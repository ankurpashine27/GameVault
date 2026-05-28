/**
 * Flappy Bird SFX — Web Audio API synthesis, no external files.
 * All functions accept an AudioContext and a start time `t`.
 */

function osc(ctx, type, freq, t, end, vol = 0.3, freqEnd = null) {
  const g  = ctx.createGain()
  const o  = ctx.createOscillator()
  o.type   = type
  o.frequency.setValueAtTime(freq, t)
  if (freqEnd !== null) o.frequency.linearRampToValueAtTime(freqEnd, end)
  g.gain.setValueAtTime(0.001, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.01)
  g.gain.linearRampToValueAtTime(0.001, end)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t)
  o.stop(end + 0.05)
}

// Flap: short upward chirp
export function playFlap(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 520, t, t + 0.08, 0.15 * vol, 420)
}

// Score: bright ping
export function playScore(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 880, t, t + 0.12, 0.22 * vol, 1100)
  osc(ctx, 'sine', 1100, t + 0.06, t + 0.18, 0.18 * vol)
}

// Death: descending crunch
export function playDeath(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sawtooth', 300, t, t + 0.35, 0.3 * vol, 80)
  osc(ctx, 'square',   200, t + 0.05, t + 0.4, 0.2 * vol, 60)
}

// Hit (pipe): thud
export function playHit(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'square', 180, t, t + 0.15, 0.28 * vol, 90)
}

// Coin collect: light ding
export function playCoin(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 1200, t, t + 0.1, 0.15 * vol, 1400)
}

// Gem collect: double ding
export function playGem(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 1000, t, t + 0.1, 0.18 * vol, 1200)
  osc(ctx, 'sine', 1400, t + 0.08, t + 0.18, 0.18 * vol)
}

// Star collect: fanfare
export function playStar(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[659, 784, 988].forEach((f, i) => osc(ctx, 'sine', f, t + i * 0.07, t + i * 0.07 + 0.15, 0.2 * vol))
}

// Collection item: magical chime
export function playCollectionItem(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[523, 659, 784, 1047].forEach((f, i) => osc(ctx, 'sine', f, t + i * 0.06, t + i * 0.06 + 0.18, 0.18 * vol))
}

// Power-up collect: whoosh + chime
export function playPowerup(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 400, t, t + 0.12, 0.15 * vol, 900)
  osc(ctx, 'sine', 880, t + 0.08, t + 0.22, 0.2 * vol)
}

// Stage up: ascending fanfare
export function playStageUp(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[523, 659, 784, 1047].forEach((f, i) => osc(ctx, 'square', f, t + i * 0.09, t + i * 0.09 + 0.2, 0.18 * vol))
}

// Shield absorb: metallic clank
export function playShieldHit(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'square', 500, t, t + 0.15, 0.22 * vol, 200)
  osc(ctx, 'sine',   800, t + 0.02, t + 0.12, 0.18 * vol)
}

// Power-up expire: descending note
export function playPowerupExpire(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 600, t, t + 0.25, 0.15 * vol, 300)
}

// Achievement unlock: triumphant
export function playAchievement(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[523, 784, 1047, 1319].forEach((f, i) => osc(ctx, 'sine', f, t + i * 0.08, t + i * 0.08 + 0.25, 0.2 * vol))
}
