// ─── SFX helpers ──────────────────────────────────────────────────────────────
function osc(ctx, type, freq, start, duration, vol, attack = 0.005, release = 0.05) {
  if (!ctx) return
  try {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, start)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(vol, start + attack)
    g.gain.exponentialRampToValueAtTime(0.001, start + duration)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(start)
    o.stop(start + duration + release)
  } catch {}
}

function freqSlide(ctx, type, freqFrom, freqTo, start, duration, vol) {
  if (!ctx) return
  try {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freqFrom, start)
    o.frequency.linearRampToValueAtTime(freqTo, start + duration)
    g.gain.setValueAtTime(vol, start)
    g.gain.exponentialRampToValueAtTime(0.001, start + duration)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(start)
    o.stop(start + duration + 0.02)
  } catch {}
}

function noise(ctx, duration, vol, start) {
  if (!ctx) return
  try {
    const bufSize = Math.floor(ctx.sampleRate * duration)
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

    const src = ctx.createBufferSource()
    const g = ctx.createGain()
    src.buffer = buf
    g.gain.setValueAtTime(vol, start)
    g.gain.exponentialRampToValueAtTime(0.001, start + duration)
    src.connect(g)
    g.connect(ctx.destination)
    src.start(start)
    src.stop(start + duration + 0.01)
  } catch {}
}

// ─── Individual SFX functions ────────────────────────────────────────────────

export function playMove(ctx, vol = 0.3) {
  if (!ctx) return
  const t = ctx.currentTime
  osc(ctx, 'square', 180, t, 0.04, vol * 0.4, 0.002, 0.02)
}

export function playRotate(ctx, vol = 0.4) {
  if (!ctx) return
  const t = ctx.currentTime
  freqSlide(ctx, 'sine', 300, 500, t, 0.08, vol * 0.5)
}

export function playSoftDrop(ctx, vol = 0.3) {
  if (!ctx) return
  const t = ctx.currentTime
  osc(ctx, 'square', 150, t, 0.03, vol * 0.3, 0.001, 0.02)
}

export function playHardDrop(ctx, vol = 0.6) {
  if (!ctx) return
  const t = ctx.currentTime
  freqSlide(ctx, 'square', 400, 80, t, 0.15, vol * 0.7)
  noise(ctx, 0.08, vol * 0.3, t)
}

export function playLock(ctx, vol = 0.5) {
  if (!ctx) return
  const t = ctx.currentTime
  osc(ctx, 'square', 220, t, 0.06, vol * 0.6, 0.002, 0.04)
  noise(ctx, 0.04, vol * 0.15, t)
}

export function playHold(ctx, vol = 0.4) {
  if (!ctx) return
  const t = ctx.currentTime
  freqSlide(ctx, 'sine', 600, 400, t, 0.1, vol * 0.5)
}

export function playLineClear(ctx, vol = 0.7, lines = 1) {
  if (!ctx) return
  const t = ctx.currentTime
  const pitches = [262, 330, 392, 523]
  for (let i = 0; i < lines; i++) {
    osc(ctx, 'square', pitches[i] ?? 523, t + i * 0.04, 0.15, vol * 0.6, 0.005, 0.08)
  }
  if (lines === 4) {
    // Tetris fanfare
    osc(ctx, 'square', 523, t + 0.16, 0.2, vol * 0.8, 0.005, 0.1)
    osc(ctx, 'square', 659, t + 0.28, 0.25, vol * 0.8, 0.005, 0.1)
    osc(ctx, 'square', 784, t + 0.4, 0.3, vol, 0.005, 0.15)
  }
}

export function playTSpin(ctx, vol = 0.7) {
  if (!ctx) return
  const t = ctx.currentTime
  osc(ctx, 'sine', 440, t, 0.05, vol * 0.6, 0.005, 0.03)
  osc(ctx, 'triangle', 880, t + 0.04, 0.12, vol * 0.7, 0.005, 0.06)
  osc(ctx, 'sine', 1320, t + 0.1, 0.15, vol * 0.8, 0.005, 0.1)
}

export function playCombo(ctx, vol = 0.6, count = 1) {
  if (!ctx) return
  const t = ctx.currentTime
  const baseFreq = 262 * Math.pow(1.12, Math.min(count, 12))
  osc(ctx, 'square', baseFreq, t, 0.12, vol * 0.7, 0.005, 0.06)
  osc(ctx, 'square', baseFreq * 1.5, t + 0.04, 0.1, vol * 0.5, 0.005, 0.05)
}

export function playBackToBack(ctx, vol = 0.8) {
  if (!ctx) return
  const t = ctx.currentTime
  const notes = [523, 659, 784, 1046]
  for (let i = 0; i < notes.length; i++) {
    osc(ctx, 'sine', notes[i], t + i * 0.06, 0.18, vol * 0.65, 0.005, 0.09)
  }
}

export function playPerfectClear(ctx, vol = 1.0) {
  if (!ctx) return
  const t = ctx.currentTime
  const triumph = [523, 659, 784, 1046, 1318, 1568, 2093]
  for (let i = 0; i < triumph.length; i++) {
    osc(ctx, 'sine', triumph[i], t + i * 0.07, 0.3, vol * 0.7, 0.01, 0.15)
    osc(ctx, 'square', triumph[i] * 0.5, t + i * 0.07, 0.25, vol * 0.3, 0.01, 0.1)
  }
}

export function playLevelUp(ctx, vol = 0.8) {
  if (!ctx) return
  const t = ctx.currentTime
  const chime = [659, 784, 988, 1318]
  for (let i = 0; i < chime.length; i++) {
    osc(ctx, 'triangle', chime[i], t + i * 0.1, 0.3, vol * 0.6, 0.01, 0.15)
  }
}

export function playPowerupEarn(ctx, vol = 0.5) {
  if (!ctx) return
  const t = ctx.currentTime
  freqSlide(ctx, 'sine', 800, 1200, t, 0.12, vol * 0.5)
}

export function playPowerupActivate(ctx, vol = 0.7, type = 'bomb') {
  if (!ctx) return
  const t = ctx.currentTime
  switch (type) {
    case 'bomb':
      freqSlide(ctx, 'sawtooth', 400, 80, t, 0.2, vol * 0.8)
      noise(ctx, 0.15, vol * 0.4, t)
      break
    case 'slow':
      freqSlide(ctx, 'sine', 600, 300, t, 0.3, vol * 0.6)
      osc(ctx, 'sine', 450, t + 0.1, 0.25, vol * 0.4, 0.01, 0.1)
      break
    case 'ghost_clear':
      for (let i = 0; i < 4; i++) {
        osc(ctx, 'sine', 880 + i * 110, t + i * 0.05, 0.12, vol * 0.5, 0.005, 0.06)
      }
      break
    case 'swap':
      freqSlide(ctx, 'sine', 500, 800, t, 0.12, vol * 0.6)
      break
    default:
      osc(ctx, 'triangle', 660, t, 0.15, vol * 0.5, 0.01, 0.08)
  }
}

export function playGameOver(ctx, vol = 0.7) {
  if (!ctx) return
  const t = ctx.currentTime
  const sad = [392, 330, 262, 196]
  for (let i = 0; i < sad.length; i++) {
    osc(ctx, 'sawtooth', sad[i], t + i * 0.2, 0.3, vol * 0.6, 0.01, 0.15)
  }
}

export function playWarning(ctx, vol = 0.5) {
  if (!ctx) return
  const t = ctx.currentTime
  // Heartbeat pulse
  osc(ctx, 'sine', 80, t, 0.1, vol * 0.7, 0.005, 0.05)
  osc(ctx, 'sine', 80, t + 0.15, 0.08, vol * 0.5, 0.005, 0.04)
}
