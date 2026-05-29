import { useRef, useCallback } from 'react'
import { getBestMove, cloneBoard } from '../utils.js'

/**
 * useAI — runs minimax in a Web Worker so the main thread stays responsive.
 *
 * computeMove(board, size, winLength, difficulty, aiPlayer, humanPlayer, onMove)
 *   → returns a cancel() function.
 *
 * The worker is created fresh per move and terminated when done (or cancelled).
 * This avoids any stale-state issues between games / board modes.
 */
export function useAI() {
  const workerRef = useRef(null)

  const computeMove = useCallback((
    board, size, winLength, difficulty, aiPlayer, humanPlayer, onMove
  ) => {
    // Brief visual "thinking" delay — makes the AI feel natural, not instant.
    const thinkMs = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 350 : 500

    let cancelled = false

    const timer = setTimeout(() => {
      if (cancelled) return

      // ── Web Worker path (all modern browsers + Vite) ─────────────────────
      if (typeof Worker !== 'undefined') {
        // Terminate any previous in-flight worker before starting a new one
        if (workerRef.current) {
          workerRef.current.terminate()
          workerRef.current = null
        }

        let worker
        try {
          worker = new Worker(
            new URL('../engine/minimaxWorker.js', import.meta.url),
            { type: 'module' }
          )
        } catch (_) {
          // Worker creation failed (sandboxed env) — fall through to sync path
          worker = null
        }

        if (worker) {
          workerRef.current = worker

          worker.addEventListener('message', ({ data }) => {
            worker.terminate()
            if (workerRef.current === worker) workerRef.current = null
            if (!cancelled) onMove(data.move)
          })

          worker.addEventListener('error', () => {
            // Worker crashed — fall back to synchronous computation
            worker.terminate()
            if (workerRef.current === worker) workerRef.current = null
            if (!cancelled) {
              const move = getBestMove(
                cloneBoard(board), size, winLength, difficulty, aiPlayer, humanPlayer
              )
              onMove(move)
            }
          })

          // postMessage serialises the board via structured clone
          worker.postMessage({
            board: board.map(row => [...row]),
            size, winLength, difficulty, aiPlayer, humanPlayer,
          })
          return  // async path — result arrives via message event
        }
      }

      // ── Synchronous fallback ──────────────────────────────────────────────
      const move = getBestMove(
        cloneBoard(board), size, winLength, difficulty, aiPlayer, humanPlayer
      )
      if (!cancelled) onMove(move)
    }, thinkMs)

    // Cancel function — clears the timer and terminates any in-flight worker
    return () => {
      cancelled = true
      clearTimeout(timer)
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  return { computeMove }
}
