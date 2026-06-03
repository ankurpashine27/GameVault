/**
 * Ship — hold to thrust upward, release to fall. Thrust and gravity are
 * symmetric and the vertical speed is hard-capped (SHIP_MAX_VY) so control
 * stays smooth and predictable instead of ramping into sudden bursts. Riding
 * the floor/ceiling is allowed (clamped, not lethal); obstacles kill.
 */
import { GRAVITY, SHIP_THRUST, SHIP_MAX_VY } from '../../constants.js'
import { resolveBounds, squareHitbox } from '../physics.js'
import { clamp } from '../../utils.js'

export function update(p, ctx) {
  // Net vertical acceleration (signed by gravity direction).
  let accel = GRAVITY.ship * p.gravityDir
  if (ctx.input.held) accel += SHIP_THRUST * p.gravityDir
  p.vy += accel * ctx.speedScale * ctx.dt

  // Cap BEFORE moving so the ship never overshoots into a sudden fast glide.
  const max = SHIP_MAX_VY * ctx.speedScale
  p.vy = clamp(p.vy, -max, max)

  p.y += p.vy * ctx.dt
  resolveBounds(p)

  // Tilt the nose toward vertical velocity for a flight feel.
  const target = clamp(p.vy / max, -1, 1) * 0.5
  p.rotation += (target - p.rotation) * Math.min(1, ctx.dt * 12)
  return p
}

export function onInput() {
  // Ship uses continuous hold (handled in update); a discrete tap = brief thrust.
  return { sfx: 'thrust', power: 0.6 }
}

export const getHitbox = (p) => squareHitbox(p, 0.22)
