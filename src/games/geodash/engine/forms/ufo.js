/**
 * UFO — falls under gravity; each tap is a small hop. Up to 3 hops before
 * needing to touch a surface (which resets the hop count). Fall speed is
 * capped (UFO_MAX_VY) so it never accelerates into a sudden plummet.
 */
import { GRAVITY, JUMP_VELOCITY, UFO_MAX_VY } from '../../constants.js'
import { resolveBounds, circleHitbox } from '../physics.js'
import { clamp } from '../../utils.js'

const MAX_HOPS = 3

export function update(p, ctx) {
  p.vy += GRAVITY.ufo * p.gravityDir * ctx.speedScale * ctx.dt
  const max = UFO_MAX_VY * ctx.speedScale
  p.vy = clamp(p.vy, -max, max)
  p.y += p.vy * ctx.dt
  resolveBounds(p)
  if (p.onSurface) p.hopCount = 0
  p.rotation = clamp(p.vy / max, -1, 1) * 0.35
  return p
}

export function onInput(p) {
  if (p.hopCount < MAX_HOPS) {
    p.vy = JUMP_VELOCITY.ufo * p.gravityDir
    p.hopCount++
    p.onSurface = false
    return { sfx: 'ufohop', power: 0.7 }
  }
  return null
}

export const getHitbox = (p) => circleHitbox(p, 0.86)
