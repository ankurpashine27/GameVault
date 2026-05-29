// ─── Tic-Tac-Toe SFX — Web Audio API synthesis ─────────────────────────────
// Self-contained; no shared/useSound dependency.

function osc(ctx, type, freq, startT, endT, vol, freqEnd) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g)
  g.connect(ctx.destination)
  o.type = type
  o.frequency.setValueAtTime(freq, startT)
  if (freqEnd !== undefined)
    o.frequency.exponentialRampToValueAtTime(freqEnd, endT)
  g.gain.setValueAtTime(vol, startT)
  g.gain.exponentialRampToValueAtTime(0.001, endT)
  o.start(startT)
  o.stop(endT + 0.01)
}

// Piece placed: soft wooden tap
export function playPlace(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 700, t, t + 0.055, 0.15 * vol)
  osc(ctx, 'sine', 1400, t, t + 0.025, 0.05 * vol)
}

// Win: triumphant ascending C5→E5→G5 + shimmer
export function playWin(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[523, 659, 784].forEach((freq, i) => {
    const s = t + i * 0.1
    osc(ctx, 'sine', freq, s, s + 0.35, 0.28 * vol)
  })
  osc(ctx, 'sine', 1047, t + 0.3, t + 0.55, 0.15 * vol)
}

// Lose: sad descending A4→F4→D4
export function playLose(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[440, 349, 294].forEach((freq, i) => {
    const s = t + i * 0.12
    osc(ctx, 'sine', freq, s, s + 0.28, 0.22 * vol)
  })
}

// Draw: unresolved G4+B4 (incomplete cadence feeling)
export function playDraw(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 392, t, t + 0.4, 0.18 * vol)
  osc(ctx, 'sine', 494, t, t + 0.4, 0.18 * vol)
}

// Power-up armed: quick rising blip
export function playPowerUpArm(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 600, t, t + 0.12, 0.18 * vol, 1200)
}

// Timer tick (≤3s): brief click
export function playTimerTick(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 1100, t, t + 0.035, 0.12 * vol)
}
