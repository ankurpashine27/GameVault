/**
 * Swing — pendulum/copter movement. Acceleration constantly pulls in the
 * current swing direction; tapping flips that direction, producing an organic
 * bouncy rhythm. Gravity portals flip the whole thing.
 */
import { GRAVITY } from '../../constants.js'
import { resolveBounds, squareHitbox } from '../physics.js'
import { TERMINAL_VY } from '../../constants.js'

export function update(p, ctx) {
  if (p.swingDir === undefined) p.swingDir = 1
  const accel = GRAVITY.swing * ctx.speedScale * p.swingDir * p.gravityDir
  p.vy += accel * ctx.dt
  if (p.vy > TERMINAL_VY) p.vy = TERMINAL_VY
  if (p.vy < -TERMINAL_VY) p.vy = -TERMINAL_VY
  p.y += p.vy * ctx.dt
  resolveBounds(p)
  p.rotation = Math.atan2(p.vy, ctx.scrollPps) * 0.5
  return p
}

export function onInput(p) {
  p.swingDir = (p.swingDir === undefined ? 1 : p.swingDir) * -1
  p.onSurface = false
  return { sfx: 'swing', power: 0.8 }
}

export const getHitbox = (p) => squareHitbox(p, 0.18)
