import { MINIMAX_DEPTH } from './constants.js'

// ─── Board Helpers ─────────────────────────────────────────────────────────────

export function createBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null))
}

export function cloneBoard(board) {
  return board.map(row => [...row])
}

export function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== null))
}

export function getEmptyCells(board, size) {
  const cells = []
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c] === null) cells.push([r, c])
  return cells
}

// ─── Win Detection ────────────────────────────────────────────────────────────
// Returns { winner: 'X'|'O', cells: [[r,c],...] } or null
export function checkWin(board, size, winLength) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = board[r][c]
      if (!p) continue
      for (const [dr, dc] of dirs) {
        const cells = [[r, c]]
        for (let i = 1; i < winLength; i++) {
          const nr = r + dr * i
          const nc = c + dc * i
          if (nr < 0 || nr >= size || nc < 0 || nc >= size || board[nr][nc] !== p) break
          cells.push([nr, nc])
        }
        if (cells.length === winLength) return { winner: p, cells }
      }
    }
  }
  return null
}

// ─── Candidate Move Generation (for large boards) ─────────────────────────────
// Returns empty cells within `radius` squares of any occupied cell.
// `radius = 1` for 5×5 extended (keeps branching tight in early game),
// `radius = 2` for 15×15 gomoku.
export function getCandidateMoves(board, size, radius = 2) {
  const hasAny = board.some(row => row.some(c => c !== null))
  if (!hasAny) {
    const mid = Math.floor(size / 2)
    return [[mid, mid]]
  }
  const seen = new Set()
  const candidates = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board[r][c]) continue
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === null) {
            const key = nr * size + nc
            if (!seen.has(key)) { seen.add(key); candidates.push([nr, nc]) }
          }
        }
      }
    }
  }
  return candidates
}

// ─── Board Heuristic Evaluation ───────────────────────────────────────────────
export function evaluateBoard(board, size, winLength, aiPlayer, humanPlayer) {
  const result = checkWin(board, size, winLength)
  if (result?.winner === aiPlayer) return 10000
  if (result?.winner === humanPlayer) return -10000

  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  let score = 0

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const [dr, dc] of dirs) {
        let aiCnt = 0, humCnt = 0
        let valid = true
        for (let i = 0; i < winLength; i++) {
          const nr = r + dr * i
          const nc = c + dc * i
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) { valid = false; break }
          const cell = board[nr][nc]
          if (cell === aiPlayer) aiCnt++
          else if (cell === humanPlayer) humCnt++
        }
        if (!valid || (aiCnt > 0 && humCnt > 0)) continue
        if (aiCnt > 0)  score += aiCnt  === winLength - 1 ? 100 : aiCnt  === winLength - 2 ? 10 : 1
        if (humCnt > 0) score -= humCnt === winLength - 1 ? 100 : humCnt === winLength - 2 ? 10 : 1
      }
    }
  }
  return score
}

// ─── Move Ordering ────────────────────────────────────────────────────────────
// Scores a move for sorting so best candidates are searched first in alpha-beta.
// Priorities:  immediate win (100 000)  >  block opponent win (90 000)
//              >  near-center positional bonus (0–1000)
// Calling checkWin twice per candidate is O(n·winLen), cheap vs. the exponential
// savings from better pruning.
function moveOrderScore(board, size, winLength, r, c, player, opponent) {
  board[r][c] = player
  const winsNow = !!checkWin(board, size, winLength)
  board[r][c] = null
  if (winsNow) return 100000

  board[r][c] = opponent
  const blocksWin = !!checkWin(board, size, winLength)
  board[r][c] = null
  if (blocksWin) return 90000

  // Positional: prefer cells closer to the centre of the board
  const cen = (size - 1) / 2
  return 1000 - Math.round((Math.abs(r - cen) + Math.abs(c - cen)) * 100)
}

// Sort a move list in-place by descending order-score (returns new array).
function sortMoves(board, size, winLength, moves, player, opponent) {
  return moves
    .map(([r, c]) => ({ r, c, s: moveOrderScore(board, size, winLength, r, c, player, opponent) }))
    .sort((a, b) => b.s - a.s)
    .map(({ r, c }) => [r, c])
}

// ─── Minimax with Alpha-Beta Pruning ──────────────────────────────────────────
export function minimax(
  board, size, winLength,
  depth, isMaximizing, alpha, beta,
  aiPlayer, humanPlayer, maxDepth, useCandidates
) {
  const result = checkWin(board, size, winLength)
  if (result?.winner === aiPlayer)    return 10000 + depth   // prefer faster wins
  if (result?.winner === humanPlayer) return -10000 - depth  // avoid slower losses
  if (isBoardFull(board) || depth >= maxDepth) {
    return evaluateBoard(board, size, winLength, aiPlayer, humanPlayer)
  }

  // Candidate radius: tight (1) for 5×5, wider (2) for 15×15
  const radius = size <= 5 ? 1 : 2
  let moves = useCandidates
    ? getCandidateMoves(board, size, radius)
    : getEmptyCells(board, size)
  if (moves.length === 0) return 0

  // ── Move ordering at the top 3 ply levels ────────────────────────────────
  // Alpha-beta prunes the most when best moves come first.  Sorting at depth<3
  // catches the high-branching-factor nodes where it matters most; at deeper
  // levels the additional checkWin calls outweigh the pruning benefit.
  if (depth < 3 && moves.length > 2) {
    const cur = isMaximizing ? aiPlayer : humanPlayer
    const opp = isMaximizing ? humanPlayer : aiPlayer
    moves = sortMoves(board, size, winLength, moves, cur, opp)
  }

  if (isMaximizing) {
    let best = -Infinity
    for (const [r, c] of moves) {
      board[r][c] = aiPlayer
      const val = minimax(board, size, winLength, depth + 1, false, alpha, beta,
        aiPlayer, humanPlayer, maxDepth, useCandidates)
      board[r][c] = null
      if (val > best) best = val
      if (best > alpha) alpha = best
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const [r, c] of moves) {
      board[r][c] = humanPlayer
      const val = minimax(board, size, winLength, depth + 1, true, alpha, beta,
        aiPlayer, humanPlayer, maxDepth, useCandidates)
      board[r][c] = null
      if (val < best) best = val
      if (best < beta) beta = best
      if (beta <= alpha) break
    }
    return best
  }
}

// ─── Get Best AI Move ─────────────────────────────────────────────────────────
export function getBestMove(board, size, winLength, difficulty, aiPlayer, humanPlayer) {
  const boardModeId    = size === 3 ? 'classic' : size === 5 ? 'extended' : 'gomoku'
  // Use candidate moves for size ≥ 5 — stops the branching factor exploding on
  // extended (5×5) and gomoku (15×15) boards.  (Previously only size > 5.)
  const useCandidates  = size >= 5
  const empty          = getEmptyCells(board, size)
  if (empty.length === 0) return null

  // ── Easy: random ──────────────────────────────────────────────────────────
  if (difficulty === 'easy') {
    return empty[Math.floor(Math.random() * empty.length)]
  }

  // ── Medium: win → block → random ─────────────────────────────────────────
  if (difficulty === 'medium') {
    for (const [r, c] of empty) {
      board[r][c] = aiPlayer
      if (checkWin(board, size, winLength)) { board[r][c] = null; return [r, c] }
      board[r][c] = null
    }
    for (const [r, c] of empty) {
      board[r][c] = humanPlayer
      if (checkWin(board, size, winLength)) { board[r][c] = null; return [r, c] }
      board[r][c] = null
    }
    return empty[Math.floor(Math.random() * empty.length)]
  }

  // ── Hard / Unbeatable: minimax with alpha-beta ────────────────────────────
  const maxDepth = MINIMAX_DEPTH[difficulty]?.[boardModeId] ?? 4

  const radius     = size <= 5 ? 1 : 2
  const candidates = useCandidates
    ? getCandidateMoves(board, size, radius)
    : getEmptyCells(board, size)

  if (candidates.length === 0) return empty[0]
  if (candidates.length === 1) return candidates[0]  // only one legal move

  // Sort root candidates — essential for good alpha-beta pruning in the subtrees
  const ordered = sortMoves(board, size, winLength, candidates, aiPlayer, humanPlayer)

  let bestVal  = -Infinity
  let bestMove = ordered[0]

  for (const [r, c] of ordered) {
    board[r][c] = aiPlayer
    const val = minimax(
      board, size, winLength,
      0, false, -Infinity, Infinity,
      aiPlayer, humanPlayer, maxDepth, useCandidates
    )
    board[r][c] = null
    if (val > bestVal) { bestVal = val; bestMove = [r, c] }
    if (bestVal >= 10000) break   // found an immediate win — no need to keep searching
  }
  return bestMove
}

// ─── Date Formatting ─────────────────────────────────────────────────────────
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
}
