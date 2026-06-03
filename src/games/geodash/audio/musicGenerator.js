/**
 * Pulse Rush — procedural per-level music. Each level gets a distinct looping
 * electronic/chiptune track built from oscillators and a lookahead scheduler.
 * Tracks loop seamlessly (the pattern repeats every PATTERN_BEATS beats) and
 * align kick hits to beats 1 & 3 with texture on 2 & 4.
 */
import { midiToFreq } from './beatSync.js'
import { makePRNG } from '../utils.js'

const MODES = {
  major:    [0, 2, 4, 5, 7, 9, 11],
  minor:    [0, 2, 3, 5, 7, 8, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  dorian:   [0, 2, 3, 5, 7, 9, 10],
}
const PATTERN_BEATS = 16
const LOOKAHEAD = 0.12
const TICK_MS = 25

/** Derive musical character from a level. */
function characterFor(level) {
  const bpm = level.bpm
  const aggressive = bpm >= 150
  const dark = level.difficulty?.startsWith('demon') || bpm >= 165
  const mode = dark ? (bpm >= 180 ? 'phrygian' : 'minor') : (bpm >= 135 ? 'dorian' : 'major')
  // Root: spread keys across levels using a hash of the id.
  let h = 0
  for (const c of level.id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const root = 48 + (h % 12) // C3..B3
  return { mode: MODES[mode], root, aggressive, dark, bpm }
}

export function createMusicTrack(ctx, dest, level) {
  const ch = characterFor(level)
  const rng = makePRNG(level.id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7))
  const spb = 60 / level.bpm

  // Pre-compose a 16-beat lead line + bass roots from the scale.
  const lead = []
  const bass = []
  for (let b = 0; b < PATTERN_BEATS; b++) {
    const deg = Math.floor(rng() * ch.mode.length)
    const oct = rng() < 0.3 ? 12 : 0
    lead.push(ch.root + 24 + ch.mode[deg] + oct)
    // Bass walks root / fifth / fourth.
    const bdeg = [0, 4, 0, 3][b % 4]
    bass.push(ch.root + ch.mode[bdeg % ch.mode.length])
  }

  const master = ctx.createGain()
  master.gain.value = 1
  master.connect(dest)

  let beatNum = 0
  let nextTime = 0
  let timer = null
  let running = false

  function osc(type, freq, t, dur, gain, glideTo) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  function kick(t) {
    osc('sine', 150, t, 0.18, 0.5, 50)
  }
  function hat(t) {
    const len = Math.floor(ctx.sampleRate * 0.05)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const s = ctx.createBufferSource(); s.buffer = buf
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000
    const g = ctx.createGain(); g.gain.value = 0.08
    s.connect(f).connect(g).connect(master)
    s.start(t); s.stop(t + 0.06)
  }

  function scheduleBeat(idx, t) {
    const inBar = idx % 4
    // Kick on 1 & 3.
    if (inBar === 0 || inBar === 2) kick(t)
    // Hats on off-beats (and 8ths for aggressive tracks).
    hat(t + spb * 0.5)
    if (ch.aggressive) { hat(t + spb * 0.25); hat(t + spb * 0.75) }
    // Bass on every beat.
    const bf = midiToFreq(bass[idx % PATTERN_BEATS] - 12)
    osc(ch.dark ? 'sawtooth' : 'triangle', bf, t, spb * 0.9, ch.dark ? 0.16 : 0.13)
    // Lead arpeggio — denser on harder tracks.
    const lf = midiToFreq(lead[idx % PATTERN_BEATS])
    osc('square', lf, t, spb * 0.4, 0.07)
    if (ch.aggressive) {
      const lf2 = midiToFreq(lead[(idx + 2) % PATTERN_BEATS])
      osc('square', lf2, t + spb * 0.5, spb * 0.35, 0.06)
    }
    // Pad chord at the top of each bar.
    if (inBar === 0) {
      [0, 2, 4].forEach((d) => {
        const f = midiToFreq(ch.root + 12 + ch.mode[d % ch.mode.length])
        osc('triangle', f, t, spb * 3.6, 0.035)
      })
    }
  }

  function tick() {
    if (!running) return
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleBeat(beatNum, nextTime)
      nextTime += spb
      beatNum++
    }
  }

  return {
    start() {
      if (running) return
      running = true
      beatNum = 0
      nextTime = ctx.currentTime + 0.08
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(1, ctx.currentTime)
      timer = setInterval(tick, TICK_MS)
      tick()
    },
    stop() {
      running = false
      if (timer) { clearInterval(timer); timer = null }
      try {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
        master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
        setTimeout(() => { try { master.disconnect() } catch { /* noop */ } }, 250)
      } catch { /* noop */ }
    },
  }
}
