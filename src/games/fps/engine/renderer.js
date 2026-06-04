/**
 * Grimhold — full-frame orchestration: floor/ceiling → walls → sprites →
 * weapon → screen-space effects (damage/pickup flash, crosshair) and minimap.
 * Draws into the 640×400 offscreen canvas; GameCanvas scales it to the frame.
 */
import { RENDER_W, RENDER_H, HALF_H, MINIMAP_SIZE, MINIMAP_TILE } from '../constants.js'
import { drawFloorCeiling } from './floorRenderer.js'
import { drawWalls } from './wallRenderer.js'
import { drawSprites } from './spriteRenderer.js'
import { drawWeapon } from './weaponRenderer.js'

export function drawFrame(ctx, g, time) {
  ctx.imageSmoothingEnabled = false

  // Screen shake
  let shake = g.shake || 0
  ctx.save()
  if (shake > 0.1) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)

  drawFloorCeiling(ctx, g)
  drawWalls(ctx, g, time)
  drawSprites(ctx, g, time)
  drawWeapon(ctx, g, time)
  ctx.restore()

  drawCrosshair(ctx, g)
  drawDamageIndicators(ctx, g)

  // Damage flash (red edges)
  if (g.damageFlash > 0.01) {
    const a = Math.min(0.6, g.damageFlash)
    const vg = ctx.createRadialGradient(RENDER_W / 2, HALF_H, RENDER_H * 0.25, RENDER_W / 2, HALF_H, RENDER_H * 0.7)
    vg.addColorStop(0, 'rgba(180,0,0,0)'); vg.addColorStop(1, `rgba(150,0,0,${a})`)
    ctx.fillStyle = vg; ctx.fillRect(0, 0, RENDER_W, RENDER_H)
  }
  // Pickup flash (gold shimmer)
  if (g.pickupFlash > 0.01) {
    ctx.fillStyle = `rgba(255,210,90,${Math.min(0.22, g.pickupFlash * 0.4)})`
    ctx.fillRect(0, 0, RENDER_W, RENDER_H)
  }
  // Death fade
  if (g.player.health <= 0) {
    ctx.fillStyle = `rgba(40,0,0,${Math.min(0.75, (g.deathFade || 0))})`
    ctx.fillRect(0, 0, RENDER_W, RENDER_H)
  }

  if (g.showMinimap) drawMinimap(ctx, g)
}

/** Subtle red chevrons around the crosshair pointing to where damage came from. */
function drawDamageIndicators(ctx, g) {
  if (!g.damageDirs || !g.damageDirs.length) return
  const cx = RENDER_W / 2, cy = HALF_H, R = 150
  for (const d of g.damageDirs) {
    const bearing = d.ang - g.player.dir       // 0 = directly ahead (up on screen)
    const ox = Math.sin(bearing), oy = -Math.cos(bearing)
    const a = Math.min(0.55, d.life * 0.45)
    ctx.save()
    ctx.translate(cx + ox * R, cy + oy * R)
    ctx.rotate(Math.atan2(oy, ox))             // tip points outward toward the source
    ctx.shadowColor = 'rgba(255,0,0,0.6)'; ctx.shadowBlur = 8
    ctx.fillStyle = `rgba(255,45,45,${a.toFixed(3)})`
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-2, -13); ctx.lineTo(-2, 13); ctx.closePath(); ctx.fill()
    ctx.restore()
  }
  ctx.shadowBlur = 0
}

function drawCrosshair(ctx, g) {
  const cx = RENDER_W / 2, cy = HALF_H
  const spread = 3 + (g.weaponRecoil || 0) * 7
  ctx.strokeStyle = g.aimEnemy ? 'rgba(255,60,60,0.9)' : 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 1.5
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * spread, cy + dy * spread)
    ctx.lineTo(cx + dx * (spread + 4), cy + dy * (spread + 4))
    ctx.stroke()
  }
  ctx.fillStyle = ctx.strokeStyle
  ctx.fillRect(cx - 1, cy - 1, 2, 2)
}

function drawMinimap(ctx, g) {
  const M = MINIMAP_SIZE, T = MINIMAP_TILE
  const ox = RENDER_W - M - 8, oy = 8
  const p = g.player, w = g.map.w, h = g.map.h
  const span = M / T, half = span / 2
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(ox - 2, oy - 2, M + 4, M + 4)
  ctx.beginPath(); ctx.rect(ox, oy, M, M); ctx.clip()
  ctx.fillStyle = '#050507'; ctx.fillRect(ox, oy, M, M)

  for (let ty = 0; ty < span; ty++) {
    for (let tx = 0; tx < span; tx++) {
      const mx = Math.floor(p.x - half + tx), my = Math.floor(p.y - half + ty)
      if (mx < 0 || my < 0 || mx >= w || my >= h) continue
      const idx = my * w + mx
      const px = ox + tx * T, py = oy + ty * T
      // exit always visible
      if (g.exitTile && g.exitTile.x === mx && g.exitTile.y === my) { ctx.fillStyle = '#30e060'; ctx.fillRect(px, py, T, T); continue }
      if (!g.visited.has(idx)) continue
      if (g.doors.has(idx)) ctx.fillStyle = '#c0a000'
      else if (g.wallGrid[idx]) ctx.fillStyle = '#9a9aa2'
      else ctx.fillStyle = '#26262c'
      ctx.fillRect(px, py, T, T)
    }
  }
  // player
  const pcx = ox + M / 2, pcy = oy + M / 2
  ctx.fillStyle = '#40ff70'
  ctx.beginPath(); ctx.arc(pcx, pcy, 2.5, 0, 7); ctx.fill()
  ctx.strokeStyle = '#40ff70'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(pcx, pcy); ctx.lineTo(pcx + p.dirX * 8, pcy + p.dirY * 8); ctx.stroke()
  ctx.restore()
}
