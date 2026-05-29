// ─── Procedural Music Generator ──────────────────────────────────────────────
// Uses Web Audio API oscillators scheduled ahead of time.
// No copyrighted material — original arrangements.

const SCHEDULE_AHEAD = 0.15  // seconds to schedule ahead
const SCHEDULER_INTERVAL = 50 // ms between scheduler ticks

// ─── Music state per AudioContext ────────────────────────────────────────────
const musicState = new WeakMap()

function getState(ctx) {
  if (!musicState.has(ctx)) {
    musicState.set(ctx, {
      trackId: null,
      volume: 0.4,
      bpm: 120,
      nextNoteTime: 0,
      noteIndex: 0,
      intervalId: null,
      gainNode: null,
      activeNodes: [],
    })
  }
  return musicState.get(ctx)
}

// ─── Note helpers ────────────────────────────────────────────────────────────
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// A4=69, C4=60
const NOTE = {
  C3: midiToFreq(48), D3: midiToFreq(50), E3: midiToFreq(52),
  F3: midiToFreq(53), G3: midiToFreq(55), A3: midiToFreq(57),
  B3: midiToFreq(59), C4: midiToFreq(60), D4: midiToFreq(62),
  E4: midiToFreq(64), F4: midiToFreq(65), G4: midiToFreq(67),
  A4: midiToFreq(69), B4: midiToFreq(71), C5: midiToFreq(72),
  D5: midiToFreq(74), E5: midiToFreq(76), F5: midiToFreq(77),
  G5: midiToFreq(79), A5: midiToFreq(81),
}

// ─── Track definitions ───────────────────────────────────────────────────────
// Each track: { baseBPM, steps: [{freq, duration (in beats), type, volume}] }

const TRACKS = {
  // A-minor folk inspired melody
  classic_dark: {
    baseBPM: 150,
    steps: [
      // Melody (phrase 1)
      { f: NOTE.E5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.D5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.C5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.B4, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.A4, d: 1,   t: 'square', v: 0.6 },
      { f: NOTE.B4, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.C5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.D5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.E5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.E5, d: 0.5, t: 'square', v: 0.45 },
      { f: NOTE.D5, d: 0.5, t: 'square', v: 0.45 },
      // Phrase 2
      { f: NOTE.C5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.D5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.E5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.A4, d: 1,   t: 'square', v: 0.6 },
      { f: NOTE.B4, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.C5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.D5, d: 1,   t: 'square', v: 0.55 },
      { f: NOTE.E5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.C5, d: 0.5, t: 'square', v: 0.45 },
    ],
    bass: [
      { f: NOTE.A3, d: 2, t: 'square', v: 0.3 },
      { f: NOTE.E3, d: 2, t: 'square', v: 0.3 },
      { f: NOTE.A3, d: 2, t: 'square', v: 0.3 },
      { f: NOTE.G3, d: 2, t: 'square', v: 0.28 },
      { f: NOTE.F3, d: 2, t: 'square', v: 0.28 },
      { f: NOTE.E3, d: 2, t: 'square', v: 0.3 },
    ],
  },

  deep_space: {
    baseBPM: 60,
    steps: [
      { f: NOTE.A3, d: 2, t: 'sine', v: 0.35 },
      { f: NOTE.C4, d: 2, t: 'sine', v: 0.3 },
      { f: NOTE.E4, d: 2, t: 'sine', v: 0.3 },
      { f: NOTE.A4, d: 4, t: 'sine', v: 0.4 },
      { f: NOTE.G4, d: 2, t: 'sine', v: 0.35 },
      { f: NOTE.E4, d: 2, t: 'sine', v: 0.3 },
      { f: NOTE.D4, d: 2, t: 'sine', v: 0.3 },
      { f: NOTE.C4, d: 4, t: 'sine', v: 0.35 },
    ],
    bass: [
      { f: NOTE.A3, d: 4, t: 'sine', v: 0.2 },
      { f: NOTE.E3, d: 4, t: 'sine', v: 0.2 },
      { f: NOTE.C3, d: 4, t: 'sine', v: 0.2 },
      { f: NOTE.A3, d: 4, t: 'sine', v: 0.2 },
    ],
  },

  neon_city: {
    baseBPM: 160,
    steps: [
      { f: NOTE.A4, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.A4, d: 0.5, t: 'square', v: 0.4 },
      { f: NOTE.C5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.A4, d: 0.5, t: 'square', v: 0.45 },
      { f: NOTE.E5, d: 1,   t: 'square', v: 0.55 },
      { f: NOTE.D5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.C5, d: 0.5, t: 'square', v: 0.5 },
      { f: NOTE.B4, d: 1,   t: 'square', v: 0.5 },
      { f: NOTE.A4, d: 0.5, t: 'square', v: 0.45 },
      { f: NOTE.G4, d: 0.5, t: 'square', v: 0.45 },
      { f: NOTE.A4, d: 1,   t: 'square', v: 0.5 },
    ],
    bass: [
      { f: NOTE.A3, d: 1, t: 'sawtooth', v: 0.25 },
      { f: NOTE.A3, d: 1, t: 'sawtooth', v: 0.2 },
      { f: NOTE.E3, d: 1, t: 'sawtooth', v: 0.25 },
      { f: NOTE.E3, d: 1, t: 'sawtooth', v: 0.2 },
      { f: NOTE.A3, d: 1, t: 'sawtooth', v: 0.25 },
      { f: NOTE.G3, d: 1, t: 'sawtooth', v: 0.22 },
    ],
  },

  aurora: {
    baseBPM: 80,
    steps: [
      { f: NOTE.C5, d: 2, t: 'triangle', v: 0.4 },
      { f: NOTE.E5, d: 2, t: 'triangle', v: 0.38 },
      { f: NOTE.G5, d: 2, t: 'triangle', v: 0.4 },
      { f: NOTE.A5, d: 4, t: 'triangle', v: 0.45 },
      { f: NOTE.G5, d: 2, t: 'triangle', v: 0.4 },
      { f: NOTE.E5, d: 2, t: 'triangle', v: 0.38 },
      { f: NOTE.D5, d: 2, t: 'triangle', v: 0.38 },
      { f: NOTE.C5, d: 4, t: 'triangle', v: 0.42 },
    ],
    bass: [
      { f: NOTE.C3, d: 4, t: 'sine', v: 0.18 },
      { f: NOTE.G3, d: 4, t: 'sine', v: 0.18 },
      { f: NOTE.A3, d: 4, t: 'sine', v: 0.18 },
      { f: NOTE.F3, d: 4, t: 'sine', v: 0.18 },
    ],
  },

  underwater: {
    baseBPM: 70,
    steps: [
      { f: NOTE.D4, d: 3, t: 'sine', v: 0.35 },
      { f: NOTE.F4, d: 1, t: 'sine', v: 0.3 },
      { f: NOTE.A4, d: 3, t: 'sine', v: 0.38 },
      { f: NOTE.G4, d: 1, t: 'sine', v: 0.3 },
      { f: NOTE.E4, d: 2, t: 'sine', v: 0.34 },
      { f: NOTE.D4, d: 4, t: 'sine', v: 0.36 },
    ],
    bass: [
      { f: NOTE.D3, d: 4, t: 'sine', v: 0.2 },
      { f: NOTE.A3, d: 4, t: 'sine', v: 0.2 },
    ],
  },

  lava_cave: {
    baseBPM: 90,
    steps: [
      { f: NOTE.A3, d: 1, t: 'sawtooth', v: 0.4 },
      { f: NOTE.A3, d: 1, t: 'sawtooth', v: 0.35 },
      { f: NOTE.G3, d: 2, t: 'sawtooth', v: 0.4 },
      { f: NOTE.F3, d: 1, t: 'sawtooth', v: 0.38 },
      { f: NOTE.E3, d: 1, t: 'sawtooth', v: 0.35 },
      { f: NOTE.F3, d: 2, t: 'sawtooth', v: 0.38 },
      { f: NOTE.A3, d: 4, t: 'sawtooth', v: 0.42 },
    ],
    bass: [
      { f: NOTE.A3, d: 2, t: 'square', v: 0.3 },
      { f: NOTE.E3, d: 2, t: 'square', v: 0.28 },
      { f: NOTE.F3, d: 2, t: 'square', v: 0.28 },
      { f: NOTE.E3, d: 2, t: 'square', v: 0.3 },
    ],
  },

  matrix: {
    baseBPM: 120,
    steps: [
      { f: NOTE.C4, d: 1, t: 'square', v: 0.3 },
      { f: 0,       d: 1, t: 'square', v: 0 },
      { f: NOTE.E4, d: 1, t: 'square', v: 0.28 },
      { f: 0,       d: 2, t: 'square', v: 0 },
      { f: NOTE.G4, d: 0.5, t: 'square', v: 0.3 },
      { f: NOTE.A4, d: 0.5, t: 'square', v: 0.28 },
      { f: 0,       d: 3, t: 'square', v: 0 },
    ],
    bass: [
      { f: NOTE.C3, d: 4, t: 'square', v: 0.15 },
      { f: 0,       d: 4, t: 'square', v: 0 },
    ],
  },

  forest_night: {
    baseBPM: 60,
    steps: [
      { f: NOTE.G4, d: 3, t: 'triangle', v: 0.3 },
      { f: 0,       d: 1, t: 'triangle', v: 0 },
      { f: NOTE.E4, d: 3, t: 'triangle', v: 0.28 },
      { f: 0,       d: 2, t: 'triangle', v: 0 },
      { f: NOTE.D4, d: 2, t: 'triangle', v: 0.28 },
      { f: NOTE.C4, d: 5, t: 'triangle', v: 0.3 },
    ],
    bass: [
      { f: NOTE.C3, d: 8, t: 'sine', v: 0.15 },
      { f: NOTE.G3, d: 8, t: 'sine', v: 0.14 },
    ],
  },
}

// ─── Schedule a single note ───────────────────────────────────────────────────
function scheduleNote(ctx, masterGain, freq, type, vol, startTime, duration) {
  if (!freq || vol <= 0) return null
  try {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, startTime)
    g.gain.setValueAtTime(0, startTime)
    g.gain.linearRampToValueAtTime(vol, startTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    o.connect(g)
    g.connect(masterGain)
    o.start(startTime)
    o.stop(startTime + duration + 0.05)
    return { o, g }
  } catch {
    return null
  }
}

// ─── Scheduler tick ──────────────────────────────────────────────────────────
function tick(ctx, state) {
  if (!ctx || !state.trackId) return

  const track = TRACKS[state.trackId]
  if (!track) return

  const secPerBeat = 60 / state.bpm
  const melody = track.steps
  const bass = track.bass ?? []

  while (state.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
    const melIdx = state.noteIndex % melody.length
    const bassIdx = state.noteIndex % bass.length
    const step = melody[melIdx]
    const bassStep = bass[bassIdx]
    const dur = step.d * secPerBeat

    if (step && state.gainNode) {
      scheduleNote(ctx, state.gainNode, step.f, step.t, step.v * state.volume, state.nextNoteTime, dur * 0.85)
    }
    if (bassStep && state.gainNode) {
      scheduleNote(ctx, state.gainNode, bassStep.f, bassStep.t, bassStep.v * state.volume, state.nextNoteTime, bassStep.d * secPerBeat * 0.9)
    }

    state.nextNoteTime += dur
    state.noteIndex++
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function startMusic(ctx, trackId, volume = 0.4) {
  if (!ctx) return
  stopMusic(ctx)

  const state = getState(ctx)
  state.trackId = trackId ?? 'classic_dark'
  state.volume = volume
  state.noteIndex = 0
  state.nextNoteTime = ctx.currentTime + 0.05

  const track = TRACKS[state.trackId] ?? TRACKS.classic_dark
  state.bpm = track.baseBPM

  // Create master gain
  state.gainNode = ctx.createGain()
  state.gainNode.gain.setValueAtTime(1, ctx.currentTime)
  state.gainNode.connect(ctx.destination)

  state.intervalId = setInterval(() => tick(ctx, state), SCHEDULER_INTERVAL)
  tick(ctx, state)
}

export function stopMusic(ctx) {
  if (!ctx) return
  const state = getState(ctx)
  if (state.intervalId) {
    clearInterval(state.intervalId)
    state.intervalId = null
  }
  if (state.gainNode) {
    try {
      state.gainNode.gain.setValueAtTime(state.gainNode.gain.value, ctx.currentTime)
      state.gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    } catch {}
    state.gainNode = null
  }
  state.trackId = null
  state.noteIndex = 0
}

export function setMusicVolume(ctx, vol) {
  if (!ctx) return
  const state = getState(ctx)
  state.volume = vol
  if (state.gainNode) {
    try {
      state.gainNode.gain.setValueAtTime(vol, ctx.currentTime)
    } catch {}
  }
}

export function setMusicTempo(ctx, bpm) {
  if (!ctx) return
  const state = getState(ctx)
  state.bpm = bpm
}
