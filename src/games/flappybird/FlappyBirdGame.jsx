import { useState, useEffect, useRef, useCallback } from 'react'
import GameCanvas from './GameCanvas.jsx'
import HUD from './HUD.jsx'
import PreGameScreen from './PreGameScreen.jsx'
import GameOverScreen from './GameOverScreen.jsx'
import PauseMenu from './PauseMenu.jsx'
import Leaderboard from './Leaderboard.jsx'
import AchievementsPanel from './AchievementsPanel.jsx'
import CollectionPanel from './CollectionPanel.jsx'
import { useFlappySettings } from './hooks/useFlappySettings.js'
import { useCollections } from './hooks/useCollections.js'
import { useAudio } from './hooks/useAudio.js'
import { BIRD_X, CANVAS_H, STAGES } from './constants.js'
import {
  drawBackground, drawPipes, drawBird, drawCollectibles,
  drawPowerups, drawParticles, drawScorePopups,
  updateParticles, createDeathParticles, createCoinParticles,
  generateBgLayers,
} from './engine/renderer.js'
import { createBird, flapBird, updateBird } from './engine/physics.js'
import { spawnPipe, updatePipes, checkPipesPassed, blendStage } from './engine/pipeGenerator.js'
import {
  spawnCollectiblesInGap, trySpawnPowerup,
  updateCollectibles as updateCollectiblesEng,
  updatePowerups as updatePowerupsEng,
} from './engine/collectibleSpawner.js'
import {
  checkPipeCollision,
  checkCollectibleCollision,
  checkBoundaryCollision,
} from './engine/collisionDetector.js'
import {
  POWERUPS, SLOW_MO_FACTOR, POWERUP_SPAWN_INTERVAL,
  COIN_VALUE, GEM_VALUE, STAR_VALUE,
} from './constants.js'
import { todayStr } from './utils.js'

// ─── Screens ──────────────────────────────────────────────────────────────────
// 'pregame' | 'playing' | 'paused' | 'gameover' | 'leaderboard' | 'achievements' | 'collections'

export default function FlappyBirdGame({ onClose }) {
  const [screen, setScreen] = useState('pregame')
  // screenRef is always in sync — updated synchronously before setScreen()
  // so any callback registered once ([] deps) reads the correct value
  const screenRef     = useRef('pregame')
  const prevScreenRef = useRef('pregame')

  // Helper: update ref AND React state atomically
  const goTo = useCallback((s) => {
    screenRef.current = s
    setScreen(s)
  }, [])

  // ─── Settings / persistence ───────────────────────────────────────────────
  const {
    playerName, setPlayerName,
    settings, updateSettings,
    getHighScore, saveHighScore,
    getLeaderboard, saveToLeaderboard,
    getPersonalBests, savePersonalBest,
    getUnlockedAchievements, unlockAchievement,
    getCollectedItems, collectItem, getCompletedSets,
    isSkinUnlocked,
    getTotalGames, incrementTotalGames,
    addCoins,
  } = useFlappySettings()

  const {
    resetRun, checkAchievements, updateRunStats,
  } = useCollections()

  // Destructure STABLE function references from useAudio.
  // useAudio returns a new object literal each render, but the individual
  // functions are useCallback with stable deps — they are the SAME function
  // object across renders. Depending on `audio` (the wrapper object) would
  // cause any downstream useCallback/useEffect to re-run every render.
  const { play: playAudio, startTrack, stopTrack, ensureCtx } = useAudio(settings)

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const canvasRef    = useRef(null)   // GameCanvas imperative handle
  const gameStateRef = useRef(null)
  const rafRef       = useRef(null)
  const lastTimeRef  = useRef(null)
  const wrapperRef   = useRef(null)   // canvas wrapper div for native pointer input

  // ─── HUD state (updated from game loop) ───────────────────────────────────
  const [hudScore,      setHudScore]      = useState(0)
  const [activePowerup, setActivePowerup] = useState(null)
  const [powerupTimer,  setPowerupTimer]  = useState(0)
  const [currentStage,  setCurrentStage]  = useState(STAGES[0])
  const [bgLayers,      setBgLayers]      = useState(() => generateBgLayers('day'))
  // Tracks whether the bird has flapped at least once this run — used to hide
  // the "Tap / Space" hint. Must be React state (not just g.started ref) so it
  // triggers a re-render and the hint actually disappears.
  const [gameStarted,   setGameStarted]   = useState(false)

  // ─── Game-over data ────────────────────────────────────────────────────────
  const [lastSummary,       setLastSummary]       = useState(null)
  const [isNewHighScore,    setIsNewHighScore]     = useState(false)
  const [newAchievements,   setNewAchievements]   = useState([])
  const [newCollectionSets, setNewCollectionSets] = useState([])

  // ─── Init game state ──────────────────────────────────────────────────────
  const initGameState = useCallback(() => {
    const bgId   = settings.selectedBg   || 'day'
    const skinId = settings.selectedSkin || 'classic'
    const layers = generateBgLayers(bgId)
    setBgLayers(layers)

    gameStateRef.current = {
      bird:         createBird(BIRD_X, CANVAS_H * 0.45),
      pipes:        [],
      collectibles: [],
      powerups:     [],
      particles:    [],
      scorePopups:  [],
      score:        0,
      coinsThisRun: 0,
      started:      false,   // ← physics gate; set true on first flap
      totalTime:    0,
      pipeTimer:    0,
      powerupSpawnTimer: 0,
      nextPipeId:   1,
      stageIdx:     0,
      // Power-up flags + timers
      shieldActive: false, shieldTimer:  0,
      slowMoActive: false, slowMoTimer:  0,
      magnetActive: false, magnetTimer:  0,
      shrinkActive: false, shrinkTimer:  0,
      scoreX2Active:false, scoreX2Timer: 0,
      ghostActive:  false, ghostTimer:   0,
      // Per-run stats (for achievements)
      powerupsUsedSet: new Set(),
      shieldSaves:  0,
      ghostPipes:   0,
      slowMoScore:  0,
      bgId,
      skinId,
      bgLayers: layers,
      collectedItems: getCollectedItems(),
    }

    resetRun()
    setHudScore(0)
    setActivePowerup(null)
    setPowerupTimer(0)
    setCurrentStage(STAGES[0])
    setGameStarted(false)
  }, [settings, getCollectedItems, resetRun])

  // ─── Flap ─────────────────────────────────────────────────────────────────
  // playAudio is a stable useCallback — doFlap only recreates if playAudio
  // changes (never), so the keydown/pointer useEffects below run exactly once.
  const doFlap = useCallback(() => {
    if (screenRef.current !== 'playing') return
    const g = gameStateRef.current
    if (!g) return
    if (!g.started) {
      g.started = true
      setGameStarted(true)   // triggers re-render → hint fades out
    }
    flapBird(g.bird)
    playAudio('flap')
  }, [playAudio])

  // ─── Loop helpers ─────────────────────────────────────────────────────────
  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // ─── Main game loop ───────────────────────────────────────────────────────
  // Defined as stable ref so the RAF self-reference doesn't cause stale issues
  const loopRef = useRef(null)
  loopRef.current = (timestamp) => {
    const g = gameStateRef.current
    if (!g) return

    const last = lastTimeRef.current
    lastTimeRef.current = timestamp
    if (!last) {
      rafRef.current = requestAnimationFrame(loopRef.current)
      return
    }

    const rawDt    = Math.min((timestamp - last) / 1000, 0.05)
    const time     = timestamp / 1000
    const timeScale = g.slowMoActive ? SLOW_MO_FACTOR : 1.0

    if (g.started) {
      updateWorld(g, rawDt, timeScale, time)
    }

    drawWorld(g, time)

    // Only continue loop if we're still playing
    if (rafRef.current !== null) {
      rafRef.current = requestAnimationFrame(loopRef.current)
    }
  }

  const startLoop = useCallback(() => {
    stopLoop()
    lastTimeRef.current = null
    rafRef.current = requestAnimationFrame(loopRef.current)
  }, [stopLoop])

  // ─── World update ─────────────────────────────────────────────────────────
  function updateWorld(g, dt, timeScale, time) {
    g.totalTime += dt

    updateBird(g.bird, dt, timeScale)

    // Stage transitions
    const stage = blendStage(g.score)
    if (stage.stageIdx !== g.stageIdx) {
      g.stageIdx = stage.stageIdx
      playAudio('stage_up')
      setCurrentStage(STAGES[stage.stageIdx])
      updateRunStats({ maxStage: stage.stageIdx })
    }

    // Spawn pipes
    g.pipeTimer += dt * timeScale
    if (g.pipeTimer >= stage.spawnInterval) {
      g.pipeTimer = 0
      const pipe = spawnPipe(stage, g.nextPipeId++, g.totalTime)
      g.pipes.push(pipe)
      g.collectibles.push(...spawnCollectiblesInGap(pipe, g.collectedItems))
    }

    // Move pipes
    const { pipes: updatedPipes } = updatePipes(g.pipes, dt, stage.pipeSpeed, timeScale, g.totalTime)
    g.pipes = updatedPipes

    // Score from pipes
    const scored = checkPipesPassed(g.pipes, g.bird.x)
    if (scored > 0) {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += scored * mult
      if (g.slowMoActive) g.slowMoScore += scored
      playAudio('score')
      setHudScore(g.score)
      addPopup(g, g.bird.x, g.bird.y - 30, `+${scored * mult}`, '#ffffff', 18)
    }

    // Spawn power-ups
    g.powerupSpawnTimer += dt
    if (g.powerupSpawnTimer >= POWERUP_SPAWN_INTERVAL) {
      g.powerupSpawnTimer = 0
      const pu = trySpawnPowerup(POWERUP_SPAWN_INTERVAL, stage)
      if (pu) g.powerups.push(pu)
    }

    // Move collectibles + power-ups
    g.collectibles = updateCollectiblesEng(
      g.collectibles, dt, stage.pipeSpeed, timeScale,
      g.bird.x, g.bird.y, g.magnetActive
    )
    g.powerups = updatePowerupsEng(g.powerups, dt, stage.pipeSpeed, timeScale)

    // Collect items
    const collectedIds = checkCollectibleCollision(g.bird, g.collectibles, g.shrinkActive)
    for (const cid of collectedIds) {
      const item = g.collectibles.find(c => c.id === cid)
      if (!item || item.collected) continue
      item.collected = true
      g.particles.push(...createCoinParticles(item.x, item.y, item.color))
      handleCollectItem(g, item)
    }

    // Collect power-ups
    const colPuIds = checkCollectibleCollision(g.bird, g.powerups, g.shrinkActive)
    for (const pid of colPuIds) {
      const pu = g.powerups.find(p => p.id === pid)
      if (!pu || pu.collected) continue
      pu.collected = true
      activatePowerup(g, pu.type)
      playAudio('powerup')
      g.powerupsUsedSet.add(pu.type)
      addPopup(g, pu.x, pu.y - 22, POWERUPS[pu.type]?.name || '⚡', '#f0abfc', 15)
    }

    // Tick power-up timers
    tickPowerups(g, dt)

    // Ghost pipe tracking
    if (g.ghostActive) {
      for (const pipe of g.pipes) {
        if (!pipe.ghostPassed && !pipe.passed && pipe.x + 29 < g.bird.x) {
          pipe.ghostPassed = true
          g.ghostPipes++
        }
      }
    }

    // Collision
    if (!g.ghostActive) {
      const hitPipe  = checkPipeCollision(g.bird, g.pipes, g.shrinkActive)
      const hitBound = checkBoundaryCollision(g.bird, g.shrinkActive)

      if (hitPipe || hitBound) {
        if (g.shieldActive) {
          g.shieldActive = false
          g.shieldTimer  = 0
          g.shieldSaves++
          playAudio('shield_hit')
          setActivePowerup(null)
          g.bird.vy = -280
        } else {
          handleDeath(g)
          return
        }
      }
    }

    g.particles   = updateParticles(g.particles, dt)
    g.scorePopups = g.scorePopups
      .map(p => ({ ...p, y: p.y - 45 * dt, life: p.life - dt }))
      .filter(p => p.life > 0)
  }

  // ─── Item collection ──────────────────────────────────────────────────────
  function handleCollectItem(g, item) {
    if (item.type === 'coin') {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += COIN_VALUE * mult
      g.coinsThisRun++
      setHudScore(g.score)
      playAudio('coin')
      addPopup(g, item.x, item.y - 18, `+${COIN_VALUE * mult}`, '#fbbf24', 15)
    } else if (item.type === 'gem') {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += GEM_VALUE * mult
      setHudScore(g.score)
      playAudio('gem')
      addPopup(g, item.x, item.y - 18, `+${GEM_VALUE * mult}💎`, '#a78bfa', 16)
    } else if (item.type === 'star') {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += STAR_VALUE * mult
      setHudScore(g.score)
      playAudio('star')
      addPopup(g, item.x, item.y - 22, `+${STAR_VALUE * mult}★`, '#fde047', 18)
    } else if (item.type === 'collection') {
      playAudio('collection_item')
      addPopup(g, item.x, item.y - 22, '✦ Collected!', '#f0abfc', 16)
      const newSet = collectItem(item.itemId)
      if (newSet) setNewCollectionSets(prev => [...prev, newSet])
    }
  }

  // ─── Power-up activation ──────────────────────────────────────────────────
  function activatePowerup(g, type) {
    const def = POWERUPS[type]
    if (!def) return
    g.shieldActive  = type === 'shield';    g.shieldTimer  = g.shieldActive  ? def.duration : 0
    g.slowMoActive  = type === 'slow_mo';   g.slowMoTimer  = g.slowMoActive  ? def.duration : 0
    g.magnetActive  = type === 'magnet';    g.magnetTimer  = g.magnetActive  ? def.duration : 0
    g.shrinkActive  = type === 'shrink';    g.shrinkTimer  = g.shrinkActive  ? def.duration : 0
    g.scoreX2Active = type === 'score_x2';  g.scoreX2Timer = g.scoreX2Active ? def.duration : 0
    g.ghostActive   = type === 'ghost';     g.ghostTimer   = g.ghostActive   ? def.duration : 0
    setActivePowerup(type)
    setPowerupTimer(def.duration)
  }

  function tickPowerups(g, dt) {
    const pairs = [
      ['shieldActive','shieldTimer'], ['slowMoActive','slowMoTimer'],
      ['magnetActive','magnetTimer'], ['shrinkActive','shrinkTimer'],
      ['scoreX2Active','scoreX2Timer'], ['ghostActive','ghostTimer'],
    ]
    for (const [ak, tk] of pairs) {
      if (g[ak]) {
        g[tk] -= dt
        if (g[tk] <= 0) {
          g[ak] = false; g[tk] = 0
          playAudio('powerup_expire')
          setActivePowerup(null); setPowerupTimer(0)
        } else {
          setPowerupTimer(g[tk])
        }
      }
    }
  }

  // ─── Death ────────────────────────────────────────────────────────────────
  function handleDeath(g) {
    playAudio('death')
    g.particles.push(...createDeathParticles(g.bird.x, g.bird.y))
    // Stop loop (set to null so the loop's RAF doesn't re-queue itself)
    if (rafRef.current) { cancelAnimationFrame(rafRef.current) }
    rafRef.current = null

    setTimeout(() => {
      const totalGames = incrementTotalGames()
      addCoins(g.coinsThisRun)
      const finalHs = saveHighScore(g.score)
      const isNewHs = g.score > 0 && g.score >= finalHs

      if (g.score > 0) {
        saveToLeaderboard({ name: playerName, score: g.score, date: todayStr() })
        savePersonalBest({ name: playerName, score: g.score, date: todayStr() })
      }

      const summary = {
        score: g.score, coinsThisRun: g.coinsThisRun,
        maxStage: g.stageIdx, powerupsUsed: g.powerupsUsedSet,
        shieldSaves: g.shieldSaves, ghostPipes: g.ghostPipes,
        slowMoScore: g.slowMoScore, completedSets: getCompletedSets().length,
        totalGames,
      }
      const newAchs = checkAchievements(summary, { unlockAchievement, getUnlockedAchievements, getCompletedSets })
      if (newAchs.length) playAudio('achievement')

      setLastSummary(summary)
      setIsNewHighScore(isNewHs)
      setNewAchievements(newAchs)
      goTo('gameover')
      stopTrack()
    }, 600)
  }

  // ─── Draw ─────────────────────────────────────────────────────────────────
  function drawWorld(g, time) {
    const canvas = canvasRef.current?.getCanvas?.()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const stage = blendStage(g.score)
    drawBackground(ctx, g.bgId, g.bgLayers, time, stage.pipeSpeed)
    drawPipes(ctx, g.pipes, g.bgId)
    drawCollectibles(ctx, g.collectibles, time)
    drawPowerups(ctx, g.powerups, time)
    drawBird(ctx, g.bird, g.skinId, time, g.shieldActive, g.shrinkActive, g.ghostActive)
    drawParticles(ctx, g.particles)
    drawScorePopups(ctx, g.scorePopups)
  }

  function addPopup(g, x, y, text, color, size) {
    g.scorePopups.push({ x, y, text, color, size, life: 0.8 })
  }

  // ─── Global keyboard handler (registered ONCE) ────────────────────────────
  // doFlap is stable (depends on playAudio which never changes), so this
  // effect runs exactly once — no listener teardown/re-add during gameplay.
  useEffect(() => {
    const onKey = (e) => {
      // Never intercept Shift+Esc (GameFrame owns that)
      if (e.shiftKey) return

      const sc = screenRef.current

      if (e.key === 'Escape') {
        e.stopPropagation()
        if (sc === 'playing') {
          stopLoop()
          goTo('paused')
        } else if (sc === 'paused') {
          goTo('playing')
          startLoop()
        } else if (['leaderboard', 'achievements', 'collections'].includes(sc)) {
          const prev = prevScreenRef.current
          goTo(prev)
          if (prev === 'playing') startLoop()
        }
        return
      }

      // Flap keys — Space / ArrowUp / Enter
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        if (sc === 'playing') {
          e.preventDefault()
          doFlap()
        }
      }
    }

    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [doFlap, stopLoop, startLoop, goTo])   // all stable useCallbacks → runs once

  // ─── Native pointer handler (registered ONCE on wrapper div) ─────────────
  // Native addEventListener instead of React synthetic props so the listener
  // is never torn down mid-game when parent re-renders.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const onDown = (e) => {
      if (e.type === 'mousedown' && e.button !== 0) return
      if (e.cancelable) e.preventDefault()
      doFlap()
    }
    el.addEventListener('mousedown', onDown)
    el.addEventListener('touchstart', onDown, { passive: false })
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('touchstart', onDown)
    }
  }, [doFlap])   // doFlap is stable → runs once

  // ─── Visibility change (auto-pause) ──────────────────────────────────────
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && screenRef.current === 'playing') {
        stopLoop()
        goTo('paused')
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [stopLoop, goTo])

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => { stopLoop(); stopTrack() }
  }, [stopLoop, stopTrack])

  // ─── Screen transitions ───────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    stopLoop()
    initGameState()
    setNewAchievements([])
    setNewCollectionSets([])
    ensureCtx()
    startTrack(settings.musicTrack || 0)
    goTo('playing')
    // Give React one frame to commit the canvas before the loop draws
    requestAnimationFrame(() => startLoop())
  }, [stopLoop, initGameState, ensureCtx, startTrack, settings.musicTrack, goTo, startLoop])

  const handleResume = useCallback(() => {
    goTo('playing')
    startLoop()
  }, [goTo, startLoop])

  const handlePause = useCallback(() => {
    stopLoop()
    goTo('paused')
  }, [stopLoop, goTo])

  const openOverlay = useCallback((overlayScreen) => {
    prevScreenRef.current = screenRef.current
    stopLoop()
    goTo(overlayScreen)
  }, [stopLoop, goTo])

  const closeOverlay = useCallback(() => {
    const prev = prevScreenRef.current
    goTo(prev)
    if (prev === 'playing') startLoop()
  }, [goTo, startLoop])

  const handleRestart = useCallback(() => handlePlay(), [handlePlay])

  const handleMenu = useCallback(() => {
    stopLoop()
    stopTrack()
    goTo('pregame')
  }, [stopLoop, stopTrack, goTo])

  const handleToggleMusic = useCallback(() => {
    const newVol = settings.musicVolume > 0 ? 0 : 0.35
    updateSettings({ musicVolume: newVol })
    if (newVol === 0) stopTrack()
    else startTrack(settings.musicTrack || 0)
  }, [settings, updateSettings, stopTrack, startTrack])

  const highScore  = getHighScore()
  const totalGames = getTotalGames()

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ touchAction: 'none' }}>

      {/* ── Canvas layer ──────────────────────────────────────────────────── */}
      {/* Visible during playing / paused / dead (to show death animation).  */}
      {/* Click/touch handled via native addEventListener in useEffect above. */}
      <div
        ref={wrapperRef}
        className={`absolute inset-0 flex items-center justify-center bg-black
          ${screen === 'pregame' || screen === 'gameover' ? 'invisible pointer-events-none' : ''}`}
        style={{ cursor: screen === 'playing' ? 'pointer' : 'default' }}
      >
        <GameCanvas ref={canvasRef} />
      </div>

      {/* ── HUD (score, stage, power-up bar, pause/mute buttons) ────────── */}
      {(screen === 'playing' || screen === 'paused') && (
        <HUD
          score={hudScore}
          highScore={highScore}
          activePowerup={activePowerup}
          powerupTimer={powerupTimer}
          currentStage={currentStage}
          musicTrack={settings.musicTrack}
          musicVolume={settings.musicVolume}
          onPause={handlePause}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* ── "Tap / Space to start" hint ─────────────────────────────────── */}
      {/* Conditionally rendered (not just opacity) so animate-pulse can't    */}
      {/* override the hidden state — CSS animations beat inline styles.      */}
      {screen === 'playing' && !gameStarted && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 15 }}
        >
          <div className="bg-black/60 rounded-2xl px-8 py-4 text-white text-center animate-pulse select-none">
            <div className="text-3xl mb-1">🐦</div>
            <div className="font-bold text-lg">Tap, Click, or Space</div>
            <div className="text-sm text-white/60 mt-1">Keep pressing to flap!</div>
          </div>
        </div>
      )}

      {/* ── Pause menu ──────────────────────────────────────────────────── */}
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

      {/* ── Pre-game screen ──────────────────────────────────────────────── */}
      {screen === 'pregame' && (
        <div className="absolute inset-0 z-20">
          <PreGameScreen
            playerName={playerName}
            onNameChange={setPlayerName}
            settings={settings}
            onSettingsChange={updateSettings}
            highScore={highScore}
            totalGames={totalGames}
            isSkinUnlocked={isSkinUnlocked}
            onPlay={handlePlay}
            onLeaderboard={() => openOverlay('leaderboard')}
            onAchievements={() => openOverlay('achievements')}
            onClose={onClose}
          />
        </div>
      )}

      {/* ── Game-over screen ─────────────────────────────────────────────── */}
      {screen === 'gameover' && (
        <div className="absolute inset-0 z-20">
          <GameOverScreen
            score={lastSummary?.score ?? 0}
            highScore={highScore}
            isNewHighScore={isNewHighScore}
            runSummary={lastSummary}
            newAchievements={newAchievements}
            newCollectionSets={newCollectionSets}
            onPlayAgain={handlePlay}
            onLeaderboard={() => openOverlay('leaderboard')}
            onMenu={handleMenu}
          />
        </div>
      )}

      {/* ── Leaderboard overlay ──────────────────────────────────────────── */}
      {screen === 'leaderboard' && (
        <Leaderboard
          allScores={getLeaderboard()}
          personalBests={getPersonalBests()}
          playerName={playerName}
          onClose={closeOverlay}
        />
      )}

      {/* ── Achievements overlay ─────────────────────────────────────────── */}
      {screen === 'achievements' && (
        <AchievementsPanel
          unlockedIds={getUnlockedAchievements()}
          onClose={closeOverlay}
        />
      )}

      {/* ── Collections overlay ──────────────────────────────────────────── */}
      {screen === 'collections' && (
        <CollectionPanel
          collectedItems={getCollectedItems()}
          onClose={closeOverlay}
        />
      )}
    </div>
  )
}
