// ─── Minimax Web Worker ───────────────────────────────────────────────────────
// Runs getBestMove off the main thread so the UI never freezes, even if the
// search takes 1-2 seconds on deep positions.

import { getBestMove } from '../utils.js'

self.addEventListener('message', ({ data }) => {
  const { board, size, winLength, difficulty, aiPlayer, humanPlayer } = data
  const move = getBestMove(board, size, winLength, difficulty, aiPlayer, humanPlayer)
  self.postMessage({ move })
})
