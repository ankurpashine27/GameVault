/**
 * Grimhold — synthesized sound effects (Web Audio). play(ctx, dest, name, opts).
 */
function tone(ctx, dest, { type = 'sine', f0, f1, t0, dur, gain = 0.3, curve = 'exp' }) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.setValueAtTime(f0, t0)
  if (f1 != null && f1 !== f0) {
    if (curve === 'exp') o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur)
    else o.frequency.linearRampToValueAtTime(f1, t0 + dur)
  }
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.01, dur * 0.3))
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(dest); o.start(t0); o.stop(t0 + dur + 0.02)
}
function noise(ctx, dest, { t0, dur, gain = 0.2, hp = 0, lp = 20000 }) {
  const len = Math.max(1, (ctx.sampleRate * dur) | 0)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const s = ctx.createBufferSource(); s.buffer = buf
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  let node = s
  if (hp > 0) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; node.connect(f); node = f }
  if (lp < 20000) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; node.connect(f); node = f }
  node.connect(g).connect(dest); s.start(t0); s.stop(t0 + dur + 0.02)
}

export const SFX = {
  footstep: (c, d, t, o = {}) => noise(c, d, { t0: t, dur: 0.06, gain: o.sprint ? 0.09 : 0.06, hp: 200, lp: 1200 }),
  w_dagger: (c, d, t) => { noise(c, d, { t0: t, dur: 0.08, gain: 0.12, hp: 2000 }); tone(c, d, { type: 'square', f0: 600, f1: 200, t0: t, dur: 0.08, gain: 0.08 }) },
  w_flintlock: (c, d, t) => { tone(c, d, { type: 'square', f0: 220, f1: 60, t0: t, dur: 0.18, gain: 0.3 }); noise(c, d, { t0: t, dur: 0.2, gain: 0.3, hp: 400 }) },
  w_blunderbuss: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 140, f1: 40, t0: t, dur: 0.3, gain: 0.35 }); noise(c, d, { t0: t, dur: 0.34, gain: 0.4, lp: 3000 }) },
  w_crossbow: (c, d, t) => { tone(c, d, { type: 'sine', f0: 900, f1: 300, t0: t, dur: 0.12, gain: 0.14 }); noise(c, d, { t0: t + 0.02, dur: 0.1, gain: 0.1, hp: 3000 }) },
  w_musket: (c, d, t) => { tone(c, d, { type: 'square', f0: 180, f1: 50, t0: t, dur: 0.28, gain: 0.34 }); noise(c, d, { t0: t, dur: 0.3, gain: 0.34, hp: 300 }) },
  w_flask: (c, d, t) => { noise(c, d, { t0: t, dur: 0.1, gain: 0.18, hp: 3000 }); tone(c, d, { type: 'sawtooth', f0: 120, f1: 300, t0: t + 0.05, dur: 0.25, gain: 0.2 }) },
  w_staff: (c, d, t) => { tone(c, d, { type: 'sine', f0: 300, f1: 900, t0: t, dur: 0.2, gain: 0.18 }); tone(c, d, { type: 'triangle', f0: 600, f1: 1400, t0: t + 0.02, dur: 0.2, gain: 0.12 }) },
  w_cannon: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 90, f1: 30, t0: t, dur: 0.5, gain: 0.45 }); noise(c, d, { t0: t, dur: 0.5, gain: 0.4, lp: 1800 }) },
  empty: (c, d, t) => tone(c, d, { type: 'square', f0: 200, f1: 180, t0: t, dur: 0.04, gain: 0.08 }),
  reload: (c, d, t) => { tone(c, d, { type: 'square', f0: 400, f1: 300, t0: t, dur: 0.05, gain: 0.08 }); tone(c, d, { type: 'square', f0: 250, f1: 200, t0: t + 0.12, dur: 0.05, gain: 0.08 }) },
  door: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 70, f1: 50, t0: t, dur: 0.6, gain: 0.18 }); noise(c, d, { t0: t, dur: 0.6, gain: 0.12, lp: 800 }) },
  locked: (c, d, t) => tone(c, d, { type: 'square', f0: 160, f1: 120, t0: t, dur: 0.12, gain: 0.12 }),
  secret: (c, d, t) => { noise(c, d, { t0: t, dur: 0.7, gain: 0.14, hp: 200, lp: 1400 }); tone(c, d, { type: 'sine', f0: 400, f1: 700, t0: t, dur: 0.5, gain: 0.1 }) },
  key: (c, d, t) => { tone(c, d, { type: 'square', f0: 800, f1: 800, t0: t, dur: 0.06, gain: 0.12 }); tone(c, d, { type: 'sine', f0: 1200, f1: 1600, t0: t + 0.06, dur: 0.12, gain: 0.12 }) },
  gold: (c, d, t) => { [900, 1200, 1500].forEach((f, i) => tone(c, d, { type: 'square', f0: f, f1: f, t0: t + i * 0.03, dur: 0.05, gain: 0.08 })) },
  health: (c, d, t) => { [523, 659, 784].forEach((f, i) => tone(c, d, { type: 'sine', f0: f, f1: f, t0: t + i * 0.05, dur: 0.12, gain: 0.12 })) },
  ammo: (c, d, t) => tone(c, d, { type: 'square', f0: 300, f1: 500, t0: t, dur: 0.08, gain: 0.1 }),
  weapon: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 200, f1: 900, t0: t, dur: 0.3, gain: 0.16 }) },
  curse: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 200, f1: 80, t0: t, dur: 0.5, gain: 0.2 }) },
  explosion: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 100, f1: 30, t0: t, dur: 0.4, gain: 0.4 }); noise(c, d, { t0: t, dur: 0.45, gain: 0.4, lp: 2000 }) },
  hurt: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 300, f1: 140, t0: t, dur: 0.18, gain: 0.18 }) },
  death: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 260, f1: 50, t0: t, dur: 0.8, gain: 0.3 }); noise(c, d, { t0: t, dur: 0.6, gain: 0.2, lp: 1500 }) },
  enemy_attack: (c, d, t) => tone(c, d, { type: 'square', f0: 180, f1: 120, t0: t, dur: 0.1, gain: 0.08 }),
  enemy_alert: (c, d, t) => tone(c, d, { type: 'sawtooth', f0: 300, f1: 500, t0: t, dur: 0.18, gain: 0.1 }),
  enemy_die: (c, d, t) => tone(c, d, { type: 'sawtooth', f0: 240, f1: 60, t0: t, dur: 0.3, gain: 0.14 }),
  boss_roar: (c, d, t) => { tone(c, d, { type: 'sawtooth', f0: 120, f1: 50, t0: t, dur: 1.0, gain: 0.3 }); noise(c, d, { t0: t, dur: 1.0, gain: 0.15, lp: 800 }) },
  level_complete: (c, d, t) => { [523, 659, 784, 1047].forEach((f, i) => tone(c, d, { type: 'triangle', f0: f, f1: f, t0: t + i * 0.12, dur: 0.2, gain: 0.2 })) },
  game_over: (c, d, t) => { [400, 330, 260, 180].forEach((f, i) => tone(c, d, { type: 'sawtooth', f0: f, f1: f, t0: t + i * 0.2, dur: 0.35, gain: 0.2 })) },
}

export function playSfx(ctx, dest, name, opts) {
  const fn = SFX[name]
  if (fn) fn(ctx, dest, ctx.currentTime, opts)
}
