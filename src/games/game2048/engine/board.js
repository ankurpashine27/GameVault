/**
 * 2048 — Pure board functions. No side effects, no React.
 *
 * Board: flat array of length cols*cols.
 * Cell: null | { value: number, id: string, merged: bool }
 *       or { value: 'obstacle', id: string }
 */

import { SPAWN_PROBABILITY_4 } from '../constants.js'

let _tileIdCounter = 0
function newId() {
  return `t${++_tileIdCounter}`
}

// ─── Board creation ───────────────────────────────────────────────────────────
export function createBoard(cols) {
  return new Array(cols * cols).fill(null)
}

export function createBoardWithObstacles(cols, obstacles) {
  const board = createBoard(cols)
  for (const { r, c } of obstacles) {
    board[r * cols + c] = { value: 'obstacle', id: newId(), merged: false }
  }
  return board
}

// ─── Tile spawning ────────────────────────────────────────────────────────────
export function addTile(board, cols, rng) {
  const empty = []
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) empty.push(i)
  }
  if (empty.length === 0) return { newBoard: board, spawnedAt: -1 }

  const idx = empty[Math.floor(rng() * empty.length)]
  const value = rng() < SPAWN_PROBABILITY_4 ? 4 : 2
  const newBoard = board.slice()
  newBoard[idx] = { value, id: newId(), merged: false }
  return { newBoard, spawnedAt: idx }
}

export function addTileAt(board, col, row, value, cols) {
  const newBoard = board.slice()
  const idx = row * cols + col
  newBoard[idx] = { value, id: newId(), merged: false }
  return newBoard
}

// ─── Core move processing ─────────────────────────────────────────────────────

/**
 * Process a single row sliding left.
 * Returns { newRow, merges, score }
 * merges: [{fromIdx, toIdx, value}] — indices within the row
 */
export function slideLeft(row) {
  const newRow = new Array(row.length).fill(null)
  const merges = []
  let score = 0
  let writePos = 0
  let i = 0

  while (i < row.length) {
    const cell = row[i]
    if (!cell || cell.value === 'obstacle') {
      // obstacles don't slide — keep in place
      if (cell && cell.value === 'obstacle') {
        newRow[i] = cell
      }
      i++
      continue
    }
    // Check if the next non-null, non-obstacle cell can merge with this one
    let j = i + 1
    while (j < row.length && (!row[j] || (row[j] && row[j].value === 'obstacle'))) {
      if (row[j] && row[j].value === 'obstacle') break
      j++
    }

    const nextCell = (j < row.length && row[j] && row[j].value !== 'obstacle') ? row[j] : null

    // Find the correct write position (skip obstacles)
    while (writePos < row.length && newRow[writePos] !== null) writePos++

    if (nextCell && nextCell.value === cell.value && !nextCell.merged) {
      // Merge
      const mergedValue = cell.value * 2
      const mergeId = cell.id // keep the "primary" tile's ID, the secondary disappears
      merges.push({ fromIdx: j, toIdx: writePos, value: mergedValue, srcId: nextCell.id, dstId: cell.id })
      score += mergedValue
      newRow[writePos] = { value: mergedValue, id: mergeId, merged: true }
      writePos++
      i = j + 1
    } else {
      newRow[writePos] = { ...cell, merged: false }
      writePos++
      i++
    }
  }

  return { newRow, merges, score }
}

/**
 * Rotate board 90° clockwise.
 */
function rotateCW(board, cols) {
  const result = new Array(cols * cols).fill(null)
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      result[c * cols + (cols - 1 - r)] = board[r * cols + c]
    }
  }
  return result
}

/**
 * Rotate board 90° counter-clockwise.
 */
function rotateCCW(board, cols) {
  const result = new Array(cols * cols).fill(null)
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      result[(cols - 1 - c) * cols + r] = board[r * cols + c]
    }
  }
  return result
}

/**
 * Slide all rows left, collecting events.
 */
function slideAllLeft(board, cols) {
  let newBoard = board.slice()
  const mergeEvents = []
  const slideEvents = []
  let totalScore = 0

  for (let r = 0; r < cols; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      row.push(board[r * cols + c])
    }
    const { newRow, merges, score } = slideLeft(row)
    totalScore += score

    for (let c = 0; c < cols; c++) {
      newBoard[r * cols + c] = newRow[c]
    }

    // Emit events (in "left" frame — will be rotated back by caller)
    for (const m of merges) {
      mergeEvents.push({
        fromRow: r, fromCol: m.fromIdx,
        toRow: r,   toCol: m.toIdx,   // these are in rotated coords
        value: m.value, score: m.value,
        srcId: m.srcId, dstId: m.dstId,
      })
    }

    // Slide events for tiles that moved
    for (let c = 0; c < cols; c++) {
      if (newRow[c] && newRow[c].value !== 'obstacle') {
        // Find where this tile originally was
        const origC = row.findIndex(cell => cell && cell.id === newRow[c].id && cell !== newRow[c])
        // This is approximate — just record from original position if different
        if (origC !== -1 && origC !== c) {
          slideEvents.push({
            fromRow: r, fromCol: origC,
            toRow: r,   toCol: c,
            value: newRow[c].value,
            id: newRow[c].id,
          })
        }
      }
    }
  }

  return { newBoard, mergeEvents, slideEvents, totalScore }
}

/**
 * Process a move in the given direction.
 */
export function processMove(board, cols, direction) {
  // Reset merged flags from the previous move.
  // Tiles that were merged last turn carry merged:true, which would
  // incorrectly block them from merging again as nextCell this turn.
  board = board.map(cell =>
    cell && cell.value !== 'obstacle' ? { ...cell, merged: false } : cell
  )

  // Rotate to canonical "left" orientation
  let rotated = board
  let rotations = 0
  if (direction === 'right')  { rotated = rotateCW(board, cols);  rotated = rotateCW(rotated, cols);  rotations = 2 }
  if (direction === 'up')     { rotated = rotateCCW(board, cols); rotations = 3 }
  if (direction === 'down')   { rotated = rotateCW(board, cols);  rotations = 1 }

  const { newBoard: slid, mergeEvents, slideEvents, totalScore } = slideAllLeft(rotated, cols)

  // Check if board changed
  let boardChanged = false
  for (let i = 0; i < slid.length; i++) {
    const oldCell = rotated[i]
    const newCell = slid[i]
    if ((oldCell === null) !== (newCell === null)) { boardChanged = true; break }
    if (oldCell && newCell && oldCell.id !== newCell.id) { boardChanged = true; break }
    if (oldCell && newCell && oldCell.value !== newCell.value) { boardChanged = true; break }
  }

  // Rotate back
  let finalBoard = slid
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    finalBoard = rotateCW(finalBoard, cols)
  }

  // Transform event coordinates back
  const transformCoord = (row, col) => {
    // Apply same reverse rotations as the board
    let r = row, c = col
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      const newR = c
      const newC = cols - 1 - r
      r = newR
      c = newC
    }
    return { r, c }
  }

  const transformedMerges = mergeEvents.map(ev => {
    const from = transformCoord(ev.fromRow, ev.fromCol)
    const to   = transformCoord(ev.toRow,   ev.toCol)
    return { fromRow: from.r, fromCol: from.c, toRow: to.r, toCol: to.c, value: ev.value, score: ev.score, srcId: ev.srcId, dstId: ev.dstId }
  })

  const transformedSlides = slideEvents.map(ev => {
    const from = transformCoord(ev.fromRow, ev.fromCol)
    const to   = transformCoord(ev.toRow,   ev.toCol)
    return { fromRow: from.r, fromCol: from.c, toRow: to.r, toCol: to.c, value: ev.value, id: ev.id }
  })

  const newHighestTile = getHighestTile(finalBoard, cols)

  return {
    newBoard: finalBoard,
    mergeEvents: transformedMerges,
    slideEvents: transformedSlides,
    scoreGained: totalScore,
    boardChanged,
    newHighestTile,
  }
}

// ─── Game state queries ───────────────────────────────────────────────────────
export function hasValidMoves(board, cols) {
  // Check empty cells
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) return true
  }
  // Check adjacent equal cells
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r * cols + c]
      if (!cell || cell.value === 'obstacle') continue
      // right neighbor
      if (c + 1 < cols) {
        const right = board[r * cols + (c + 1)]
        if (right && right.value === cell.value) return true
      }
      // bottom neighbor
      if (r + 1 < cols) {
        const bottom = board[(r + 1) * cols + c]
        if (bottom && bottom.value === cell.value) return true
      }
    }
  }
  return false
}

export function isGameOver(board, cols) {
  return !hasValidMoves(board, cols)
}

export function getHighestTile(board, cols) {
  let max = 0
  for (let i = 0; i < board.length; i++) {
    const cell = board[i]
    if (cell && typeof cell.value === 'number' && cell.value > max) {
      max = cell.value
    }
  }
  return max
}

// ─── Sandbox reshuffle ────────────────────────────────────────────────────────
export function reshuffleBoard(board, cols, rng) {
  const tiles = board.filter(c => c && c.value !== 'obstacle')
  const obstacles = board.map((c, i) => (c && c.value === 'obstacle') ? i : -1).filter(i => i >= 0)
  const newBoard = createBoard(cols)
  // Restore obstacles
  for (const idx of obstacles) {
    newBoard[idx] = board[idx]
  }
  // Shuffle tiles into remaining empty slots
  const empty = []
  for (let i = 0; i < newBoard.length; i++) {
    if (newBoard[i] === null) empty.push(i)
  }
  // Fisher-Yates shuffle using rng
  for (let i = empty.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [empty[i], empty[j]] = [empty[j], empty[i]]
  }
  for (let i = 0; i < tiles.length && i < empty.length; i++) {
    newBoard[empty[i]] = { ...tiles[i], merged: false }
  }
  return newBoard
}
