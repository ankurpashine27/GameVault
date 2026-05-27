import { useState, useRef, useCallback, useEffect } from 'react'
import { BOARD_MODES, POWER_UPS } from '../constants.js'
import { createBoard, cloneBoard, checkWin, isBoardFull } from '../utils.js'

// Returns a fresh per-player power-up object: all 3 available, none used
function freshPowerUps() {
  return {
    X: { block: false, swap: false, extra_turn: false },
    O: { block: false, swap: false, extra_turn: false },
  }
}

function getModeConfig(boardMode) {
  return BOARD_MODES[boardMode] ?? BOARD_MODES.classic
}

export function useTicTacToeGame() {
  // ── Config set at startGame ─────────────────────────────────────────────────
  const configRef = useRef({
    boardMode: 'classic', vsAI: true, aiDifficulty: 'medium',
    seriesWinsNeeded: 1, powerupsOn: false, timerSeconds: 0,
  })

  // ── Core board state (dual ref+state for async safety) ──────────────────────
  const [board, setBoard] = useState(null)
  const boardRef = useRef(null)

  const [currentPlayer, setCurrentPlayer] = useState('X')
  const currentPlayerRef = useRef('X')

  // gameStatus: 'idle' | 'playing' | 'ai_thinking' | 'gameover'
  const [gameStatus, setGameStatus] = useState('idle')

  // Sound event emitter
  const [lastEvent, setLastEvent] = useState(null)

  // winResult: null | { winner: 'X'|'O', cells: [[r,c],...] } | { draw: true }
  const [winResult, setWinResult] = useState(null)

  // ── Series tracking ─────────────────────────────────────────────────────────
  const [seriesScore, setSeriesScore] = useState({ X: 0, O: 0, draws: 0 })
  const seriesScoreRef = useRef({ X: 0, O: 0, draws: 0 })
  const [seriesWinner, setSeriesWinner] = useState(null)

  // ── Power-ups ────────────────────────────────────────────────────────────────
  // powerUps[player][id] = false (available) | true (used)
  const [powerUps, setPowerUps] = useState(freshPowerUps())
  const powerUpsRef = useRef(freshPowerUps())

  // armedPowerUp: null | 'block' | 'swap' | 'extra_turn'  (for currentPlayer)
  const [armedPowerUp, setArmedPowerUp] = useState(null)
  const armedPowerUpRef = useRef(null)

  // Extra turn active — current player gets another move after placing
  const [extraTurnActive, setExtraTurnActive] = useState(false)
  const extraTurnRef = useRef(false)

  // Blocked cells [[r,c], ...]
  const [blockedCells, setBlockedCells] = useState([])
  const blockedCellsRef = useRef([])

  // ── Turn Timer ───────────────────────────────────────────────────────────────
  const [timerLeft, setTimerLeft] = useState(0)
  const timerIntervalRef = useRef(null)
  const timerLeftRef = useRef(0)

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimerLeft(0)
    timerLeftRef.current = 0
  }

  function startTimer(seconds) {
    stopTimer()
    if (!seconds) return
    timerLeftRef.current = seconds
    setTimerLeft(seconds)
    timerIntervalRef.current = setInterval(() => {
      timerLeftRef.current -= 1
      setTimerLeft(timerLeftRef.current)
      if (timerLeftRef.current <= 0) {
        stopTimer()
        handleTimerExpiry()
      }
    }, 1000)
  }

  // Called inside setInterval callback — reads refs, not state
  function handleTimerExpiry() {
    // Forfeit current player's turn — switch to other player
    const next = currentPlayerRef.current === 'X' ? 'O' : 'X'
    currentPlayerRef.current = next
    setCurrentPlayer(next)

    armedPowerUpRef.current = null
    setArmedPowerUp(null)
    extraTurnRef.current = false
    setExtraTurnActive(false)

    if (configRef.current.vsAI && next === 'O') {
      setGameStatus('ai_thinking')
    } else {
      setGameStatus('playing')
      startTimer(configRef.current.timerSeconds)
    }
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  function handleGameOver(result) {
    stopTimer()
    setWinResult(result)

    const newScore = { ...seriesScoreRef.current }
    if (result.draw) {
      newScore.draws++
    } else {
      newScore[result.winner] = (newScore[result.winner] || 0) + 1
    }
    seriesScoreRef.current = newScore
    setSeriesScore({ ...newScore })

    if (newScore.X >= configRef.current.seriesWinsNeeded) setSeriesWinner('X')
    else if (newScore.O >= configRef.current.seriesWinsNeeded) setSeriesWinner('O')

    setLastEvent({
      type: 'gameover',
      result: result.draw ? 'draw' : result.winner,
      vsAI: configRef.current.vsAI,
      id: Date.now(),
    })
    setGameStatus('gameover')
  }

  function advanceTurn() {
    const next = currentPlayerRef.current === 'X' ? 'O' : 'X'
    currentPlayerRef.current = next
    setCurrentPlayer(next)

    armedPowerUpRef.current = null
    setArmedPowerUp(null)

    if (configRef.current.vsAI && next === 'O') {
      stopTimer()
      setGameStatus('ai_thinking')
    } else {
      setGameStatus('playing')
      startTimer(configRef.current.timerSeconds)
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  const startGame = useCallback((cfg) => {
    configRef.current = cfg
    const { size } = getModeConfig(cfg.boardMode)
    const newBoard = createBoard(size)
    boardRef.current = newBoard
    setBoard(newBoard)

    currentPlayerRef.current = 'X'
    setCurrentPlayer('X')
    setWinResult(null)
    setSeriesWinner(null)

    const newSeries = { X: 0, O: 0, draws: 0 }
    seriesScoreRef.current = newSeries
    setSeriesScore(newSeries)

    blockedCellsRef.current = []
    setBlockedCells([])
    extraTurnRef.current = false
    setExtraTurnActive(false)
    armedPowerUpRef.current = null
    setArmedPowerUp(null)

    const pu = cfg.powerupsOn ? freshPowerUps() : freshPowerUps()
    if (!cfg.powerupsOn) {
      // disable all
      pu.X = { block: true, swap: true, extra_turn: true }
      pu.O = { block: true, swap: true, extra_turn: true }
    }
    powerUpsRef.current = pu
    setPowerUps({ ...pu })

    setGameStatus('playing')
    startTimer(cfg.timerSeconds)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Start the next game in a series without resetting the series score
  const startNextGame = useCallback((cfg) => {
    configRef.current = cfg
    const { size } = getModeConfig(cfg.boardMode)
    const newBoard = createBoard(size)
    boardRef.current = newBoard
    setBoard(newBoard)

    currentPlayerRef.current = 'X'
    setCurrentPlayer('X')
    setWinResult(null)

    blockedCellsRef.current = []
    setBlockedCells([])
    extraTurnRef.current = false
    setExtraTurnActive(false)
    armedPowerUpRef.current = null
    setArmedPowerUp(null)

    const pu = cfg.powerupsOn ? freshPowerUps() : { X: { block: true, swap: true, extra_turn: true }, O: { block: true, swap: true, extra_turn: true } }
    powerUpsRef.current = pu
    setPowerUps({ ...pu })

    setGameStatus('playing')
    startTimer(cfg.timerSeconds)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetAll = useCallback(() => {
    stopTimer()
    setBoard(null)
    boardRef.current = null
    setCurrentPlayer('X')
    currentPlayerRef.current = 'X'
    setGameStatus('idle')
    setWinResult(null)
    setSeriesScore({ X: 0, O: 0, draws: 0 })
    seriesScoreRef.current = { X: 0, O: 0, draws: 0 }
    setSeriesWinner(null)
    setPowerUps(freshPowerUps())
    powerUpsRef.current = freshPowerUps()
    setArmedPowerUp(null)
    armedPowerUpRef.current = null
    setBlockedCells([])
    blockedCellsRef.current = []
    setExtraTurnActive(false)
    extraTurnRef.current = false
  }, [])

  // ── Place a piece (human move) ──────────────────────────────────────────────
  const placePiece = useCallback((row, col) => {
    if (gameStatus !== 'playing') return false
    const { boardMode } = configRef.current
    const { size, winLength } = getModeConfig(boardMode)
    const b = boardRef.current
    if (!b) return false

    const player = currentPlayerRef.current
    const armed = armedPowerUpRef.current

    // ── Block power-up armed: click any empty, non-blocked cell to block it ──
    if (armed === 'block') {
      if (b[row][col] !== null) return false
      if (blockedCellsRef.current.some(([r, c]) => r === row && c === col)) return false

      const newBlocked = [...blockedCellsRef.current, [row, col]]
      blockedCellsRef.current = newBlocked
      setBlockedCells(newBlocked)

      const newPu = { ...powerUpsRef.current }
      newPu[player] = { ...newPu[player], block: true }
      powerUpsRef.current = newPu
      setPowerUps({ ...newPu })

      armedPowerUpRef.current = null
      setArmedPowerUp(null)

      // Block costs the turn
      advanceTurn()
      return true
    }

    // ── Swap power-up armed: click opponent's piece to remove it, stay on turn ──
    if (armed === 'swap') {
      const opponent = player === 'X' ? 'O' : 'X'
      if (b[row][col] !== opponent) return false

      const newBoard = cloneBoard(b)
      newBoard[row][col] = null
      boardRef.current = newBoard
      setBoard(newBoard)

      const newPu = { ...powerUpsRef.current }
      newPu[player] = { ...newPu[player], swap: true }
      powerUpsRef.current = newPu
      setPowerUps({ ...newPu })

      armedPowerUpRef.current = null
      setArmedPowerUp(null)
      // Stay on same player's turn — they now place their piece
      setGameStatus('playing')
      return true
    }

    // ── Normal move ──────────────────────────────────────────────────────────
    if (b[row][col] !== null) return false
    if (blockedCellsRef.current.some(([r, c]) => r === row && c === col)) return false

    const newBoard = cloneBoard(b)
    newBoard[row][col] = player
    boardRef.current = newBoard
    setBoard(newBoard)
    setLastEvent({ type: 'place', id: Date.now() })

    // Check outcome
    const result = checkWin(newBoard, size, winLength)
    if (result) { handleGameOver(result); return true }
    if (isBoardFull(newBoard)) { handleGameOver({ draw: true }); return true }

    // Extra turn: player goes again
    if (extraTurnRef.current) {
      extraTurnRef.current = false
      setExtraTurnActive(false)
      setGameStatus('playing')
      startTimer(configRef.current.timerSeconds)
      return true
    }

    advanceTurn()
    return true
  }, [gameStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply AI move ────────────────────────────────────────────────────────────
  const applyAIMove = useCallback((row, col) => {
    if (gameStatus !== 'ai_thinking') return
    const { boardMode } = configRef.current
    const { size, winLength } = getModeConfig(boardMode)
    const b = boardRef.current
    if (!b || b[row][col] !== null) return

    const newBoard = cloneBoard(b)
    newBoard[row][col] = 'O'
    boardRef.current = newBoard
    setBoard(newBoard)
    setLastEvent({ type: 'place', id: Date.now() })

    const result = checkWin(newBoard, size, winLength)
    if (result) { handleGameOver(result); return }
    if (isBoardFull(newBoard)) { handleGameOver({ draw: true }); return }

    currentPlayerRef.current = 'X'
    setCurrentPlayer('X')
    setGameStatus('playing')
    startTimer(configRef.current.timerSeconds)
  }, [gameStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Arm / disarm a power-up ──────────────────────────────────────────────────
  const armPowerUp = useCallback((id) => {
    if (gameStatus !== 'playing') return
    const player = currentPlayerRef.current
    if (powerUpsRef.current[player][id]) return // already used

    // Toggle: disarm if already armed
    if (armedPowerUpRef.current === id) {
      armedPowerUpRef.current = null
      setArmedPowerUp(null)
      if (id === 'extra_turn') {
        extraTurnRef.current = false
        setExtraTurnActive(false)
      }
      return
    }

    // Extra turn activates immediately on arm
    if (id === 'extra_turn') {
      const newPu = { ...powerUpsRef.current }
      newPu[player] = { ...newPu[player], extra_turn: true }
      powerUpsRef.current = newPu
      setPowerUps({ ...newPu })
      extraTurnRef.current = true
      setExtraTurnActive(true)
      // Don't set armedPowerUp — extra turn has no "click to apply" step
      return
    }

    // Block or Swap: arm and wait for cell click
    armedPowerUpRef.current = id
    setArmedPowerUp(id)
    setLastEvent({ type: 'powerUpArm', id: Date.now() })
  }, [gameStatus])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer()
  }, [])

  return {
    // State
    board,
    currentPlayer,
    gameStatus,
    winResult,
    seriesScore,
    seriesWinner,
    powerUps,
    armedPowerUp,
    extraTurnActive,
    blockedCells,
    timerLeft,
    lastEvent,
    // Actions
    startGame,
    startNextGame,
    resetAll,
    placePiece,
    applyAIMove,
    armPowerUp,
    // Expose current config for reads
    getConfig: () => configRef.current,
  }
}
