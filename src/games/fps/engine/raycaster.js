/**
 * Grimhold — core raycaster (DDA). Per-column wall hit with perpendicular
 * distance correction (no fisheye) and texture offsets. Door/secret tiles carry
 * an `openness` so the renderer can sink them like a portcullis.
 */
import { MAX_RAY_DEPTH, TEX_SIZE, DOOR_PASSABLE_AT } from '../constants.js'

/** Solid-to-rays lookup. Returns null when a ray passes through. */
export function solidAt(g, mx, my) {
  const w = g.map.w, h = g.map.h
  if (mx < 0 || my < 0 || mx >= w || my >= h) return { tex: 1, openness: 0, kind: 'oob' }
  const i = my * w + mx
  const wt = g.wallGrid[i]
  if (wt) return { tex: wt, openness: 0, kind: 'wall' }
  const d = g.doors.get(i)
  if (d && d.openness < 0.98) return { tex: d.tex, openness: d.openness, kind: 'door', ent: d }
  const s = g.secrets.get(i)
  if (s && s.openness < 0.98) return { tex: s.tex, openness: s.openness, kind: 'secret', ent: s }
  return null
}

/** Passable-to-movement lookup. */
export function passableAt(g, mx, my) {
  const w = g.map.w, h = g.map.h
  if (mx < 0 || my < 0 || mx >= w || my >= h) return false
  const i = my * w + mx
  if (g.wallGrid[i]) return false
  const d = g.doors.get(i)
  if (d && d.openness < DOOR_PASSABLE_AT) return false
  const s = g.secrets.get(i)
  if (s && s.openness < DOOR_PASSABLE_AT) return false
  return true
}

/** Line-of-sight check between two world points (for enemy sight). */
export function lineOfSight(g, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay
  const len = Math.hypot(dx, dy)
  const steps = Math.ceil(len / 0.15)
  const sx = dx / steps, sy = dy / steps
  let x = ax, y = ay
  for (let i = 0; i < steps; i++) {
    x += sx; y += sy
    const s = solidAt(g, x | 0, y | 0)
    if (s) return false
  }
  return true
}

/** Cast a single column. Returns hit info (always returns an object). */
export function castColumn(g, px, py, rdx, rdy) {
  let mapX = px | 0, mapY = py | 0
  const deltaX = rdx === 0 ? 1e30 : Math.abs(1 / rdx)
  const deltaY = rdy === 0 ? 1e30 : Math.abs(1 / rdy)
  let stepX, stepY, sideDistX, sideDistY
  if (rdx < 0) { stepX = -1; sideDistX = (px - mapX) * deltaX } else { stepX = 1; sideDistX = (mapX + 1 - px) * deltaX }
  if (rdy < 0) { stepY = -1; sideDistY = (py - mapY) * deltaY } else { stepY = 1; sideDistY = (mapY + 1 - py) * deltaY }

  let side = 0, hit = null, depth = 0
  while (depth < MAX_RAY_DEPTH) {
    if (sideDistX < sideDistY) { sideDistX += deltaX; mapX += stepX; side = 0 }
    else { sideDistY += deltaY; mapY += stepY; side = 1 }
    hit = solidAt(g, mapX, mapY)
    if (hit) break
    depth++
  }
  if (!hit) return { dist: MAX_RAY_DEPTH, tex: 1, side: 0, texX: 0, openness: 0 }

  const perp = side === 0 ? (sideDistX - deltaX) : (sideDistY - deltaY)
  const d = perp < 1e-4 ? 1e-4 : perp
  let wallX = side === 0 ? py + d * rdy : px + d * rdx
  wallX -= Math.floor(wallX)
  let texX = (wallX * TEX_SIZE) | 0
  if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) texX = TEX_SIZE - 1 - texX
  return { dist: d, tex: hit.tex, side, texX, openness: hit.openness || 0, kind: hit.kind, ent: hit.ent, mapX, mapY }
}
