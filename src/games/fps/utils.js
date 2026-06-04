/**
 * Grimhold — pure utilities. No React, no DOM globals beyond canvas helpers.
 */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const TAU = Math.PI * 2

/** Mulberry32 seeded PRNG. */
export function makePRNG(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const randInt = (rng, lo, hi) => Math.floor(rng() * (hi - lo + 1)) + lo
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

export function normalizeAngle(a) {
  a %= TAU
  if (a < 0) a += TAU
  return a
}

/** Distance helpers. */
export const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy }
export const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by))

/** Create an offscreen canvas (texture/sprite). */
export function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  return c
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

export function safeParse(str, fallback) {
  try { const v = JSON.parse(str); return v == null ? fallback : v } catch { return fallback }
}

export const isTouchDevice = () =>
  typeof navigator !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches))

/** rgb helper. */
export const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`
