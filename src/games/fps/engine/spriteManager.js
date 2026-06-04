/**
 * Grimhold — procedural sprites. Enemies get animation frame sets
 * (idle/walk/attack/pain/death); items/decorations get static or short loops.
 * Everything is canvas pixel-art, no external images.
 */
import { makeCanvas } from '../utils.js'

const enemyCache = {}
const itemCache = {}

// ─── Enemy palettes / style flags ───────────────────────────────────────────
const STYLE = {
  cultist:      { body: '#3a2d52', head: '#b8a070', eye: '#ff3030', size: 64, weapon: 'pistol' },
  skeleton:     { body: '#d8d2c0', head: '#e8e2d0', eye: '#103030', size: 64, bones: true, weapon: 'sword' },
  zombie:       { body: '#46603a', head: '#6a7a52', eye: '#c0ff60', size: 64, hunch: true },
  gargoyle:     { body: '#5a5d66', head: '#6a6d76', eye: '#ff8000', size: 64, wings: '#4a4d56' },
  darkknight:   { body: '#26262e', head: '#33333c', eye: '#ff2020', size: 64, bulky: true, weapon: 'greatsword' },
  wraith:       { body: '#7a90b0', head: '#c0d0e0', eye: '#80f0ff', size: 64, ghost: true },
  imp:          { body: '#a03020', head: '#c04030', eye: '#ffd000', size: 48, wings: '#702018', small: true },
  deathcultist: { body: '#2a2030', head: '#a89878', eye: '#a040ff', size: 64, tall: true, weapon: 'staff' },
  count:        { body: '#2a0a18', head: '#d8c8b8', eye: '#ff1040', size: 128, boss: true, cape: '#10040a' },
  lich:         { body: '#203840', head: '#c0d8c0', eye: '#40ffa0', size: 128, boss: true, wings: '#142028' },
  demonlord:    { body: '#5a1010', head: '#7a1818', eye: '#ffd000', size: 128, boss: true, wings: '#3a0808', horns: true },
}

const P = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0)) }

function drawEnemy(style, pose) {
  const S = style.size
  const c = makeCanvas(S, S)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  const cx = S / 2
  const u = S / 64                  // unit scale
  const ground = S - 2 * u
  ctx.save()
  ctx.globalAlpha = pose.alpha ?? 1
  if (pose.fallen) {
    ctx.translate(cx, ground); ctx.rotate(pose.fallen * 1.4); ctx.scale(1, 1 - pose.fallen * 0.4); ctx.translate(-cx, -ground)
  }
  const lean = (pose.lean || 0) * u

  // Wings (behind body)
  if (style.wings) {
    const wf = pose.wing || 0
    ctx.fillStyle = style.wings
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(cx, ground - 34 * u)
      ctx.lineTo(cx + s * (24 + wf * 6) * u, ground - (46 + wf * 4) * u)
      ctx.lineTo(cx + s * (20) * u, ground - 24 * u)
      ctx.closePath(); ctx.fill()
    }
  }
  // Cape (boss)
  if (style.cape) { P(ctx, cx - 14 * u, ground - 40 * u, 28 * u, 38 * u, style.cape) }

  // Legs
  const legSpread = (pose.leg || 0) * u
  if (!style.ghost) {
    P(ctx, cx - 8 * u - legSpread, ground - 18 * u, 6 * u, 18 * u, shade(style.body, 0.7))
    P(ctx, cx + 2 * u + legSpread, ground - 18 * u, 6 * u, 18 * u, shade(style.body, 0.7))
  }

  // Body
  const bodyTop = ground - (style.tall ? 46 : style.bulky ? 42 : 40) * u
  const bw = (style.bulky ? 26 : style.small ? 14 : 20) * u
  if (style.ghost) {
    // wispy translucent
    ctx.globalAlpha = (pose.alpha ?? 1) * 0.8
    ctx.fillStyle = style.body
    ctx.beginPath()
    ctx.moveTo(cx - bw / 2, bodyTop)
    ctx.quadraticCurveTo(cx - bw, ground, cx - 4 * u, ground)
    ctx.lineTo(cx + 4 * u, ground)
    ctx.quadraticCurveTo(cx + bw, ground, cx + bw / 2, bodyTop)
    ctx.closePath(); ctx.fill()
  } else {
    P(ctx, cx - bw / 2 + lean, bodyTop, bw, ground - 16 * u - bodyTop, style.body)
    if (style.bones) {
      P(ctx, cx - bw / 2 + lean, bodyTop, bw, 2 * u, '#aaa')
      for (let r = 0; r < 4; r++) P(ctx, cx - bw / 2 + 2 * u + lean, bodyTop + (5 + r * 6) * u, bw - 4 * u, 2 * u, '#bbb')
    }
  }

  // Head
  const headR = (style.boss ? 12 : 7) * u
  const headY = bodyTop - headR + 2 * u
  ctx.fillStyle = style.head
  ctx.beginPath(); ctx.arc(cx + lean, headY, headR, 0, 7); ctx.fill()
  if (style.horns) {
    ctx.fillStyle = '#1a0808'
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * headR, headY - headR * 0.4); ctx.lineTo(cx + s * headR * 1.8, headY - headR * 1.6); ctx.lineTo(cx + s * headR * 0.5, headY - headR); ctx.closePath(); ctx.fill() }
  }
  // Eyes (glow)
  ctx.fillStyle = pose.flash ? '#ffffff' : style.eye
  ctx.shadowColor = style.eye; ctx.shadowBlur = 4 * u
  P(ctx, cx + lean - 4 * u, headY - 1 * u, 2.4 * u, 2.4 * u, ctx.fillStyle)
  P(ctx, cx + lean + 2 * u, headY - 1 * u, 2.4 * u, 2.4 * u, ctx.fillStyle)
  ctx.shadowBlur = 0

  // Arm + weapon
  const armRaise = (pose.arm || 0)
  const ax = cx + bw / 2 - 2 * u + lean
  const ay = bodyTop + 8 * u - armRaise * 10 * u
  P(ctx, ax, ay, 5 * u, 14 * u, shade(style.body, 0.85))
  if (style.weapon === 'pistol') P(ctx, ax + 3 * u, ay - 2 * u, 10 * u, 4 * u, '#2b2b30')
  if (style.weapon === 'sword' || style.weapon === 'greatsword') {
    const len = style.weapon === 'greatsword' ? 30 : 20
    P(ctx, ax + 2 * u, ay - len * u + 6 * u, 3 * u, len * u, '#c8ccd4')
  }
  if (style.weapon === 'staff') { P(ctx, ax + 2 * u, ay - 20 * u, 3 * u, 30 * u, '#5a3d24'); ctx.fillStyle = style.eye; ctx.beginPath(); ctx.arc(ax + 3 * u, ay - 20 * u, 3 * u, 0, 7); ctx.fill() }

  if (pose.flash) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, S, S); ctx.globalCompositeOperation = 'source-over' }
  ctx.restore()
  return c
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((n >> 16) & 255) * f), g = Math.min(255, ((n >> 8) & 255) * f), b = Math.min(255, (n & 255) * f)
  return `rgb(${r | 0},${g | 0},${b | 0})`
}

function buildEnemy(key) {
  const style = STYLE[key]
  if (!style) return null
  const set = {
    idle: [drawEnemy(style, { lean: -1, wing: 0 }), drawEnemy(style, { lean: 1, wing: 1 })],
    walk: [-3, 0, 3, 0].map((leg, i) => drawEnemy(style, { leg, arm: 0.1, wing: i % 2 })),
    attack: [0.3, 1, 0.5].map(arm => drawEnemy(style, { arm, lean: 1 })),
    pain: [drawEnemy(style, { flash: true, lean: 2 })],
    death: [0, 0.25, 0.5, 0.75, 1].map(f => drawEnemy(style, { fallen: f, alpha: 1 - f * 0.35 })),
  }
  enemyCache[key] = set
  return set
}

export function getEnemySprites(key) { return enemyCache[key] || buildEnemy(key) }

// ─── Items / decorations ────────────────────────────────────────────────────
function item(key, drawFn, frames = 1) {
  const arr = []
  for (let f = 0; f < frames; f++) { const c = makeCanvas(64, 64); drawFn(c.getContext('2d'), f); arr.push(c) }
  itemCache[key] = frames === 1 ? arr[0] : arr
  return itemCache[key]
}

function buildItems() {
  const cross = (ctx, col, glow) => { ctx.shadowColor = glow; ctx.shadowBlur = 8; ctx.fillStyle = col; ctx.fillRect(26, 18, 12, 28); ctx.fillRect(18, 26, 28, 12); ctx.shadowBlur = 0 }
  item('health_small', (ctx) => cross(ctx, '#e23030', '#ff6060'))
  item('health_large', (ctx) => { ctx.fillStyle = '#7a1010'; ctx.fillRect(20, 16, 24, 32); cross(ctx, '#ff4040', '#ff8080') })
  item('armor', (ctx) => { ctx.fillStyle = '#3a6ad0'; ctx.beginPath(); ctx.moveTo(32, 14); ctx.lineTo(48, 22); ctx.lineTo(44, 46); ctx.lineTo(32, 52); ctx.lineTo(20, 46); ctx.lineTo(16, 22); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7aa0ff'; ctx.fillRect(28, 24, 8, 16) })
  const ammoBox = (ctx, col) => { ctx.fillStyle = '#3a3a40'; ctx.fillRect(20, 26, 24, 18); ctx.fillStyle = col; ctx.fillRect(22, 22, 6, 8); ctx.fillRect(30, 22, 6, 8); ctx.fillRect(38, 22, 4, 8) }
  item('ammo_ball', (ctx) => ammoBox(ctx, '#b0b0b8'))
  item('ammo_shell', (ctx) => ammoBox(ctx, '#c04030'))
  item('ammo_bolt', (ctx) => ammoBox(ctx, '#8a6a40'))
  item('ammo_flask', (ctx) => { ctx.fillStyle = '#40c060'; ctx.beginPath(); ctx.arc(32, 38, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#206030'; ctx.fillRect(28, 18, 8, 14) })
  item('ammo_cannon', (ctx) => { ctx.fillStyle = '#1a1a1e'; ctx.beginPath(); ctx.arc(32, 38, 12, 0, 7); ctx.fill() })
  item('mana', (ctx) => { ctx.shadowColor = '#60a0ff'; ctx.shadowBlur = 10; ctx.fillStyle = '#4080ff'; ctx.beginPath(); ctx.moveTo(32, 14); ctx.lineTo(42, 34); ctx.lineTo(32, 50); ctx.lineTo(22, 34); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0 })
  item('gold', (ctx) => { ctx.fillStyle = '#d4af37'; for (const [x, y] of [[24, 38], [34, 38], [29, 30], [24, 44], [34, 44]]) { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill() } })
  item('gem', (ctx) => { ctx.shadowColor = '#ff40a0'; ctx.shadowBlur = 8; ctx.fillStyle = '#ff60c0'; ctx.beginPath(); ctx.moveTo(32, 16); ctx.lineTo(46, 32); ctx.lineTo(32, 50); ctx.lineTo(18, 32); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0 })
  item('chest', (ctx) => { ctx.fillStyle = '#5a3d24'; ctx.fillRect(16, 30, 32, 18); ctx.fillStyle = '#7a5a34'; ctx.fillRect(16, 24, 32, 8); ctx.fillStyle = '#d4af37'; ctx.fillRect(30, 30, 4, 10) })
  const key = (ctx, col) => { ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(26, 30, 7, 0, 7); ctx.fill(); ctx.fillRect(30, 28, 16, 4); ctx.fillRect(42, 28, 3, 8); ctx.shadowBlur = 0 }
  item('key_red', (ctx) => key(ctx, '#ff3030'))
  item('key_blue', (ctx) => key(ctx, '#3070ff'))
  item('key_yellow', (ctx) => key(ctx, '#ffd000'))
  item('key_rune', (ctx) => key(ctx, '#a040ff'))
  const wIcon = (ctx, col) => { ctx.fillStyle = '#2b2b30'; ctx.fillRect(16, 34, 32, 8); ctx.fillStyle = col; ctx.fillRect(20, 28, 10, 8) }
  item('w_blunderbuss', (ctx) => wIcon(ctx, '#8a6a40'))
  item('w_crossbow', (ctx) => wIcon(ctx, '#6a4a2a'))
  item('w_musket', (ctx) => wIcon(ctx, '#9a7a4a'))
  item('w_flask', (ctx) => wIcon(ctx, '#40c060'))
  item('w_staff', (ctx) => wIcon(ctx, '#a040ff'))
  item('w_cannon', (ctx) => wIcon(ctx, '#1a1a1e'))
  const up = (ctx, col, ch) => { ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(32, 32, 12, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.fillText(ch, 32, 38) }
  item('up_dmg', (ctx) => up(ctx, '#ff4040', '+'))
  item('up_fr', (ctx) => up(ctx, '#40a0ff', '»'))
  item('up_cap', (ctx) => up(ctx, '#40ff80', '∞'))
  item('curse', (ctx) => { ctx.shadowColor = '#a00040'; ctx.shadowBlur = 12; ctx.fillStyle = '#c01050'; ctx.beginPath(); ctx.arc(32, 32, 12, 0, 7); ctx.fill(); ctx.shadowBlur = 0 })
  item('skull', (ctx) => { ctx.fillStyle = '#d0ccc0'; ctx.beginPath(); ctx.arc(32, 34, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#101010'; ctx.fillRect(26, 32, 4, 5); ctx.fillRect(34, 32, 4, 5) })
  item('pillar', (ctx) => { ctx.fillStyle = '#6a6a72'; ctx.fillRect(22, 6, 20, 56); ctx.fillStyle = '#4a4a52'; ctx.fillRect(18, 4, 28, 6); ctx.fillRect(18, 54, 28, 8) })
  item('barrel', (ctx) => { ctx.fillStyle = '#5a3d24'; ctx.fillRect(20, 22, 24, 30); ctx.fillStyle = '#3a2818'; ctx.fillRect(20, 26, 24, 3); ctx.fillRect(20, 44, 24, 3); ctx.fillStyle = '#2b2b30'; ctx.fillRect(20, 22, 24, 2) })
  // torch: 3 flame frames
  item('torch', (ctx, f) => {
    ctx.fillStyle = '#3a2818'; ctx.fillRect(30, 34, 4, 24)
    ctx.shadowColor = '#ff8000'; ctx.shadowBlur = 12
    ctx.fillStyle = ['#ff9020', '#ffb040', '#ff7010'][f]
    ctx.beginPath(); ctx.ellipse(32, 26 - f, 6, 10 + f, 0, 0, 7); ctx.fill()
    ctx.fillStyle = '#ffe060'; ctx.beginPath(); ctx.ellipse(32, 28, 3, 5, 0, 0, 7); ctx.fill()
    ctx.shadowBlur = 0
  }, 3)
}

let built = false
export function initSprites() {
  if (built) return
  buildItems()
  Object.keys(STYLE).forEach(buildEnemy)
  built = true
}
export function getItemSprite(key, frame = 0) {
  if (!built) initSprites()
  const s = itemCache[key]
  return Array.isArray(s) ? s[frame % s.length] : s
}
export function isAnimatedItem(key) { return Array.isArray(itemCache[key]) }
