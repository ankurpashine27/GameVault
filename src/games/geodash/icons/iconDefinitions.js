/**
 * Pulse Rush — icon kit. 8 forms × 15 designs = 120 icons, all drawn with the
 * Canvas 2D API (no images). Each icon = a form silhouette + a distinct detail
 * overlay. Exposes draw functions, names, and unlock conditions.
 *
 * draw signature: drawIcon(ctx, form, variant, { size, primary, secondary, t })
 *   — draws centred on the current transform origin (caller translates/rotates).
 */
import { FORMS, FORM_LABELS, ICONS_PER_FORM, DEFAULT_UNLOCKED_PER_FORM } from '../constants.js'

// ─── Form silhouettes ──────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const silhouette = {
  cube(ctx, s, p, sec) {
    roundRect(ctx, -s / 2, -s / 2, s, s, s * 0.16)
    ctx.fillStyle = p; ctx.fill()
    ctx.lineWidth = s * 0.08; ctx.strokeStyle = sec; ctx.stroke()
  },
  robot(ctx, s, p, sec) {
    roundRect(ctx, -s / 2, -s / 2, s, s * 0.7, s * 0.12)
    ctx.fillStyle = p; ctx.fill()
    ctx.fillRect(-s / 2 + s * 0.1, s * 0.2, s * 0.18, s * 0.3)
    ctx.fillRect(s / 2 - s * 0.28, s * 0.2, s * 0.18, s * 0.3)
    ctx.lineWidth = s * 0.07; ctx.strokeStyle = sec
    roundRect(ctx, -s / 2, -s / 2, s, s * 0.7, s * 0.12); ctx.stroke()
  },
  swing(ctx, s, p, sec) {
    roundRect(ctx, -s / 2, -s / 2, s, s, s * 0.34)
    ctx.fillStyle = p; ctx.fill()
    ctx.lineWidth = s * 0.08; ctx.strokeStyle = sec; ctx.stroke()
  },
  ship(ctx, s, p, sec) {
    ctx.beginPath()
    ctx.moveTo(s * 0.55, 0)
    ctx.lineTo(-s * 0.5, -s * 0.4)
    ctx.lineTo(-s * 0.3, 0)
    ctx.lineTo(-s * 0.5, s * 0.4)
    ctx.closePath()
    ctx.fillStyle = p; ctx.fill()
    ctx.lineWidth = s * 0.07; ctx.strokeStyle = sec; ctx.stroke()
  },
  ball(ctx, s, p, sec) {
    ctx.beginPath(); ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = p; ctx.fill()
    ctx.lineWidth = s * 0.08; ctx.strokeStyle = sec; ctx.stroke()
  },
  spider(ctx, s, p, sec) {
    ctx.strokeStyle = sec; ctx.lineWidth = s * 0.06
    for (const dx of [-1, 1]) {
      for (const dy of [-0.25, 0.05, 0.35]) {
        ctx.beginPath(); ctx.moveTo(0, 0)
        ctx.lineTo(dx * s * 0.55, dy * s); ctx.stroke()
      }
    }
    ctx.beginPath(); ctx.arc(0, 0, s * 0.34, 0, Math.PI * 2)
    ctx.fillStyle = p; ctx.fill(); ctx.stroke()
  },
  ufo(ctx, s, p, sec) {
    ctx.beginPath(); ctx.ellipse(0, s * 0.08, s * 0.55, s * 0.22, 0, 0, Math.PI * 2)
    ctx.fillStyle = p; ctx.fill()
    ctx.lineWidth = s * 0.06; ctx.strokeStyle = sec; ctx.stroke()
    ctx.beginPath(); ctx.arc(0, -s * 0.02, s * 0.26, Math.PI, 0)
    ctx.fillStyle = sec; ctx.fill()
  },
  wave(ctx, s, p, sec) {
    ctx.beginPath()
    ctx.moveTo(s * 0.5, 0); ctx.lineTo(0, -s * 0.42)
    ctx.lineTo(-s * 0.5, 0); ctx.lineTo(0, s * 0.42)
    ctx.closePath()
    ctx.fillStyle = p; ctx.fill()
    ctx.lineWidth = s * 0.07; ctx.strokeStyle = sec; ctx.stroke()
  },
}

// ─── 15 detail overlays (shared, recoloured per icon) ──────────────────────────
const DETAILS = [
  { name: 'Dot',     fn: (c, s, col) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, s * 0.12, 0, 7); c.fill() } },
  { name: 'Ring',    fn: (c, s, col) => { c.strokeStyle = col; c.lineWidth = s * 0.08; c.beginPath(); c.arc(0, 0, s * 0.22, 0, 7); c.stroke() } },
  { name: 'Cross',   fn: (c, s, col) => { c.strokeStyle = col; c.lineWidth = s * 0.09; c.beginPath(); c.moveTo(-s * 0.2, 0); c.lineTo(s * 0.2, 0); c.moveTo(0, -s * 0.2); c.lineTo(0, s * 0.2); c.stroke() } },
  { name: 'Star',    fn: (c, s, col) => { star(c, 0, 0, 5, s * 0.24, s * 0.1, col) } },
  { name: 'Diamond', fn: (c, s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, -s * 0.24); c.lineTo(s * 0.2, 0); c.lineTo(0, s * 0.24); c.lineTo(-s * 0.2, 0); c.closePath(); c.fill() } },
  { name: 'Smiley',  fn: (c, s, col) => { c.fillStyle = col; for (const dx of [-1, 1]) { c.beginPath(); c.arc(dx * s * 0.13, -s * 0.05, s * 0.05, 0, 7); c.fill() } c.strokeStyle = col; c.lineWidth = s * 0.05; c.beginPath(); c.arc(0, s * 0.02, s * 0.16, 0.2, Math.PI - 0.2); c.stroke() } },
  { name: 'Checker', fn: (c, s, col) => { c.fillStyle = col; const u = s * 0.13; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) c.fillRect((i - 1) * u, (j - 1) * u, u, u) } },
  { name: 'Hollow',  fn: (c, s, col) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, s * 0.16, 0, 7); c.fill() } },
  { name: 'Crown',   fn: (c, s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(-s * 0.22, s * 0.08); c.lineTo(-s * 0.22, -s * 0.06); c.lineTo(-s * 0.08, s * 0.02); c.lineTo(0, -s * 0.14); c.lineTo(s * 0.08, s * 0.02); c.lineTo(s * 0.22, -s * 0.06); c.lineTo(s * 0.22, s * 0.08); c.closePath(); c.fill() } },
  { name: 'Bars',    fn: (c, s, col) => { c.fillStyle = col; for (let i = -1; i <= 1; i++) c.fillRect(i * s * 0.16 - s * 0.04, -s * 0.18, s * 0.08, s * 0.36) } },
  { name: 'Triangle', fn: (c, s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, -s * 0.22); c.lineTo(s * 0.2, s * 0.16); c.lineTo(-s * 0.2, s * 0.16); c.closePath(); c.fill() } },
  { name: 'Heart',   fn: (c, s, col) => { c.fillStyle = col; const u = s * 0.18; c.beginPath(); c.moveTo(0, u * 0.9); c.bezierCurveTo(u * 1.3, -u * 0.3, u * 0.4, -u * 1.1, 0, -u * 0.3); c.bezierCurveTo(-u * 0.4, -u * 1.1, -u * 1.3, -u * 0.3, 0, u * 0.9); c.fill() } },
  { name: 'Hex',     fn: (c, s, col) => { c.strokeStyle = col; c.lineWidth = s * 0.07; c.beginPath(); for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; const x = Math.cos(a) * s * 0.2, y = Math.sin(a) * s * 0.2; i ? c.lineTo(x, y) : c.moveTo(x, y) } c.closePath(); c.stroke() } },
  { name: 'Eye',     fn: (c, s, col) => { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, 0, s * 0.2, s * 0.13, 0, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(0, 0, s * 0.07, 0, 7); c.fill() } },
  { name: 'Bolt',    fn: (c, s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(s * 0.05, -s * 0.22); c.lineTo(-s * 0.12, s * 0.02); c.lineTo(0, s * 0.02); c.lineTo(-s * 0.05, s * 0.22); c.lineTo(s * 0.14, -s * 0.04); c.lineTo(0, -s * 0.04); c.closePath(); c.fill() } },
]

function star(c, x, y, points, outer, inner, col) {
  c.fillStyle = col; c.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / points) * i - Math.PI / 2
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r
    i ? c.lineTo(px, py) : c.moveTo(px, py)
  }
  c.closePath(); c.fill()
}

/** Draw a complete icon centred at origin. */
export function drawIcon(ctx, form, variant, { size, primary, secondary }) {
  const sil = silhouette[form] || silhouette.cube
  sil(ctx, size, primary, secondary)
  const det = DETAILS[variant % DETAILS.length]
  if (det) det.fn(ctx, size, secondary)
}

// ─── Metadata + unlock conditions ──────────────────────────────────────────────
// Unlock spreads across stars, coins, demon completions, and counts so the kit
// is earned through varied play.
function unlockFor(formIdx, v) {
  if (v < DEFAULT_UNLOCKED_PER_FORM) return { type: 'default', label: 'Unlocked' }
  const ladder = [
    { type: 'stars', value: 10 }, { type: 'stars', value: 25 },
    { type: 'coins', value: 25 }, { type: 'stars', value: 50 },
    { type: 'coins', value: 75 }, { type: 'stars', value: 100 },
    { type: 'completions', value: 5 }, { type: 'stars', value: 150 },
    { type: 'coins', value: 150 }, { type: 'demon', value: 1 },
    { type: 'stars', value: 200 }, { type: 'demon', value: 3 },
  ]
  const step = ladder[(v - DEFAULT_UNLOCKED_PER_FORM + formIdx) % ladder.length]
  const labels = {
    stars: `${step.value} stars`,
    coins: `${step.value} coins`,
    completions: `${step.value} levels`,
    demon: `${step.value} demon${step.value > 1 ? 's' : ''}`,
  }
  return { ...step, label: labels[step.type] }
}

export const ICON_LIST = []
FORMS.forEach((form, fi) => {
  for (let v = 0; v < ICONS_PER_FORM; v++) {
    ICON_LIST.push({
      id: `${form}_${v}`,
      form, variant: v,
      name: `${FORM_LABELS[form]} ${DETAILS[v % DETAILS.length].name}`,
      unlock: unlockFor(fi, v),
    })
  }
})

export const DEFAULT_ICON_IDS = ICON_LIST.filter(i => i.unlock.type === 'default').map(i => i.id)

/** Evaluate whether an icon is unlocked given the player's currency/progress. */
export function isIconUnlocked(icon, data) {
  const u = icon.unlock
  switch (u.type) {
    case 'default': return true
    case 'stars': return (data.stars || 0) >= u.value
    case 'coins': return (data.coins || 0) >= u.value
    case 'completions': return (data.completions || 0) >= u.value
    case 'demon': return (data.demonStars || 0) >= u.value
    default: return false
  }
}
