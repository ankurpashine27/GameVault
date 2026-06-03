/**
 * Robot — jump height scales with how long input is held (up to a max). Quick
 * tap → micro-hop, full hold → max height.
 */
import { GRAVITY, JUMP_VELOCITY } from '../../constants.js'
import { applyVerticalGravity, squareHitbox } from '../physics.js'

const HOLD_BOOST_TIME = 0.18 // seconds of hold to reach max height

export function update(p, ctx) {
  // While the jump is charging (rising + held), keep topping up velocity.
  if (p.robotCharging) {
    p.robotChargeT += ctx.dt
    if (ctx.input.held && p.robotChargeT < HOLD_BOOST_TIME) {
      const t = p.robotChargeT / HOLD_BOOST_TIME
      const target = (JUMP_VELOCITY.robotMin + (JUMP_VELOCITY.robotMax - JUMP_VELOCITY.robotMin) * t) * p.gravityDir
      // Only extend, never reduce magnitude.
      if (Math.abs(target) > Math.abs(p.vy)) p.vy = target
    } else {
      p.robotCharging = false
    }
  }
  applyVerticalGravity(p, ctx, GRAVITY.robot)
  if (p.onSurface) {
    p.robotCharging = false
    p.rotation = Math.round(p.rotation / (Math.PI / 2)) * (Math.PI / 2)
  } else {
    p.rotation += (ctx.scrollPps / 260) * ctx.dt * p.gravityDir
  }
  return p
}

export function onInput(p) {
  if (p.onSurface) {
    p.vy = JUMP_VELOCITY.robotMin * p.gravityDir
    p.robotCharging = true
    p.robotChargeT = 0
    p.onSurface = false
    return { sfx: 'jump', power: 0.7 }
  }
  return null
}

export const getHitbox = (p) => squareHitbox(p, 0.14)
