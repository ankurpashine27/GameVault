// ─── Tic-Tac-Toe Procedural Music Generator ────────────────────────────────
// Three looping tracks; scheduled via Web Audio API ahead-of-time.
// No external audio files, no copyrighted material.

const SCHEDULE_AHEAD    = 0.15   // seconds
const SCHEDULER_INTERVAL = 50    // ms

// Per-AudioContext music state
const musicState = new WeakMap()

function getState(ctx) {
  if (!musicState.has(ctx)) {
    musicState.set(ctx, {
      trackId:     null,
      volume:      0.3,
      bpm:         90,
      nextNoteTime: 0,
      noteIndex:   0,
      intervalId:  null,
      gainNode:    null,
    })
  }
  return musicState.get(ctx)
}

// MIDI note → Hz
function m(midi) { return 440 * Math.pow(2, (midi - 69) / 12) }

// ─── Track definitions ──────────────────────────────────────────────────────
// step: { f: Hz|null (null = rest), d: beats, t: OscType, v: volume 0-1 }

const TRACKS = {

  // Gentle Am pentatonic arpeggio — meditative and calm
  ambient: {
    bpm: 68,
    steps: [
      { f: m(57), d: 2, t: 'sine', v: 0.38 },  // A3
      { f: m(60), d: 2, t: 'sine', v: 0.32 },  // C4
      { f: m(64), d: 2, t: 'sine', v: 0.32 },  // E4
      { f: m(69), d: 2, t: 'sine', v: 0.38 },  // A4
      { f: m(64), d: 2, t: 'sine', v: 0.30 },  // E4 (descend)
      { f: m(60), d: 2, t: 'sine', v: 0.28 },  // C4
      // Dm section
      { f: m(50), d: 2, t: 'sine', v: 0.36 },  // D3
      { f: m(53), d: 2, t: 'sine', v: 0.30 },  // F3
      { f: m(57), d: 2, t: 'sine', v: 0.32 },  // A3
      { f: m(62), d: 2, t: 'sine', v: 0.36 },  // D4
      { f: m(57), d: 2, t: 'sine', v: 0.28 },  // A3
      { f: m(53), d: 2, t: 'sine', v: 0.28 },  // F3
    ],
  },

  // Staccato dissonant pulses — competitive tension
  tense: {
    bpm: 132,
    steps: [
      { f: m(69), d: 0.25, t: 'sawtooth', v: 0.28 },  // A4
      { f: null,  d: 0.25 },
      { f: m(70), d: 0.25, t: 'sawtooth', v: 0.28 },  // Bb4
      { f: null,  d: 0.25 },
      { f: m(67), d: 0.5,  t: 'sawtooth', v: 0.32 },  // G4
      { f: null,  d: 0.25 },
      { f: m(68), d: 0.75, t: 'sawtooth', v: 0.36 },  // Ab4
      { f: m(65), d: 0.25, t: 'sawtooth', v: 0.28 },  // F4
      { f: null,  d: 0.25 },
      { f: m(67), d: 0.25, t: 'sawtooth', v: 0.30 },  // G4
      { f: null,  d: 0.5  },
      { f: m(64), d: 0.5,  t: 'sawtooth', v: 0.25 },  // E4
      { f: null,  d: 0.75 },
      // Lower phrase
      { f: m(57), d: 0.25, t: 'sawtooth', v: 0.30 },  // A3
      { f: null,  d: 0.25 },
      { f: m(58), d: 0.25, t: 'sawtooth', v: 0.30 },  // Bb3
      { f: null,  d: 0.5  },
      { f: m(55), d: 0.5,  t: 'sawtooth', v: 0.32 },  // G3
      { f: null,  d: 1.0  },
    ],
  },

  // Square-wave chiptune — 8-bit arcade energy
  retro: {
    bpm: 155,
    steps: [
      // Phrase A — C major
      { f: m(72), d: 0.5, t: 'square', v: 0.30 },  // C5
      { f: m(72), d: 0.5, t: 'square', v: 0.30 },
      { f: m(67), d: 0.5, t: 'square', v: 0.28 },  // G4
      { f: m(67), d: 0.5, t: 'square', v: 0.28 },
      { f: m(68), d: 0.5, t: 'square', v: 0.32 },  // Ab4
      { f: m(68), d: 0.5, t: 'square', v: 0.32 },
      { f: m(67), d: 1.0, t: 'square', v: 0.34 },  // G4 (held)
      // Phrase B — descend
      { f: m(65), d: 0.5, t: 'square', v: 0.28 },  // F4
      { f: m(65), d: 0.5, t: 'square', v: 0.28 },
      { f: m(63), d: 0.5, t: 'square', v: 0.28 },  // Eb4
      { f: m(63), d: 0.5, t: 'square', v: 0.28 },
      { f: m(62), d: 0.5, t: 'square', v: 0.32 },  // D4
      { f: m(62), d: 0.5, t: 'square', v: 0.32 },
      { f: m(60), d: 1.0, t: 'square', v: 0.34 },  // C4 (held)
      // Quick fill
      { f: m(62), d: 0.25, t: 'square', v: 0.28 }, // D4
      { f: m(64), d: 0.25, t: 'square', v: 0.28 }, // E4
      { f: m(65), d: 0.25, t: 'square', v: 0.28 }, // F4
      { f: m(67), d: 0.25, t: 'square', v: 0.32 }, // G4
    ],
  },
}

// ─── Internal scheduler ─────────────────────────────────────────────────────

function scheduleNote(ctx, state, step) {
  if (!step.f) return   // rest — advance time only
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g)
  g.connect(state.gainNode)
  o.type = step.t || 'sine'
  o.frequency.setValueAtTime(step.f, state.nextNoteTime)
  const dur = (60 / state.bpm) * step.d * 0.88  // 12% gap for natural feel
  g.gain.setValueAtTime(step.v, state.nextNoteTime)
  g.gain.exponentialRampToValueAtTime(0.001, state.nextNoteTime + dur)
  o.start(state.nextNoteTime)
  o.stop(state.nextNoteTime + dur + 0.01)
}

function tick(ctx, capturedTrackId) {
  if (!musicState.has(ctx)) return
  const state = musicState.get(ctx)
  if (state.trackId !== capturedTrackId) return   // track was changed/stopped

  const track = TRACKS[capturedTrackId]
  if (!track) return

  while (state.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
    const step = track.steps[state.noteIndex % track.steps.length]
    scheduleNote(ctx, state, step)
    state.nextNoteTime += (60 / state.bpm) * step.d
    state.noteIndex++
  }

  state.intervalId = setTimeout(() => tick(ctx, capturedTrackId), SCHEDULER_INTERVAL)
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function startMusic(ctx, trackId, volume = 0.3) {
  stopMusic(ctx)

  const track = TRACKS[trackId]
  if (!track) return

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(Math.max(volume, 0.001), ctx.currentTime)
  gain.connect(ctx.destination)

  const state = getState(ctx)
  state.trackId    = trackId
  state.volume     = volume
  state.bpm        = track.bpm
  state.nextNoteTime = ctx.currentTime + 0.05
  state.noteIndex  = 0
  state.gainNode   = gain

  tick(ctx, trackId)
}

export function stopMusic(ctx) {
  if (!musicState.has(ctx)) return
  const state = musicState.get(ctx)
  if (state.intervalId) { clearTimeout(state.intervalId); state.intervalId = null }
  if (state.gainNode) {
    try {
      state.gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    } catch (_) {}
    state.gainNode = null
  }
  state.trackId = null
}

export function setMusicVolume(ctx, vol) {
  if (!musicState.has(ctx)) return
  const state = musicState.get(ctx)
  state.volume = vol
  if (state.gainNode) {
    try {
      state.gainNode.gain.setValueAtTime(Math.max(vol, 0.001), ctx.currentTime)
    } catch (_) {}
  }
}
