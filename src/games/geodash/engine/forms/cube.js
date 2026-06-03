/**
 * Cube — the fundamental form. Auto-runs; tap to jump; one air (double) jump
 * available until landing. Standard arc gravity.
 */
import { GRAVITY, JUMP_VELOCITY, DOUBLE_JUMP } from '../../constants.js'
import { applyVerticalGravity, squareHitbox } from '../physics.js'

export function update(p, ctx) {
  const wasAir = !p.onSurface
  applyVerticalGravity(p, ctx, GRAVITY.cube)

  if (p.onSurface) {
    // Snap rotation to a clean quarter turn when grounded.
    p.rotation = Math.round(p.rotation / (Math.PI / 2)) * (Math.PI / 2)
    p.airJumpUsed = false
  } else if (wasAir) {
    // Spin in the direction of travel.
    p.rotation += (ctx.scrollPps / 220) * ctx.dt * p.gravityDir
  }
  return p
}

export function onInput(p) {
  if (p.onSurface) {
    p.vy = JUMP_VELOCITY.cube * p.gravityDir
    p.onSurface = false
    p.airJumpUsed = false
    return { sfx: 'jump', power: 1 }
  }
  if (DOUBLE_JUMP && !p.airJumpUsed) {
    p.vy = JUMP_VELOCITY.cube * 0.92 * p.gravityDir
    p.airJumpUsed = true
    return { sfx: 'jump', power: 0.8 }
  }
  return null
}

export const getHitbox = (p) => squareHitbox(p, 0.14)
