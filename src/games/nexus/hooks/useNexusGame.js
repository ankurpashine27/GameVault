import { useState, useCallback } from 'react'
import { checkGuess, calcScore } from '../utils.js'

export function useNexusGame() {
  const [puzzle,        setPuzzle]        = useState(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [wrongGuesses,  setWrongGuesses]  = useState([])
  // 'idle' | 'guessing' | 'correct' | 'failed'
  const [roundStatus,   setRoundStatus]   = useState('idle')
  const [hintsUsed,     setHintsUsed]     = useState(0)
  const [roundScore,    setRoundScore]    = useState(0)
  const [shakeInput,    setShakeInput]    = useState(false)
  const [lastEvent,     setLastEvent]     = useState(null)

  const startRound = useCallback((pz) => {
    setPuzzle(pz)
    setRevealedCount(1)
    setWrongGuesses([])
    setRoundStatus('guessing')
    setHintsUsed(0)
    setRoundScore(0)
    setShakeInput(false)
    setLastEvent(null)
  }, [])

  const startReverseRound = useCallback((pz) => {
    // Mark puzzle so submitGuess can apply reverse limit
    setPuzzle({ ...pz, _reverse: true })
    setRevealedCount(5)
    setWrongGuesses([])
    setRoundStatus('guessing')
    setHintsUsed(0)
    setRoundScore(0)
    setShakeInput(false)
    setLastEvent(null)
  }, [])

  const submitGuess = useCallback((text, currentWrongGuesses, currentRevealedCount, currentPuzzle) => {
    // Accept snapshot args to avoid stale-closure issues when called from GameScreen
    const pz     = currentPuzzle   ?? puzzle
    const wg     = currentWrongGuesses ?? wrongGuesses
    const rc     = currentRevealedCount ?? revealedCount

    if (roundStatus !== 'guessing' || !pz) return

    if (checkGuess(text, pz.answers)) {
      setHintsUsed(rc)
      setRoundScore(calcScore(rc, true))
      setRevealedCount(5)
      setRoundStatus('correct')
      setLastEvent({ type: 'correct', id: Date.now() })
    } else {
      const newWrong = [...wg, text]
      setWrongGuesses(newWrong)
      setShakeInput(true)
      setTimeout(() => setShakeInput(false), 400)
      setLastEvent({ type: 'wrong', id: Date.now() })

      // Reverse mode: 2 wrong guesses → failed
      if (pz._reverse && newWrong.length >= 2) {
        setRevealedCount(5)
        setRoundStatus('failed')
        setLastEvent({ type: 'gameover', id: Date.now() })
        return
      }

      if (rc < 5) {
        const next = rc + 1
        setRevealedCount(next)
        // Small delay so shake and reveal don't fight each other
        setTimeout(() => setLastEvent({ type: 'reveal', id: Date.now() }), 120)
      } else {
        setRevealedCount(5)
        setRoundStatus('failed')
        setLastEvent({ type: 'gameover', id: Date.now() })
      }
    }
  }, [roundStatus, puzzle, wrongGuesses, revealedCount])

  return {
    puzzle, revealedCount, wrongGuesses,
    roundStatus, hintsUsed, roundScore,
    shakeInput, lastEvent,
    startRound, startReverseRound, submitGuess,
  }
}
