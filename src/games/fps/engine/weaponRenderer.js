/**
 * Grimhold — first-person weapon viewmodel, drawn programmatically at the bottom
 * of the frame with idle bob, fire recoil, and a muzzle flash. No images.
 */
import { RENDER_W, RENDER_H } from '../constants.js'

const COLORS = {
  metal: '#3a3a42', metalLight: '#5a5a64', wood: '#5a3d24', woodDark: '#3a2818',
  hand: '#b89070', steel: '#c8ccd4',
}

export function drawWeapon(ctx, g, time) {
  const p = g.player
  const cx = RENDER_W / 2
  const baseY = RENDER_H
  const bobAmt = (p.bobPhase != null ? Math.sin(p.bobPhase) : 0)
  const moving = g.moving ? 1 : 0
  const bx = bobAmt * 10 * moving
  const by = Math.abs(bobAmt) * 8 * moving
  const recoil = (g.weaponRecoil || 0)        // 0..1
  const ry = recoil * 26
  const x = cx + bx + 70
  const y = baseY - 6 + by + ry

  ctx.save()
  ctx.translate(x, y)
  drawByType(ctx, p.weapon, recoil)
  ctx.restore()

  // Muzzle flash
  if (g.muzzle > 0) {
    const mx = cx + bx + 28
    const my = baseY - 116 + by + ry
    ctx.save()
    ctx.globalAlpha = Math.min(1, g.muzzle)
    const fl = ctx.createRadialGradient(mx, my, 2, mx, my, 40)
    fl.addColorStop(0, '#fff'); fl.addColorStop(0.4, '#ffd060'); fl.addColorStop(1, 'rgba(255,120,0,0)')
    ctx.fillStyle = fl
    ctx.beginPath(); ctx.arc(mx, my, 40, 0, 7); ctx.fill()
    ctx.restore()
  }
}

function R(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h) }

function drawByType(ctx, weapon, recoil) {
  // Hand/arm common
  const arm = () => { R(ctx, -54, 4, 40, 90, COLORS.hand); R(ctx, -58, 0, 48, 22, '#9a7458') }
  switch (weapon) {
    case 'dagger':
      arm()
      ctx.save(); ctx.translate(-30, -10); ctx.rotate(-0.3 - recoil * 0.5)
      R(ctx, -4, -70, 8, 70, COLORS.steel); R(ctx, -8, 0, 16, 10, COLORS.woodDark)
      ctx.restore(); break
    case 'flintlock':
    case 'musket': {
      arm()
      const len = weapon === 'musket' ? 150 : 96
      R(ctx, -36, -len, 16, len, COLORS.metal)         // barrel
      R(ctx, -40, -len + 6, 24, 10, COLORS.metalLight) // lock
      R(ctx, -44, -20, 30, 40, COLORS.wood)            // stock
      break
    }
    case 'blunderbuss':
      arm()
      R(ctx, -40, -70, 24, 70, COLORS.metal)
      ctx.beginPath(); ctx.moveTo(-44, -70); ctx.lineTo(-12, -86); ctx.lineTo(-12, -64); ctx.closePath(); ctx.fillStyle = COLORS.metalLight; ctx.fill()
      R(ctx, -46, -16, 34, 36, COLORS.wood); break
    case 'crossbow':
      arm()
      R(ctx, -34, -110, 10, 110, COLORS.woodDark)
      R(ctx, -64, -94, 70, 8, '#6a4a2a')               // bow arms
      R(ctx, -30, -16, 26, 36, COLORS.wood); break
    case 'flask':
      arm()
      ctx.fillStyle = '#40c060'; ctx.beginPath(); ctx.arc(-30, -36, 22, 0, 7); ctx.fill()
      R(ctx, -36, -64, 12, 22, '#2a6a3a'); break
    case 'staff':
      arm()
      R(ctx, -34, -130, 8, 130, '#4a2d54')
      ctx.fillStyle = '#a040ff'; ctx.shadowColor = '#c060ff'; ctx.shadowBlur = 16
      ctx.beginPath(); ctx.arc(-30, -130, 12, 0, 7); ctx.fill(); ctx.shadowBlur = 0; break
    case 'cannon':
      arm()
      R(ctx, -50, -84, 40, 84, '#1a1a1e')
      R(ctx, -56, -84, 52, 14, COLORS.metalLight)
      R(ctx, -54, -18, 46, 40, COLORS.woodDark); break
    default: arm()
  }
}
