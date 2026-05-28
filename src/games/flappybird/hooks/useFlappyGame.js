import { useRef, useState, useCallback, useEffect } from 'react'
import {
  CANVAS_W, CANVAS_H, GROUND_Y,
  BIRD_X, STAGES, SCORE_PER_PIPE, COIN_VALUE, GEM_VALUE, STAR_VALUE,
  POWERUPS, SLOW_MO_FACTOR, POWERUP_SPAWN_INTERVAL,
  PARTICLE_COUNT_DEATH,
} from '../constants.js'
import { createBird, flapBird, updateBird } from '../engine/physics.js'
import { spawnPipe, updatePipes, checkPipesPassed, blendStage } from '../engine/pipeGenerator.js'
import { spawnCollectiblesInGap, trySpawnPowerup, updateCollectibles, updatePowerups } from '../engine/collectibleSpawner.js'
import { checkPipeCollision, checkCollectibleCollision, checkBoundaryCollision } from '../engine/collisionDetector.js'
import {
  updateParticles, createDeathParticles, createCoinParticles,
  generateBgLayers,
} from '../engine/renderer.js'

/**
 * Core game loop hook.
 * All simulation data lives in gameRef (mutable, no re-renders).
 * React state is only updated for score / activePowerup / phase (for HUD + screen transitions).
 */
export function useFlappyGame({ canvasRef, settings, onGameOver, onScore, onCollect, onPowerup, onStageUp, onAchievement, play }) {
  // ─── Mutable game world ────────────────────────────────────────────────────
  const gameRef = useRef(null)
  const rafRef  = useRef(null)
  const lastTimeRef = useRef(null)

  // ─── React state for HUD ──────────────────────────────────────────────────
  const [hudScore,       setHudScore]       = useState(0)
  const [activePowerup,  setActivePowerup]  = useState(null)
  const [powerupTimer,   setPowerupTimer]   = useState(0)
  const [currentStage,   setCurrentStage]   = useState(STAGES[0])
  const [phase,          setPhase]          = useState('idle')  // 'idle'|'playing'|'dead'
  const [bgLayers,       setBgLayers]       = useState(() => generateBgLayers('day'))

  // ─── Init / reset ─────────────────────────────────────────────────────────
  const initGame = useCallback((bgId) => {
    setBgLayers(generateBgLayers(bgId))
    gameRef.current = createGameState()
    setHudScore(0)
    setActivePowerup(null)
    setPowerupTimer(0)
    setCurrentStage(STAGES[0])
    setPhase('idle')
    lastTimeRef.current = null
  }, [])

  // ─── Flap input ───────────────────────────────────────────────────────────
  const flap = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    if (phase === 'idle') {
      setPhase('playing')
      g.started = true
    }
    if (phase === 'dead') return
    flapBird(g.bird)
    play?.('flap')
  }, [phase, play])

  // ─── Game loop ────────────────────────────────────────────────────────────
  const loop = useCallback((timestamp) => {
    const g = gameRef.current
    if (!g || phase === 'dead') return

    const last = lastTimeRef.current
    lastTimeRef.current = timestamp
    if (!last) { rafRef.current = requestAnimationFrame(loop); return }

    const rawDt = Math.min((timestamp - last) / 1000, 0.05)
    const timeScale = g.slowMoActive ? SLOW_MO_FACTOR : 1.0
    const dt = rawDt

    if (g.started) {
      update(g, dt, timeScale, timestamp)
    }

    drawFrame(g, timestamp)
    rafRef.current = requestAnimationFrame(loop)
  }, [phase])  // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Update ───────────────────────────────────────────────────────────────
  function update(g, dt, timeScale, now) {
    g.totalTime += dt

    // Bird physics
    updateBird(g.bird, dt, timeScale)

    // Stage blending
    const stage = blendStage(g.score)
    if (stage.stageIdx !== g.stageIdx) {
      g.stageIdx = stage.stageIdx
      onStageUp?.(stage)
      play?.('stage_up')
      setCurrentStage(STAGES[stage.stageIdx])
    }

    // Pipe spawning
    g.pipeTimer += dt * timeScale
    if (g.pipeTimer >= stage.spawnInterval) {
      g.pipeTimer = 0
      const pipe = spawnPipe(stage, g.nextPipeId++, g.totalTime)
      g.pipes.push(pipe)
      const coins = spawnCollectiblesInGap(pipe, g.collectedItems)
      g.collectibles.push(...coins)
    }

    // Update pipes
    const { pipes: updatedPipes } = updatePipes(g.pipes, dt, stage.pipeSpeed, timeScale, g.totalTime)
    g.pipes = updatedPipes

    // Score from pipes
    const scored = checkPipesPassed(g.pipes, g.bird.x)
    if (scored > 0) {
      const mult = g.scoreX2Active ? 2 : 1
      g.score += scored * SCORE_PER_PIPE * mult
      if (g.slowMoActive) g.slowMoScore += scored
      play?.('score')
      setHudScore(g.score)
      addScorePopup(g, g.bird.x, g.bird.y - 30, `+${scored * mult}`, '#ffffff', 18)
    }

    // Power-up spawning
    g.powerupSpawnTimer += dt
    if (g.powerupSpawnTimer >= POWERUP_SPAWN_INTERVAL) {
      g.powerupSpawnTimer = 0
      const pu = trySpawnPowerup(POWERUP_SPAWN_INTERVAL, stage)
      if (pu) g.powerups.push(pu)
    }

    // Collectible movement
    g.collectibles = updateCollectibles(
      g.collectibles, dt, stage.pipeSpeed, timeScale,
      g.bird.x, g.bird.y, g.magnetActive
    )
    g.powerups = updatePowerups(g.powerups, dt, stage.pipeSpeed, timeScale)

    // Collectible collection
    const collectedIds = checkCollectibleCollision(g.bird, g.collectibles, g.shrinkActive)
    if (collectedIds.length) {
      for (const cid of collectedIds) {
        const item = g.collectibles.find(c => c.id === cid)
        if (!item) continue
        item.collected = true
        g.particles.push(...createCoinParticles(item.x, item.y, item.color))

        if (item.type === 'coin') {
          const mult = g.scoreX2Active ? 2 : 1
          g.score += COIN_VALUE * mult
          g.coinsThisRun++
          setHudScore(g.score)
          play?.('coin')
          addScorePopup(g, item.x, item.y - 18, `+${COIN_VALUE * mult}`, '#fbbf24', 15)
        } else if (item.type === 'gem') {
          const mult = g.scoreX2Active ? 2 : 1
          g.score += GEM_VALUE * mult
          setHudScore(g.score)
          play?.('gem')
          addScorePopup(g, item.x, item.y - 18, `+${GEM_VALUE * mult}`, '#a78bfa', 16)
        } else if (item.type === 'star') {
          const mult = g.scoreX2Active ? 2 : 1
          g.score += STAR_VALUE * mult
          setHudScore(g.score)
          play?.('star')
          addScorePopup(g, item.x, item.y - 22, `+${STAR_VALUE * mult}★`, '#fde047', 18)
        } else if (item.type === 'collection') {
          play?.('collection_item')
          addScorePopup(g, item.x, item.y - 22, '✦ Collected!', '#f0abfc', 16)
          onCollect?.(item, g.collectedItems)
        }
      }
    }

    // Power-up collection
    const collectedPuIds = checkCollectibleCollision(g.bird, g.powerups, g.shrinkActive)
    if (collectedPuIds.length) {
      for (const pid of collectedPuIds) {
        const pu = g.powerups.find(p => p.id === pid)
        if (!pu) continue
        pu.collected = true
        activatePowerup(g, pu.type)
        play?.('powerup')
        g.powerupsUsedSet.add(pu.type)
        addScorePopup(g, pu.x, pu.y - 22, POWERUPS[pu.type]?.name || '?', '#f0abfc', 15)
        onPowerup?.(pu.type)
      }
    }

    // Power-up timers
    updatePowerupTimers(g, dt)

    // Ghost pipe scoring
    if (g.ghostActive) {
      for (const pipe of g.pipes) {
        if (!pipe.ghostPassed && !pipe.passed && pipe.x + 29 < g.bird.x) {
          pipe.ghostPassed = true
          g.ghostPipes++
        }
      }
    }

    // Collision detection
    if (!g.ghostActive) {
      const hitPipe = checkPipeCollision(g.bird, g.pipes, g.shrinkActive)
      const hitBoundary = checkBoundaryCollision(g.bird, g.shrinkActive)

      if (hitPipe || hitBoundary) {
        if (g.shieldActive) {
          // Absorb hit
          g.shieldActive = false
          g.shieldTimer  = 0
          g.shieldSaves++
          play?.('shield_hit')
          setActivePowerup(null)
          // Push bird away from pipe
          g.bird.vy = -300
        } else {
          // Death
          killBird(g, play)
          return
        }
      }
    }

    // Update particles + score popups
    g.particles   = updateParticles(g.particles, dt)
    g.scorePopups = g.scorePopups
      .map(p => ({ ...p, y: p.y - 45 * dt, life: p.life - dt }))
      .filter(p => p.life > 0)
  }

  // ─── Kill bird ────────────────────────────────────────────────────────────
  function killBird(g, playFn) {
    playFn?.('death')
    g.particles.push(...createDeathParticles(g.bird.x, g.bird.y))
    setPhase('dead')

    const summary = buildSummary(g)
    onGameOver?.(summary)
  }

  // ─── Power-ups ────────────────────────────────────────────────────────────
  function activatePowerup(g, type) {
    const def = POWERUPS[type]
    if (!def) return
    // Reset all, then apply
    g.shieldActive  = type === 'shield'
    g.slowMoActive  = type === 'slow_mo'
    g.magnetActive  = type === 'magnet'
    g.shrinkActive  = type === 'shrink'
    g.scoreX2Active = type === 'score_x2'
    g.ghostActive   = type === 'ghost'

    g.shieldTimer  = type === 'shield'   ? def.duration : 0
    g.slowMoTimer  = type === 'slow_mo'  ? def.duration : 0
    g.magnetTimer  = type === 'magnet'   ? def.duration : 0
    g.shrinkTimer  = type === 'shrink'   ? def.duration : 0
    g.scoreX2Timer = type === 'score_x2' ? def.duration : 0
    g.ghostTimer   = type === 'ghost'    ? def.duration : 0

    setActivePowerup(type)
    setPowerupTimer(def.duration)
  }

  function updatePowerupTimers(g, dt) {
    const pairs = [
      ['shieldActive',  'shieldTimer',  'shield'],
      ['slowMoActive',  'slowMoTimer',  'slow_mo'],
      ['magnetActive',  'magnetTimer',  'magnet'],
      ['shrinkActive',  'shrinkTimer',  'shrink'],
      ['scoreX2Active', 'scoreX2Timer', 'score_x2'],
      ['ghostActive',   'ghostTimer',   'ghost'],
    ]
    let anyActive = false
    for (const [activeKey, timerKey, type] of pairs) {
      if (g[activeKey]) {
        g[timerKey] -= dt
        if (g[timerKey] <= 0) {
          g[activeKey] = false
          g[timerKey]  = 0
          play?.('powerup_expire')
          setActivePowerup(null)
          setPowerupTimer(0)
        } else {
          anyActive = true
          setPowerupTimer(g[timerKey])
        }
      }
    }
  }

  // ─── Score popups ─────────────────────────────────────────────────────────
  function addScorePopup(g, x, y, text, color, size) {
    g.scorePopups.push({ x, y, text, color, size, life: 0.8 })
  }

  // ─── Draw ─────────────────────────────────────────────────────────────────
  function drawFrame(g, timestamp) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas is scaled externally by GameCanvas
    // Draw via imported renderer functions
    const { drawBackground, drawPipes, drawBird, drawCollectibles, drawPowerups, drawParticles, drawScorePopups } = window.__flappyRenderer || {}
    if (!window.__flappyRenderer) return

    const time = timestamp / 1000

    drawBackground(ctx, g.bgId, g.bgLayers, time, blendStage(g.score).pipeSpeed)
    drawPipes(ctx, g.pipes, g.bgId)
    drawCollectibles(ctx, g.collectibles, time)
    drawCollectibles(ctx, g.powerups, time)  // reuse same draw path (different shape per type)
    drawPowerups(ctx, g.powerups, time)
    drawBird(ctx, g.bird, g.skinId, time, g.shieldActive, g.shrinkActive, g.ghostActive)
    drawParticles(ctx, g.particles)
    drawScorePopups(ctx, g.scorePopups)
  }

  // ─── Build game over summary ───────────────────────────────────────────────
  function buildSummary(g) {
    return {
      score:          g.score,
      coinsThisRun:   g.coinsThisRun,
      maxStage:       g.stageIdx,
      powerupsUsed:   g.powerupsUsedSet,
      shieldSaves:    g.shieldSaves,
      ghostPipes:     g.ghostPipes,
      slowMoScore:    g.slowMoScore,
    }
  }

  // ─── Start / stop loop ────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastTimeRef.current = null
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  const stopLoop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  useEffect(() => {
    return () => stopLoop()
  }, [stopLoop])

  // ─── Expose game ref for renderer (used in FlappyBirdGame) ────────────────
  const getGameRef = useCallback(() => gameRef.current, [])

  return {
    hudScore, activePowerup, powerupTimer, currentStage, phase, bgLayers,
    initGame, flap, startLoop, stopLoop, getGameRef,
  }
}

// ─── Initial game state ───────────────────────────────────────────────────────
function createGameState() {
  return {
    bird:          createBird(BIRD_X, CANVAS_H * 0.45),
    pipes:         [],
    collectibles:  [],
    powerups:      [],
    particles:     [],
    scorePopups:   [],
    score:         0,
    coinsThisRun:  0,
    started:       false,
    totalTime:     0,
    pipeTimer:     0,
    powerupSpawnTimer: 0,
    nextPipeId:    1,
    stageIdx:      0,
    // Power-up flags
    shieldActive:  false, shieldTimer:  0,
    slowMoActive:  false, slowMoTimer:  0,
    magnetActive:  false, magnetTimer:  0,
    shrinkActive:  false, shrinkTimer:  0,
    scoreX2Active: false, scoreX2Timer: 0,
    ghostActive:   false, ghostTimer:   0,
    // Run stats
    powerupsUsedSet: new Set(),
    shieldSaves:     0,
    ghostPipes:      0,
    slowMoScore:     0,
    // Per-run settings (set by FlappyBirdGame before startLoop)
    bgId:    'day',
    skinId:  'classic',
    bgLayers: null,
    collectedItems: {},
  }
}
