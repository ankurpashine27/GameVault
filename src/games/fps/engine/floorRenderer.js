/**
 * Grimhold — floor & ceiling. Per-pixel floor casting is too slow for canvas2D
 * at 640×400/60fps, so we use depth gradients in the episode palette (brighter
 * near the player, fading to fog at the horizon). Reads atmospheric and fast.
 */
import { RENDER_W, RENDER_H, HALF_H } from '../constants.js'

export function drawFloorCeiling(ctx, g) {
  const pal = g.palette
  const cg = ctx.createLinearGradient(0, 0, 0, HALF_H)
  cg.addColorStop(0, pal.ceil[0]); cg.addColorStop(1, pal.ceil[1])
  ctx.fillStyle = cg
  ctx.fillRect(0, 0, RENDER_W, HALF_H)

  const fg = ctx.createLinearGradient(0, HALF_H, 0, RENDER_H)
  fg.addColorStop(0, pal.floor[1]); fg.addColorStop(1, pal.floor[0])
  ctx.fillStyle = fg
  ctx.fillRect(0, HALF_H, RENDER_W, RENDER_H - HALF_H)
}
