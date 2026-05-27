import { useCallback } from 'react'
import { getBestMove, cloneBoard } from '../utils.js'

// Async AI computation — runs getBestMove in a setTimeout to avoid blocking the UI.
// Returns a cleanup function that cancels the pending computation.
export function useAI() {
  const computeMove = useCallback((board, size, winLength, difficulty, aiPlayer, humanPlayer, onMove) => {
    // Delay gives the browser a frame to render the "thinking" state before CPU work
    const delay = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 350 : 600

    const timer = setTimeout(() => {
      const boardCopy = cloneBoard(board)
      const move = getBestMove(boardCopy, size, winLength, difficulty, aiPlayer, humanPlayer)
      if (move) onMove(move)
    }, delay)

    return () => clearTimeout(timer)
  }, [])

  return { computeMove }
}
