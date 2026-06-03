/**
 * Pulse Rush — game orchestration hook. Owns the requestAnimationFrame loop,
 * raw keyboard/pointer input (with input buffering), the beat-pulse sync, and
 * the run lifecycle. Rendering is done here too (it holds the loop + canvas).
 *
 * The host component owns screen state and passes callbacks for death/complete.
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { createGameState, advance, progressOf } from '../engine/gameLoop.js'
import { drawGame } from '../engine/renderer.js'
import { createInfiniteRun, infiniteLevel } from '../engine/infiniteGenerator.js'
import { BEAT_WIDTH, LOGICAL_W, LOGICAL_H } from '../constants.js'

const DEATH_FREEZE = 0.45
const COMPLETE_DELAY = 0.4

export function useGeoDashGame({ audio, settingsApi, practice, canvasRef, callbacks }) {
  const gameRef = useRef(null)
  const rafRef = useRef(null)
  const loopRef = useRef(null)
  const lastTsRef = useRef(0)
  const runningRef = useRef(false)
  const phaseTimerRef = useRef(0)
  const wrapperRef = useRef(null)
  const attemptsRef = useRef(0)
  const infiniteRef = useRef(null)
  const hudTickRef = useRef(0)

  const input = useRef({ held: false, bufferFrames: 0 })

  const [hud, setHud] = useState({
    progress: 0, attempts: 0, form: 'cube', coins: [], practice: false,
    infinite: 0, status: 'idle', speed: 1, mini: false,
  })

  const { settings } = settingsApi

  // ─── Input registration ──────────────────────────────────────────────────
  const registerPress = useCallback(() => {
    input.current.bufferFrames = (settings.inputBufferFrames || 3) + 1
  }, [settings.inputBufferFrames])

  useEffect(() => {
    const down = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        if (!e.repeat) { input.current.held = true; registerPress() }
      } else if ((e.code === 'KeyP') && gameRef.current?.practice && runningRef.current) {
        e.preventDefault()
        if (practice.placeCheckpoint(gameRef.current)) audio.playSfx('checkpoint')
      }
    }
    const up = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') input.current.held = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [registerPress, practice, audio])

  // Pointer input on the canvas wrapper.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const down = (e) => { e.preventDefault(); input.current.held = true; registerPress() }
    const up = () => { input.current.held = false }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => { el.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up) }
  }, [registerPress])

  // ─── The loop (reassigned each render to read latest state) ────────────────
  loopRef.current = (ts) => {
    const g = gameRef.current
    if (!g || !runningRef.current) return
    let dt = (ts - lastTsRef.current) / 1000
    lastTsRef.current = ts
    if (!isFinite(dt) || dt < 0) dt = 0
    dt = Math.min(dt, 0.05)

    const inp = { held: input.current.held, pressed: input.current.bufferFrames > 0 }
    const events = advance(g, dt, inp)
    if (g.actionTaken) input.current.bufferFrames = 0
    else input.current.bufferFrames = Math.max(0, input.current.bufferFrames - 1)

    // Beat pulse
    const bi = audio.getBeatInfo()
    g.beatPulse = Math.max(0, 1 - bi.phase * 3)
    g.onKick = bi.onKick

    // Dispatch events
    for (const ev of events) {
      if (ev.type === 'sfx') audio.playSfx(ev.name, ev.opts)
      else if (ev.type === 'coin') callbacks.onCoin?.(ev.id)
    }

    // Render — clear full device buffer (letterbox), then draw in logical space.
    const canvas = canvasRef.current?.getCanvas?.()
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.setTransform(canvas._scale || 1, 0, 0, canvas._scale || 1, canvas._ox || 0, canvas._oy || 0)
      ctx.beginPath()
      ctx.rect(0, 0, LOGICAL_W, LOGICAL_H)
      ctx.clip()
      drawGame(ctx, g)
      ctx.restore()
    }

    // Lifecycle transitions — on completion/death-freeze end, stop scheduling
    // here (finish* either ends the run or restarts the loop itself).
    if (g.status === 'dead') {
      phaseTimerRef.current += dt
      if (phaseTimerRef.current >= DEATH_FREEZE) {
        runningRef.current = false
        rafRef.current = null
        finishDeath(g)
        return
      }
    } else if (g.status === 'complete') {
      phaseTimerRef.current += dt
      if (phaseTimerRef.current >= COMPLETE_DELAY) {
        runningRef.current = false
        rafRef.current = null
        finishComplete(g)
        return
      }
    }

    // Throttled HUD update
    if (++hudTickRef.current % 4 === 0) updateHud(g)

    rafRef.current = requestAnimationFrame(loopRef.current)
  }

  const updateHud = useCallback((g) => {
    const beats = g.infinite ? g.worldX / BEAT_WIDTH : 0
    setHud({
      progress: progressOf(g),
      attempts: attemptsRef.current,
      form: g.player.form,
      coins: Array.from(g.collectedCoins),
      practice: g.practice,
      infinite: g.infinite ? Math.floor(beats * g.speedScale) : 0,
      status: g.status,
      speed: g.speedScale,
      mini: g.player.mini,
    })
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastTsRef.current = performance.now()
    runningRef.current = true
    rafRef.current = requestAnimationFrame(loopRef.current)
  }, [])

  const stopLoop = useCallback(() => {
    runningRef.current = false
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  // ─── Lifecycle handlers ────────────────────────────────────────────────────
  const finishDeath = useCallback((g) => {
    audio.stopMusic()
    callbacks.onDeath?.({
      percent: Math.round(progressOf(g) * 100),
      coins: Array.from(g.collectedCoins),
      attempts: attemptsRef.current,
      infinite: g.infinite ? { beats: g.worldX / BEAT_WIDTH, score: Math.floor((g.worldX / BEAT_WIDTH) * g.speedScale), maxSpeed: g.speedScale } : null,
      deathRect: null,
    })
  }, [audio, callbacks])

  const finishComplete = useCallback((g) => {
    audio.stopMusic()
    callbacks.onComplete?.({
      coins: Array.from(g.collectedCoins),
      attempts: attemptsRef.current,
    })
  }, [audio, callbacks])

  // ─── Public controls ───────────────────────────────────────────────────────
  const startRun = useCallback((level, { practice: prac = false, infinite = false } = {}) => {
    audio.ensureCtx()
    let lvl = level
    let inf = null
    if (infinite) {
      inf = createInfiniteRun(Date.now())
      infiniteRef.current = inf
      lvl = infiniteLevel()
    }
    const g = createGameState({
      level: lvl, iconConfig: settingsApi.iconConfig, settings, practice: prac, infinite: inf,
    })
    gameRef.current = g
    phaseTimerRef.current = 0
    attemptsRef.current += 1
    input.current.bufferFrames = 0
    audio.startMusic(lvl)
    updateHud(g)
    startLoop()
  }, [audio, settingsApi.iconConfig, settings, startLoop, updateHud])

  const retry = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    startRun(g.infinite ? null : g.level, { practice: g.practice, infinite: !!g.infinite })
  }, [startRun])

  const respawnAtCheckpoint = useCallback(() => {
    const g = gameRef.current
    if (!g) return false
    if (practice.respawn(g)) {
      phaseTimerRef.current = 0
      attemptsRef.current += 1
      audio.startMusic(g.level) // music restarts from bar 1 (deliberate)
      startLoop()
      return true
    }
    return false
  }, [practice, audio, startLoop])

  const pauseRun = useCallback(() => { stopLoop(); audio.suspend() }, [stopLoop, audio])
  const resumeRun = useCallback(() => { audio.resume(); startLoop() }, [audio, startLoop])
  const stopRun = useCallback(() => { stopLoop(); audio.stopMusic() }, [stopLoop, audio])

  // Tab visibility → auto pause.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && runningRef.current) {
        pauseRun()
        callbacks.onAutoPause?.()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pauseRun, callbacks])

  // Unmount-only cleanup. Must NOT depend on stopRun/audio (their identities
  // change every render, which would otherwise tear down the running loop on
  // each re-render — e.g. the throttled HUD setState).
  const cleanupRef = useRef(null)
  cleanupRef.current = () => { stopLoop(); audio.stopMusic() }
  useEffect(() => () => cleanupRef.current?.(), [])

  return {
    wrapperRef, hud, gameRef, attemptsRef,
    startRun, retry, respawnAtCheckpoint, pauseRun, resumeRun, stopRun,
    isRunning: () => runningRef.current,
    setAttempts: (n) => { attemptsRef.current = n },
  }
}
