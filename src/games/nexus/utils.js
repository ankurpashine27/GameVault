// ── Nexus Game Utilities — pure functions, no React, no localStorage ──────────

/**
 * Normalize a guess string for comparison:
 * lowercase, strip non-alpha/space chars, collapse whitespace.
 */
export function normalizeGuess(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Naive singularize for flexible matching — handles the most common English patterns.
 * Used to compare both the input and the answer, so "cats" vs "cat" both work.
 */
export function singularize(word) {
  if (word.length <= 2) return word
  // -ies → -y  (e.g. "berries" → "berry")
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y'
  // -ves → -f or -fe  (e.g. "knives" → "knife")
  if (word.endsWith('ves') && word.length > 4) return word.slice(0, -3) + 'fe'
  // -es endings (e.g. "glasses" → "glass", "foxes" → "fox")
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2)
  // simple -s (e.g. "cats" → "cat") — skip words ending in "ss"
  if (word.endsWith('s') && word.length > 3 && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/**
 * Check if a user's input matches any accepted answer for a puzzle.
 * Compares normalized forms AND singularized forms of both input and each answer.
 */
export function checkGuess(input, answers) {
  const norm = normalizeGuess(input)
  if (!norm) return false

  return answers.some(answer => {
    const na = normalizeGuess(answer)
    if (na === norm) return true
    // Compare word-by-word singularized versions
    const singNorm = norm.split(' ').map(singularize).join(' ')
    const singAns  = na.split(' ').map(singularize).join(' ')
    return singNorm === singAns || singNorm === na || singAns === norm
  })
}

/**
 * Deterministic daily puzzle index derived from today's date.
 * Same result for all users on the same calendar date.
 * Uses a position-weighted charcode hash (similar to Java's String.hashCode).
 */
export function dailyPuzzleIndex(puzzleCount) {
  const d = new Date()
  const s = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  let h = 0
  for (const c of s) {
    h = ((h * 31) + c.charCodeAt(0)) >>> 0
  }
  return h % puzzleCount
}

/**
 * Returns the "Daily #N" number — days since a fixed epoch.
 */
export function dailyNumber() {
  const epoch = new Date('2025-01-01T00:00:00Z')
  return Math.max(1, Math.floor((Date.now() - epoch.getTime()) / 86400000) + 1)
}

/**
 * Returns today's date string in "YYYY-MM-DD" format (local time).
 */
export function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Score based on hints used (1–5). Returns 0 if not correct.
 */
export function calcScore(hintsUsed, correct) {
  if (!correct) return 0
  return [500, 400, 300, 200, 100][hintsUsed - 1] ?? 0
}

/**
 * Emoji for Wordle-style daily share result.
 * 1 hint → 🟢, 2-3 hints → 🟡, 4-5 hints → 🟠, failed → 🔴
 */
export function dailyEmoji(hintsUsed, correct) {
  if (!correct)        return '🔴'
  if (hintsUsed === 1) return '🟢'
  if (hintsUsed <= 3)  return '🟡'
  return '🟠'
}

/**
 * Format a date for display: "Jan 1, 2025"
 */
export function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date()
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Touch/pointer-coarse device detection — used to skip auto-focus on mobile.
 */
export const isTouchDevice = () =>
  typeof navigator !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches)
