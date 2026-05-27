import { useRef } from 'react'
import puzzles from '../puzzles.js'
import { TIME_ATTACK_PUZZLES } from '../constants.js'
import { dailyPuzzleIndex } from '../utils.js'

// Re-export constant so callers can import from here
export { puzzles }

export function usePuzzleManager() {
  const usedIdsRef = useRef(new Set())

  const getDailyPuzzle = () => puzzles[dailyPuzzleIndex(puzzles.length)]

  const getRandomPuzzle = (theme = null, difficulty = null) => {
    let pool = puzzles.filter(p => {
      if (theme && p.theme !== theme) return false
      if (difficulty && p.difficulty !== difficulty) return false
      return !usedIdsRef.current.has(p.id)
    })
    if (pool.length === 0) {
      usedIdsRef.current.clear()
      pool = puzzles.filter(p => {
        if (theme && p.theme !== theme) return false
        if (difficulty && p.difficulty !== difficulty) return false
        return true
      })
    }
    const p = pool[Math.floor(Math.random() * pool.length)]
    usedIdsRef.current.add(p.id)
    return p
  }

  const pickN = (count, difficulty, theme) => {
    const pool = puzzles.filter(p =>
      p.difficulty === difficulty &&
      (!theme || p.theme === theme) &&
      !usedIdsRef.current.has(p.id),
    )
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, count)
    picked.forEach(p => usedIdsRef.current.add(p.id))
    return picked
  }

  const getTimeAttackSet = (count = TIME_ATTACK_PUZZLES, theme = null) => {
    usedIdsRef.current.clear()
    const easyCount  = Math.ceil(count * 0.5)
    const medCount   = Math.ceil(count * 0.3)
    const hardCount  = Math.ceil(count * 0.2)

    const easy   = pickN(easyCount,  'easy',   theme)
    const medium = pickN(medCount,   'medium', theme)
    const hard   = pickN(hardCount,  'hard',   theme)

    const combined = [...easy, ...medium, ...hard]
    // Shuffle so it isn't always easy→hard
    return combined.sort(() => Math.random() - 0.5).slice(0, count)
  }

  const resetSession = () => usedIdsRef.current.clear()

  return { getDailyPuzzle, getRandomPuzzle, getTimeAttackSet, resetSession }
}
