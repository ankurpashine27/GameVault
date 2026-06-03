/**
 * Pulse Rush — all canvas draw calls. Renders in LOGICAL coordinates
 * (LOGICAL_W × LOGICAL_H); GameCanvas applies the scale transform.
 */
import {
  LOGICAL_W, LOGICAL_H, GROUND_Y, CEIL_Y, GROUND_H, CEIL_H,
  PLAYER_X,
} from '../constants.js'
import { objRect, coinRect, categoryOf, orbColor, padColor } from './objectTypes.js'
import { drawIcon } from '../icons/iconDefinitions.js'
import { hexToRgb, shade, clamp, lerp } from '../utils.js'

const ORB_COLORS = {
  yellow: '#ffd23f', pink: '#ff5ea8', blue: '#39a0ff',
  green: '#3fe08a', red: '#ff5a5a', black: '#222233',
}
const PAD_COLORS = { yellow: '#ffd23f', pink: '#ff5ea8', blue: '#39a0ff', red: '#ff5a5a' }
const PORTAL_TINT = {
  speed: '#39d0ff', gravity: '#b06bff', size: '#ffd23f', mirror: '#ff6bd6', form: '#7ee787',
}

function portalKind(type) {
  if (type.startsWith('portal_speed')) return 'speed'
  if (type === 'portal_gravity') return 'gravity'
  if (type.startsWith('portal_size')) return 'size'
  if (type === 'portal_mirror') return 'mirror'
  return 'form'
}

// ─── Backgrounds (3-layer parallax + pattern) ──────────────────────────────────
function drawBackground(ctx, g, pulse) {
  const { bgColor, accentColor, bgPattern } = g.level
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)

  const rgb = hexToRgb(accentColor)
  const wx = g.worldX
  ctx.save()
  ctx.globalAlpha = 0.5
  for (let layer = 0; layer < 3; layer++) {
    const speed = 0.06 + layer * 0.07
    const off = (wx * speed) % 200
    const alpha = 0.05 + layer * 0.03
    ctx.strokeStyle = `rgba(${rgb},${alpha})`
    ctx.fillStyle = `rgba(${rgb},${alpha})`
    ctx.lineWidth = 2
    if (bgPattern === 'grid') {
      for (let x = -off; x < LOGICAL_W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, CEIL_Y); ctx.lineTo(x + 40, LOGICAL_H); ctx.stroke()
      }
    } else if (bgPattern === 'stars') {
      for (let i = 0; i < 30; i++) {
        const x = (i * 137.5 - off * (layer + 1)) % LOGICAL_W
        const y = (i * 53) % LOGICAL_H
        ctx.fillRect((x + LOGICAL_W) % LOGICAL_W, y, 2 + layer, 2 + layer)
      }
    } else if (bgPattern === 'wave') {
      ctx.beginPath()
      for (let x = 0; x <= LOGICAL_W; x += 10) {
        const y = LOGICAL_H / 2 + Math.sin((x + wx * speed) * 0.02) * (30 + layer * 20)
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      }
      ctx.stroke()
    } else if (bgPattern === 'circuit') {
      for (let x = -off; x < LOGICAL_W; x += 120) {
        for (let y = 40; y < LOGICAL_H; y += 90) {
          ctx.strokeRect(x, y, 60, 40)
          ctx.fillRect(x + 56, y + 36, 6, 6)
        }
      }
    } else { // geometric
      for (let x = -off; x < LOGICAL_W + 80; x += 110) {
        const y = 60 + ((layer * 47) % 200)
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30, y + 52); ctx.lineTo(x - 30, y + 52)
        ctx.closePath(); ctx.stroke()
      }
    }
  }
  ctx.restore()
}

function drawGroundCeiling(ctx, g, pulse) {
  const gc = g.level.groundColor
  const accent = g.level.accentColor
  // Floor
  ctx.fillStyle = gc
  ctx.fillRect(0, GROUND_Y, LOGICAL_W, GROUND_H)
  ctx.strokeStyle = accent; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(LOGICAL_W, GROUND_Y); ctx.stroke()
  // Ceiling
  ctx.fillStyle = gc
  ctx.fillRect(0, 0, LOGICAL_W, CEIL_H)
  ctx.beginPath(); ctx.moveTo(0, CEIL_Y); ctx.lineTo(LOGICAL_W, CEIL_Y); ctx.stroke()
  // Moving floor texture
  ctx.strokeStyle = `rgba(${hexToRgb(accent)},0.25)`; ctx.lineWidth = 1
  const off = g.worldX % 40
  for (let x = -off; x < LOGICAL_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, GROUND_Y); ctx.lineTo(x, GROUND_Y + GROUND_H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CEIL_H); ctx.stroke()
  }
}

// ─── Objects ────────────────────────────────────────────────────────────────────
function drawObject(ctx, g, obj, idx) {
  const cat = categoryOf(obj.type)
  const r = objRect(obj, g.worldX)
  if (r.x + r.w < -40 || r.x > LOGICAL_W + 40) return
  const accent = g.level.accentColor

  if (cat === 'hazard') {
    if (obj.type === 'saw') {
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, rad = r.w / 2
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(g.worldX * 0.05)
      ctx.fillStyle = '#cfd8e3'
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4)
        ctx.beginPath(); ctx.moveTo(0, -rad); ctx.lineTo(rad * 0.25, -rad * 0.7); ctx.lineTo(-rad * 0.25, -rad * 0.7); ctx.closePath(); ctx.fill()
      }
      ctx.beginPath(); ctx.arc(0, 0, rad * 0.7, 0, 7); ctx.fillStyle = '#8a94a6'; ctx.fill()
      ctx.beginPath(); ctx.arc(0, 0, rad * 0.2, 0, 7); ctx.fillStyle = '#2c2c3a'; ctx.fill()
      ctx.restore()
      return
    }
    const down = obj.type === 'spike_down'
    ctx.fillStyle = accent
    ctx.strokeStyle = shade(accent, -0.4); ctx.lineWidth = 2
    ctx.beginPath()
    if (down) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w / 2, r.y + r.h) }
    else { ctx.moveTo(r.x, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.lineTo(r.x + r.w / 2, r.y) }
    ctx.closePath(); ctx.fill(); ctx.stroke()
    return
  }

  if (cat === 'solid') {
    ctx.fillStyle = shade(g.level.groundColor, 0.08)
    ctx.fillRect(r.x, r.y, r.w, r.h)
    ctx.strokeStyle = accent; ctx.lineWidth = 2
    ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2)
    ctx.strokeStyle = `rgba(${hexToRgb(accent)},0.2)`
    ctx.beginPath(); ctx.moveTo(r.x, r.y + r.h / 2); ctx.lineTo(r.x + r.w, r.y + r.h / 2); ctx.stroke()
    return
  }

  if (cat === 'orb') {
    const col = ORB_COLORS[orbColor(obj.type)]
    const dim = g.triggered.has('orb' + idx)
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2
    const pr = (r.w / 2) * (0.85 + (dim ? 0 : g.beatPulse * 0.18))
    ctx.globalAlpha = dim ? 0.4 : 1
    ctx.shadowColor = col; ctx.shadowBlur = dim ? 0 : 14
    ctx.strokeStyle = col; ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(cx, cy, pr, 0, 7); ctx.stroke()
    ctx.fillStyle = `rgba(${hexToRgb(col)},0.35)`
    ctx.beginPath(); ctx.arc(cx, cy, pr * 0.5, 0, 7); ctx.fill()
    ctx.shadowBlur = 0; ctx.globalAlpha = 1
    return
  }

  if (cat === 'pad') {
    const col = PAD_COLORS[padColor(obj.type)]
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.moveTo(r.x, r.y + r.h)
    ctx.lineTo(r.x + r.w * 0.15, r.y + r.h * 0.4)
    ctx.lineTo(r.x + r.w * 0.85, r.y + r.h * 0.4)
    ctx.lineTo(r.x + r.w, r.y + r.h)
    ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0
    return
  }

  if (cat === 'portal') {
    const kind = portalKind(obj.type)
    const tint = PORTAL_TINT[kind]
    const cx = r.x + r.w / 2
    ctx.save()
    ctx.strokeStyle = tint; ctx.lineWidth = 4
    ctx.shadowColor = tint; ctx.shadowBlur = 16
    ctx.globalAlpha = 0.9
    // Tall oval gate.
    ctx.beginPath(); ctx.ellipse(cx, r.y + r.h / 2, r.w * 0.4, r.h * 0.5, 0, 0, 7); ctx.stroke()
    ctx.globalAlpha = 0.18; ctx.fillStyle = tint
    ctx.beginPath(); ctx.ellipse(cx, r.y + r.h / 2, r.w * 0.4, r.h * 0.5, 0, 0, 7); ctx.fill()
    ctx.restore()
    // Symbol
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(r.w * 0.5)}px system-ui`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const sym = { speed: '»', gravity: '↕', size: '◇', mirror: '⇄', form: '★' }[kind]
    ctx.fillText(sym, cx, r.y + r.h / 2)
    ctx.textAlign = 'left'
    return
  }
}

function drawCoins(ctx, g) {
  for (const c of g.coins) {
    if (g.collectedCoins.has(c.id)) continue
    const r = coinRect(c, g.worldX)
    if (r.cx < -30 || r.cx > LOGICAL_W + 30) continue
    const wob = Math.sin(g.worldX * 0.02 + c.id) * 0.3
    ctx.save(); ctx.translate(r.cx, r.cy); ctx.scale(Math.cos(g.worldX * 0.03 + c.id), 1)
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 12
    ctx.beginPath(); ctx.arc(0, 0, r.w * 0.42, 0, 7); ctx.stroke()
    ctx.fillStyle = `rgba(255,210,63,0.3)`; ctx.beginPath(); ctx.arc(0, 0, r.w * 0.28, 0, 7); ctx.fill()
    ctx.restore()
    // sparkle
    ctx.fillStyle = `rgba(255,255,200,${0.4 + wob})`
    ctx.fillRect(r.cx + r.w * 0.4, r.cy - 2, 3, 3)
  }
}

// ─── Player + trail ─────────────────────────────────────────────────────────────
function drawPlayer(ctx, g) {
  const p = g.player
  const cfg = g.iconConfig[p.form] || {}
  const primary = cfg.primary || '#39d0ff'
  const secondary = cfg.secondary || '#ffffff'

  // Wave continuous trail
  if (p.form === 'wave' && g.waveTrail.length > 1) {
    ctx.strokeStyle = primary; ctx.lineWidth = 3
    ctx.shadowColor = primary; ctx.shadowBlur = 10
    ctx.beginPath()
    g.waveTrail.forEach((pt, i) => {
      const x = PLAYER_X - (g.worldX - pt.wx)
      i ? ctx.lineTo(x, pt.y) : ctx.moveTo(x, pt.y)
    })
    ctx.stroke(); ctx.shadowBlur = 0
  }

  if (g.status === 'dead') return // explosion particles only

  const cx = PLAYER_X
  const cy = p.y + p.size / 2
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(p.rotation || 0)
  if (cfg.glow) { ctx.shadowColor = cfg.glowColor || primary; ctx.shadowBlur = 16 }
  // Form-entry morph flash
  if (p.formEntryT > 0) {
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(p.formEntryT * 40)
  }
  drawIcon(ctx, p.form, cfg.icon || 0, { size: p.size, primary, secondary })
  ctx.restore()

  if (g.settings.showHitbox) {
    const { getHitbox } = g.formModule
    const hb = getHitbox(p)
    ctx.strokeStyle = '#ff0066'; ctx.lineWidth = 1
    ctx.strokeRect(hb.x + PLAYER_X, hb.y, hb.w, hb.h)
  }
}

function drawParticles(ctx, g) {
  for (const pt of g.particles) {
    const a = clamp(pt.life / pt.maxLife, 0, 1)
    ctx.globalAlpha = a
    ctx.fillStyle = pt.color
    const s = pt.size * (pt.type === 'death' ? a : 1)
    ctx.fillRect(pt.x - s / 2, pt.y - s / 2, s, s)
  }
  ctx.globalAlpha = 1
}

// ─── Master draw ────────────────────────────────────────────────────────────────
export function drawGame(ctx, g) {
  const pulse = g.beatPulse
  ctx.save()

  // Camera shake
  if (g.camera.shake > 0) {
    ctx.translate((Math.random() - 0.5) * g.camera.shake, (Math.random() - 0.5) * g.camera.shake)
  }
  // Mirror
  if (g.mirror.active) {
    ctx.translate(LOGICAL_W, 0); ctx.scale(-1, 1)
  }

  drawBackground(ctx, g, pulse)
  drawGroundCeiling(ctx, g, pulse)

  for (let i = 0; i < g.objects.length; i++) drawObject(ctx, g, g.objects[i], i)
  drawCoins(ctx, g)
  drawParticles(ctx, g)
  drawPlayer(ctx, g)

  ctx.restore()

  // No full-screen beat/portal flash overlays — they can be uncomfortable or
  // seizure-inducing. Rhythm is conveyed by the orbs' local pulse and the
  // music only. (Portals still ripple locally at their own position.)
}
