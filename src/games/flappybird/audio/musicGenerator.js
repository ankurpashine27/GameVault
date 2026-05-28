/**
 * Procedural chiptune music for Flappy Bird.
 * Uses Web Audio API scheduling. No external files.
 *
 * Tracks: 0=Chiptune, 1=Calm, 2=Upbeat, 3=Retro
 * Each background theme has a preferred track.
 */

const TEMPO = [140, 100, 160, 130] // BPM per track

// ─── Note sequences ───────────────────────────────────────────────────────────
// Frequencies in Hz
const SCALES = {
  C_MAJOR: [262, 294, 330, 349, 392, 440, 494, 523],
  C_MINOR: [262, 294, 311, 349, 392, 415, 466, 523],
  C_PENTA: [262, 294, 330, 392, 440, 523],
  C_BLUES: [262, 311, 349, 370, 392, 466, 523],
}

const SEQUENCES = [
  // Track 0: Chiptune — C major melody
  { scale: SCALES.C_MAJOR, melody: [4,4,5,4,7,6, 4,4,5,4,6,5, 4,4,8,6,5,4,3, 7,7,6,5,4,3], bass: [0,0,4,4,0,0,4,4] },
  // Track 1: Calm — pentatonic
  { scale: SCALES.C_PENTA, melody: [0,2,4,5,4,2,0,1, 2,4,5,4,2,1,0,2], bass: [0,2,0,2,0,2,0,2] },
  // Track 2: Upbeat — minor scale
  { scale: SCALES.C_MINOR, melody: [0,2,3,5,7,5,3,2, 0,3,5,7,5,3,5,7], bass: [0,0,3,3,5,5,3,3] },
  // Track 3: Retro — blues
  { scale: SCALES.C_BLUES, melody: [0,2,3,4,3,2,0,1, 2,4,5,4,3,2,0,2], bass: [0,3,0,3,0,5,3,0] },
]

// ─── State per AudioContext ────────────────────────────────────────────────────
const contexts = new WeakMap()

function getState(ctx) {
  if (!contexts.has(ctx)) {
    contexts.set(ctx, {
      playing:    false,
      track:      0,
      step:       0,
      nextBeat:   0,
      timeoutId:  null,
      masterGain: null,
    })
  }
  return contexts.get(ctx)
}

// ─── Tone generators ──────────────────────────────────────────────────────────
function scheduleNote(ctx, freq, t, duration, vol, type = 'square') {
  if (!freq || freq <= 0) return
  const g = ctx.createGain()
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.001, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.01)
  g.gain.linearRampToValueAtTime(vol * 0.7, t + duration * 0.6)
  g.gain.linearRampToValueAtTime(0.001, t + duration * 0.95)
  o.connect(g)

  const st = getState(ctx)
  if (st.masterGain) g.connect(st.masterGain)
  else g.connect(ctx.destination)

  o.start(t)
  o.stop(t + duration + 0.05)
}

// ─── Sequencer ────────────────────────────────────────────────────────────────
function tick(ctx) {
  const st = getState(ctx)
  if (!st.playing) return

  const seq     = SEQUENCES[st.track]
  const bpm     = TEMPO[st.track]
  const beatSec = 60 / bpm
  const now     = ctx.currentTime

  // Schedule slightly ahead
  while (st.nextBeat < now + 0.3) {
    const t       = st.nextBeat
    const step    = st.step
    const mLen    = seq.melody.length
    const bLen    = seq.bass.length

    // Melody
    const mIdx  = seq.melody[step % mLen]
    const mFreq = seq.scale[mIdx % seq.scale.length] * (mIdx >= seq.scale.length ? 2 : 1)
    scheduleNote(ctx, mFreq, t, beatSec * 0.45, 0.12, 'square')

    // Bass (every 2 beats)
    if (step % 2 === 0) {
      const bIdx  = seq.bass[(step / 2) % bLen]
      const bFreq = seq.scale[bIdx] * 0.5
      scheduleNote(ctx, bFreq, t, beatSec * 0.9, 0.10, 'triangle')
    }

    // Drum-like kick every 4 beats
    if (step % 4 === 0) {
      scheduleDrum(ctx, t, st.masterGain)
    }

    st.step++
    st.nextBeat += beatSec
  }

  st.timeoutId = setTimeout(() => tick(ctx), 50)
}

function scheduleDrum(ctx, t, masterGain) {
  const g = ctx.createGain()
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(80, t)
  o.frequency.linearRampToValueAtTime(40, t + 0.12)
  g.gain.setValueAtTime(0.001, t)
  g.gain.linearRampToValueAtTime(0.18, t + 0.005)
  g.gain.linearRampToValueAtTime(0.001, t + 0.15)
  o.connect(g)
  if (masterGain) g.connect(masterGain); else g.connect(ctx.destination)
  o.start(t)
  o.stop(t + 0.2)
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function startMusic(ctx, track = 0, volume = 0.35) {
  const st = getState(ctx)
  if (st.playing && st.track === track) {
    setMusicVolume(ctx, volume)
    return
  }

  stopMusic(ctx)

  // Master gain node
  const mg = ctx.createGain()
  mg.gain.setValueAtTime(volume, ctx.currentTime)
  mg.connect(ctx.destination)

  st.masterGain = mg
  st.playing    = true
  st.track      = track
  st.step       = 0
  st.nextBeat   = ctx.currentTime + 0.1

  tick(ctx)
}

export function stopMusic(ctx) {
  const st = getState(ctx)
  st.playing = false
  if (st.timeoutId) { clearTimeout(st.timeoutId); st.timeoutId = null }
  if (st.masterGain) {
    try {
      st.masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      setTimeout(() => { try { st.masterGain.disconnect() } catch {} }, 300)
    } catch {}
    st.masterGain = null
  }
}

export function setMusicVolume(ctx, volume) {
  const st = getState(ctx)
  if (st.masterGain) {
    st.masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1)
  }
}

export function getMusicTrackName(track) {
  return ['Chiptune', 'Calm', 'Upbeat', 'Retro'][track] || 'Chiptune'
}

export const MUSIC_TRACK_COUNT = 4

// Background-to-preferred-track mapping
export const BG_PREFERRED_TRACK = {
  day:    0,
  sunset: 2,
  night:  1,
  space:  1,
  ocean:  1,
  jungle: 2,
  desert: 3,
  neon:   3,
}
