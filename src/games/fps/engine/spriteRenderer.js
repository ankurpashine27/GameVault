/**
 * Grimhold — distance-sorted billboard sprites (enemies, pickups, decorations,
 * projectiles) with per-column Z-buffer occlusion (never drawn over nearer
 * walls). Distance fade via globalAlpha for cheap depth cueing.
 */
import { RENDER_W, RENDER_H, HALF_H, FOG_BASE } from '../constants.js'
import { getEnemySprites, getItemSprite } from './spriteManager.js'
import { getEnemyDef } from '../data/enemies.js'
import { getItem } from '../data/items.js'
import { makeCanvas } from '../utils.js'

const ANIM_FPS = 7
const projGlow = {}
function glow(color) {
  if (projGlow[color]) return projGlow[color]
  const c = makeCanvas(16, 16), ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(8, 8, 1, 8, 8, 8)
  g.addColorStop(0, '#fff'); g.addColorStop(0.4, color); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 16)
  projGlow[color] = c
  return c
}

function enemyCanvas(e) {
  const set = getEnemySprites(e.sprite)
  if (!set) return null
  if (e.state === 'dead') { const f = set.death; return f[Math.min(f.length - 1, e.deathFrame | 0)] }
  const frames = set[e.state] || set.idle
  return frames[Math.floor((e.animTime || 0) * ANIM_FPS) % frames.length]
}

export function drawSprites(ctx, g, time) {
  const p = g.player
  const W = RENDER_W, H = RENDER_H
  const zb = g.zbuffer
  const list = []

  for (const e of g.enemies) {
    const canvas = enemyCanvas(e)
    if (!canvas) continue
    const def = getEnemyDef(e.type)
    list.push({ x: e.x, y: e.y, canvas, scale: (def?.scale || 1) * 1.0, alpha: e.phaseAlpha ?? 1, grounded: e.kind !== 'flying' && !def?.flies, float: e.kind === 'flying' || def?.flies ? 0.18 : 0 })
  }
  for (const it of g.pickups) {
    if (it.taken) continue
    const def = getItem(it.type)
    const canvas = getItemSprite(def?.sprite || 'gold', (time * 4 | 0))
    if (canvas) list.push({ x: it.x, y: it.y, canvas, scale: 0.5, alpha: 1, grounded: true, bob: Math.sin(time * 3 + it.x) * 0.04 })
  }
  for (const d of g.decorations) {
    const def = getItem(d.type)
    const canvas = getItemSprite(def?.sprite || 'skull', (time * 6 | 0))
    if (canvas) list.push({ x: d.x, y: d.y, canvas, scale: d.type === 'pillar' ? 1.0 : 0.7, alpha: 1, grounded: true })
  }
  for (const b of g.barrels) {
    if (b.dead) continue
    const canvas = getItemSprite('barrel')
    list.push({ x: b.x, y: b.y, canvas, scale: 0.6, alpha: 1, grounded: true })
  }
  for (const pr of g.projectiles) {
    list.push({ x: pr.x, y: pr.y, canvas: glow(pr.color || '#ff8000'), scale: 0.35, alpha: 1, grounded: false })
  }

  const invDet = 1.0 / (p.planeX * p.dirY - p.dirX * p.planeY)
  const vis = []
  for (const s of list) {
    const dx = s.x - p.x, dy = s.y - p.y
    s.tX = invDet * (p.dirY * dx - p.dirX * dy)
    s.tY = invDet * (-p.planeY * dx + p.planeX * dy)
    if (s.tY > 0.08) vis.push(s)
  }
  // Insertion sort, far first (lists are near-sorted frame to frame).
  for (let i = 1; i < vis.length; i++) {
    const v = vis[i]; let j = i - 1
    while (j >= 0 && vis[j].tY < v.tY) { vis[j + 1] = vis[j]; j-- }
    vis[j + 1] = v
  }

  for (const s of vis) {
    const screenX = (W / 2) * (1 + s.tX / s.tY)
    const fullH = Math.abs(H / s.tY)
    const spriteH = fullH * s.scale
    const spriteW = spriteH
    const drawX = (screenX - spriteW / 2) | 0
    let drawY = s.grounded ? (HALF_H + fullH / 2 - spriteH) : (HALF_H - spriteH / 2)
    drawY -= (s.float || 0) * fullH
    drawY += (s.bob || 0) * fullH
    drawY |= 0
    const texW = s.canvas.width, texH = s.canvas.height
    const dim = 1 - Math.min(0.8, s.tY / FOG_BASE) * 0.85
    const x0 = Math.max(0, drawX), x1 = Math.min(W, drawX + spriteW)
    for (let x = x0; x < x1; x++) {
      if (s.tY >= zb[x]) continue
      const u = (((x - drawX) * texW / spriteW) | 0)
      ctx.globalAlpha = s.alpha * dim
      ctx.drawImage(s.canvas, u, 0, 1, texH, x, drawY, 1, spriteH)
    }
  }
  ctx.globalAlpha = 1
}
