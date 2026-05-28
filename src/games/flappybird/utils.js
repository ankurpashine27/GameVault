import { LS_SETTINGS } from './constants.js'

// ─── Math helpers ─────────────────────────────────────────────────────────────
export const lerp   = (a, b, t) => a + (b - a) * t
export const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
export const randBetween = (lo, hi) => lo + Math.random() * (hi - lo)
export const randInt     = (lo, hi) => Math.floor(randBetween(lo, hi + 1))
export const degToRad    = (d) => d * (Math.PI / 180)
export const radToDeg    = (r) => r * (180 / Math.PI)

// ─── Seeded pseudo-random (LCG) — for stable bg decorations ──────────────────
export function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
export function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* quota exceeded — ignore */ }
}

// ─── Default settings ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  sfxVolume:   0.6,
  musicVolume: 0.35,
  selectedSkin: 'classic',
  selectedBg:   'day',
  musicTrack:   0,
  showFPS:      false,
}

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...lsGet(LS_SETTINGS, {}) }
}

export function saveSettings(settings) {
  lsSet(LS_SETTINGS, settings)
}

// ─── Color helpers ────────────────────────────────────────────────────────────
export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')
}

export function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  return rgbToHex(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t))
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────
export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function drawStar(ctx, cx, cy, outerR, innerR, points = 5) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
    else ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
  }
  ctx.closePath()
}

// ─── Date/time ────────────────────────────────────────────────────────────────
export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
