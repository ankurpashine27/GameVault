/**
 * 2048 — Main game hook.
 * Manages board state, animations, score, undo, input queue, timers.
 */

import { useRef, useState, useCallback, useEffect } from 'react'
import { createBoard, createBoardWithObstacles, addTile, processMove, isGameOver, getHighestTile, reshuffleBoard } from '../engine/board.js'
import { getMergeScore, getLimitedMovesBonus, getTimeAttackComboMultiplier } from '../engine/scorer.js'
import { ANIMATION_DURATIONS, ANIM_SPEED_MULTIPLIERS, MAX_UNDO_STACK, INPUT_QUEUE_MAX, MILESTONE_VALUES, COMBO_WINDOW_MS, LS_SETTINGS } from '../constants.js'
import { seededRandom, dailySeed, getSwipeDirection, checkAchievements, lsGet } from '../utils.js'
import { getBoardLayout, getCellXY } from '../engine/renderer.js'
import { PATTERNS } from '../engine/obstaclePatterns.js'

function getAnimDuration(type, animSpeed) {
  const base = ANIMATION_DURATIONS[type] || 100
  const mult = ANIM_SPEED_MULTIPLIERS[animSpeed] ?? 1.0
  return base * mult
}

export function use2048Game({ play, getAchievements, unlockAchievement, getDailyStreak }) {
  // ─── React state (for UI re-renders) ─────────────────────────────────────
  const [score, setScore]                   = useState(0)
  const [bestScore, setBestScore]           = useState(0)
  const [highestTile, setHighestTile]       = useState(0)
  const [gamePhase, setGamePhase]           = useState('idle')
  const [undoCharges, setUndoCharges]       = useState(3)
  const [remainingMoves, setRemainingMoves] = useState(null)
  const [timeLeft, setTimeLeft]             = useState(null)
  const [comboMultiplier, setComboMultiplier] = useState(1.0)
  const [milestoneQueue, setMilestoneQueue]   = useState([])

  // ─── Refs (mutable per-frame data) ───────────────────────────────────────
  const boardRef        = useRef(null)       // current board
  const animStateRef    = useRef({ tiles: {}, vanishing: [] })
  const scoreRef        = useRef(0)
  const bestScoreRef    = useRef(0)
  const highestTileRef  = useRef(0)
  const undoStackRef    = useRef([])         // array of {board, score, highestTile, ...}
  const inputQueueRef   = useRef([])
  const animBusyRef     = useRef(false)
  const settingsRef     = useRef(null)
  const modeRef         = useRef('classic')

  // Time Attack
  const timerRef        = useRef(null)       // setInterval id
  const timeLeftRef     = useRef(null)
  const comboRef        = useRef(1.0)
  const lastMergeTimeRef = useRef(0)
  const comboCountRef   = useRef(0)

  // Limited Moves
  const remainingMovesRef = useRef(null)

  // Undo charges
  const undoChargesRef  = useRef(3)

  // Sandbox rng
  const rngRef          = useRef(null)

  // Input div ref (touch swipe target)
  const inputDivRef     = useRef(null)
  const touchStartRef   = useRef(null)

  // Phase ref (sync read in callbacks)
  const gamePhaseRef    = useRef('idle')
  const undoUsedRef     = useRef(false)

  const setPhase = useCallback((p) => {
    gamePhaseRef.current = p
    setGamePhase(p)
  }, [])

  // ─── Score helpers ────────────────────────────────────────────────────────
  const addScore = useCallback((delta) => {
    scoreRef.current += delta
    setScore(scoreRef.current)
    if (scoreRef.current > bestScoreRef.current) {
      bestScoreRef.current = scoreRef.current
      setBestScore(bestScoreRef.current)
      try { localStorage.setItem('g2048_best', String(bestScoreRef.current)) } catch {}
    }
  }, [])

  // ─── Animation helpers ────────────────────────────────────────────────────
  function getLayout(cols) {
    return getBoardLayout(cols)
  }

  function buildAnimState(mergeEvents, slideEvents, oldBoard, newBoard, cols, animSpeed) {
    const layout = getLayout(cols)
    const now = performance.now()
    const slideDur  = getAnimDuration('slide', animSpeed)
    const mergeDur  = getAnimDuration('merge', animSpeed)
    const spawnDur  = getAnimDuration('spawn', animSpeed)
    const tiles     = {}
    const vanishing = []

    // Slide events
    for (const ev of slideEvents) {
      const fromPos = getCellXY(ev.fromCol, ev.fromRow, layout)
      const toPos   = getCellXY(ev.toCol,   ev.toRow,   layout)
      tiles[ev.id] = {
        type: 'slide',
        fromX: fromPos.x, fromY: fromPos.y,
        toX: toPos.x,     toY: toPos.y,
        startTime: now,
        duration: slideDur,
      }
    }

    // Merge events
    for (const ev of mergeEvents) {
      const fromPos = getCellXY(ev.fromCol, ev.fromRow, layout)
      const toPos   = getCellXY(ev.toCol,   ev.toRow,   layout)
      // The primary tile (dstId) does the merge bounce at destination
      tiles[ev.dstId] = {
        type: 'merge',
        fromX: toPos.x, fromY: toPos.y,
        toX: toPos.x,   toY: toPos.y,
        startTime: now + slideDur,
        duration: mergeDur,
      }
      // The secondary tile (srcId) slides to destination, then vanishes
      vanishing.push({
        id: ev.srcId,
        fromX: fromPos.x, fromY: fromPos.y,
        toX: toPos.x,     toY: toPos.y,
        startTime: now,
        duration: slideDur,
        value: ev.value / 2, // original value
      })
    }

    return { tiles, vanishing, totalDuration: slideDur + mergeDur }
  }

  // ─── Spawn tile with animation ────────────────────────────────────────────
  function spawnTile(board, cols, animSpeed, rng) {
    const result = addTile(board, cols, rng)
    if (result.spawnedAt < 0) return board
    const { newBoard, spawnedAt } = result
    const layout = getLayout(cols)
    const r = Math.floor(spawnedAt / cols)
    const c = spawnedAt % cols
    const pos = getCellXY(c, r, layout)
    const now = performance.now()
    const spawnDur = getAnimDuration('spawn', animSpeed)
    const id = newBoard[spawnedAt].id

    animStateRef.current = {
      ...animStateRef.current,
      tiles: {
        ...animStateRef.current.tiles,
        [id]: {
          type: 'spawn',
          fromX: pos.x, fromY: pos.y,
          toX: pos.x,   toY: pos.y,
          startTime: now,
          duration: spawnDur,
        },
      },
    }

    return newBoard
  }

  // ─── Process queued input ─────────────────────────────────────────────────
  const processQueuedInput = useCallback(() => {
    if (inputQueueRef.current.length === 0) {
      animBusyRef.current = false
      return
    }
    const dir = inputQueueRef.current.shift()
    executeMove(dir)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Execute a move ───────────────────────────────────────────────────────
  const executeMove = useCallback((direction) => {
    const board   = boardRef.current
    const settings = settingsRef.current
    if (!board || !settings) return

    const cols = settings.gridSize
    const result = processMove(board, cols, direction)
    if (!result.boardChanged) {
      animBusyRef.current = false
      processQueuedInput()
      return
    }

    // Save undo snapshot (before the move)
    if (undoStackRef.current.length >= MAX_UNDO_STACK) {
      undoStackRef.current.shift()
    }
    undoStackRef.current.push({
      board: board.slice(),
      score: scoreRef.current,
      highestTile: highestTileRef.current,
      remainingMoves: remainingMovesRef.current,
    })

    const animSpeed = settings.animSpeed
    const anim = buildAnimState(
      result.mergeEvents, result.slideEvents,
      board, result.newBoard, cols, animSpeed
    )
    animStateRef.current = anim

    animBusyRef.current = true

    // Score
    let scoreGain = result.scoreGained
    if (modeRef.current === 'time_attack' && result.mergeEvents.length > 0) {
      // Update combo
      const nowMs = Date.now()
      if (nowMs - lastMergeTimeRef.current < COMBO_WINDOW_MS) {
        comboCountRef.current++
      } else {
        comboCountRef.current = 1
      }
      lastMergeTimeRef.current = nowMs
      const mult = getTimeAttackComboMultiplier(comboCountRef.current)
      comboRef.current = mult
      setComboMultiplier(mult)
      scoreGain = Math.round(scoreGain * mult)
      play('combo', comboCountRef.current)
    }

    addScore(scoreGain)

    // Update board
    boardRef.current = result.newBoard

    // SFX
    if (result.mergeEvents.length > 0) {
      const maxVal = Math.max(...result.mergeEvents.map(e => e.value))
      play('merge', maxVal)
    } else {
      play('slide')
    }

    // Check milestone
    const prevHighest = highestTileRef.current
    const newHighest  = result.newHighestTile
    highestTileRef.current = newHighest
    setHighestTile(newHighest)

    if (newHighest > prevHighest && MILESTONE_VALUES.includes(newHighest)) {
      setMilestoneQueue(q => [...q, newHighest])
      play('milestone')
    }

    // Limited Moves
    if (modeRef.current === 'limited_moves' && remainingMovesRef.current !== null) {
      remainingMovesRef.current--
      setRemainingMoves(remainingMovesRef.current)
    }

    // After animation: spawn tile and check game state
    const totalAnim = anim.totalDuration || getAnimDuration('slide', animSpeed)
    setTimeout(() => {
      // Spawn
      const rng = rngRef.current || Math.random.bind(Math)
      boardRef.current = spawnTile(boardRef.current, cols, animSpeed, rng)
      play('spawn')

      // Check win
      const target = settings.targetTile
      if (highestTileRef.current >= target && gamePhaseRef.current === 'playing') {
        // Win condition (player can still continue in classic/sandbox)
        if (modeRef.current !== 'sandbox') {
          setPhase('won')
          play('win')
          // Save stats
          try {
            const achs = getAchievements()
            const stats = {
              score: scoreRef.current,
              highestTile: highestTileRef.current,
              wonWithoutUndo: !undoUsedRef.current,
              wonOnGridSize: cols,
              wonInObstacleMode: modeRef.current === 'obstacle',
              wonInTimeAttack: modeRef.current === 'time_attack',
              dailyCompleted: modeRef.current === 'daily' ? 1 : 0,
              dailyStreak: getDailyStreak ? getDailyStreak() : 0,
              totalUndos: 0,
              maxCombo: comboCountRef.current,
            }
            const newAchs = checkAchievements(stats, achs)
            newAchs.forEach(id => unlockAchievement(id))
          } catch {}
        }
        return
      }

      // Limited moves game over
      if (modeRef.current === 'limited_moves' && remainingMovesRef.current <= 0) {
        endGame()
        return
      }

      // Board game over
      if (isGameOver(boardRef.current, cols)) {
        endGame()
        return
      }

      animBusyRef.current = false
      processQueuedInput()
    }, Math.max(totalAnim + 20, 50))
  }, [addScore, play, processQueuedInput, setPhase, getAchievements, unlockAchievement, getDailyStreak]) // eslint-disable-line react-hooks/exhaustive-deps

  function endGame() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setPhase('gameover')
    play('gameover')
    animBusyRef.current = false
  }

  // ─── Process input ────────────────────────────────────────────────────────
  const processInput = useCallback((direction) => {
    if (gamePhaseRef.current !== 'playing') return
    if (animBusyRef.current) {
      if (inputQueueRef.current.length < INPUT_QUEUE_MAX) {
        inputQueueRef.current.push(direction)
      }
      return
    }
    executeMove(direction)
  }, [executeMove])

  // ─── Start game ───────────────────────────────────────────────────────────
  const startGame = useCallback((gameSettings) => {
    settingsRef.current = gameSettings
    modeRef.current = gameSettings.mode || 'classic'

    const cols = gameSettings.gridSize || 4
    rngRef.current = seededRandom(gameSettings.mode === 'daily' ? dailySeed() : Math.floor(Math.random() * 0xffffff))

    // Create board
    let board
    if (gameSettings.mode === 'obstacle') {
      const patterns = PATTERNS[cols] || []
      const patIdx = gameSettings.obstaclePatternIndex || 0
      const pattern = patterns[patIdx % patterns.length] || { cells: [] }
      board = createBoardWithObstacles(cols, pattern.cells)
    } else {
      board = createBoard(cols)
    }

    // Daily: use deterministic spawn
    const rng = rngRef.current
    const r1 = addTile(board, cols, rng)
    board = r1.newBoard
    const r2 = addTile(board, cols, rng)
    board = r2.newBoard
    boardRef.current = board

    // Reset state
    scoreRef.current = 0
    setScore(0)
    highestTileRef.current = 0
    setHighestTile(0)
    undoStackRef.current = []
    inputQueueRef.current = []
    animBusyRef.current = false
    animStateRef.current = { tiles: {}, vanishing: [] }
    undoUsedRef.current = false
    comboCountRef.current = 0
    comboRef.current = 1.0
    setComboMultiplier(1.0)
    setMilestoneQueue([])

    // Load best score
    try {
      bestScoreRef.current = parseInt(localStorage.getItem('g2048_best') || '0', 10) || 0
      setBestScore(bestScoreRef.current)
    } catch {}

    // Mode-specific setup
    if (gameSettings.mode === 'time_attack') {
      const dur = (gameSettings.timeAttackDuration || 120) * 1000
      timeLeftRef.current = dur
      setTimeLeft(dur)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        timeLeftRef.current = Math.max(0, timeLeftRef.current - 100)
        setTimeLeft(timeLeftRef.current)
        if (timeLeftRef.current <= 0) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setPhase('gameover')
          play('gameover')
          animBusyRef.current = false
        }
      }, 100)
    } else {
      timeLeftRef.current = null
      setTimeLeft(null)
    }

    if (gameSettings.mode === 'limited_moves') {
      const diff = gameSettings.limitedMovesDiff || 'medium'
      const gridConfig = { 3: { easy: 50, medium: 35, hard: 25 }, 4: { easy: 100, medium: 75, hard: 50 }, 5: { easy: 200, medium: 150, hard: 100 }, 6: { easy: 400, medium: 300, hard: 200 }, 8: { easy: 700, medium: 500, hard: 400 } }
      const moves = gridConfig[cols]?.[diff] ?? 75
      remainingMovesRef.current = moves
      setRemainingMoves(moves)
    } else {
      remainingMovesRef.current = null
      setRemainingMoves(null)
    }

    // Undo charges
    const charges = gameSettings.unlimitedUndos ? Infinity : 3
    undoChargesRef.current = charges
    setUndoCharges(charges)

    setPhase('playing')
  }, [play, setPhase])

  // ─── Pause / resume ───────────────────────────────────────────────────────
  const pauseGame = useCallback(() => {
    if (timerRef.current && modeRef.current === 'time_attack') {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resumeGame = useCallback(() => {
    if (modeRef.current === 'time_attack' && gamePhaseRef.current === 'playing' && timeLeftRef.current > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        timeLeftRef.current = Math.max(0, timeLeftRef.current - 100)
        setTimeLeft(timeLeftRef.current)
        if (timeLeftRef.current <= 0) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setPhase('gameover')
          play('gameover')
          animBusyRef.current = false
        }
      }, 100)
    }
  }, [play, setPhase])

  // ─── Undo ─────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return
    const charges = undoChargesRef.current
    if (charges !== Infinity && charges <= 0) return

    const snap = undoStackRef.current.pop()
    boardRef.current = snap.board
    scoreRef.current = snap.score
    setScore(snap.score)
    highestTileRef.current = snap.highestTile
    setHighestTile(snap.highestTile)
    if (snap.remainingMoves !== undefined && remainingMovesRef.current !== null) {
      // subtract 2 moves for undo in limited moves mode
      remainingMovesRef.current = Math.max(0, snap.remainingMoves - 2)
      setRemainingMoves(remainingMovesRef.current)
    }
    animStateRef.current = { tiles: {}, vanishing: [] }
    animBusyRef.current = false
    inputQueueRef.current = []

    if (charges !== Infinity) {
      undoChargesRef.current = charges - 1
      setUndoCharges(undoChargesRef.current)
    }
    undoUsedRef.current = true
    play('undo')
  }, [play])

  // ─── Dismiss win (continue playing) ──────────────────────────────────────
  const dismissWin = useCallback(() => {
    setPhase('playing')
  }, [setPhase])

  // ─── Reshuffle (Sandbox) ──────────────────────────────────────────────────
  const reshuffleBoard2 = useCallback(() => {
    const board = boardRef.current
    if (!board || !settingsRef.current) return
    const cols = settingsRef.current.gridSize
    const rng = rngRef.current || Math.random.bind(Math)
    boardRef.current = reshuffleBoard(board, cols, rng)
    animStateRef.current = { tiles: {}, vanishing: [] }
  }, [])

  // ─── Touch input ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = inputDivRef.current
    if (!el) return

    const onTouchStart = (e) => {
      const t = e.touches[0]
      touchStartRef.current = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = (e) => {
      if (!touchStartRef.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStartRef.current.x
      const dy = t.clientY - touchStartRef.current.y
      touchStartRef.current = null
      const dir = getSwipeDirection(dx, dy)
      if (dir) processInput(dir)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [processInput])

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return {
    board:             boardRef.current,
    boardRef,
    animStateRef,
    score,
    bestScore,
    highestTile,
    gamePhase,
    undoCharges,
    undoStack:         undoStackRef.current,
    remainingMoves,
    timeLeft,
    comboMultiplier,
    milestoneQueue,
    setMilestoneQueue,
    startGame,
    pauseGame,
    resumeGame,
    processInput,
    undo,
    dismissWin,
    reshuffleBoard:    reshuffleBoard2,
    inputDivRef,
  }
}
