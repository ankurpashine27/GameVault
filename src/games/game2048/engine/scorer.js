/**
 * 2048 — Scoring functions.
 */

import { COMBO_INCREMENT, MAX_COMBO } from '../constants.js'

export function getMergeScore(value) {
  return value
}

export function getLimitedMovesBonus(highestTile, remainingMoves) {
  return highestTile * 10 + remainingMoves * 50
}

export function getTimeAttackComboMultiplier(comboCount) {
  return 1.0 + Math.min(comboCount * COMBO_INCREMENT, MAX_COMBO - 1.0)
}
