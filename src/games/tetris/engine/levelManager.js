import { MODERN_GRAVITY, NES_GRAVITY_FRAMES } from '../constants.js'

/**
 * Get gravity delay in milliseconds per row drop.
 * @param {number} level - 1-based level
 * @param {string} system - 'modern' | 'classic'
 * @returns {number} ms per row
 */
export function getGravityDelay(level, system = 'modern') {
  if (system === 'classic') {
    // NES mode: levels 0-based, cap at 29
    const nesLevel = Math.max(0, Math.min(29, level - 1))
    const frames = NES_GRAVITY_FRAMES[nesLevel] ?? 1
    return (frames / 60) * 1000   // convert frames to ms at 60fps
  }

  // Modern: 1-based, cap at 20
  const idx = Math.max(0, Math.min(19, level - 1))
  return MODERN_GRAVITY[idx] * 1000   // seconds → ms
}

/**
 * Get the level from total lines cleared.
 * Modern: level = floor(lines / 10) + 1, capped at 20
 * Classic: level = floor(lines / 10) + startLevel, capped at 29
 */
export function getLevelFromLines(lines, startLevel = 1, system = 'modern') {
  const rawLevel = Math.floor(lines / 10) + startLevel
  const cap = system === 'classic' ? 29 : 20
  return Math.min(rawLevel, cap)
}

/**
 * Lines needed to reach the next level from current level.
 * Returns the total lines threshold for the next level.
 */
export function getNextLevelThreshold(level) {
  return level * 10
}

/**
 * Check if the game should end based on mode.
 */
export function isGameComplete(mode, lines, timeMs) {
  if (mode === 'sprint') return lines >= 40
  if (mode === 'ultra') return timeMs >= 3 * 60 * 1000
  return false  // marathon / blitz end on game over only
}
