/**
 * Wave — hold to move up at 45°, release to move down at 45°. Constant speed,
 * only direction changes. No gravity. Touching floor/ceiling is lethal
 * (flagged via p.deadlyBounds, enforced in collision.js). Leaves a glowing
 * trail (rendered in renderer.js from p.trailPoints).
 */
import { diamondHitbox } from '../physics.js'

export function update(p, ctx) {
  const vDir = ctx.input.held ? -1 : 1     // up when held
  const vy = vDir * ctx.scrollPps * p.gravityDir
  p.vy = vy
  p.y += vy * ctx.dt
  p.deadlyBounds = true
  p.rotation = (vy < 0 ? -1 : 1) * (Math.PI / 4) * p.gravityDir
  return p
}

export function onInput() {
  return { sfx: 'wave', power: 0.4 }
}

export const getHitbox = (p) => diamondHitbox(p)
