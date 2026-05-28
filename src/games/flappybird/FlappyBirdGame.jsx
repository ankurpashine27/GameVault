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

// ─── Screen enum ──────────────────────────────────────────────────────────────
// 'pregame' | 'playing' | 'paused' | 'gameover' | 'leaderboard' | 'achievements' | 'collections'

export default function FlappyBirdGame() {
  const [screen, setScreen] = useState('pregame')

  const {
    playerName, setPlayerName,
    settings, updateSettings,
    getHighScore, saveHighScore,
    getLeaderboard, saveToLeaderboard,
    getPersonalBests, savePersonalBest,
    getUnlockedAchievements, unlockAchievement,
    getCollectedItems, collectItem, getCompletedSets,
    getUnlockedSkins, isSkinUnlocked,
    getTotalGames, incrementTotalGames,
    getTotalCoins, addCoins,
  } = useFlappySettings()

  const {
    resetRun, onCollect: onCollectCollection,
    checkAchievements, getRunStats, updateRunStats,
  } = useCollections()

  const audio = useAudio(settings)
  const canvasRef   = useRef(null)
  const gameStateRef = useRef(null)
  const rafRef       = useRef(null)
  const lastTimeRef  = useRef(null)
  // Ref-based mirror of `screen` so callbacks never have stale closure state
  const screenRef    = useRef('pregame')

  // React state for HUD / overlays
  const [hudScore,      setHudScore]      = useState(0)
  const [activePowerup, setActivePowerup] = useState(null)
  const [powerupTimer,  setPowerupTimer]  = useState(0)
  const [currentStage,  setCurrentStage]  = useState(STAGES[0])
  const [bgLayers,      setBgLayers]      = useState(() => generateBgLayers('day'))

  // Game-over data
  const [lastSummary,         setLastSummary]         = useState(null)
  const [isNewHighScore,      setIsNewHighScore]       = useState(false)
  const [newAchievements,     setNewAchievements]      = useState([])
  const [newCollectionSets,   setNewCollectionSets]    = useState([])
  const [prevScreen,          setPrevScreen]           = useState('pregame')

  // Keep screenRef in sync with screen state
  useEffect(() => { screenRef.current = screen }, [screen])

  // ─── Init game world ──────────────────────────────────────────────────────
  const initGameState = useCallback(() => {
    const bgId = settings.selectedBg || 'day'
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
      started:      false,
      totalTime:    0,
      pipeTimer:    0,
      powerupSpawnTimer: 0,
      nextPipeId:   1,
      stageIdx:     0,
      // Power-up flags
      shieldActive: false, shieldTimer:  0,
      slowMoActive: false, slowMoTimer:  0,
      magnetActive: false, magnetTimer:  0,
      shrinkActive: false, shrinkTimer:  0,
      scoreX2Active:false, scoreX2Timer: 0,
      ghostActive:  false, ghostTimer:   0,
      // Run stats
      powerupsUsedSet: new Set(),
      shieldSaves:  0,
      ghostPipes:   0,
      slowMoScore:  0,
      bgId,
      skinId: settings.selectedSkin || 'classic',
      bgLayers: layers,
      collectedItems: getCollectedItems(),
    }

    resetRun()
    setHudScore(0)
    setActivePowerup(null)
    setPowerupTimer(0)
    setCurrentStage(STAGES[0])
  }, [settings, getCollectedItems, resetRun])

  // ─── Flap ─────────────────────────────────────────────────────────────────
  // Uses screenRef (not state) so the callback is never stale no matter when called
  const handleFlap = useCallback(() => {
    if (screenRef.current !== 'playing') return
    const g = gameStateRef.current
    if (!g) return
    if (!g.started) g.started = true
    flapBird(g.bird)
    audio.play('flap')
  }, [audio])

  // ─── Main game loop ───────────────────────────────────────────────────────
  const loop = useCallback((timestamp) => {
    const g = gameStateRef.current
    if (!g) return

    const last = lastTimeRef.current
    lastTimeRef.current = timestamp
    if (!last) { rafRef.current = requestAnimationFrame(loop); return }

    const rawDt = Math.min((timestamp - last) / 1000, 0.05)
    const time  = timestamp / 1000
    const timeScale = g.slowMoActive ? SLOW_MO_FACTOR : 1.0

    // Update only if started
    if (g.started) {
      updateWorld(g, rawDt, timeScale, time)
    }

    // Draw
    drawWorld(g, time)

    rafRef.current = requestAnimationFrame(loop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── World update ─────────────────────────────────────────────────────────
  function updateWorld(g, dt, timeScale, time) {
    g.totalTime += dt

    updateBird(g.bird, dt, timeScale)

    // Stage
    const stage = blendStage(g.score)
    if (stage.stageIdx !== g.stageIdx) {
      g.stageIdx = stage.stageIdx
      audio.play('stage_up')
      setCurrentStage(STAGES[stage.stageIdx])
      updateRunStats({ maxStage: stage.stageIdx })
    }

    // Pipes
    g.pipeTimer += dt * timeScale
    if (g.pipeTimer >= stage.spawnInterval) {
      g.pipeTimer = 0
      const pipe = spawnPipe(stage, g.nextPipeId++, g.totalTime)
      g.pipes.push(pipe)
      const coins = spawnCollectiblesInGap(pipe, g.collectedItems)
      g.collectibles.push(...coins)
    }

    const { pipes: updatedPipes } = updatePipes(g.pipes, dt, stage.pipeSpeed, timeScale, g.totalTime)
    g.pipes = updatedPipes

    const scored = checkPipesPassed(g.pipes, g.bird.x)
    if (scored > 0) {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += scored * mult
      if (g.slowMoActive) g.slowMoScore += scored
      audio.play('score')
      setHudScore(g.score)
      addPopup(g, g.bird.x, g.bird.y - 30, `+${scored * mult}`, '#ffffff', 18)
    }

    // Power-up spawn
    g.powerupSpawnTimer += dt
    if (g.powerupSpawnTimer >= POWERUP_SPAWN_INTERVAL) {
      g.powerupSpawnTimer = 0
      const pu = trySpawnPowerup(POWERUP_SPAWN_INTERVAL, stage)
      if (pu) g.powerups.push(pu)
    }

    // Collectible movement
    g.collectibles = updateCollectiblesEng(g.collectibles, dt, stage.pipeSpeed, timeScale, g.bird.x, g.bird.y, g.magnetActive)
    g.powerups     = updatePowerupsEng(g.powerups, dt, stage.pipeSpeed, timeScale)

    // Collect items
    const collectedIds = checkCollectibleCollision(g.bird, g.collectibles, g.shrinkActive)
    if (collectedIds.length) {
      for (const cid of collectedIds) {
        const item = g.collectibles.find(c => c.id === cid)
        if (!item || item.collected) continue
        item.collected = true
        g.particles.push(...createCoinParticles(item.x, item.y, item.color))
        handleCollectItem(g, item)
      }
    }

    // Collect power-ups
    const colPuIds = checkCollectibleCollision(g.bird, g.powerups, g.shrinkActive)
    if (colPuIds.length) {
      for (const pid of colPuIds) {
        const pu = g.powerups.find(p => p.id === pid)
        if (!pu || pu.collected) continue
        pu.collected = true
        activatePowerup(g, pu.type)
        audio.play('powerup')
        g.powerupsUsedSet.add(pu.type)
        addPopup(g, pu.x, pu.y - 22, POWERUPS[pu.type]?.name || '⚡', '#f0abfc', 15)
      }
    }

    // Power-up timers
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
      const hitPipe = checkPipeCollision(g.bird, g.pipes, g.shrinkActive)
      const hitBound = checkBoundaryCollision(g.bird, g.shrinkActive)

      if (hitPipe || hitBound) {
        if (g.shieldActive) {
          g.shieldActive = false
          g.shieldTimer  = 0
          g.shieldSaves++
          audio.play('shield_hit')
          setActivePowerup(null)
          g.bird.vy = -280
        } else {
          handleDeath(g)
          return
        }
      }
    }

    g.particles   = updateParticles(g.particles, dt)
    g.scorePopups = g.scorePopups.map(p => ({ ...p, y: p.y - 45 * dt, life: p.life - dt })).filter(p => p.life > 0)
  }

  // ─── Collect item handler ─────────────────────────────────────────────────
  function handleCollectItem(g, item) {
    if (item.type === 'coin') {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += COIN_VALUE * mult
      g.coinsThisRun++
      setHudScore(g.score)
      audio.play('coin')
      addPopup(g, item.x, item.y - 18, `+${COIN_VALUE * mult}`, '#fbbf24', 15)
    } else if (item.type === 'gem') {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += GEM_VALUE * mult
      setHudScore(g.score)
      audio.play('gem')
      addPopup(g, item.x, item.y - 18, `+${GEM_VALUE * mult}💎`, '#a78bfa', 16)
    } else if (item.type === 'star') {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += STAR_VALUE * mult
      setHudScore(g.score)
      audio.play('star')
      addPopup(g, item.x, item.y - 22, `+${STAR_VALUE * mult}★`, '#fde047', 18)
    } else if (item.type === 'collection') {
      audio.play('collection_item')
      addPopup(g, item.x, item.y - 22, '✦ Collected!', '#f0abfc', 16)
      // Persist collection
      const newSet = collectItem(item.itemId)
      if (newSet) {
        setNewCollectionSets(prev => [...prev, newSet])
      }
    }
  }

  // ─── Power-up activation ──────────────────────────────────────────────────
  function activatePowerup(g, type) {
    const def = POWERUPS[type]
    if (!def) return
    g.shieldActive  = type === 'shield'
    g.slowMoActive  = type === 'slow_mo'
    g.magnetActive  = type === 'magnet'
    g.shrinkActive  = type === 'shrink'
    g.scoreX2Active = type === 'score_x2'
    g.ghostActive   = type === 'ghost'
    g.shieldTimer   = type === 'shield'    ? def.duration : 0
    g.slowMoTimer   = type === 'slow_mo'   ? def.duration : 0
    g.magnetTimer   = type === 'magnet'    ? def.duration : 0
    g.shrinkTimer   = type === 'shrink'    ? def.duration : 0
    g.scoreX2Timer  = type === 'score_x2'  ? def.duration : 0
    g.ghostTimer    = type === 'ghost'     ? def.duration : 0
    setActivePowerup(type)
    setPowerupTimer(def.duration)
  }

  function tickPowerups(g, dt) {
    const pairs = [
      ['shieldActive','shieldTimer'],
      ['slowMoActive','slowMoTimer'],
      ['magnetActive','magnetTimer'],
      ['shrinkActive','shrinkTimer'],
      ['scoreX2Active','scoreX2Timer'],
      ['ghostActive','ghostTimer'],
    ]
    let anyActive = false
    for (const [ak, tk] of pairs) {
      if (g[ak]) {
        g[tk] -= dt
        if (g[tk] <= 0) {
          g[ak] = false
          g[tk] = 0
          audio.play('powerup_expire')
          setActivePowerup(null)
          setPowerupTimer(0)
        } else {
          anyActive = true
          setPowerupTimer(g[tk])
        }
      }
    }
  }

  // ─── Death ────────────────────────────────────────────────────────────────
  function handleDeath(g) {
    audio.play('death')
    g.particles.push(...createDeathParticles(g.bird.x, g.bird.y))
    cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    // After short death animation, show game over
    setTimeout(() => {
      // Persist stats
      const totalGames = incrementTotalGames()
      addCoins(g.coinsThisRun)
      const finalHs = saveHighScore(g.score)
      const isNewHs = g.score >= finalHs && g.score > 0

      if (g.score > 0) {
        saveToLeaderboard({ name: playerName, score: g.score, date: todayStr() })
        savePersonalBest({ name: playerName, score: g.score, date: todayStr() })
      }

      // Check achievements
      const summary = {
        score:          g.score,
        coinsThisRun:   g.coinsThisRun,
        maxStage:       g.stageIdx,
        powerupsUsed:   g.powerupsUsedSet,
        shieldSaves:    g.shieldSaves,
        ghostPipes:     g.ghostPipes,
        slowMoScore:    g.slowMoScore,
        completedSets:  getCompletedSets().length,
        totalGames,
      }

      const newAchs = checkAchievements(summary, {
        unlockAchievement,
        getUnlockedAchievements,
        getCompletedSets,
      })
      if (newAchs.length) audio.play('achievement')

      setLastSummary(summary)
      setIsNewHighScore(isNewHs)
      setNewAchievements(newAchs)
      setScreen('gameover')
      audio.stopTrack()
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

  // ─── Start loop ───────────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastTimeRef.current = null
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  const stopLoop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  // ─── Page visibility pause ────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && screen === 'playing') {
        setScreen('paused')
        stopLoop()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [screen, stopLoop])

  // ─── Esc key ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey) return  // Let GameFrame handle Shift+Esc
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (screen === 'playing') {
          setScreen('paused')
          stopLoop()
        } else if (screen === 'paused') {
          setScreen('playing')
          startLoop()
        } else if (['leaderboard','achievements','collections'].includes(screen)) {
          setScreen(prevScreen)
        }
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [screen, prevScreen, stopLoop, startLoop])

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopLoop()
      audio.stopTrack()
    }
  }, [stopLoop, audio])

  // ─── Screen transitions ───────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    initGameState()
    setNewAchievements([])
    setNewCollectionSets([])
    setScreen('playing')
    audio.ensureCtx()
    audio.startTrack(settings.musicTrack || 0)
    // Start loop after small delay to allow canvas to mount
    setTimeout(startLoop, 50)
  }, [initGameState, audio, settings.musicTrack, startLoop])

  const handleResume = useCallback(() => {
    setScreen('playing')
    startLoop()
  }, [startLoop])

  const handlePause = useCallback(() => {
    setScreen('paused')
    stopLoop()
  }, [stopLoop])

  const openOverlay = useCallback((overlayScreen) => {
    setPrevScreen(screen)
    if (screen === 'playing') stopLoop()
    setScreen(overlayScreen)
  }, [screen, stopLoop])

  const closeOverlay = useCallback(() => {
    if (prevScreen === 'playing') startLoop()
    setScreen(prevScreen)
  }, [prevScreen, startLoop])

  const handleRestart = useCallback(() => {
    stopLoop()
    handlePlay()
  }, [stopLoop, handlePlay])

  const handleMenu = useCallback(() => {
    stopLoop()
    audio.stopTrack()
    setScreen('pregame')
  }, [stopLoop, audio])

  const handleToggleMusic = useCallback(() => {
    const newVol = settings.musicVolume > 0 ? 0 : 0.35
    updateSettings({ musicVolume: newVol })
    if (newVol === 0) audio.stopTrack()
    else audio.startTrack(settings.musicTrack || 0)
  }, [settings, updateSettings, audio])

  const highScore   = getHighScore()
  const totalGames  = getTotalGames()

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Canvas layer — always present so we can draw death animation */}
      <div className={`absolute inset-0 ${screen === 'pregame' || screen === 'gameover' ? 'hidden' : ''}`}>
        <GameCanvas
          ref={canvasRef}
          onFlap={screen === 'playing' ? handleFlap : undefined}
          bgLayers={bgLayers}
        />
      </div>

      {/* HUD — only during play/pause */}
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

      {/* Tap-to-start hint */}
      {screen === 'playing' && gameStateRef.current && !gameStateRef.current.started && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 15 }}>
          <div className="bg-black/50 rounded-2xl px-6 py-3 text-white text-center animate-pulse">
            <div className="text-2xl mb-1">👆</div>
            <div className="font-bold">Tap to start!</div>
          </div>
        </div>
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

      {/* Pre-game screen */}
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
          />
        </div>
      )}

      {/* Game over screen */}
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

      {/* Leaderboard overlay */}
      {screen === 'leaderboard' && (
        <Leaderboard
          allScores={getLeaderboard()}
          personalBests={getPersonalBests()}
          playerName={playerName}
          onClose={closeOverlay}
        />
      )}

      {/* Achievements overlay */}
      {screen === 'achievements' && (
        <AchievementsPanel
          unlockedIds={getUnlockedAchievements()}
          onClose={closeOverlay}
        />
      )}

      {/* Collections overlay */}
      {screen === 'collections' && (
        <CollectionPanel
          collectedItems={getCollectedItems()}
          onClose={closeOverlay}
        />
      )}
    </div>
  )
}
