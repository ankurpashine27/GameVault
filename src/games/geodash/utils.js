/**
 * Pulse Rush — pure utilities. No React, no DOM, no side effects.
 */

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
export const lerp = (a, b, t) => a + (b - a) * t

/** Mulberry32 — small, fast, seedable PRNG. Returns a function ()=>[0,1). */
export function makePRNG(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const randInt = (rng, lo, hi) => Math.floor(rng() * (hi - lo + 1)) + lo
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

/** AABB overlap test. Each box: {x, y, w, h}. */
export function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

export function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** HSL → CSS string helper. */
export const hsl = (h, s, l, a = 1) =>
  a === 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${a})`

/** Lighten/darken a hex color by mixing toward white/black. amt in [-1,1]. */
export function shade(hex, amt) {
  const c = hex.replace('#', '')
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16)
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff
  const mix = amt < 0 ? 0 : 255
  const t = Math.abs(amt)
  r = Math.round(lerp(r, mix, t))
  g = Math.round(lerp(g, mix, t))
  b = Math.round(lerp(b, mix, t))
  return `rgb(${r} ${g} ${b})`
}

/** Hex → "r,g,b" for rgba() usage. */
export function hexToRgb(hex) {
  const c = hex.replace('#', '')
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16)
  return `${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff}`
}

/** Safe JSON parse with fallback. */
export function safeParse(str, fallback) {
  try {
    const v = JSON.parse(str)
    return v == null ? fallback : v
  } catch {
    return fallback
  }
}

export const isTouchDevice = () =>
  typeof navigator !== 'undefined' &&
  (navigator.maxTouchPoints > 0 ||
    (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches))
