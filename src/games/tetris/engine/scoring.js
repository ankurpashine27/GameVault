import { MODERN_SCORE, CLASSIC_SCORE } from '../constants.js'

/**
 * Calculate score for a line clear event.
 *
 * @param {number} lines - Number of lines cleared (1-4)
 * @param {string|null} tSpin - 'full' | 'mini' | null
 * @param {boolean} isBackToBack - Previous action was also a special clear
 * @param {number} combo - Current combo count (0-based)
 * @param {number} level - Current game level (1-based)
 * @param {string} system - 'modern' | 'classic'
 *
 * @returns {{ points, newBackToBack, newCombo, messages }}
 */
export function calculateLineClearScore(lines, tSpin, isBackToBack, combo, level, system = 'modern') {
  const messages = []
  let points = 0
  let newBackToBack = isBackToBack

  if (system === 'classic') {
    const base = CLASSIC_SCORE.base[lines] ?? 0
    points = base * level

    // NES classic has no B2B or combo
    const comboPoints = 0
    return {
      points: points + comboPoints,
      newBackToBack: false,
      newCombo: lines > 0 ? combo + 1 : 0,
      messages,
    }
  }

  // Modern scoring
  const isSpecial = lines === 4 || tSpin !== null

  if (tSpin === 'full') {
    const base = MODERN_SCORE.tspin[lines] ?? 0
    if (isBackToBack && lines > 0) {
      points = Math.floor(base * MODERN_SCORE.back_to_back_multiplier)
      messages.push('BACK-TO-BACK T-SPIN!')
    } else {
      points = base
    }
    if (lines > 0) messages.push(lines === 1 ? 'T-SPIN SINGLE' : lines === 2 ? 'T-SPIN DOUBLE' : lines === 3 ? 'T-SPIN TRIPLE' : 'T-SPIN')
    else messages.push('T-SPIN')
    newBackToBack = lines > 0
  } else if (tSpin === 'mini') {
    const base = MODERN_SCORE.tspin_mini[lines] ?? 0
    if (isBackToBack && lines > 0) {
      points = Math.floor(base * MODERN_SCORE.back_to_back_multiplier)
      messages.push('BACK-TO-BACK MINI T-SPIN!')
    } else {
      points = base
    }
    if (lines > 0) messages.push('MINI T-SPIN')
    newBackToBack = lines > 0
  } else {
    const base = MODERN_SCORE.base[lines] ?? 0
    if (lines === 4) {
      if (isBackToBack) {
        points = Math.floor(base * MODERN_SCORE.back_to_back_multiplier)
        messages.push('BACK-TO-BACK TETRIS!')
      } else {
        points = base
        messages.push('TETRIS!')
      }
      newBackToBack = true
    } else {
      points = base
      newBackToBack = false
      if (lines === 3) messages.push('TRIPLE!')
      else if (lines === 2) messages.push('DOUBLE!')
      else if (lines === 1) messages.push('SINGLE')
    }
  }

  // Multiply by level
  points *= level

  // Combo bonus
  let comboPoints = 0
  if (lines > 0 && combo > 0) {
    comboPoints = MODERN_SCORE.combo_base * combo * level
    if (combo >= 2) messages.push(`${combo} COMBO!`)
  }

  const newCombo = lines > 0 ? combo + 1 : 0

  return {
    points: points + comboPoints,
    newBackToBack,
    newCombo,
    messages,
  }
}

/**
 * Calculate score for a Perfect Clear.
 * Call this AFTER the regular line-clear score if all cells cleared.
 */
export function calculatePerfectClearScore(lines, isBackToBack, level) {
  const scores = {
    1: MODERN_SCORE.perfect_clear_single,
    2: MODERN_SCORE.perfect_clear_double,
    3: MODERN_SCORE.perfect_clear_triple,
    4: isBackToBack
      ? MODERN_SCORE.perfect_clear_b2b_tetris
      : MODERN_SCORE.perfect_clear_tetris,
  }
  const base = scores[lines] ?? MODERN_SCORE.perfect_clear_single
  return base * level
}

/**
 * Calculate drop score.
 * @param {number} cells - Number of rows dropped
 * @param {boolean} isHard - Hard drop (true) vs soft drop (false)
 * @param {string} system
 */
export function calculateDropScore(cells, isHard, system = 'modern') {
  if (system === 'classic') {
    return cells * (isHard ? CLASSIC_SCORE.hard_drop : CLASSIC_SCORE.soft_drop)
  }
  return cells * (isHard ? MODERN_SCORE.hard_drop : MODERN_SCORE.soft_drop)
}
