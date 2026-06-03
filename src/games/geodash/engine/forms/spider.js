/**
 * Spider — tap to instantly teleport to the opposite surface (gravity
 * reverses). No arc — the transition is instantaneous. Rests on whatever
 * surface it lands on. Can chain teleports rapidly.
 */
import { floorRestY, ceilRestY, circleHitbox, applyVerticalGravity } from '../physics.js'
import { GRAVITY } from '../../constants.js'

export function update(p, ctx) {
  // Spider normally rests; if displaced (e.g. block removed), settle quickly.
  if (!p.onSurface) {
    applyVerticalGravity(p, ctx, GRAVITY.cube * 1.6)
  } else {
    p.vy = 0
  }
  p.rotation = 0
  return p
}

export function onInput(p) {
  // Flip gravity and teleport to the opposite global surface instantly.
  p.gravityDir *= -1
  if (p.gravityDir > 0) {
    p.y = floorRestY(p.size)
    p.surfaceDir = 1
  } else {
    p.y = ceilRestY()
    p.surfaceDir = -1
  }
  p.vy = 0
  p.onSurface = true
  return { sfx: 'spider', power: 1 }
}

export const getHitbox = (p) => circleHitbox(p, 0.9)
