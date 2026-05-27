import { useState, useRef, useCallback } from 'react'

const LS_KEY = 'gamevault_sfx_muted'

// ── Low-level helpers ────────────────────────────────────────────────────────

function osc(ctx, type, freq, startT, endT, vol, freqEnd) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g)
  g.connect(ctx.destination)
  o.type = type
  o.frequency.setValueAtTime(freq, startT)
  if (freqEnd !== undefined) o.frequency.exponentialRampToValueAtTime(freqEnd, endT)
  g.gain.setValueAtTime(vol, startT)
  g.gain.exponentialRampToValueAtTime(0.001, endT)
  o.start(startT)
  o.stop(endT + 0.01)
}

function noise(ctx, startT, duration, vol) {
  const sampleRate = ctx.sampleRate
  const buf = ctx.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }
  const src = ctx.createBufferSource()
  const g = ctx.createGain()
  src.buffer = buf
  src.connect(g)
  g.connect(ctx.destination)
  g.gain.setValueAtTime(vol, startT)
  src.start(startT)
  src.stop(startT + duration + 0.01)
}

// ── Snake sounds ─────────────────────────────────────────────────────────────

// Eat food: crisp ascending ping
function snakeEat(ctx, t) {
  osc(ctx, 'sine', 440, t, t + 0.09, 0.28, 880)
}

// Collect power-up: sparkly major arpeggio C5→E5→G5→C6
function snakePowerUp(ctx, t) {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const s = t + i * 0.065
    osc(ctx, 'triangle', freq, s, s + 0.12, 0.22)
  })
}

// Game over: heavy descending crash + noise thud
function snakeGameOver(ctx, t) {
  osc(ctx, 'sawtooth', 220, t, t + 0.65, 0.38, 40)
  noise(ctx, t, 0.12, 0.45)
}

// Shield absorbs hit: metallic double ring
function snakeShieldHit(ctx, t) {
  osc(ctx, 'sine', 880, t, t + 0.25, 0.28)
  osc(ctx, 'sine', 1320, t, t + 0.18, 0.18)
}

// Speed boost activates: rising whoosh
function snakeSpeedBoost(ctx, t) {
  osc(ctx, 'sine', 300, t, t + 0.18, 0.2, 700)
}

// ── Tic-Tac-Toe sounds ───────────────────────────────────────────────────────

// Piece placed: soft wooden tap
function tttPlace(ctx, t) {
  osc(ctx, 'sine', 700, t, t + 0.055, 0.15)
  // subtle overtone for "wood" texture
  osc(ctx, 'sine', 1400, t, t + 0.025, 0.05)
}

// Win: triumphant ascending major arpeggio C5→E5→G5
function tttWin(ctx, t) {
  const notes = [523, 659, 784]
  notes.forEach((freq, i) => {
    const s = t + i * 0.1
    osc(ctx, 'sine', freq, s, s + 0.35, 0.28)
  })
  // extra shimmer on the last note
  osc(ctx, 'sine', 1047, t + 0.3, t + 0.55, 0.15)
}

// Lose: sad descending A4→F4→D4
function tttLose(ctx, t) {
  const notes = [440, 349, 294]
  notes.forEach((freq, i) => {
    const s = t + i * 0.12
    osc(ctx, 'sine', freq, s, s + 0.28, 0.22)
  })
}

// Draw: two notes together — G4 + B4 (unresolved feeling)
function tttDraw(ctx, t) {
  osc(ctx, 'sine', 392, t, t + 0.4, 0.18)
  osc(ctx, 'sine', 494, t, t + 0.4, 0.18)
}

// Power-up armed: quick rising blip
function tttPowerUpArm(ctx, t) {
  osc(ctx, 'sine', 600, t, t + 0.12, 0.18, 1200)
}

// Timer tick (≤3s remaining): brief click
function tttTimerTick(ctx, t) {
  osc(ctx, 'sine', 1100, t, t + 0.035, 0.12)
}

// ── Nexus sounds ─────────────────────────────────────────────────────────────

// Correct guess: bright ascending arpeggio C5→E5→G5
function nexusCorrect(ctx, t) {
  ;[523, 659, 784].forEach((f, i) => {
    const s = t + i * 0.07
    osc(ctx, 'sine', f, s, s + 0.2, 0.22)
  })
}

// Wrong guess: dull descending buzz
function nexusWrong(ctx, t) {
  osc(ctx, 'sawtooth', 200, t, t + 0.15, 0.2, 100)
}

// Hint reveal: soft rising whoosh
function nexusReveal(ctx, t) {
  osc(ctx, 'sine', 400, t, t + 0.12, 0.12, 800)
}

// Game over: descending closing motif A4→F4→D4
function nexusGameOver(ctx, t) {
  ;[440, 349, 294].forEach((f, i) => {
    const s = t + i * 0.18
    osc(ctx, 'sine', f, s, s + 0.5, 0.18)
  })
}

// ── Dispatch table ────────────────────────────────────────────────────────────

const SOUNDS = {
  'snake:eat':        snakeEat,
  'snake:powerUp':    snakePowerUp,
  'snake:gameOver':   snakeGameOver,
  'snake:shieldHit':  snakeShieldHit,
  'snake:speedBoost': snakeSpeedBoost,
  'ttt:place':        tttPlace,
  'ttt:win':          tttWin,
  'ttt:lose':         tttLose,
  'ttt:draw':         tttDraw,
  'ttt:powerUpArm':   tttPowerUpArm,
  'ttt:timerTick':    tttTimerTick,
  'nexus:correct':    nexusCorrect,
  'nexus:wrong':      nexusWrong,
  'nexus:reveal':     nexusReveal,
  'nexus:gameover':   nexusGameOver,
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSound() {
  const ctxRef = useRef(null)
  const [muted, setMutedState] = useState(
    () => localStorage.getItem(LS_KEY) === 'true'
  )
  // Keep a ref so the play callback never goes stale
  const mutedRef = useRef(muted)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {})
    }
    return ctxRef.current
  }, [])

  const play = useCallback((name) => {
    if (mutedRef.current) return
    const fn = SOUNDS[name]
    if (!fn) return
    try {
      const ctx = getCtx()
      fn(ctx, ctx.currentTime)
    } catch (_) {
      // AudioContext may be unavailable (e.g. in some sandboxed environments)
    }
  }, [getCtx])

  const toggleMute = useCallback(() => {
    setMutedState(prev => {
      const next = !prev
      mutedRef.current = next
      localStorage.setItem(LS_KEY, next ? 'true' : 'false')
      return next
    })
  }, [])

  return { play, muted, toggleMute }
}
