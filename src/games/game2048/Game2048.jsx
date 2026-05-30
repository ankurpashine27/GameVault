/**
 * 2048 — Root game component.
 * Screen states: 'modeselect' | 'pregame' | 'playing' | 'paused' | 'gameover' | 'leaderboard' | 'achievements'
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import GameCanvas from './GameCanvas.jsx'
import HUD from './HUD.jsx'
import ModeSelectScreen from './ModeSelectScreen.jsx'
import PreGameScreen from './PreGameScreen.jsx'
import PauseMenu from './PauseMenu.jsx'
import GameOverScreen from './GameOverScreen.jsx'
import Leaderboard from './Leaderboard.jsx'
import AchievementsPanel from './AchievementsPanel.jsx'
import { use2048Settings } from './hooks/use2048Settings.js'
import { useAudio } from './hooks/useAudio.js'
import { use2048Game } from './hooks/use2048Game.js'
import { drawGame } from './engine/renderer.js'
import { todayStr } from './utils.js'

export default function Game2048({ onClose }) {
  const [screen, setScreen] = useState('modeselect')
  const screenRef     = useRef('modeselect')
  const prevScreenRef = useRef('modeselect')

  const goTo = useCallback((s) => {
    screenRef.current = s
    setScreen(s)
  }, [])

  // ─── Settings ─────────────────────────────────────────────────────────────
  const {
    settings, updateSettings,
    playerName, setPlayerName,
    getLeaderboard, saveToLeaderboard,
    getPersonalBests, savePersonalBest,
    getAchievements, unlockAchievement,
    getDailyData, saveDailyResult, getDailyStreak,
    getStats, updateStats,
  } = use2048Settings()

  // ─── Audio ────────────────────────────────────────────────────────────────
  const { play, startTrack, stopTrack, ensureCtx } = useAudio(settings)

  // ─── Game hook ────────────────────────────────────────────────────────────
  const {
    boardRef, animStateRef,
    score, bestScore, highestTile,
    gamePhase, undoCharges,
    remainingMoves, timeLeft, comboMultiplier,
    milestoneQueue, setMilestoneQueue,
    startGame, pauseGame, resumeGame,
    processInput, undo, dismissWin,
    reshuffleBoard,
    inputDivRef,
  } = use2048Game({
    play,
    getAchievements,
    unlockAchievement,
    getDailyStreak,
  })

  // ─── Canvas ref ───────────────────────────────────────────────────────────
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const loopRef   = useRef(null)

  // ─── Win overlay ──────────────────────────────────────────────────────────
  const [showWin, setShowWin] = useState(false)

  // When gamePhase changes to 'won', show the win overlay
  useEffect(() => {
    if (gamePhase === 'won') {
      setShowWin(true)
    }
    if (gamePhase === 'gameover') {
      // Stop loop, save scores
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      const st = getStats()
      const newBest = score > (st.highScoreEver || 0)
      updateStats({
        totalGames: (st.totalGames || 0) + 1,
        highScoreEver: newBest ? score : st.highScoreEver,
        highestTileEver: Math.max(st.highestTileEver || 0, highestTile),
      })
      if (score > 0) {
        saveToLeaderboard({ name: playerName, score, date: todayStr() })
        savePersonalBest(settings.mode, settings.gridSize, { score, highestTile, date: todayStr() })
      }
      goTo('gameover')
      stopTrack()
    }
  }, [gamePhase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── RAF loop ─────────────────────────────────────────────────────────────
  loopRef.current = (timestamp) => {
    const canvas = canvasRef.current?.getCanvas?.()
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const board = boardRef.current
    if (!board) return

    const state = {
      board,
      cols:       settings.gridSize,
      animState:  animStateRef.current,
      scorePopups: [],
      palette:    settings.palette,
      theme:      settings.theme,
      background: settings.background,
    }

    drawGame(ctx, state, timestamp, settings)

    if (rafRef.current !== null) {
      rafRef.current = requestAnimationFrame(loopRef.current)
    }
  }

  const startLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loopRef.current)
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // ─── Keyboard handler ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey) return

      const sc = screenRef.current
      const dirs = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
        A: 'left', D: 'right', W: 'up', S: 'down',
      }

      if (e.key === 'Escape') {
        e.stopPropagation()
        if (sc === 'playing') {
          stopLoop()
          pauseGame()
          goTo('paused')
        } else if (sc === 'paused') {
          resumeGame()
          startLoop()
          goTo('playing')
        } else if (['leaderboard', 'achievements'].includes(sc)) {
          const prev = prevScreenRef.current
          goTo(prev)
          if (prev === 'playing') startLoop()
        }
        return
      }

      const dir = dirs[e.key]
      if (dir && sc === 'playing') {
        e.preventDefault()
        processInput(dir)
        return
      }

      // Undo: Z or Ctrl+Z
      if (sc === 'playing' && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [processInput, undo, stopLoop, startLoop, pauseGame, resumeGame, goTo])

  // ─── Visibility change ────────────────────────────────────────────────────
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && screenRef.current === 'playing') {
        stopLoop()
        pauseGame()
        goTo('paused')
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [stopLoop, pauseGame, goTo])

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { stopLoop(); stopTrack() }
  }, [stopLoop, stopTrack])

  // ─── Screen handlers ──────────────────────────────────────────────────────
  const handleSelectMode = useCallback((modeId) => {
    updateSettings({ mode: modeId, obstacleRerolls: 0 })
    goTo('pregame')
  }, [updateSettings, goTo])

  const handlePlay = useCallback(() => {
    stopLoop()
    ensureCtx()
    startGame(settings)
    startTrack(settings.musicTrackId || 'calm')
    setShowWin(false)
    goTo('playing')
    requestAnimationFrame(() => startLoop())
  }, [stopLoop, ensureCtx, startGame, settings, startTrack, goTo, startLoop])

  const handleResume = useCallback(() => {
    resumeGame()
    startLoop()
    goTo('playing')
  }, [resumeGame, startLoop, goTo])

  const handlePause = useCallback(() => {
    stopLoop()
    pauseGame()
    goTo('paused')
  }, [stopLoop, pauseGame, goTo])

  const handleMenu = useCallback(() => {
    stopLoop()
    stopTrack()
    goTo('modeselect')
  }, [stopLoop, stopTrack, goTo])

  const handleRestart = useCallback(() => {
    handlePlay()
  }, [handlePlay])

  const openOverlay = useCallback((overlayScreen) => {
    prevScreenRef.current = screenRef.current
    if (screenRef.current === 'playing') stopLoop()
    goTo(overlayScreen)
  }, [stopLoop, goTo])

  const closeOverlay = useCallback(() => {
    const prev = prevScreenRef.current
    goTo(prev)
    if (prev === 'playing') startLoop()
  }, [goTo, startLoop])

  const handleToggleMusic = useCallback(() => {
    const newVol = settings.musicVolume > 0 ? 0 : 0.3
    updateSettings({ musicVolume: newVol })
    if (newVol === 0) stopTrack()
    else startTrack(settings.musicTrackId || 'calm')
  }, [settings, updateSettings, stopTrack, startTrack])

  const handleDismissWin = useCallback(() => {
    setShowWin(false)
    dismissWin()
  }, [dismissWin])

  // ─── Daily check ──────────────────────────────────────────────────────────
  const dailyData = getDailyData()
  const dailyDone = !!dailyData[todayStr()]
  const dailyStreak = getDailyStreak()

  // ─── Milestone popup ──────────────────────────────────────────────────────
  const topMilestone = milestoneQueue.length > 0 ? milestoneQueue[0] : null

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ touchAction: 'none' }}>

      {/* Canvas wrapper — always mounted so loop can draw */}
      <div
        ref={inputDivRef}
        className="absolute inset-0 flex items-center justify-center bg-black"
        style={{ cursor: screen === 'playing' ? 'default' : 'default' }}
      >
        <GameCanvas ref={canvasRef} />
      </div>

      {/* HUD — shown during play / paused */}
      {(screen === 'playing' || screen === 'paused') && (
        <HUD
          score={score}
          bestScore={bestScore}
          mode={settings.mode}
          timeLeft={timeLeft}
          remainingMoves={remainingMoves}
          comboMultiplier={comboMultiplier}
          undoCharges={undoCharges}
          canUndo={undoCharges > 0}
          highestTile={highestTile}
          musicOn={settings.musicVolume > 0}
          onPause={handlePause}
          onUndo={undo}
          onToggleMusic={handleToggleMusic}
          onNewGame={handleRestart}
          onMenu={handleMenu}
          onReshuffle={reshuffleBoard}
        />
      )}

      {/* Win overlay */}
      {showWin && screen === 'playing' && (
        <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-gray-900/98 border border-amber-500/40 rounded-2xl p-8 text-center max-w-xs w-full mx-4">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-amber-300 font-black text-3xl mb-1">You Win!</h2>
            <p className="text-white/60 text-sm mb-2">You reached {settings.targetTile.toLocaleString()}!</p>
            <p className="text-white font-bold text-xl mb-6">Score: {score.toLocaleString()}</p>
            <div className="flex flex-col gap-2">
              <button onClick={handleDismissWin}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-colors">
                Keep Playing
              </button>
              <button onClick={handleMenu}
                className="w-full py-2.5 text-white/50 hover:text-white/80 text-sm transition-colors">
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone popup */}
      {topMilestone && screen === 'playing' && (
        <MilestonePopup
          value={topMilestone}
          onDismiss={() => {
            if (typeof setMilestoneQueue === 'function') {
              setMilestoneQueue(q => q.slice(1))
            }
          }}
        />
      )}

      {/* Mode select */}
      {screen === 'modeselect' && (
        <ModeSelectScreen
          onSelectMode={handleSelectMode}
          onClose={onClose}
          getPersonalBests={getPersonalBests}
          dailyDone={dailyDone}
          dailyStreak={dailyStreak}
        />
      )}

      {/* Pre-game settings */}
      {screen === 'pregame' && (
        <PreGameScreen
          mode={settings.mode}
          settings={settings}
          onSettingsChange={updateSettings}
          playerName={playerName}
          onNameChange={setPlayerName}
          onBack={() => goTo('modeselect')}
          onPlay={handlePlay}
          getPersonalBests={getPersonalBests}
        />
      )}

      {/* Pause menu */}
      {screen === 'paused' && (
        <PauseMenu
          settings={settings}
          onSettingsChange={updateSettings}
          onResume={handleResume}
          onRestart={handleRestart}
          onMenu={handleMenu}
          onLeaderboard={() => openOverlay('leaderboard')}
          onAchievements={() => openOverlay('achievements')}
        />
      )}

      {/* Game over */}
      {screen === 'gameover' && (
        <div className="absolute inset-0 z-20">
          <GameOverScreen
            score={score}
            bestScore={bestScore}
            isNewBest={score >= bestScore && score > 0}
            highestTile={highestTile}
            mode={settings.mode}
            onPlayAgain={handlePlay}
            onMenu={handleMenu}
            onLeaderboard={() => openOverlay('leaderboard')}
          />
        </div>
      )}

      {/* Leaderboard */}
      {screen === 'leaderboard' && (
        <Leaderboard
          allScores={getLeaderboard()}
          personalBests={getPersonalBests()}
          playerName={playerName}
          onClose={closeOverlay}
        />
      )}

      {/* Achievements */}
      {screen === 'achievements' && (
        <AchievementsPanel
          unlockedIds={getAchievements()}
          onClose={closeOverlay}
        />
      )}
    </div>
  )
}

function MilestonePopup({ value, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500)
    return () => clearTimeout(t)
  }, [value, onDismiss])

  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 pointer-events-none
      animate-bounce">
      <div className="bg-amber-500/90 backdrop-blur border border-amber-300/50 rounded-2xl
        px-6 py-3 text-center shadow-xl">
        <div className="text-3xl mb-1">🌟</div>
        <div className="text-white font-black text-xl">{value.toLocaleString()}!</div>
        <div className="text-white/80 text-xs">Milestone reached!</div>
      </div>
    </div>
  )
}
