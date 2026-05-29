import { useState, useRef, useCallback, useEffect } from 'react'
import GameCanvas from './GameCanvas.jsx'
import HUD from './HUD.jsx'
import ModeSelectScreen from './ModeSelectScreen.jsx'
import PreGameScreen from './PreGameScreen.jsx'
import PauseMenu from './PauseMenu.jsx'
import GameOverScreen from './GameOverScreen.jsx'
import Leaderboard from './Leaderboard.jsx'
import DailyScreen from './DailyScreen.jsx'
import { useTetrisGame } from './hooks/useTetrisGame.js'
import { useAudio } from './hooks/useAudio.js'
import { useTetrisSettings } from './hooks/useTetrisSettings.js'
import { drawGame } from './engine/renderer.js'
import { createLineClearParticles, updateParticles } from './engine/renderer.js'
import { levelToBPM } from './engine/gameLoop.js'
import { ACHIEVEMENTS, CANVAS_W, CANVAS_H } from './constants.js'
import { dailySeed } from './utils.js'

// Screens: 'modeselect' | 'pregame' | 'daily' | 'playing' | 'paused' | 'gameover' | 'leaderboard'

export default function TetrisGame({ onClose }) {
  // ─── Screen state machine ────────────────────────────────────────────────
  const [screen, setScreen] = useState('modeselect')
  const screenRef = useRef('modeselect')
  const goTo = useCallback((s) => { screenRef.current = s; setScreen(s) }, [])

  // ─── Settings ────────────────────────────────────────────────────────────
  const {
    settings, updateSettings,
    getHighScore, saveHighScore, isNewHighScore,
    getLeaderboard, saveToLeaderboard,
    getUnlockedAchievements, unlockAchievement,
    getDailyData, saveDailyScore, hasDailyScore,
    getTotalGames, incrementTotalGames,
  } = useTetrisSettings()

  // ─── Audio ───────────────────────────────────────────────────────────────
  const { play: playAudio, startTrack, stopTrack, setTempo, ensureCtx } = useAudio(settings)

  // ─── Mode/level state ────────────────────────────────────────────────────
  const [selectedMode, setSelectedMode] = useState('marathon')
  const [startLevel, setStartLevel] = useState(1)
  const selectedModeRef = useRef('marathon')

  // ─── Canvas and loop ────────────────────────────────────────────────────
  const canvasRef    = useRef(null)
  const wrapperRef   = useRef(null)
  const rafRef       = useRef(null)
  const lastTimeRef2 = useRef(null)

  // ─── Particles (managed here so renderer gets them each frame) ────────────
  const particlesRef = useRef([])

  // ─── Game over result ────────────────────────────────────────────────────
  const [lastResult,    setLastResult]    = useState(null)
  const [isNewBest,     setIsNewBest]     = useState(false)
  const [newAchievs,    setNewAchievs]    = useState([])

  // ─── HUD state ───────────────────────────────────────────────────────────
  const [hudScore,  setHudScore]  = useState(0)
  const [hudLines,  setHudLines]  = useState(0)
  const [hudLevel,  setHudLevel]  = useState(1)
  const [hudTimeMs, setHudTimeMs] = useState(0)
  const [hudHold,   setHudHold]   = useState(null)
  const [hudNext,   setHudNext]   = useState([])
  const [hudBtB,    setHudBtB]    = useState(false)
  const [hudCombo,  setHudCombo]  = useState(0)
  const [hudSlow,   setHudSlow]   = useState(false)
  const [hudSlowT,  setHudSlowT]  = useState(0)

  // ─── Game hook ────────────────────────────────────────────────────────────
  const game = useTetrisGame({
    settings,
    mode: selectedMode,
    startLevel,
    dailySeed: selectedMode === 'daily' ? dailySeed() : null,
    audio: { play: playAudio },
    onGameOver: useCallback((result) => {
      // Save scores
      const mode = selectedModeRef.current
      const newBest = isNewHighScore(result.score, mode)
      saveHighScore(result.score, mode)
      if (result.score > 0) {
        saveToLeaderboard({ name: 'Player', score: result.score, mode })
      }
      if (mode === 'daily') {
        saveDailyScore(result.score)
      }
      incrementTotalGames()

      // Check achievements
      const earned = checkAchievements(result)
      setNewAchievs(earned)
      setLastResult({ ...result, complete: false })
      setIsNewBest(newBest)
      stopTrack()
      goTo('gameover')
    }, [isNewHighScore, saveHighScore, saveToLeaderboard, saveDailyScore, incrementTotalGames, stopTrack, goTo]),

    onGameComplete: useCallback((result) => {
      const mode = selectedModeRef.current
      const newBest = isNewHighScore(
        mode === 'sprint' ? result.timeMs : result.score,
        mode
      )
      saveHighScore(
        mode === 'sprint' ? result.timeMs : result.score,
        mode
      )
      if (result.score > 0) {
        saveToLeaderboard({ name: 'Player', score: result.score, mode })
      }
      incrementTotalGames()
      const earned = checkAchievements(result)
      setNewAchievs(earned)
      setLastResult({ ...result, complete: true })
      setIsNewBest(newBest)
      stopTrack()
      goTo('gameover')
    }, [isNewHighScore, saveHighScore, saveToLeaderboard, incrementTotalGames, stopTrack, goTo]),
  })

  // ─── Achievement checker ─────────────────────────────────────────────────
  function checkAchievements(result) {
    const unlocked = getUnlockedAchievements()
    const earned = []

    const check = (id, condition) => {
      if (condition && !unlocked.includes(id)) {
        if (unlockAchievement(id)) {
          const def = ACHIEVEMENTS.find(a => a.id === id)
          if (def) earned.push(def)
        }
      }
    }

    check('level_10',       result.level >= 10)
    check('level_20',       result.level >= 20)
    check('score_10k',      result.score >= 10000)
    check('score_100k',     result.score >= 100000)
    check('sprint_sub2',    result.mode === 'sprint' && result.timeMs < 2 * 60 * 1000)
    check('sprint_sub1',    result.mode === 'sprint' && result.timeMs < 60 * 1000)
    check('ultra_100k',     result.mode === 'ultra' && result.score >= 100000)
    check('survival_5min',  result.mode === 'marathon' && result.timeMs >= 5 * 60 * 1000)
    check('daily_first',    result.mode === 'daily')

    return earned
  }

  // ─── RAF render loop ─────────────────────────────────────────────────────
  const loopRef = useRef(null)
  loopRef.current = (timestamp) => {
    const last = lastTimeRef2.current
    lastTimeRef2.current = timestamp
    if (!last) {
      if (rafRef.current !== null) rafRef.current = requestAnimationFrame(loopRef.current)
      return
    }

    const dt = Math.min((timestamp - last) / 1000, 0.05)
    const time = timestamp / 1000

    // Tick game logic
    game.tick(dt)

    // Update particles
    particlesRef.current = updateParticles(particlesRef.current, dt)

    // Update HUD state (throttled — only when values change significantly)
    const s = game.scoreRef.current
    const li = game.linesRef.current
    const lv = game.levelRef.current
    const tm = game.timeMsRef.current
    const hold = game.holdPieceRef.current?.type ?? null
    const next = game.nextQueueRef.current.slice(0, 5)
    const btb = game.backToBackRef?.current ?? false
    const combo = game.comboRef?.current ?? 0

    setHudScore(s)
    setHudLines(li)
    setHudLevel(lv)
    setHudTimeMs(tm)
    setHudHold(hold)
    setHudNext([...next])
    setHudBtB(btb)
    setHudCombo(combo)

    // Update music tempo based on level
    if (lv > 1) {
      const trackId = settings.background ?? 'classic_dark'
      const TRACK_BPMS = {
        classic_dark: 150, neon_city: 160, aurora: 80, underwater: 70,
        lava_cave: 90, matrix: 120, forest_night: 60, deep_space: 60,
      }
      const baseBPM = TRACK_BPMS[trackId] ?? 120
      setTempo(levelToBPM(baseBPM, lv))
    }

    // Draw
    const canvas = canvasRef.current?.getCanvas?.()
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const renderState = game.getRenderState()
        renderState.particles = particlesRef.current
        drawGame(ctx, renderState, time, settings)
      }
    }

    if (rafRef.current !== null) {
      rafRef.current = requestAnimationFrame(loopRef.current)
    }
  }

  const startLoop = useCallback(() => {
    stopLoop()
    lastTimeRef2.current = null
    rafRef.current = requestAnimationFrame(loopRef.current)
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // ─── Keyboard input (registered once) ────────────────────────────────────
  useEffect(() => {
    const dasTimers   = {}
    const arrIntervals = {}
    const held        = {}

    function startARR(key, fn) {
      if (dasTimers[key]) return
      dasTimers[key] = setTimeout(() => {
        arrIntervals[key] = setInterval(fn, settings.arrDelay ?? 33)
      }, settings.dasDelay ?? 167)
    }

    function stopARR(key) {
      clearTimeout(dasTimers[key])
      clearInterval(arrIntervals[key])
      delete dasTimers[key]
      delete arrIntervals[key]
    }

    const onKeyDown = (e) => {
      if (e.shiftKey) return  // Let GameFrame handle Shift+Esc
      const sc = screenRef.current

      if (e.key === 'Escape') {
        e.stopPropagation()
        if (sc === 'playing') {
          stopLoop()
          game.pauseGame()
          stopTrack()
          goTo('paused')
        } else if (sc === 'paused') {
          game.resumeGame()
          ensureCtx()
          startTrack(settings.background ?? 'classic_dark')
          goTo('playing')
          startLoop()
        } else if (sc === 'leaderboard') {
          goTo('gameover')
        }
        return
      }

      if (sc !== 'playing') return

      if (held[e.code]) return
      held[e.code] = true

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault()
          game.movePiece(-1)
          startARR('left', () => game.movePiece(-1))
          break
        case 'ArrowRight':
          e.preventDefault()
          game.movePiece(1)
          startARR('right', () => game.movePiece(1))
          break
        case 'ArrowUp':
          e.preventDefault()
          game.rotatePiece(1)
          break
        case 'ArrowDown':
          e.preventDefault()
          game.softDrop()
          startARR('down', () => game.softDrop())
          break
        case 'Space':
          e.preventDefault()
          game.hardDrop()
          break
        case 'KeyZ':
          e.preventDefault()
          game.rotatePiece(-1)
          break
        case 'KeyX':
          e.preventDefault()
          game.rotatePiece(1)
          break
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          if (!e.shiftKey) {
            e.preventDefault()
            game.holdPiece()
          }
          break
        default: break
      }
    }

    const onKeyUp = (e) => {
      delete held[e.code]
      if (e.code === 'ArrowLeft') stopARR('left')
      if (e.code === 'ArrowRight') stopARR('right')
      if (e.code === 'ArrowDown') stopARR('down')
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
      Object.values(dasTimers).forEach(clearTimeout)
      Object.values(arrIntervals).forEach(clearInterval)
    }
  }, [game.movePiece, game.rotatePiece, game.softDrop, game.hardDrop, game.holdPiece,
      game.pauseGame, game.resumeGame, stopLoop, startLoop, stopTrack, startTrack, ensureCtx, goTo, settings])

  // ─── Visibility change (auto-pause) ──────────────────────────────────────
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && screenRef.current === 'playing') {
        stopLoop()
        game.pauseGame()
        stopTrack()
        goTo('paused')
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [stopLoop, game.pauseGame, stopTrack, goTo])

  // ─── Touch controls ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    let touchStartX = 0
    let touchStartY = 0
    let lastTap = 0

    const onTouchStart = (e) => {
      if (screenRef.current !== 'playing') return
      const t = e.touches[0]
      touchStartX = t.clientX
      touchStartY = t.clientY

      // Double tap → hard drop
      const now = Date.now()
      if (now - lastTap < 300) {
        game.hardDrop()
        lastTap = 0
        return
      }
      lastTap = now
    }

    const onTouchEnd = (e) => {
      if (screenRef.current !== 'playing') return
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStartX
      const dy = t.clientY - touchStartY

      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (absDx > 30 && absDx > absDy) {
        // Swipe horizontal → move
        game.movePiece(dx > 0 ? 1 : -1)
        return
      }

      if (absDy > 30 && absDy > absDx) {
        if (dy > 0) {
          // Swipe down → soft drop
          game.softDrop()
        } else {
          // Swipe up → hard drop
          game.hardDrop()
        }
        return
      }

      // Tap — left 40% = rotate CCW, right 40% = rotate CW
      const canvas = canvasRef.current?.getCanvas?.()
      const rect = canvas?.getBoundingClientRect?.()
      if (rect) {
        const relX = t.clientX - rect.left
        if (relX < rect.width * 0.4) {
          game.rotatePiece(-1)
        } else if (relX > rect.width * 0.6) {
          game.rotatePiece(1)
        }
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [game.movePiece, game.rotatePiece, game.softDrop, game.hardDrop])

  // ─── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => { stopLoop(); stopTrack() }
  }, [stopLoop, stopTrack])

  // ─── Screen transition handlers ───────────────────────────────────────────
  const handleSelectMode = useCallback((mode) => {
    setSelectedMode(mode)
    selectedModeRef.current = mode
    if (mode === 'daily') {
      goTo('daily')
    } else {
      goTo('pregame')
    }
  }, [goTo])

  const handlePlay = useCallback((lvl = 1) => {
    const level = lvl ?? startLevel
    setStartLevel(level)
    particlesRef.current = []
    ensureCtx()
    game.startGame({ startLevel: level })
    startTrack(settings.background ?? 'classic_dark')
    goTo('playing')
    requestAnimationFrame(() => startLoop())
  }, [ensureCtx, game.startGame, startTrack, settings.background, goTo, startLoop, startLevel])

  const handlePause = useCallback(() => {
    stopLoop()
    game.pauseGame()
    stopTrack()
    goTo('paused')
  }, [stopLoop, game.pauseGame, stopTrack, goTo])

  const handleResume = useCallback(() => {
    game.resumeGame()
    ensureCtx()
    startTrack(settings.background ?? 'classic_dark')
    goTo('playing')
    startLoop()
  }, [game.resumeGame, ensureCtx, startTrack, settings.background, goTo, startLoop])

  const handleRestart = useCallback(() => {
    stopLoop()
    particlesRef.current = []
    ensureCtx()
    game.startGame({ startLevel })
    startTrack(settings.background ?? 'classic_dark')
    goTo('playing')
    requestAnimationFrame(() => startLoop())
  }, [stopLoop, ensureCtx, game.startGame, startLevel, startTrack, settings.background, goTo, startLoop])

  const handleMenu = useCallback(() => {
    stopLoop()
    stopTrack()
    goTo('modeselect')
  }, [stopLoop, stopTrack, goTo])

  const bestScore = getHighScore(selectedMode)

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      {/* Canvas layer */}
      <div
        ref={wrapperRef}
        className={`absolute inset-0 flex items-center justify-center bg-black ${
          screen === 'modeselect' || screen === 'pregame' || screen === 'daily'
            ? 'invisible pointer-events-none'
            : ''
        }`}
      >
        <GameCanvas ref={canvasRef} />
      </div>

      {/* HUD */}
      {screen === 'playing' && (
        <HUD
          score={hudScore}
          bestScore={typeof bestScore === 'number' ? bestScore : 0}
          level={hudLevel}
          lines={hudLines}
          timeMs={hudTimeMs}
          mode={selectedMode}
          holdType={hudHold}
          nextQueue={hudNext}
          backToBack={hudBtB}
          combo={hudCombo}
          slowActive={hudSlow}
          slowTimer={hudSlowT}
          onPause={handlePause}
        />
      )}

      {/* Mode select screen */}
      {screen === 'modeselect' && (
        <ModeSelectScreen
          onSelectMode={handleSelectMode}
          onSettings={() => {}}
          onLeaderboard={() => goTo('leaderboard')}
          onClose={onClose}
        />
      )}

      {/* Pre-game screen */}
      {screen === 'pregame' && (
        <PreGameScreen
          mode={selectedMode}
          settings={settings}
          onSettingsChange={updateSettings}
          bestScore={typeof bestScore === 'number' ? bestScore : 0}
          startLevel={startLevel}
          onStartLevelChange={setStartLevel}
          onPlay={handlePlay}
          onBack={() => goTo('modeselect')}
        />
      )}

      {/* Daily challenge screen */}
      {screen === 'daily' && (
        <DailyScreen
          dailyData={getDailyData()}
          onPlay={() => handlePlay(1)}
          onBack={() => goTo('modeselect')}
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
          onLeaderboard={() => goTo('leaderboard')}
        />
      )}

      {/* Game over screen */}
      {screen === 'gameover' && (
        <GameOverScreen
          result={lastResult ?? {}}
          mode={selectedMode}
          bestScore={typeof bestScore === 'number' ? bestScore : 0}
          isNewBest={isNewBest}
          newAchievements={newAchievs}
          onPlayAgain={handleRestart}
          onMenu={handleMenu}
          onLeaderboard={() => goTo('leaderboard')}
        />
      )}

      {/* Leaderboard */}
      {screen === 'leaderboard' && (
        <Leaderboard
          scores={getLeaderboard()}
          mode={selectedMode}
          onClose={() => {
            const prev = screen === 'leaderboard' ? 'gameover' : 'modeselect'
            goTo(screen === 'gameover' ? 'gameover' : 'modeselect')
          }}
        />
      )}
    </div>
  )
}
