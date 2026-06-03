/**
 * Pulse Rush — shared physics utilities used by every form.
 *
 * Coordinate model:
 *   - Canvas/logical pixels, +y is DOWN.
 *   - The player never moves horizontally; the world scrolls. So all physics
 *     here is purely vertical (except Wave, whose vertical speed is tied to the
 *     scroll speed to produce exact 45° motion).
 *   - player.y is the TOP-LEFT y of the player's visual box.
 *   - gravityDir: +1 pulls the player toward the floor, -1 toward the ceiling.
 *   - surfaceDir: which surface the player currently rests on:
 *        +1 → resting on a floor (support is below the player)
 *        -1 → resting on a ceiling (support is above the player)
 */

import { GROUND_Y, CEIL_Y, TERMINAL_VY } from '../constants.js'

/** The y the player TOP sits at when resting on the floor / ceiling. */
export function floorRestY(size) { return GROUND_Y - size }
export function ceilRestY() { return CEIL_Y }

/**
 * Integrate gravity for one step and resolve against the global floor/ceiling.
 * Mutates and returns `p`. `ctx` provides { dt, gravity, speedScale }.
 * Platform (block) landing is handled separately in collision.js.
 */
export function applyVerticalGravity(p, ctx, gravityValue) {
  const g = gravityValue * ctx.speedScale * p.gravityDir
  p.vy += g * ctx.dt
  if (p.vy > TERMINAL_VY) p.vy = TERMINAL_VY
  if (p.vy < -TERMINAL_VY) p.vy = -TERMINAL_VY
  p.y += p.vy * ctx.dt
  resolveBounds(p)
  return p
}

/** Clamp the player to the floor/ceiling bars, updating resting state. */
export function resolveBounds(p) {
  const restFloor = floorRestY(p.size)
  const restCeil = ceilRestY()
  p.onSurface = false

  if (p.gravityDir > 0) {
    // Falling toward the floor
    if (p.y >= restFloor) {
      p.y = restFloor
      p.vy = 0
      p.onSurface = true
      p.surfaceDir = 1
    }
    // Bonk the ceiling
    if (p.y <= restCeil) {
      p.y = restCeil
      if (p.vy < 0) p.vy = 0
    }
  } else {
    // Inverted gravity — toward the ceiling
    if (p.y <= restCeil) {
      p.y = restCeil
      p.vy = 0
      p.onSurface = true
      p.surfaceDir = -1
    }
    if (p.y >= restFloor) {
      p.y = restFloor
      if (p.vy > 0) p.vy = 0
    }
  }
  return p
}

/** True if the player is currently standing on any surface (global or block). */
export function isGrounded(p) {
  return p.onSurface
}

/** Standard square hitbox, slightly inset from the visual box. */
export function squareHitbox(p, inset = 0.12) {
  const m = p.size * inset
  return { x: -p.size / 2 + m, y: p.y + m, w: p.size - 2 * m, h: p.size - 2 * m, shape: 'rect' }
}

/** Circle hitbox (returns a square AABB approximation + radius for fine tests). */
export function circleHitbox(p, scale = 0.92) {
  const r = (p.size / 2) * scale
  const cx = 0
  const cy = p.y + p.size / 2
  return { x: cx - r, y: cy - r, w: r * 2, h: r * 2, shape: 'circle', r, cx, cy }
}

/** Thin diamond hitbox for the Wave (very small, forgiving-to-hit but precise). */
export function diamondHitbox(p) {
  const s = p.size * 0.42
  const cx = 0
  const cy = p.y + p.size / 2
  return { x: cx - s, y: cy - s, w: s * 2, h: s * 2, shape: 'diamond', cx, cy, r: s }
}

/**
 * The player's hitbox is anchored at x=0 here; the game loop offsets by
 * PLAYER_X. Returning x relative keeps forms simple. The loop adds PLAYER_X.
 */
