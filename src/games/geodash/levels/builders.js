/**
 * Pulse Rush — level builders. `makeLevel(cfg)` lays out a beat-synced,
 * progressively-harder course from a compact per-level config, choosing
 * obstacle patterns per form. Spacing is kept forgiving and scaled by tier.
 */
import { makePRNG, clamp } from '../utils.js'

// Play area is ~10 tiles tall (ground..ceiling). Tile = 1 unit.
const PLAY_TILES = 10

const spike = (b, y = 0) => ({ type: 'spike', beatOffset: +b.toFixed(2), y, width: 1, height: 1 })
const spikeDown = (b, y) => ({ type: 'spike_down', beatOffset: +b.toFixed(2), y, width: 1, height: 1 })
const block = (b, y, w = 1, h = 1) => ({ type: 'block', beatOffset: +b.toFixed(2), y: y * 32, width: w, height: h })
const saw = (b, y) => ({ type: 'saw', beatOffset: +b.toFixed(2), y: y * 32, width: 2, height: 2 })
const orb = (kind, b, yTiles) => ({ type: 'orb_' + kind, beatOffset: +b.toFixed(2), y: yTiles * 32, width: 1, height: 1 })
const pad = (kind, b) => ({ type: 'pad_' + kind, beatOffset: +b.toFixed(2), y: 0, width: 1, height: 0.5 })
const portal = (kind, b, yTiles = 4) => ({ type: 'portal_' + kind, beatOffset: +b.toFixed(2), y: yTiles * 32, width: 1, height: 3 })

// spike() y default 0 = on ground; for raised spikes pass y in px.

function groundSegment(form, start, len, tier, rng) {
  const out = []
  const gap = clamp(4 - tier * 0.22, 2.2, 4)
  const ceilingHazards = form === 'ball' || form === 'spider' || form === 'swing'
  let flipped = false
  for (let t = start; t < start + len; t += gap) {
    const r = rng()
    if (ceilingHazards && tier >= 3 && r < 0.25) {
      // Force a gravity flip: ceiling spikes + a flip orb just before.
      out.push(orb('green', t - 0.8, 3))
      out.push(spikeDown(t, (PLAY_TILES - 1) * 32))
      flipped = !flipped
    } else if (r < 0.58) {
      out.push(spike(t))
    } else if (r < 0.76 && tier >= 2) {
      out.push(spike(t)); out.push(spike(t + Math.min(0.7, gap * 0.3)))
    } else if (r < 0.9) {
      // Platform to hop onto, spike guarding it.
      out.push(spike(t))
      out.push(block(t + 1, 2, 2, 1))
    } else if (tier >= 3) {
      // Orb jump over a wider hazard.
      out.push(spike(t)); out.push(spike(t + 0.6))
      out.push(orb('yellow', t + 0.3, 3))
    }
  }
  return out
}

function flightSegment(form, start, len, tier, rng) {
  const out = []
  const gapSize = clamp((form === 'wave' ? 6 : 5.5) - tier * 0.25, 4, 6)
  const colW = 6 // tiles — overlaps into a continuous barrier
  let center = PLAY_TILES / 2
  for (let t = start; t < start + len; t += 1) {
    center += (rng() - 0.5) * 0.9
    center = clamp(center, gapSize / 2 + 0.5, PLAY_TILES - gapSize / 2 - 0.5)
    const gapBottom = center - gapSize / 2
    const gapTop = center + gapSize / 2
    if (gapBottom > 0.2) out.push(block(t, 0, colW, gapBottom))
    if (gapTop < PLAY_TILES - 0.2) out.push(block(t, gapTop, colW, PLAY_TILES - gapTop))
    // Occasional spike inside the corridor on harder tiers.
    if (tier >= 4 && rng() < 0.12) out.push(spike(t, gapBottom * 32))
  }
  return out
}

export function makeSegment(form, start, len, tier, rng) {
  if (form === 'ship' || form === 'ufo' || form === 'wave') return flightSegment(form, start, len, tier, rng)
  return groundSegment(form, start, len, tier, rng)
}

export const portalObj = portal

export function makeLevel(cfg) {
  const {
    id, name, difficulty, stars, bpm, songName,
    initialSpeed = 1, initialForm = 'cube', initialGravity = 1,
    theme, totalBeats, seed, forms = ['cube'], tier = 0,
    speedChanges = false, gravityFlips = false, sizeMini = false, mirror = false,
  } = cfg
  const rng = makePRNG(seed)
  const objects = []
  const coins = []
  const bgEvents = []

  const intro = 8
  const segLen = clamp(13 - Math.floor(tier / 3), 9, 13)
  let b = intro
  let currentForm = initialForm
  let fi = 0
  let usedMirror = false
  const segList = [] // record each segment's form + beat range for coin placement

  while (b < totalBeats - 8) {
    const form = forms[fi % forms.length]
    if (form !== currentForm) {
      objects.push(portal(form, b - 1, 4))
      currentForm = form
    }
    if (speedChanges && tier >= 4 && fi > 0 && rng() < 0.4) {
      const sp = rng() < 0.5 ? 'fast' : (rng() < 0.5 ? 'faster' : 'slow')
      objects.push(portal('speed_' + sp, b - 0.5, 5))
    }
    if (gravityFlips && tier >= 5 && rng() < 0.3) {
      objects.push(portal('gravity', b - 0.5, 6))
    }
    if (sizeMini && tier >= 5 && rng() < 0.25) {
      objects.push(portal('size_mini', b - 0.5, 6))
      // restore size a couple segments later handled by another mini segment naturally
    }
    if (mirror && !usedMirror && tier >= 3 && b > totalBeats * 0.4) {
      objects.push(portal('mirror', b - 0.5, 6))
      usedMirror = true
    }

    objects.push(...makeSegment(form, b, segLen, tier, rng))
    segList.push({ form, start: b, len: segLen })
    b += segLen + 2
    fi++
  }

  // Three secret coins. Each is placed inside a segment whose form can actually
  // reach a mid-air coin via a jump/arc (cube/robot/ball/swing — NOT spider,
  // which teleports instantly between surfaces and would skip past it, and not
  // flight segments where a fixed height may sit inside a corridor wall).
  // Height 2.6 tiles is within a normal jump arc, so the coin requires a
  // deliberate jump (meaningful deviation) but is always collectible.
  const COIN_FORMS = ['cube', 'robot', 'ball', 'swing']
  const pool = segList.filter(s => COIN_FORMS.includes(s.form))
  const usable = pool.length ? pool : segList
  for (let i = 0; i < 3; i++) {
    // Spread the three coins across early / middle / late of the level.
    const idx = usable.length >= 3
      ? Math.floor(((i + 0.5) / 3) * usable.length)
      : i % usable.length
    const seg = usable[Math.min(idx, usable.length - 1)]
    // Nudge by index so coins reusing the same segment don't overlap exactly.
    const cb = Math.round(seg.start + seg.len * 0.5 + (usable.length >= 3 ? 0 : i * 3))
    coins.push({ id: i + 1, beatOffset: cb, y: Math.round(2.6 * 32) })
  }

  // Background events — color shifts + on-bar flashes, shakes for demon tiers.
  for (let bar = 16; bar < totalBeats; bar += 16) {
    if (bar % 32 === 0) bgEvents.push({ beatOffset: bar, type: 'bg_color', color: shiftColor(theme.bg, bar) })
    else bgEvents.push({ beatOffset: bar, type: 'flash', color: theme.accent, beats: 0.25 })
  }
  if (tier >= 6) {
    for (let bar = 24; bar < totalBeats; bar += 48) bgEvents.push({ beatOffset: bar, type: 'shake', intensity: 3, beats: 1 })
  }

  return {
    id, name, difficulty, stars, bpm, songName,
    initialSpeed, initialForm, initialGravity,
    bgColor: theme.bg, groundColor: theme.ground, accentColor: theme.accent,
    bgPattern: theme.pattern, totalBeats,
    objects: objects.sort((a, b) => a.beatOffset - b.beatOffset),
    coins, bgEvents,
  }
}

function shiftColor(hex, n) {
  // Rotate hue slightly by mixing — cheap deterministic variation.
  const c = hex.replace('#', '')
  const v = parseInt(c, 16)
  const r = clamp(((v >> 16) & 255) + ((n * 7) % 40) - 20, 0, 255)
  const g = clamp(((v >> 8) & 255) + ((n * 13) % 40) - 20, 0, 255)
  const b = clamp((v & 255) + ((n * 5) % 40) - 20, 0, 255)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}
