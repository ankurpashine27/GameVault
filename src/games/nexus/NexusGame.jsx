import './NexusAnimations.css'
import { useState, useEffect, useCallback } from 'react'
import { useSound }          from '../../shared/useSound.js'
import { useNexusSettings }  from './hooks/useNexusSettings.js'
import { usePuzzleManager }  from './hooks/usePuzzleManager.js'
import { useNexusGame }      from './hooks/useNexusGame.js'
import PreGameScreen         from './PreGameScreen.jsx'
import GameScreen            from './GameScreen.jsx'
import RoundResult           from './RoundResult.jsx'
import GameOverScreen        from './GameOverScreen.jsx'
import Leaderboard           from './Leaderboard.jsx'
import HowToPlay             from './HowToPlay.jsx'
import PauseMenu             from './PauseMenu.jsx'
import { TIME_ATTACK_PUZZLES, TIME_ATTACK_TOTAL_SECS, TIME_ATTACK_TIME_BONUS } from './constants.js'

// ── Screen state machine ──────────────────────────────────────────────────────
// 'pregame' | 'playing' | 'roundover' | 'paused' | 'gameover' | 'leaderboard' | 'howtoplay'

export default function NexusGame() {
  const { play, muted, toggleMute } = useSound()

  // Persistent settings
  const settings = useNexusSettings()
  const { mode, filterTheme, playerName } = settings

  // Puzzle engine
  const { getDailyPuzzle, getRandomPuzzle, getTimeAttackSet, resetSession } = usePuzzleManager()

  // Per-round game state
  const {
    puzzle, revealedCount, wrongGuesses, roundStatus,
    hintsUsed, roundScore, shakeInput, lastEvent,
    startRound, startReverseRound, submitGuess,
  } = useNexusGame()

  // Screen + nav
  const [screen,     setScreen]     = useState('pregame')
  const [prevScreen, setPrevScreen] = useState('pregame')

  // Session accumulators
  const [sessionScore,     setSessionScore]     = useState(0)
  const [streakCount,      setStreakCount]       = useState(0)
  const [correctCount,     setCorrectCount]      = useState(0)
  const [roundsPlayed,     setRoundsPlayed]      = useState(0)

  // Time Attack
  const [taQueue,      setTaQueue]      = useState([])   // pre-loaded puzzle set
  const [taIdx,        setTaIdx]        = useState(0)
  const [taStartTime,  setTaStartTime]  = useState(0)
  const [taElapsed,    setTaElapsed]    = useState(0)
  const [taTimeBonus,  setTaTimeBonus]  = useState(0)
  const [taExpired,    setTaExpired]    = useState(false)

  // ── Sound dispatch ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lastEvent) return
    const map = {
      correct:  'nexus:correct',
      wrong:    'nexus:wrong',
      reveal:   'nexus:reveal',
      gameover: 'nexus:gameover',
    }
    const name = map[lastEvent.type]
    if (name) play(name)
  }, [lastEvent]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard handling ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.shiftKey) {
        e.stopPropagation()
        if (screen === 'playing') setScreen('paused')
        else if (screen === 'paused') setScreen('playing')
        else if (screen === 'leaderboard' || screen === 'howtoplay') setScreen('pregame')
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [screen])

  // ── Round transition: roundStatus change → roundover / gameover ───────────
  useEffect(() => {
    if (roundStatus === 'idle' || roundStatus === 'guessing') return

    const correct = roundStatus === 'correct'

    // Accumulate session score
    if (correct) {
      setSessionScore(prev => prev + roundScore)
      setCorrectCount(prev => prev + 1)
    }
    setRoundsPlayed(prev => prev + 1)

    if (mode === 'streak') {
      if (correct) {
        setStreakCount(prev => prev + 1)
        setScreen('roundover')
      } else {
        // End of streak
        setScreen('roundover')
      }
      return
    }

    if (mode === 'time_attack') {
      // RoundResult auto-advances via its own 1.5 s timeout calling onNext
      setScreen('roundover')
      return
    }

    // Daily: save result
    if (mode === 'daily' && puzzle) {
      settings.saveDailyResult({
        puzzleId: puzzle.id,
        hintsUsed: correct ? hintsUsed : 5,
        correct,
        dayNumber: Math.floor((Date.now() - new Date('2025-01-01')) / 86400000) + 1,
      })
    }

    setScreen('roundover')
  }, [roundStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start a round ─────────────────────────────────────────────────────────
  const beginRound = useCallback((pz) => {
    if (mode === 'reverse') {
      startReverseRound(pz)
    } else {
      startRound(pz)
    }
    setScreen('playing')
  }, [mode, startRound, startReverseRound])

  // ── Handle Play button ────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    resetSession()
    setSessionScore(0)
    setStreakCount(0)
    setCorrectCount(0)
    setRoundsPlayed(0)
    setTaExpired(false)
    setTaTimeBonus(0)

    if (mode === 'daily') {
      const pz = getDailyPuzzle()
      beginRound(pz)
      return
    }

    if (mode === 'time_attack') {
      const queue = getTimeAttackSet(TIME_ATTACK_PUZZLES)
      setTaQueue(queue)
      setTaIdx(0)
      setTaStartTime(Date.now())
      beginRound(queue[0])
      return
    }

    const pz = mode === 'filter'
      ? getRandomPuzzle(filterTheme)
      : getRandomPuzzle()
    beginRound(pz)
  }, [mode, filterTheme, getDailyPuzzle, getRandomPuzzle, getTimeAttackSet, beginRound, resetSession])

  // ── "Next" from RoundResult ───────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (mode === 'time_attack') {
      const nextIdx = taIdx + 1
      if (taExpired || nextIdx >= TIME_ATTACK_PUZZLES) {
        // Game over — compute time bonus
        const elapsed = (Date.now() - taStartTime) / 1000
        const remaining = Math.max(0, TIME_ATTACK_TOTAL_SECS - elapsed)
        const bonus = Math.round(remaining * TIME_ATTACK_TIME_BONUS)
        setTaElapsed(elapsed)
        setTaTimeBonus(bonus)
        setSessionScore(prev => {
          const final = prev + bonus
          settings.saveToLeaderboard({ name: playerName, mode, score: final, date: new Date().toISOString().slice(0, 10) })
          settings.savePersonalBest(mode, final)
          return final
        })
        setScreen('gameover')
        play('nexus:gameover')
        return
      }
      setTaIdx(nextIdx)
      beginRound(taQueue[nextIdx])
      return
    }

    if (mode === 'streak') {
      if (roundStatus === 'correct') {
        // Continue streak with a new puzzle
        const pz = getRandomPuzzle()
        beginRound(pz)
      } else {
        // Failed — game over
        settings.saveStreakRecord({ name: playerName, streak: streakCount, date: new Date().toISOString().slice(0, 10) })
        settings.saveToLeaderboard({ name: playerName, mode, score: sessionScore, streak: streakCount })
        settings.savePersonalBest(mode, streakCount)
        setScreen('gameover')
        play('nexus:gameover')
      }
      return
    }

    // Classic / filter / reverse / daily: single-round game over
    settings.saveToLeaderboard({ name: playerName, mode, score: sessionScore })
    settings.savePersonalBest(mode, sessionScore)
    setScreen('gameover')
    play('nexus:gameover')
  }, [
    mode, taIdx, taExpired, taQueue, taStartTime, streakCount, sessionScore,
    roundStatus, playerName, settings, beginRound, getRandomPuzzle, play,
  ])

  // ── Timer expired (Time Attack) ────────────────────────────────────────────
  const handleTimerExpire = useCallback(() => {
    setTaExpired(true)
    // handleNext will detect taExpired on next call
  }, [])

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goToMenu = () => {
    resetSession()
    setScreen('pregame')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-vault-bg text-white overflow-hidden">

      {/* How To Play overlay */}
      {screen === 'howtoplay' && (
        <HowToPlay onClose={() => setScreen('pregame')} />
      )}

      {/* Leaderboard overlay */}
      {screen === 'leaderboard' && (
        <Leaderboard
          settings={settings}
          playerName={playerName}
          onClose={() => setScreen('pregame')}
        />
      )}

      {/* Pause menu overlay */}
      {screen === 'paused' && (
        <PauseMenu
          onResume={() => setScreen('playing')}
          onQuit={goToMenu}
        />
      )}

      {/* ── Screens ── */}
      {screen === 'pregame' && (
        <PreGameScreen
          playerName={playerName}
          onPlayerNameChange={settings.setPlayerName}
          mode={mode}
          onModeChange={settings.setMode}
          filterTheme={filterTheme}
          onFilterThemeChange={settings.setFilterTheme}
          onPlay={handlePlay}
          onHowToPlay={() => setScreen('howtoplay')}
          onLeaderboard={() => setScreen('leaderboard')}
          dailyResult={settings.getDailyTodayResult()}
          dailyStreakData={settings.getDailyStreak()}
        />
      )}

      {screen === 'playing' && (
        <GameScreen
          puzzle={puzzle}
          revealedCount={revealedCount}
          wrongGuesses={wrongGuesses}
          roundStatus={roundStatus}
          hintsUsed={hintsUsed}
          roundScore={roundScore}
          shakeInput={shakeInput}
          mode={mode}
          sessionScore={sessionScore}
          streakCount={streakCount}
          timeAttackIdx={taIdx}
          totalTimeAttackPuzzles={TIME_ATTACK_PUZZLES}
          onSubmitGuess={submitGuess}
          onPause={() => setScreen('paused')}
          onMute={toggleMute}
          muted={muted}
          onTimerExpire={handleTimerExpire}
        />
      )}

      {screen === 'roundover' && (
        <RoundResult
          puzzle={puzzle}
          roundStatus={roundStatus}
          hintsUsed={hintsUsed}
          roundScore={roundScore}
          mode={mode}
          streakCount={streakCount}
          onNext={handleNext}
          onMenu={goToMenu}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          mode={mode}
          sessionScore={sessionScore}
          streakCount={streakCount}
          personalBest={settings.getPersonalBest(mode)}
          roundsPlayed={roundsPlayed}
          correctCount={correctCount}
          timeAttackTime={taElapsed}
          timeBonus={taTimeBonus}
          hintsUsed={hintsUsed}
          correct={roundStatus === 'correct'}
          puzzle={puzzle}
          dailyStreakData={settings.getDailyStreak()}
          onPlayAgain={() => {
            setScreen('pregame')
          }}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}
    </div>
  )
}
