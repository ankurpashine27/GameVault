/**
 * Pulse Rush — portal / orb / pad effect application.
 * These mutate the player (and game state for speed/size/mirror) and return a
 * small event object describing visual/audio feedback for the loop to dispatch.
 */
import { TILE, MINI_SCALE, ORB_IMPULSE, PAD_IMPULSE, BEAT_WIDTH } from '../constants.js'
import { resolveBounds } from './physics.js'
import { orbColor, padColor } from './objectTypes.js'

const SPEED_FROM_TYPE = {
  portal_speed_slow: 0.5,
  portal_speed_normal: 1,
  portal_speed_fast: 1.5,
  portal_speed_faster: 2,
  portal_speed_fastest: 3,
}

function resetFormState(p) {
  p.airJumpUsed = false
  p.hopCount = 0
  p.robotCharging = false
  p.robotChargeT = 0
  p.deadlyBounds = false
  p.swingDir = 1
  // Neutralise vertical momentum on a form swap. Otherwise the velocity you
  // happened to carry into the portal (e.g. rising from a jump, or falling)
  // gets inherited by the new form — so a ship/UFO entered "from slightly up"
  // would keep shooting up, and one entered while falling would crash down.
  // Zeroing it makes entry predictable regardless of approach angle.
  p.vy = 0
}

/** Apply a portal the player just entered. Returns an event descriptor. */
export function applyPortal(p, state, type) {
  // Form portals
  const formName = type.startsWith('portal_') ? type.slice('portal_'.length) : null
  const FORMS = ['cube', 'ship', 'ball', 'ufo', 'wave', 'robot', 'spider', 'swing']
  if (FORMS.includes(formName)) {
    if (p.form !== formName) {
      p.form = formName
      resetFormState(p)
      p.formEntryT = 0.25 // morph-flash timer (seconds)
    }
    return { sfx: 'portal', flash: state.accentColor, kind: 'form' }
  }

  if (type in SPEED_FROM_TYPE) {
    state.speedScale = SPEED_FROM_TYPE[type]
    return { sfx: 'portal', flash: '#39d0ff', kind: 'speed' }
  }

  if (type === 'portal_gravity') {
    p.gravityDir *= -1
    p.onSurface = false
    return { sfx: 'portal', flash: '#b06bff', kind: 'gravity' }
  }

  if (type === 'portal_size_mini' || type === 'portal_size_normal') {
    const mini = type === 'portal_size_mini'
    if (p.mini !== mini) {
      const centerY = p.y + p.size / 2
      p.mini = mini
      p.size = mini ? TILE * MINI_SCALE : TILE
      p.y = centerY - p.size / 2
      resolveBounds(p)
    }
    return { sfx: 'portal', flash: '#ffd23f', kind: 'size' }
  }

  if (type === 'portal_mirror') {
    state.mirror = { active: true, untilWorldX: state.worldX + BEAT_WIDTH * 16 }
    return { sfx: 'portal', flash: '#ff6bd6', kind: 'mirror' }
  }

  return null
}

/** Apply an orb when the player taps in range. */
export function applyOrb(p, type) {
  const color = orbColor(type)
  const imp = ORB_IMPULSE[color] ?? 0

  if (color === 'green') {
    p.gravityDir *= -1
    p.onSurface = false
    return { sfx: 'orb_flip', color }
  }
  if (color === 'blue') {
    p.gravityDir *= -1
    p.vy = imp * p.gravityDir
    p.onSurface = false
    return { sfx: 'orb_flip', color }
  }
  if (color === 'black') {
    p.gravityDir *= -1
    p.vy = imp * p.gravityDir
    p.onSurface = false
    return { sfx: 'orb', color }
  }
  // yellow / pink / red
  p.vy = imp * (color === 'red' ? -p.gravityDir : p.gravityDir)
  p.onSurface = false
  return { sfx: 'orb', color }
}

/** Apply a pad on contact (auto-trigger). */
export function applyPad(p, type) {
  const color = padColor(type)
  if (color === 'blue') {
    p.gravityDir *= -1
    p.vy = PAD_IMPULSE.blue * p.gravityDir
    p.onSurface = false
    return { sfx: 'orb_flip', color }
  }
  const imp = PAD_IMPULSE[color] ?? 0
  p.vy = imp * (color === 'red' ? -p.gravityDir : p.gravityDir)
  p.onSurface = false
  return { sfx: 'orb', color }
}
