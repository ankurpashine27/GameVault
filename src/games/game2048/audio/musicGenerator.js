/**
 * 2048 — Procedural calm/meditative chiptune music.
 * Uses Web Audio API scheduling. No external files.
 *
 * Tracks:
 *   calm:   slow arpeggiated major, 60 BPM, warm sines
 *   ambient: minimal long held notes, 40 BPM
 *   upbeat: soft faster, 80 BPM
 *   lofi:   detuned oscillators, 55 BPM
 */

const TRACKS = {
  calm: {
    bpm: 60,
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
    melody: [0, 2, 4, 5, 4, 2, 1, 0, 2, 4, 5, 3, 2, 1, 0, 2],
    bass:   [0, 0, 2, 2, 0, 0, 2, 2],
    type:   'sine',
    bassType: 'triangle',
    noteDur: 0.85,
    bassDiv: 2,
  },
  ambient: {
    bpm: 40,
    scale: [196.00, 220.00, 261.63, 293.66, 329.63, 392.00],
    melody: [0, 2, 4, 3, 2, 4, 0, 1],
    bass:   [0, 2, 0, 2],
    type:   'sine',
    bassType: 'sine',
    noteDur: 1.6,
    bassDiv: 4,
  },
  upbeat: {
    bpm: 80,
    scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
    melody: [0, 2, 4, 7, 5, 4, 2, 4, 3, 5, 4, 2, 0, 2, 4, 5],
    bass:   [0, 0, 4, 4, 0, 0, 4, 4],
    type:   'triangle',
    bassType: 'triangle',
    noteDur: 0.65,
    bassDiv: 2,
  },
  lofi: {
    bpm: 55,
    scale: [246.94, 277.18, 311.13, 369.99, 415.30, 493.88],
    melody: [0, 1, 3, 4, 3, 1, 0, 2, 3, 5, 4, 2, 1, 3, 2, 0],
    bass:   [0, 0, 2, 2, 3, 3, 0, 0],
    type:   'sawtooth',
    bassType: 'triangle',
    noteDur: 0.75,
    bassDiv: 2,
    detune: 8,  // cents
  },
}

const contexts = new WeakMap()

function getState(ctx) {
  if (!contexts.has(ctx)) {
    contexts.set(ctx, {
      playing:    false,
      trackId:    'calm',
      step:       0,
      nextBeat:   0,
      timeoutId:  null,
      masterGain: null,
    })
  }
  return contexts.get(ctx)
}

function scheduleNote(ctx, freq, t, duration, vol, type, detune = 0, masterGain) {
  if (!freq || freq <= 0) return
  const g = ctx.createGain()
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (detune) o.detune.setValueAtTime(detune, t)
  g.gain.setValueAtTime(0.001, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.02)
  g.gain.linearRampToValueAtTime(vol * 0.6, t + duration * 0.5)
  g.gain.linearRampToValueAtTime(0.001, t + duration * 0.95)
  o.connect(g)
  if (masterGain) g.connect(masterGain)
  else g.connect(ctx.destination)
  o.start(t)
  o.stop(t + duration + 0.05)
}

function tick(ctx) {
  const st = getState(ctx)
  if (!st.playing) return

  const track   = TRACKS[st.trackId] || TRACKS.calm
  const beatSec = 60 / track.bpm
  const now     = ctx.currentTime
  const lookahead = 0.5

  while (st.nextBeat < now + lookahead) {
    const t     = st.nextBeat
    const step  = st.step
    const mLen  = track.melody.length
    const bLen  = track.bass.length

    // Melody
    const mIdx  = track.melody[step % mLen]
    const mFreq = track.scale[mIdx % track.scale.length]
    scheduleNote(ctx, mFreq, t, beatSec * track.noteDur, 0.1, track.type, track.detune || 0, st.masterGain)

    // Bass (every bassDiv beats)
    if (step % track.bassDiv === 0) {
      const bIdx  = track.bass[(Math.floor(step / track.bassDiv)) % bLen]
      const bFreq = track.scale[bIdx % track.scale.length] * 0.5
      scheduleNote(ctx, bFreq, t, beatSec * track.bassDiv * 0.9, 0.08, track.bassType, 0, st.masterGain)
    }

    st.step++
    st.nextBeat += beatSec
  }

  st.timeoutId = setTimeout(() => tick(ctx), 200)
}

export function startMusic(ctx, trackId = 'calm', volume = 0.3) {
  const st = getState(ctx)
  if (st.playing && st.trackId === trackId) {
    setMusicVolume(ctx, volume)
    return
  }
  stopMusic(ctx)

  const mg = ctx.createGain()
  mg.gain.setValueAtTime(volume, ctx.currentTime)
  mg.connect(ctx.destination)

  st.masterGain = mg
  st.playing    = true
  st.trackId    = trackId
  st.step       = 0
  st.nextBeat   = ctx.currentTime + 0.1

  tick(ctx)
}

export function stopMusic(ctx) {
  if (!ctx) return
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
  if (!ctx) return
  const st = getState(ctx)
  if (st.masterGain) {
    st.masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1)
  }
}
