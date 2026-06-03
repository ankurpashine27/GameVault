/**
 * Pulse Rush — root component & screen state machine.
 * screens: levelselect | pregame | playing | paused | gameover | complete |
 *          leaderboard | achievements | customizer
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import './GeoDashAnimations.css'
import GameCanvas from './GameCanvas.jsx'
import HUD from './HUD.jsx'
import LevelSelectScreen from './LevelSelectScreen.jsx'
import PreGameScreen from './PreGameScreen.jsx'
import PauseMenu from './PauseMenu.jsx'
import GameOverScreen from './GameOverScreen.jsx'
import LevelCompleteScreen from './LevelCompleteScreen.jsx'
import Leaderboard from './Leaderboard.jsx'
import AchievementsPanel from './AchievementsPanel.jsx'
import IconCustomizer from './IconCustomizer.jsx'
import { useGeoDashSettings } from './hooks/useGeoDashSettings.js'
import { useAudio } from './hooks/useAudio.js'
import { usePracticeMode } from './hooks/usePracticeMode.js'
import { useGeoDashGame } from './hooks/useGeoDashGame.js'
import { achievementsToUnlock, ACHIEVEMENTS } from './achievements.js'
import { LEVELS, levelIndex } from './levels/index.js'
import { infiniteLevel } from './engine/infiniteGenerator.js'
import { DIFFICULTIES, TIPS, MAX_CHECKPOINTS } from './constants.js'
import { pick, makePRNG } from './utils.js'

export default function GeoDashGame({ onClose }) {
  const settingsApi = useGeoDashSettings()
  const audio = useAudio(settingsApi.settings)
  const practice = usePracticeMode()
  const canvasRef = useRef(null)

  const [screen, setScreen] = useState('levelselect')
  const [returnScreen, setReturnScreen] = useState('levelselect')
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0])
  const [activeLevel, setActiveLevel] = useState(LEVELS[0])
  const [isPractice, setIsPractice] = useState(false)
  const [isInfinite, setIsInfinite] = useState(false)
  const [deathInfo, setDeathInfo] = useState(null)
  const [completeInfo, setCompleteInfo] = useState(null)
  const [toasts, setToasts] = useState([])

  const practiceRef = useRef(false)
  const infiniteRef = useRef(false)
  useEffect(() => { practiceRef.current = isPractice }, [isPractice])
  useEffect(() => { infiniteRef.current = isInfinite }, [isInfinite])

  const musicOn = settingsApi.settings.musicVolume > 0

  // ─── Achievement helper ─────────────────────────────────────────────────────
  const pushToast = useCallback((id) => {
    const a = ACHIEVEMENTS.find(x => x.id === id)
    if (!a) return
    const tid = Date.now() + Math.random()
    setToasts(t => [...t, { tid, name: a.name }])
    setTimeout(() => setToasts(t => t.filter(x => x.tid !== tid)), 3200)
  }, [])

  const checkAchievements = useCallback((infiniteInfo = null) => {
    const ids = achievementsToUnlock({
      stats: settingsApi.stats,
      currency: settingsApi.currency,
      progress: settingsApi.progress,
      unlockedIconsCount: settingsApi.getUnlockedIcons().size,
      infinite: infiniteInfo,
    })
    for (const id of ids) {
      if (settingsApi.unlockAchievement(id)) { pushToast(id); audio.playSfx('achievement') }
    }
  }, [settingsApi, audio, pushToast])

  // ─── Game hook callbacks ────────────────────────────────────────────────────
  const callbacks = useRef({})
  callbacks.current.onCoin = () => {}
  callbacks.current.onAutoPause = () => { setScreen('paused') }

  callbacks.current.onDeath = (info) => {
    settingsApi.bumpStats({ totalDeaths: 1 })
    const inf = infiniteRef.current
    if (!inf) {
      const prevBest = settingsApi.getLevelProgress(selectedLevel.id).bestPercent || 0
      settingsApi.saveLevelResult(selectedLevel.id, { percent: info.percent, completed: false, coins: info.coins })
      // Practice: respawn at last checkpoint instead of game over.
      if (practiceRef.current && practice.count > 0) {
        checkAchievements()
        game.respawnAtCheckpoint()
        setScreen('playing')
        return
      }
      setDeathInfo({ ...info, bestPercent: prevBest, isNewBest: info.percent > prevBest })
    } else if (info.infinite) {
      settingsApi.addInfiniteScore({
        playerName: settingsApi.playerName, score: info.infinite.score,
        beatsReached: info.infinite.beats, maxSpeed: info.infinite.maxSpeed,
      })
      if (info.infinite.maxSpeed >= 3 && info.infinite.beats >= 100) {
        if (settingsApi.unlockAchievement('speed_demon')) { pushToast('speed_demon'); audio.playSfx('achievement') }
      }
      setDeathInfo({ ...info })
    }
    checkAchievements(inf && info.infinite ? { beats: info.infinite.beats } : null)
    setScreen('gameover')
  }

  callbacks.current.onComplete = (info) => {
    const wasComplete = settingsApi.getLevelProgress(selectedLevel.id).completed
    settingsApi.bumpStats({ totalCompletions: 1 })
    settingsApi.saveLevelResult(selectedLevel.id, { percent: 100, completed: true, coins: info.coins })
    settingsApi.addLevelCompletion({
      playerName: settingsApi.playerName, levelId: selectedLevel.id, levelName: selectedLevel.name,
      attempts: info.attempts, coinsCollected: info.coins.length,
    })
    setCompleteInfo({ ...info, isNewBest: !wasComplete })
    checkAchievements()
    setScreen('complete')
  }

  const game = useGeoDashGame({
    audio, settingsApi, practice, canvasRef,
    callbacks: {
      onDeath: (i) => callbacks.current.onDeath(i),
      onComplete: (i) => callbacks.current.onComplete(i),
      onCoin: (i) => callbacks.current.onCoin(i),
      onAutoPause: () => callbacks.current.onAutoPause(),
    },
  })

  // checkpoint_pro achievement
  useEffect(() => {
    if (practice.count >= MAX_CHECKPOINTS) {
      if (settingsApi.unlockAchievement('checkpoint_pro')) { pushToast('checkpoint_pro'); audio.playSfx('achievement') }
    }
  }, [practice.count, settingsApi, pushToast, audio])

  // ─── Esc → pause/resume ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.shiftKey) {
        if (screen === 'playing') { e.stopPropagation(); pausePlay() }
        else if (screen === 'paused') { e.stopPropagation(); resumePlay() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // re-bind each render so `screen` is fresh

  // ─── Screen actions ─────────────────────────────────────────────────────────
  const openLevel = (level) => { setSelectedLevel(level); setIsInfinite(false); setScreen('pregame') }

  const beginLevel = () => {
    setActiveLevel(selectedLevel)
    setIsInfinite(false)
    infiniteRef.current = false
    practice.clearCheckpoints()
    game.setAttempts(0)
    settingsApi.saveAttempt(selectedLevel.id, isPractice)
    settingsApi.bumpStats({ totalAttempts: 1 })
    if (isPractice && DIFFICULTIES[selectedLevel.difficulty]?.demon) {
      if (settingsApi.unlockAchievement('practiced_hard')) { pushToast('practiced_hard'); audio.playSfx('achievement') }
    }
    setScreen('playing')
    game.startRun(selectedLevel, { practice: isPractice })
    setTimeout(() => checkAchievements(), 0)
  }

  const beginInfinite = () => {
    const lvl = infiniteLevel()
    setActiveLevel(lvl)
    setSelectedLevel(lvl)
    setIsInfinite(true)
    infiniteRef.current = true
    game.setAttempts(0)
    settingsApi.bumpStats({ totalAttempts: 1 })
    setScreen('playing')
    game.startRun(null, { infinite: true })
  }

  const retry = () => {
    setDeathInfo(null); setCompleteInfo(null)
    if (isInfinite) { beginInfinite(); return }
    practice.clearCheckpoints()
    game.setAttempts(game.attemptsRef.current) // keep counting attempts
    settingsApi.saveAttempt(selectedLevel.id, isPractice)
    settingsApi.bumpStats({ totalAttempts: 1 })
    setScreen('playing')
    game.startRun(selectedLevel, { practice: isPractice })
  }

  const pausePlay = () => { game.pauseRun(); setScreen('paused') }
  const resumePlay = () => { setScreen('playing'); game.resumeRun() }

  const toLevelSelect = () => {
    game.stopRun()
    setIsInfinite(false); setDeathInfo(null); setCompleteInfo(null)
    setScreen('levelselect')
  }

  const openOverlay = (s) => { setReturnScreen(screen); setScreen(s) }
  const closeOverlay = () => setScreen(returnScreen)

  const toggleMusic = () => {
    const next = musicOn ? 0 : 0.6
    settingsApi.updateSettings({ musicVolume: next })
    if (next === 0) audio.stopMusic()
    else if (screen === 'playing') audio.startMusic(activeLevel)
  }

  const placeCheckpoint = () => {
    if (game.gameRef.current && practice.placeCheckpoint(game.gameRef.current)) audio.playSfx('checkpoint')
  }

  const deathTip = (() => {
    const r = makePRNG((deathInfo?.attempts || 1) * 7 + 3)
    return pick(r, TIPS)
  })()

  const nextLevel = (() => {
    const i = levelIndex(selectedLevel.id)
    return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : null
  })()

  const showCanvas = ['playing', 'paused', 'gameover', 'complete'].includes(screen)

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Canvas — always mounted so the loop can draw; hidden behind menus. */}
      <div ref={game.wrapperRef} className="absolute inset-0" style={{ display: showCanvas ? 'block' : 'none' }}>
        <GameCanvas ref={canvasRef} />
      </div>

      {(screen === 'playing' || screen === 'paused') && (
        <HUD
          hud={game.hud} level={activeLevel} infinite={isInfinite} musicOn={musicOn}
          checkpointPositions={practice.positions} remainingCheckpoints={practice.remaining}
          onPause={pausePlay} onToggleMusic={toggleMusic} onCheckpoint={placeCheckpoint}
        />
      )}

      {screen === 'levelselect' && (
        <LevelSelectScreen
          levels={LEVELS} progress={settingsApi.progress} currency={settingsApi.currency}
          playerName={settingsApi.playerName} setPlayerName={settingsApi.setPlayerName}
          infiniteBest={settingsApi.infiniteBest}
          onPlayLevel={openLevel} onInfinite={beginInfinite}
          onOpenCustomizer={() => openOverlay('customizer')}
          onOpenLeaderboard={() => openOverlay('leaderboard')}
          onOpenAchievements={() => openOverlay('achievements')}
          onClose={onClose}
        />
      )}

      {screen === 'pregame' && (
        <PreGameScreen
          level={selectedLevel} progress={settingsApi.progress}
          practice={isPractice} setPractice={setIsPractice}
          onStart={beginLevel} onBack={() => setScreen('levelselect')}
          onOpenCustomizer={() => openOverlay('customizer')}
        />
      )}

      {screen === 'paused' && (
        <PauseMenu
          settings={settingsApi.settings} updateSettings={settingsApi.updateSettings}
          practice={isPractice} setPractice={setIsPractice}
          onResume={resumePlay} onRetry={retry}
          onCustomizer={() => openOverlay('customizer')}
          onLeaderboard={() => openOverlay('leaderboard')}
          onAchievements={() => openOverlay('achievements')}
          onLevelSelect={toLevelSelect}
        />
      )}

      {screen === 'gameover' && deathInfo && (
        <GameOverScreen info={deathInfo} level={activeLevel} tip={deathTip}
          isNewBest={deathInfo.isNewBest} onRetry={retry} onLevelSelect={toLevelSelect} />
      )}

      {screen === 'complete' && completeInfo && (
        <LevelCompleteScreen level={activeLevel} info={completeInfo} isNewBest={completeInfo.isNewBest}
          nextLevel={nextLevel}
          onNext={() => { if (nextLevel) openLevel(nextLevel) }}
          onRetry={retry} onLevelSelect={toLevelSelect} />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard data={settingsApi.getLeaderboard()} playerName={settingsApi.playerName} onClose={closeOverlay} />
      )}
      {screen === 'achievements' && (
        <AchievementsPanel unlocked={settingsApi.achievements} onClose={closeOverlay} />
      )}
      {screen === 'customizer' && (
        <IconCustomizer iconConfig={settingsApi.iconConfig} setFormIconConfig={settingsApi.setFormIconConfig}
          unlockedIds={settingsApi.getUnlockedIcons()} onClose={closeOverlay} />
      )}

      {/* Achievement toasts */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 space-y-1.5 pointer-events-none">
        {toasts.map(t => (
          <div key={t.tid} className="gd-toast bg-yellow-500/90 text-black font-bold text-sm rounded-lg px-4 py-2 shadow-lg">
            🏅 {t.name} unlocked!
          </div>
        ))}
      </div>
    </div>
  )
}
