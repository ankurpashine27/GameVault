// ─── Game Loop Utilities ──────────────────────────────────────────────────────
// This module provides helpers for the main RAF loop.
// The actual loop is managed in useTetrisGame.js via a loopRef pattern.

/**
 * Clamp delta time to avoid huge jumps after tab switching.
 */
export function clampDelta(dt, maxDt = 0.05) {
  return Math.min(dt, maxDt)
}

/**
 * Compute elapsed time as seconds.
 */
export function computeDelta(lastTime, timestamp) {
  if (lastTime === null || lastTime === undefined) return 0
  return (timestamp - lastTime) / 1000
}

/**
 * Create a simple timer that accumulates time and fires when it exceeds interval.
 * Returns { tick(dt): bool } — returns true each time the interval elapsed.
 */
export function createTimer(interval) {
  let acc = 0
  return {
    tick(dt) {
      acc += dt
      if (acc >= interval) {
        acc -= interval
        return true
      }
      return false
    },
    reset() { acc = 0 },
    setInterval(i) { interval = i },
    getAccumulator() { return acc },
  }
}

/**
 * Calculate tempo BPM from level (for music).
 * baseBPM * (1 + (level-1) * 0.05)
 */
export function levelToBPM(baseBPM, level) {
  return baseBPM * (1 + (Math.max(1, level) - 1) * 0.05)
}
