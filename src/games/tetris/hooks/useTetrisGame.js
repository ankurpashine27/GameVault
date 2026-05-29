import { useState, useRef, useCallback, useEffect } from 'react'
import { createBoard, isValidPosition, placePiece, clearLines, checkPerfectClear, getGhostPosition } from '../engine/board.js'
import { spawnPiece, getOccupiedCells } from '../engine/tetrominoes.js'
import { tryRotate } from '../engine/rotation.js'
import { SevenBagRandomizer, ClassicRandomizer, SeededRandomizer } from '../engine/randomizer.js'
import { calculateLineClearScore, calculatePerfectClearScore, calculateDropScore } from '../engine/scoring.js'
import { getGravityDelay, getLevelFromLines, isGameComplete } from '../engine/levelManager.js'
import { applyBomb, applyGhostClear, applySlow, applySwap } from '../engine/powerups.js'
import { checkTSpin } from '../utils.js'
import { BOARD_COLS, BOARD_ROWS, DAS_DELAY, ARR_DELAY, LOCK_DELAY, MAX_LOCK_RESETS, ARE_DELAY } from '../constants.js'

const NEXT_QUEUE_SIZE = 5

export function useTetrisGame({ settings, onGameOver, onGameComplete, audio, mode = 'marathon', startLevel = 1, dailySeed = null }) {
  // ─── React state (UI-facing only) ────────────────────────────────────────
  const [gameState, setGameState] = useState({
    status: 'idle',    // idle | playing | paused | gameover | complete
    score: 0,
    lines: 0,
    level: startLevel,
    combo: 0,
    backToBack: false,
    timeMs: 0,
    mode,
  })

  // ─── Refs (per-frame game data) ───────────────────────────────────────────
  const boardRef        = useRef(createBoard())
  const currentPieceRef = useRef(null)
  const ghostPieceRef   = useRef(null)
  const holdPieceRef    = useRef(null)
  const usedHoldRef     = useRef(false)
  const nextQueueRef    = useRef([])
  const randomizerRef   = useRef(null)
  const statusRef       = useRef('idle')
  const scoreRef        = useRef(0)
  const linesRef        = useRef(0)
  const levelRef        = useRef(startLevel)
  const comboRef        = useRef(0)
  const backToBackRef   = useRef(false)
  const timeMsRef       = useRef(0)

  // T-spin tracking
  const lastActionWasRotationRef = useRef(false)

  // Lock delay
  const lockTimerRef    = useRef(null)
  const lockResetCountRef = useRef(0)
  const onGroundRef     = useRef(false)

  // ARE delay (classic)
  const areTimerRef     = useRef(null)

  // Slow power-up
  const slowActiveRef   = useRef(false)
  const slowTimerRef    = useRef(0)

  // Score popups
  const scorePopupsRef  = useRef([])

  // Flash & shake
  const flashAlphaRef   = useRef(0)
  const shakeRef        = useRef(0)

  // Gravity accumulator
  const gravityAccRef   = useRef(0)

  // Last RAF timestamp
  const lastTimeRef     = useRef(null)
  const rafRef          = useRef(null)

  // Settings ref for stable callbacks
  const settingsRef     = useRef(settings)
  useEffect(() => { settingsRef.current = settings }, [settings])

  const audioRef        = useRef(audio)
  useEffect(() => { audioRef.current = audio }, [audio])

  // Input state
  const keysRef         = useRef({})
  const dasTimerRef     = useRef({})
  const arrIntervalRef  = useRef({})

  // ─── Sync state to refs ───────────────────────────────────────────────────
  function syncState() {
    setGameState(prev => ({
      ...prev,
      score: scoreRef.current,
      lines: linesRef.current,
      level: levelRef.current,
      combo: comboRef.current,
      backToBack: backToBackRef.current,
      timeMs: timeMsRef.current,
      status: statusRef.current,
    }))
  }

  // ─── Randomizer factory ───────────────────────────────────────────────────
  function createRandomizer() {
    if (mode === 'daily' && dailySeed !== null) {
      return new SeededRandomizer(dailySeed)
    }
    const system = settingsRef.current.rotationSystem ?? 'modern'
    if (system === 'classic') return new ClassicRandomizer()
    return new SevenBagRandomizer()
  }

  // ─── Fill next queue ─────────────────────────────────────────────────────
  function fillQueue() {
    const rand = randomizerRef.current
    while (nextQueueRef.current.length < NEXT_QUEUE_SIZE) {
      nextQueueRef.current.push(rand.next())
    }
  }

  // ─── Spawn next piece ─────────────────────────────────────────────────────
  function spawnNext() {
    fillQueue()
    const type = nextQueueRef.current.shift()
    fillQueue()

    const system = settingsRef.current.rotationSystem ?? 'modern'
    const piece = spawnPiece(type, system)

    // Check game over — if spawn position is blocked
    const cells = getOccupiedCells(piece)
    const validCells = cells.filter(c => c.row >= 0)
    if (validCells.length > 0 && !isValidPosition(boardRef.current, cells)) {
      triggerGameOver()
      return
    }

    currentPieceRef.current = piece
    ghostPieceRef.current = getGhostPosition(boardRef.current, piece)
    usedHoldRef.current = false
    lastActionWasRotationRef.current = false
    lockResetCountRef.current = 0
    onGroundRef.current = false
    checkOnGround()
  }

  // ─── Check if piece is on ground ─────────────────────────────────────────
  function checkOnGround() {
    const piece = currentPieceRef.current
    if (!piece) return false

    const below = { ...piece, row: piece.row + 1 }
    const cells = getOccupiedCells(below)
    const onGround = !isValidPosition(boardRef.current, cells)

    if (onGround && !onGroundRef.current) {
      // Just landed — start lock timer
      onGroundRef.current = true
      startLockTimer()
    } else if (!onGround && onGroundRef.current) {
      // Lifted off — cancel lock timer
      onGroundRef.current = false
      cancelLockTimer()
    }
    return onGround
  }

  // ─── Lock timer ──────────────────────────────────────────────────────────
  function startLockTimer() {
    cancelLockTimer()
    lockTimerRef.current = setTimeout(() => {
      lockPiece()
    }, LOCK_DELAY)
  }

  function cancelLockTimer() {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
      lockTimerRef.current = null
    }
  }

  function resetLockTimer() {
    if (!onGroundRef.current) return
    if (lockResetCountRef.current >= MAX_LOCK_RESETS) return
    lockResetCountRef.current++
    startLockTimer()
  }

  // ─── Lock piece ──────────────────────────────────────────────────────────
  function lockPiece() {
    const piece = currentPieceRef.current
    if (!piece) return
    cancelLockTimer()

    // Place piece
    const newBoard = placePiece(boardRef.current, piece)
    const tSpin = checkTSpin(boardRef.current, piece, lastActionWasRotationRef.current)
    const { newBoard: clearedBoard, linesCleared, lineIndices } = clearLines(newBoard)

    boardRef.current = clearedBoard

    // Scoring
    if (linesCleared > 0 || tSpin) {
      const system = settingsRef.current.rotationSystem ?? 'modern'
      const { points, newBackToBack, newCombo, messages } = calculateLineClearScore(
        linesCleared, tSpin, backToBackRef.current, comboRef.current, levelRef.current, system
      )

      scoreRef.current += points
      comboRef.current = newCombo
      backToBackRef.current = newBackToBack

      // Perfect clear bonus
      if (checkPerfectClear(clearedBoard) && linesCleared > 0) {
        const pcPoints = calculatePerfectClearScore(linesCleared, backToBackRef.current, levelRef.current)
        scoreRef.current += pcPoints
        messages.push('PERFECT CLEAR!!')
        audioRef.current?.play('perfect_clear')
        flashAlphaRef.current = 0.8
        shakeRef.current = 12
      } else {
        flashAlphaRef.current = 0.15 + linesCleared * 0.1
        if (linesCleared >= 4) shakeRef.current = 8
        else if (linesCleared >= 2) shakeRef.current = 3
      }

      // Audio
      if (tSpin) audioRef.current?.play('tspin')
      else if (linesCleared > 0) audioRef.current?.play('line_clear', linesCleared)
      if (backToBackRef.current && linesCleared > 0 && !tSpin) audioRef.current?.play('back_to_back')
      if (comboRef.current > 1) audioRef.current?.play('combo', comboRef.current)

      // Score popups
      for (const msg of messages) {
        const piece2 = currentPieceRef.current
        const px = BOARD_COLS * 18  // center
        const py = piece2 ? piece2.row * 36 + 50 : 200
        scorePopupsRef.current.push({
          x: px, y: py,
          text: msg,
          color: linesCleared === 4 ? '#f0d060' : tSpin ? '#c060ff' : '#ffffff',
          size: linesCleared === 4 ? 22 : 18,
          life: 1.2, maxLife: 1.2,
        })
      }

      // Update lines + level
      linesRef.current += linesCleared
      const system2 = settingsRef.current.rotationSystem ?? 'modern'
      const newLevel = getLevelFromLines(linesRef.current, startLevel, system2)
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel
        audioRef.current?.play('level_up')
      }

      // Check mode completion
      if (isGameComplete(mode, linesRef.current, timeMsRef.current)) {
        triggerComplete()
        return
      }

      // Particle data stored for renderer (set externally)
    } else {
      // No clear — reset combo
      comboRef.current = 0
      audioRef.current?.play('lock')
    }

    currentPieceRef.current = null
    ghostPieceRef.current = null

    // ARE delay or immediate spawn
    const system3 = settingsRef.current.rotationSystem ?? 'modern'
    if (system3 === 'classic') {
      areTimerRef.current = setTimeout(() => {
        areTimerRef.current = null
        if (statusRef.current === 'playing') spawnNext()
      }, ARE_DELAY)
    } else {
      spawnNext()
    }

    syncState()
  }

  // ─── Move piece ──────────────────────────────────────────────────────────
  const movePiece = useCallback((dir) => {
    const piece = currentPieceRef.current
    if (!piece || statusRef.current !== 'playing') return false

    const moved = { ...piece, col: piece.col + dir }
    const cells = getOccupiedCells(moved)
    if (!isValidPosition(boardRef.current, cells)) return false

    currentPieceRef.current = moved
    ghostPieceRef.current = getGhostPosition(boardRef.current, moved)
    lastActionWasRotationRef.current = false
    resetLockTimer()
    audioRef.current?.play('move')
    return true
  }, [])

  // ─── Rotate piece ────────────────────────────────────────────────────────
  const rotatePiece = useCallback((dir) => {
    const piece = currentPieceRef.current
    if (!piece || statusRef.current !== 'playing') return false

    const system = settingsRef.current.rotationSystem ?? 'modern'
    const result = tryRotate(boardRef.current, piece, dir, system)
    if (!result) return false

    currentPieceRef.current = result.piece
    ghostPieceRef.current = getGhostPosition(boardRef.current, result.piece)
    lastActionWasRotationRef.current = true
    resetLockTimer()
    audioRef.current?.play('rotate')
    return true
  }, [])

  // ─── Soft drop ───────────────────────────────────────────────────────────
  const softDrop = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece || statusRef.current !== 'playing') return

    const below = { ...piece, row: piece.row + 1 }
    const cells = getOccupiedCells(below)
    if (!isValidPosition(boardRef.current, cells)) {
      // Hit floor — lock immediately if on ground
      if (onGroundRef.current) lockPiece()
      return
    }

    currentPieceRef.current = below
    ghostPieceRef.current = getGhostPosition(boardRef.current, below)
    lastActionWasRotationRef.current = false
    scoreRef.current += calculateDropScore(1, false, settingsRef.current.rotationSystem)
    gravityAccRef.current = 0  // reset gravity accumulator
    checkOnGround()
  }, [])

  // ─── Hard drop ───────────────────────────────────────────────────────────
  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece || statusRef.current !== 'playing') return

    const ghost = ghostPieceRef.current ?? getGhostPosition(boardRef.current, piece)
    const cellsDrop = ghost.row - piece.row
    currentPieceRef.current = ghost
    lastActionWasRotationRef.current = false
    scoreRef.current += calculateDropScore(cellsDrop, true, settingsRef.current.rotationSystem)
    audioRef.current?.play('hard_drop')
    gravityAccRef.current = 0
    lockPiece()
  }, [])

  // ─── Hold piece ──────────────────────────────────────────────────────────
  const holdPiece = useCallback(() => {
    if (usedHoldRef.current || statusRef.current !== 'playing') return
    const piece = currentPieceRef.current
    if (!piece) return

    const prevHeld = holdPieceRef.current
    const system = settingsRef.current.rotationSystem ?? 'modern'
    holdPieceRef.current = { type: piece.type, colorId: piece.colorId }

    cancelLockTimer()
    onGroundRef.current = false

    if (prevHeld) {
      currentPieceRef.current = spawnPiece(prevHeld.type, system)
    } else {
      fillQueue()
      const type = nextQueueRef.current.shift()
      fillQueue()
      currentPieceRef.current = spawnPiece(type, system)
    }

    ghostPieceRef.current = getGhostPosition(boardRef.current, currentPieceRef.current)
    usedHoldRef.current = true
    lastActionWasRotationRef.current = false
    audioRef.current?.play('hold')
    syncState()
  }, [])

  // ─── Power-up activation ─────────────────────────────────────────────────
  const activatePowerup = useCallback((type) => {
    if (statusRef.current !== 'playing') return

    switch (type) {
      case 'bomb': {
        const { newBoard, linesCleared } = applyBomb(boardRef.current)
        boardRef.current = newBoard
        scoreRef.current += linesCleared * 100 * levelRef.current
        audioRef.current?.play('powerup_activate', type)
        flashAlphaRef.current = 0.4
        shakeRef.current = 5
        break
      }
      case 'ghost_clear': {
        const { newBoard } = applyGhostClear(boardRef.current)
        boardRef.current = newBoard
        audioRef.current?.play('powerup_activate', type)
        break
      }
      case 'slow': {
        slowActiveRef.current = true
        slowTimerRef.current = 8000
        audioRef.current?.play('powerup_activate', type)
        break
      }
      case 'swap': {
        usedHoldRef.current = false  // bypass hold cooldown
        holdPiece()
        break
      }
    }
    syncState()
  }, [holdPiece])

  // ─── Trigger game over ───────────────────────────────────────────────────
  function triggerGameOver() {
    statusRef.current = 'gameover'
    cancelLockTimer()
    if (areTimerRef.current) { clearTimeout(areTimerRef.current); areTimerRef.current = null }
    audioRef.current?.play('game_over')
    syncState()
    onGameOver?.({
      score: scoreRef.current,
      lines: linesRef.current,
      level: levelRef.current,
      timeMs: timeMsRef.current,
      mode,
    })
  }

  // ─── Trigger game complete (sprint/ultra) ────────────────────────────────
  function triggerComplete() {
    statusRef.current = 'complete'
    cancelLockTimer()
    audioRef.current?.play('level_up')
    syncState()
    onGameComplete?.({
      score: scoreRef.current,
      lines: linesRef.current,
      level: levelRef.current,
      timeMs: timeMsRef.current,
      mode,
    })
  }

  // ─── Gravity tick (called from RAF loop) ─────────────────────────────────
  function tickGravity(dt) {
    const piece = currentPieceRef.current
    if (!piece || statusRef.current !== 'playing') return

    // Slow power-up
    let gravityDt = dt
    if (slowActiveRef.current) {
      slowTimerRef.current -= dt * 1000
      if (slowTimerRef.current <= 0) {
        slowActiveRef.current = false
        slowTimerRef.current = 0
      } else {
        gravityDt = dt * 0.5
      }
    }

    const system = settingsRef.current.rotationSystem ?? 'modern'
    const delay = getGravityDelay(levelRef.current, system)

    gravityAccRef.current += gravityDt
    if (gravityAccRef.current >= delay / 1000) {
      gravityAccRef.current -= delay / 1000

      const below = { ...piece, row: piece.row + 1 }
      const cells = getOccupiedCells(below)
      if (isValidPosition(boardRef.current, cells)) {
        currentPieceRef.current = below
        ghostPieceRef.current = getGhostPosition(boardRef.current, below)
        lastActionWasRotationRef.current = false
        onGroundRef.current = false
      } else {
        // Piece hit ground
        checkOnGround()
      }
    }
  }

  // ─── Update time ─────────────────────────────────────────────────────────
  function tickTime(dt) {
    timeMsRef.current += dt * 1000
    // Ultra mode — time limit 3 minutes
    if (mode === 'ultra' && timeMsRef.current >= 3 * 60 * 1000) {
      triggerComplete()
    }
  }

  // ─── Update flash/shake ──────────────────────────────────────────────────
  function tickEffects(dt) {
    if (flashAlphaRef.current > 0) {
      flashAlphaRef.current = Math.max(0, flashAlphaRef.current - dt * 3)
    }
    if (shakeRef.current > 0) {
      shakeRef.current = Math.max(0, shakeRef.current - dt * 40)
    }
    // Update score popups
    scorePopupsRef.current = scorePopupsRef.current
      .map(p => ({ ...p, y: p.y - 40 * dt, life: p.life - dt }))
      .filter(p => p.life > 0)
  }

  // ─── Main tick (called from RAF) ─────────────────────────────────────────
  const tick = useCallback((dt) => {
    if (statusRef.current !== 'playing') return
    tickTime(dt)
    tickGravity(dt)
    tickEffects(dt)
  }, [])

  // ─── Start game ──────────────────────────────────────────────────────────
  const startGame = useCallback((opts = {}) => {
    const { mode: newMode = mode, seed } = opts

    // Reset all state
    boardRef.current = createBoard()
    currentPieceRef.current = null
    ghostPieceRef.current = null
    holdPieceRef.current = null
    usedHoldRef.current = false
    nextQueueRef.current = []
    scoreRef.current = 0
    linesRef.current = 0
    levelRef.current = opts.startLevel ?? startLevel
    comboRef.current = 0
    backToBackRef.current = false
    timeMsRef.current = 0
    gravityAccRef.current = 0
    lastTimeRef.current = null
    slowActiveRef.current = false
    slowTimerRef.current = 0
    flashAlphaRef.current = 0
    shakeRef.current = 0
    scorePopupsRef.current = []
    lockResetCountRef.current = 0
    onGroundRef.current = false

    cancelLockTimer()
    if (areTimerRef.current) { clearTimeout(areTimerRef.current); areTimerRef.current = null }

    randomizerRef.current = createRandomizer()
    fillQueue()

    statusRef.current = 'playing'
    syncState()

    // Spawn first piece
    spawnNext()
  }, [mode, startLevel])

  // ─── Pause / resume ──────────────────────────────────────────────────────
  const pauseGame = useCallback(() => {
    if (statusRef.current !== 'playing') return
    statusRef.current = 'paused'
    cancelLockTimer()
    syncState()
  }, [])

  const resumeGame = useCallback(() => {
    if (statusRef.current !== 'paused') return
    statusRef.current = 'playing'
    lastTimeRef.current = null  // prevent large dt jump
    if (onGroundRef.current) startLockTimer()
    syncState()
  }, [])

  const restartGame = useCallback(() => {
    startGame()
  }, [startGame])

  // ─── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelLockTimer()
      if (areTimerRef.current) clearTimeout(areTimerRef.current)
      // Clear ARR intervals
      for (const id of Object.values(arrIntervalRef.current)) {
        clearInterval(id)
      }
    }
  }, [])

  // ─── Get render state (called each frame from RAF) ────────────────────────
  const getRenderState = useCallback(() => ({
    board: boardRef.current,
    currentPiece: currentPieceRef.current,
    ghostPiece: ghostPieceRef.current,
    particles: [],
    scorePopups: scorePopupsRef.current,
    flashAlpha: flashAlphaRef.current,
    shakeIntensity: shakeRef.current,
  }), [])

  return {
    gameState,
    statusRef,
    boardRef,
    currentPieceRef,
    ghostPieceRef,
    holdPieceRef,
    nextQueueRef,
    scoreRef,
    linesRef,
    levelRef,
    timeMsRef,
    scorePopupsRef,
    flashAlphaRef,
    shakeRef,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    movePiece,
    rotatePiece,
    softDrop,
    hardDrop,
    holdPiece,
    activatePowerup,
    tick,
    getRenderState,
    lastTimeRef,
  }
}
