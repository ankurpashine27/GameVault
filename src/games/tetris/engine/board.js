import { BOARD_ROWS, BOARD_COLS } from '../constants.js'
import { getOccupiedCells } from './tetrominoes.js'

/**
 * Create an empty 20×10 board.
 * Each cell is 0 (empty) or a color string (piece type ID).
 */
export function createBoard() {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(0))
}

/**
 * Check if a list of {row, col} cells is within bounds and not occupied.
 */
export function isValidPosition(board, cells) {
  for (const { row, col } of cells) {
    if (row < 0) continue                       // above board is ok
    if (row >= BOARD_ROWS) return false         // below floor
    if (col < 0 || col >= BOARD_COLS) return false  // outside walls
    if (board[row]?.[col]) return false         // occupied
  }
  return true
}

/**
 * Stamp a piece onto the board (immutable — returns new board).
 */
export function placePiece(board, piece) {
  const cells = getOccupiedCells(piece)
  const newBoard = board.map(row => [...row])
  for (const { row, col } of cells) {
    if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
      newBoard[row][col] = piece.colorId
    }
  }
  return newBoard
}

/**
 * Clear completed lines.
 * Returns { newBoard, linesCleared, lineIndices }.
 */
export function clearLines(board) {
  const lineIndices = []
  for (let r = 0; r < BOARD_ROWS; r++) {
    if (board[r].every(cell => cell !== 0)) {
      lineIndices.push(r)
    }
  }

  if (!lineIndices.length) {
    return { newBoard: board, linesCleared: 0, lineIndices: [] }
  }

  const cleared = new Set(lineIndices)
  const remaining = board.filter((_, r) => !cleared.has(r))
  const newRows = Array.from(
    { length: lineIndices.length },
    () => Array(BOARD_COLS).fill(0)
  )
  const newBoard = [...newRows, ...remaining]
  return { newBoard, linesCleared: lineIndices.length, lineIndices }
}

/**
 * Check if the board is completely empty (Perfect Clear condition).
 */
export function checkPerfectClear(board) {
  return board.every(row => row.every(cell => cell === 0))
}

/**
 * Check if the game is over (any occupied cell in the spawn zone rows 0–1).
 */
export function isGameOver(board) {
  for (let r = 0; r <= 1; r++) {
    if (board[r].some(cell => cell !== 0)) return true
  }
  return false
}

/**
 * Get the ghost position — the piece dropped as far down as possible.
 */
export function getGhostPosition(board, piece) {
  let testPiece = { ...piece }
  while (true) {
    const next = { ...testPiece, row: testPiece.row + 1 }
    const cells = getOccupiedCells(next)
    if (!isValidPosition(board, cells)) break
    testPiece = next
  }
  return testPiece
}

/**
 * Remove isolated single cells (cells with no adjacent filled neighbors).
 * Used by the ghost_clear power-up.
 */
export function removeIsolatedCells(board) {
  const newBoard = board.map(row => [...row])
  const ROWS = board.length
  const COLS = board[0]?.length ?? BOARD_COLS

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!newBoard[r][c]) continue
      const neighbors = [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
      ]
      const hasNeighbor = neighbors.some(
        ([nr, nc]) =>
          nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc]
      )
      if (!hasNeighbor) {
        newBoard[r][c] = 0
      }
    }
  }
  return newBoard
}
