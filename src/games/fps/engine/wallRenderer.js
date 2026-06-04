/**
 * Grimhold — wall column rendering. Casts every screen column, draws a textured
 * vertical strip (1px source slice scaled), applies distance fog + side shading
 * + torch flicker, sinks doors/secrets like a portcullis, and fills the Z-buffer
 * used for sprite occlusion.
 */
import {
  RENDER_W, RENDER_H, HALF_H, TEX_SIZE, SIDE_DARKEN, FOG_BASE, TORCH_FREQ, TORCH_AMP,
} from '../constants.js'
import { castColumn } from './raycaster.js'
import { getWallTexture } from './textureManager.js'

const LOCK_COLORS = { R: '#ff2020', B: '#3070ff', Y: '#ffd000' }

export function drawWalls(ctx, g, time) {
  const p = g.player
  const W = RENDER_W, H = RENDER_H
  const zb = g.zbuffer

  for (let x = 0; x < W; x++) {
    const cameraX = 2 * x / W - 1
    const rdx = p.dirX + p.planeX * cameraX
    const rdy = p.dirY + p.planeY * cameraX
    const hit = castColumn(g, p.x, p.y, rdx, rdy)
    zb[x] = hit.dist

    const lineH = (H / hit.dist) | 0
    const sink = hit.openness > 0 ? ((hit.openness * lineH) | 0) : 0
    const dStart = (-(lineH >> 1) + HALF_H + sink) | 0

    const texCanvas = getWallTexture(hit.tex)
    ctx.drawImage(texCanvas, hit.texX, 0, 1, TEX_SIZE, x, dStart, 1, lineH)

    // Shading: distance fog + side darken + torch flicker.
    let dim = 1 - Math.min(0.88, hit.dist / FOG_BASE) * 0.92
    if (hit.side === 1) dim *= SIDE_DARKEN
    if (g.torchSet && g.torchSet.has(hit.mapY * g.map.w + hit.mapX)) {
      dim *= 1 + Math.sin(time * TORCH_FREQ + (hit.mapX * 1.3 + hit.mapY)) * TORCH_AMP
    }
    if (dim < 1) {
      ctx.fillStyle = `rgba(8,6,10,${(1 - dim).toFixed(3)})`
      ctx.fillRect(x, dStart, 1, lineH)
    } else if (dim > 1) {
      ctx.fillStyle = `rgba(255,180,90,${Math.min(0.4, dim - 1).toFixed(3)})`
      ctx.fillRect(x, dStart, 1, lineH)
    }

    // Locked-door colour badge (center of strip).
    if (hit.kind === 'door' && hit.ent && hit.ent.locked && LOCK_COLORS[hit.ent.locked]) {
      const cy = dStart + (lineH >> 1)
      ctx.fillStyle = LOCK_COLORS[hit.ent.locked]
      ctx.fillRect(x, cy - (lineH * 0.06) | 0, 1, (lineH * 0.12) | 0)
    }
  }
}
