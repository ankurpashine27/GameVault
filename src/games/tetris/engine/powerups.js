import { clearLines, removeIsolatedCells } from './board.js'

/**
 * Bomb: clears the bottom 2 rows.
 * Returns { newBoard, linesCleared: 2 }.
 */
export function applyBomb(board) {
  const ROWS = board.length
  const COLS = board[0]?.length ?? 10

  const newBoard = board.map(row => [...row])
  const cleared = [ROWS - 1, ROWS - 2]

  for (const r of cleared) {
    if (r >= 0) {
      newBoard[r] = Array(COLS).fill(0)
    }
  }

  // Compact: remove the two cleared rows and add empties at top
  const remaining = newBoard.filter((_, r) => !cleared.includes(r))
  const emptyRows = Array.from({ length: cleared.length }, () => Array(COLS).fill(0))
  return {
    newBoard: [...emptyRows, ...remaining],
    linesCleared: cleared.filter(r => r >= 0).length,
  }
}

/**
 * Ghost Clear: removes all isolated single cells from the board.
 * Returns { newBoard, removedCount }.
 */
export function applyGhostClear(board) {
  const newBoard = removeIsolatedCells(board)
  let removedCount = 0
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] && !newBoard[r][c]) removedCount++
    }
  }
  return { newBoard, removedCount }
}

/**
 * Slow: halves game speed for a duration.
 * Mutates gameState and returns it.
 */
export function applySlow(gameState) {
  gameState.slowActive = true
  gameState.slowTimer = 8000
  return gameState
}

/**
 * Swap: activate hold swap that bypasses the hold cooldown.
 * Mutates gameState and returns it.
 */
export function applySwap(gameState) {
  gameState.swapBypassCooldown = true
  return gameState
}
