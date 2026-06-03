/**
 * Ball — rolls along the active surface; tap flips gravity, arcing smoothly to
 * the opposite surface. Momentum preserved through the arc.
 */
import { GRAVITY } from '../../constants.js'
import { applyVerticalGravity, circleHitbox } from '../physics.js'

export function update(p, ctx) {
  applyVerticalGravity(p, ctx, GRAVITY.ball)
  // Rolling rotation, proportional to scroll speed.
  p.rotation += (ctx.scrollPps / 90) * ctx.dt
  return p
}

export function onInput(p) {
  // Flip gravity; the arc emerges naturally from integration.
  p.gravityDir *= -1
  p.onSurface = false
  p.vy = 60 * p.gravityDir // tiny nudge off the surface
  return { sfx: 'ballflip', power: 1 }
}

export const getHitbox = (p) => circleHitbox(p, 0.9)
