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
// Returns empty cells within `radius` squares of any existing piece
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

// ─── Minimax with Alpha-Beta Pruning ──────────────────────────────────────────
export function minimax(board, size, winLength, depth, isMaximizing, alpha, beta, aiPlayer, humanPlayer, maxDepth, useCandidates) {
  const result = checkWin(board, size, winLength)
  if (result?.winner === aiPlayer)    return 10000 + depth   // prefer faster wins
  if (result?.winner === humanPlayer) return -10000 - depth  // disfavour faster losses
  if (isBoardFull(board) || depth >= maxDepth) {
    return evaluateBoard(board, size, winLength, aiPlayer, humanPlayer)
  }

  const moves = useCandidates ? getCandidateMoves(board, size) : getEmptyCells(board, size)
  if (moves.length === 0) return 0

  if (isMaximizing) {
    let best = -Infinity
    for (const [r, c] of moves) {
      board[r][c] = aiPlayer
      const val = minimax(board, size, winLength, depth + 1, false, alpha, beta, aiPlayer, humanPlayer, maxDepth, useCandidates)
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
      const val = minimax(board, size, winLength, depth + 1, true, alpha, beta, aiPlayer, humanPlayer, maxDepth, useCandidates)
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
  const boardModeId = size === 3 ? 'classic' : size === 5 ? 'extended' : 'gomoku'
  const useCandidates = size > 5
  const empty = getEmptyCells(board, size)
  if (empty.length === 0) return null

  // ── Easy: random
  if (difficulty === 'easy') {
    return empty[Math.floor(Math.random() * empty.length)]
  }

  // ── Medium: win → block → random
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

  // ── Hard / Unbeatable: minimax
  const maxDepth = MINIMAX_DEPTH[difficulty]?.[boardModeId] ?? 4
  const candidates = useCandidates ? getCandidateMoves(board, size) : getEmptyCells(board, size)
  let bestVal = -Infinity
  let bestMove = candidates[0]
  for (const [r, c] of candidates) {
    board[r][c] = aiPlayer
    const val = minimax(board, size, winLength, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer, maxDepth, useCandidates)
    board[r][c] = null
    if (val > bestVal) { bestVal = val; bestMove = [r, c] }
  }
  return bestMove
}

// ─── Date Formatting ─────────────────────────────────────────────────────────
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
}
