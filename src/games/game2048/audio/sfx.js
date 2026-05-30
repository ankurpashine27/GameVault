/**
 * 2048 SFX — Web Audio API synthesis, no external files.
 */

function osc(ctx, type, freq, t, end, vol = 0.3, freqEnd = null) {
  const g = ctx.createGain()
  const o = ctx.createOscillator()
  o.type = type
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

// Slide: short soft whoosh
export function playSlide(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 320, t, t + 0.08, 0.08 * vol, 260)
}

// Merge: pop, pitch scales with log2(tileValue)
export function playMerge(ctx, vol = 1, tileValue = 4) {
  const t = ctx.currentTime
  const semitones = Math.log2(tileValue) - 1
  const baseFreq = 300 * Math.pow(1.06, semitones)
  const topFreq  = baseFreq * 1.5
  osc(ctx, 'sine', baseFreq, t, t + 0.1, 0.18 * vol, topFreq)
  osc(ctx, 'triangle', topFreq, t + 0.04, t + 0.14, 0.12 * vol)
}

// Spawn: very quiet soft click
export function playSpawn(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 600, t, t + 0.06, 0.04 * vol, 400)
}

// Undo: descending whoosh
export function playUndo(ctx, vol = 1) {
  const t = ctx.currentTime
  osc(ctx, 'sine', 500, t, t + 0.15, 0.15 * vol, 280)
  osc(ctx, 'triangle', 350, t + 0.05, t + 0.18, 0.1 * vol, 200)
}

// Game over: descending 3-note tone
export function playGameOver(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[440, 349, 262].forEach((f, i) => osc(ctx, 'sine', f, t + i * 0.15, t + i * 0.15 + 0.28, 0.2 * vol))
}

// Win: ascending 4-note fanfare
export function playWin(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[523, 659, 784, 1047].forEach((f, i) =>
    osc(ctx, 'sine', f, t + i * 0.1, t + i * 0.1 + 0.3, 0.22 * vol))
}

// Milestone: warm 3-note chime
export function playMilestone(ctx, vol = 1) {
  const t = ctx.currentTime
  ;[659, 784, 988].forEach((f, i) =>
    osc(ctx, 'sine', f, t + i * 0.08, t + i * 0.08 + 0.25, 0.2 * vol))
}

// Combo tick: small ascending pip
export function playComboTick(ctx, vol = 1, comboLevel = 1) {
  const t = ctx.currentTime
  const freq = 600 + comboLevel * 80
  osc(ctx, 'sine', freq, t, t + 0.07, 0.1 * vol, freq * 1.2)
}
