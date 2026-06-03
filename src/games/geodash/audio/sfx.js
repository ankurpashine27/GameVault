/**
 * Pulse Rush — sound effects, all synthesized via Web Audio API.
 * Each effect is a function (ctx, dest, t, opts) that schedules nodes at audio
 * time `t`. `dest` is the SFX master gain node.
 */

function tone(ctx, dest, { type = 'sine', f0, f1, t0, dur, gain = 0.3, curve = 'exp' }) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(f0, t0)
  if (f1 != null && f1 !== f0) {
    if (curve === 'exp') osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur)
    else osc.frequency.linearRampToValueAtTime(f1, t0 + dur)
  }
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.01, dur * 0.2))
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(dest)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function noise(ctx, dest, { t0, dur, gain = 0.2, hp = 0, lp = 20000 }) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  let node = src
  if (hp > 0) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; node.connect(f); node = f }
  if (lp < 20000) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; node.connect(f); node = f }
  node.connect(g).connect(dest)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

export const SFX = {
  jump(ctx, dest, t, o = {}) {
    const p = o.power ?? 1
    tone(ctx, dest, { type: 'square', f0: 320 + p * 180, f1: 140, t0: t, dur: 0.12, gain: 0.22 })
  },
  thrust(ctx, dest, t) {
    tone(ctx, dest, { type: 'triangle', f0: 180, f1: 220, t0: t, dur: 0.08, gain: 0.08 })
  },
  ballflip(ctx, dest, t) {
    tone(ctx, dest, { type: 'sawtooth', f0: 500, f1: 180, t0: t, dur: 0.12, gain: 0.16 })
    noise(ctx, dest, { t0: t, dur: 0.08, gain: 0.1, hp: 800 })
  },
  ufohop(ctx, dest, t) {
    tone(ctx, dest, { type: 'sine', f0: 380, f1: 620, t0: t, dur: 0.1, gain: 0.18 })
  },
  wave(ctx, dest, t) {
    tone(ctx, dest, { type: 'sine', f0: 520, f1: 540, t0: t, dur: 0.06, gain: 0.06 })
  },
  spider(ctx, dest, t) {
    tone(ctx, dest, { type: 'sawtooth', f0: 900, f1: 120, t0: t, dur: 0.1, gain: 0.18 })
    noise(ctx, dest, { t0: t, dur: 0.05, gain: 0.12, hp: 2000 })
  },
  swing(ctx, dest, t) {
    noise(ctx, dest, { t0: t, dur: 0.16, gain: 0.1, hp: 300, lp: 2400 })
  },
  portal(ctx, dest, t) {
    tone(ctx, dest, { type: 'triangle', f0: 300, f1: 900, t0: t, dur: 0.18, gain: 0.16 })
    tone(ctx, dest, { type: 'sine', f0: 600, f1: 1200, t0: t + 0.02, dur: 0.18, gain: 0.1 })
  },
  orb(ctx, dest, t, o = {}) {
    const base = o.color === 'pink' ? 700 : o.color === 'red' ? 300 : 900
    tone(ctx, dest, { type: 'sine', f0: base, f1: base * 1.5, t0: t, dur: 0.12, gain: 0.16 })
  },
  orb_flip(ctx, dest, t) {
    tone(ctx, dest, { type: 'sine', f0: 240, f1: 700, t0: t, dur: 0.14, gain: 0.16 })
  },
  coin(ctx, dest, t) {
    tone(ctx, dest, { type: 'square', f0: 990, f1: 990, t0: t, dur: 0.07, gain: 0.14 })
    tone(ctx, dest, { type: 'square', f0: 1480, f1: 1480, t0: t + 0.07, dur: 0.1, gain: 0.14 })
  },
  death(ctx, dest, t) {
    tone(ctx, dest, { type: 'sawtooth', f0: 200, f1: 40, t0: t, dur: 0.4, gain: 0.25 })
    noise(ctx, dest, { t0: t, dur: 0.35, gain: 0.2, lp: 1800 })
  },
  complete(ctx, dest, t) {
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((f, i) => tone(ctx, dest, { type: 'triangle', f0: f, f1: f, t0: t + i * 0.12, dur: 0.22, gain: 0.2 }))
  },
  checkpoint(ctx, dest, t) {
    tone(ctx, dest, { type: 'sine', f0: 660, f1: 880, t0: t, dur: 0.1, gain: 0.14 })
  },
  achievement(ctx, dest, t) {
    const notes = [659, 880, 1047]
    notes.forEach((f, i) => tone(ctx, dest, { type: 'triangle', f0: f, f1: f, t0: t + i * 0.1, dur: 0.3, gain: 0.18 }))
  },
  beat(ctx, dest, t) {
    tone(ctx, dest, { type: 'sine', f0: 90, f1: 55, t0: t, dur: 0.07, gain: 0.05 })
  },
}

export function playSfx(ctx, dest, name, opts) {
  const fn = SFX[name]
  if (fn) fn(ctx, dest, ctx.currentTime, opts)
}
