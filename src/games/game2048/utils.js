/**
 * 2048 — Utility functions.
 */

import { ACHIEVEMENTS, SWIPE_MIN_DIST } from './constants.js'

// ─── Seeded random (LCG) ──────────────────────────────────────────────────────
export function seededRandom(seed) {
  let s = seed >>> 0
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dailySeed() {
  const s = todayStr().replace(/-/g, '')
  return parseInt(s, 10)
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
export function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

// ─── Time formatting ──────────────────────────────────────────────────────────
export function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = String(totalSec % 60).padStart(2, '0')
  return `${m}:${s}`
}

// ─── Device detection ─────────────────────────────────────────────────────────
export function isTouchDevice() {
  return typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}

// ─── Swipe detection ──────────────────────────────────────────────────────────
export function getSwipeDirection(dx, dy, minDist = SWIPE_MIN_DIST) {
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  const dist  = Math.sqrt(dx * dx + dy * dy)
  if (dist < minDist) return null
  // 45° axis threshold: dominant axis must be >= subdominant
  if (absDx >= absDy) {
    return dx > 0 ? 'right' : 'left'
  } else {
    return dy > 0 ? 'down' : 'up'
  }
}

// ─── Color helpers ────────────────────────────────────────────────────────────
export function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `rgb(${r},${g},${b})`
}

// ─── Achievement checker ──────────────────────────────────────────────────────
export function checkAchievements(stats, unlocked) {
  const newlyUnlocked = []

  function check(id, condition) {
    if (!unlocked.includes(id) && condition) {
      newlyUnlocked.push(id)
    }
  }

  check('first_512',       stats.highestTile >= 512)
  check('first_1024',      stats.highestTile >= 1024)
  check('first_2048',      stats.highestTile >= 2048)
  check('first_4096',      stats.highestTile >= 4096)
  check('first_8192',      stats.highestTile >= 8192)
  check('score_10k',       stats.score >= 10000)
  check('score_50k',       stats.score >= 50000)
  check('score_100k',      stats.score >= 100000)
  check('daily_first',     stats.dailyCompleted >= 1)
  check('daily_streak_3',  stats.dailyStreak >= 3)
  check('daily_streak_7',  stats.dailyStreak >= 7)
  check('undo_master',     stats.totalUndos >= 10)
  check('no_undo_win',     stats.wonWithoutUndo === true)
  check('tiny_win',        stats.wonOnGridSize === 3)
  check('big_win',         stats.wonOnGridSize === 6)
  check('obstacle_win',    stats.wonInObstacleMode === true)
  check('time_attack_win', stats.wonInTimeAttack === true)
  check('combo_5',         stats.maxCombo >= 5)

  return newlyUnlocked
}
