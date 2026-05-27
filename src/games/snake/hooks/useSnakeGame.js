import { useState, useRef, useCallback, useEffect } from 'react'
import {
  DIFFICULTIES, OBSTACLE_COUNT, POWER_UP_TYPES, POWER_UP_DURATION,
  POWER_UP_SPAWN_MIN, POWER_UP_SPAWN_MAX, POWER_UP_SPEED_FACTOR,
  MOVING_OBSTACLE_INTERVAL,
  SCORE_FOOD_BASE, SCORE_BONUS_FOOD, SCORE_SPEED_BOOST, SCORE_SHRINK_PILL,
} from '../constants.js'
import {
  DIR_DELTAS, OPPOSITES, randomPosition, generateObstacles,
  calcScore, isOccupied, cellKey,
} from '../utils.js'

const SHRINK_AMOUNT = 3

export function useSnakeGame() {
  // ── React state (drives rendering) ──────────────────────────────────────
  const [snake,        setSnake]        = useState([])
  const [food,         setFood]         = useState(null)
  const [powerUpItem,  setPowerUpItem]  = useState(null)   // on-board item
  const [activeEffect, setActiveEffect] = useState(null)   // { type, expiresAt }
  const [obstacles,    setObstacles]    = useState([])
  const [score,        setScore]        = useState(0)
  const [direction,    setDirection]    = useState('RIGHT')
  const [shieldActive, setShieldActive] = useState(false)
  const [isRunning,    setIsRunning]    = useState(false)
  const [isGameOver,   setIsGameOver]   = useState(false)
  const [intervalSpeed, setIntervalSpeed] = useState(150)

  // ── Refs (read by game loop, avoids stale closures) ─────────────────────
  const snakeRef       = useRef([])
  const foodRef        = useRef(null)
  const powerUpRef     = useRef(null)
  const activeEffRef   = useRef(null)   // { type, expiresAt }
  const obstaclesRef   = useRef([])
  const scoreRef       = useRef(0)
  const currentDirRef  = useRef('RIGHT')
  const dirQueueRef    = useRef([])
  const shieldRef      = useRef(false)
  const scoreMultRef   = useRef(1)      // from score_multiplier power-up
  const settingsRef    = useRef(null)   // current game settings snapshot
  const isRunningRef   = useRef(false)
  const powerUpSpawnTimerRef       = useRef(null)
  const movingObstacleIntervalRef  = useRef(null)
  const activeEffectTimerRef       = useRef(null)

  // ── Helpers ──────────────────────────────────────────────────────────────
  const syncState = useCallback(() => {
    setSnake([...snakeRef.current])
    setFood(foodRef.current ? { ...foodRef.current } : null)
    setPowerUpItem(powerUpRef.current ? { ...powerUpRef.current } : null)
    setActiveEffect(activeEffRef.current ? { ...activeEffRef.current } : null)
    setObstacles([...obstaclesRef.current])
    setScore(scoreRef.current)
    setDirection(currentDirRef.current)
    setShieldActive(shieldRef.current)
  }, [])

  const getOccupied = () => [
    ...snakeRef.current,
    ...(foodRef.current ? [foodRef.current] : []),
    ...(powerUpRef.current ? [powerUpRef.current.position] : []),
    ...obstaclesRef.current,
  ]

  const spawnFood = useCallback(() => {
    const cols = settingsRef.current.gridSize
    const pos = randomPosition(cols, cols, getOccupied())
    if (pos) { foodRef.current = pos; setFood({ ...pos }) }
  }, [])

  const clearPowerUpSpawnTimer = useCallback(() => {
    if (powerUpSpawnTimerRef.current) {
      clearTimeout(powerUpSpawnTimerRef.current)
      powerUpSpawnTimerRef.current = null
    }
  }, [])

  const schedulePowerUpSpawn = useCallback(() => {
    if (!settingsRef.current?.powerupsOn) return
    clearPowerUpSpawnTimer()
    const delay = POWER_UP_SPAWN_MIN + Math.random() * (POWER_UP_SPAWN_MAX - POWER_UP_SPAWN_MIN)
    powerUpSpawnTimerRef.current = setTimeout(() => {
      if (!isRunningRef.current) return
      const types = Object.keys(POWER_UP_TYPES)
      const type = types[Math.floor(Math.random() * types.length)]
      const cols = settingsRef.current.gridSize
      const pos = randomPosition(cols, cols, getOccupied())
      if (pos) {
        const item = {
          type,
          position: pos,
          expiresAt: Date.now() + (POWER_UP_DURATION[type] || 8000),
          icon: POWER_UP_TYPES[type].icon,
          color: POWER_UP_TYPES[type].color,
        }
        powerUpRef.current = item
        setPowerUpItem({ ...item })
      }
      schedulePowerUpSpawn() // schedule the next one
    }, delay)
  }, [clearPowerUpSpawnTimer])

  const clearActiveEffect = useCallback(() => {
    if (activeEffectTimerRef.current) {
      clearTimeout(activeEffectTimerRef.current)
      activeEffectTimerRef.current = null
    }
    activeEffRef.current = null
    setActiveEffect(null)
    scoreMultRef.current = 1
    // restore normal speed
    if (settingsRef.current) {
      setIntervalSpeed(DIFFICULTIES[settingsRef.current.difficulty].speed)
    }
  }, [])

  const applyPowerUpEffect = useCallback((type) => {
    const diff = DIFFICULTIES[settingsRef.current.difficulty]
    const duration = POWER_UP_DURATION[type]

    if (type === 'bonus_food') {
      // Grow 2 extra segments (tick adds 1 more via ateFood=true → net +3)
      const tail = snakeRef.current[snakeRef.current.length - 1]
      snakeRef.current = [...snakeRef.current, tail, tail]
      // Brief HUD flash for 2 s
      activeEffRef.current = { type, expiresAt: Date.now() + 2000 }
      setActiveEffect({ ...activeEffRef.current })
      activeEffectTimerRef.current = setTimeout(clearActiveEffect, 2000)

    } else if (type === 'speed_boost') {
      const boostedSpeed = Math.round(diff.speed * POWER_UP_SPEED_FACTOR)
      setIntervalSpeed(boostedSpeed)
      activeEffRef.current = { type, expiresAt: Date.now() + duration }
      setActiveEffect({ ...activeEffRef.current })
      activeEffectTimerRef.current = setTimeout(clearActiveEffect, duration)

    } else if (type === 'score_multiplier') {
      scoreMultRef.current = 2
      activeEffRef.current = { type, expiresAt: Date.now() + duration }
      setActiveEffect({ ...activeEffRef.current })
      activeEffectTimerRef.current = setTimeout(() => {
        scoreMultRef.current = 1
        clearActiveEffect()
      }, duration)

    } else if (type === 'shield') {
      shieldRef.current = true
      setShieldActive(true)
      activeEffRef.current = { type, expiresAt: Infinity }
      setActiveEffect({ ...activeEffRef.current })

    } else if (type === 'shrink_pill') {
      const s = snakeRef.current
      snakeRef.current = s.length > SHRINK_AMOUNT + 1
        ? s.slice(0, s.length - SHRINK_AMOUNT)
        : s.slice(0, 2) // keep at least 2 segments
      setSnake([...snakeRef.current])
      // Brief HUD flash for 2 s
      activeEffRef.current = { type, expiresAt: Date.now() + 2000 }
      setActiveEffect({ ...activeEffRef.current })
      activeEffectTimerRef.current = setTimeout(clearActiveEffect, 2000)
    }
  }, [clearActiveEffect])

  // ── Game tick (always current via ref, no stale closures) ────────────────
  const tickFnRef = useRef()
  tickFnRef.current = () => {
    if (!isRunningRef.current) return
    const settings = settingsRef.current
    const diff = DIFFICULTIES[settings.difficulty]
    const cols = settings.gridSize
    const rows = settings.gridSize

    // Consume direction queue
    if (dirQueueRef.current.length > 0) {
      currentDirRef.current = dirQueueRef.current.shift()
      setDirection(currentDirRef.current)
    }

    const head = snakeRef.current[0]
    const { dx, dy } = DIR_DELTAS[currentDirRef.current]
    let nx = head.x + dx
    let ny = head.y + dy

    // Wall handling
    if (diff.wallLethal) {
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
        if (shieldRef.current) {
          // Shield absorbs the hit — wrap instead
          shieldRef.current = false
          setShieldActive(false)
          activeEffRef.current = null
          setActiveEffect(null)
          nx = ((nx % cols) + cols) % cols
          ny = ((ny % rows) + rows) % rows
        } else {
          handleGameOver()
          return
        }
      }
    } else {
      // Wrap-around
      nx = ((nx % cols) + cols) % cols
      ny = ((ny % rows) + rows) % rows
    }

    const newHead = { x: nx, y: ny }

    // Self-collision (skip tail since it moves away)
    const bodyWithoutTail = snakeRef.current.slice(0, -1)
    if (isOccupied(newHead, bodyWithoutTail)) {
      if (shieldRef.current) {
        shieldRef.current = false
        setShieldActive(false)
        activeEffRef.current = null
        setActiveEffect(null)
      } else {
        handleGameOver()
        return
      }
    }

    // Obstacle collision
    if (isOccupied(newHead, obstaclesRef.current)) {
      if (shieldRef.current) {
        shieldRef.current = false
        setShieldActive(false)
        activeEffRef.current = null
        setActiveEffect(null)
      } else {
        handleGameOver()
        return
      }
    }

    // Check food
    let ateFood = false
    if (foodRef.current && newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      ateFood = true
      const pts = calcScore(SCORE_FOOD_BASE, diff.multiplier, scoreMultRef.current)
      scoreRef.current += pts
      setScore(scoreRef.current)
      spawnFood()
    }

    // Check power-up item
    const pu = powerUpRef.current
    if (pu && newHead.x === pu.position.x && newHead.y === pu.position.y) {
      // Award points for applicable types
      const ptsDef = { bonus_food: SCORE_BONUS_FOOD, speed_boost: SCORE_SPEED_BOOST, shrink_pill: SCORE_SHRINK_PILL }
      const pts = ptsDef[pu.type] ? calcScore(ptsDef[pu.type], diff.multiplier, scoreMultRef.current) : 0
      if (pts) { scoreRef.current += pts; setScore(scoreRef.current) }

      powerUpRef.current = null
      setPowerUpItem(null)
      applyPowerUpEffect(pu.type)
      ateFood = pu.type === 'bonus_food' // bonus food grows snake
    }

    // Check expired power-up item
    if (pu && !isRunningRef.current === false && Date.now() > pu.expiresAt) {
      powerUpRef.current = null
      setPowerUpItem(null)
    }

    // Move snake
    const newSnake = [newHead, ...snakeRef.current.slice(0, ateFood ? undefined : -1)]
    snakeRef.current = newSnake
    setSnake([...newSnake])
  }

  // ── Game loop interval ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => tickFnRef.current(), intervalSpeed)
    return () => clearInterval(id)
  }, [isRunning, intervalSpeed])

  // ── Moving obstacles (Insane only) ──────────────────────────────────────
  useEffect(() => {
    if (!isRunning || settingsRef.current?.difficulty !== 'insane') return
    const id = setInterval(() => {
      if (!isRunningRef.current) return
      const cols = settingsRef.current.gridSize
      const count = OBSTACLE_COUNT[cols]
      const newObstacles = generateObstacles(cols, cols, count, snakeRef.current)
      obstaclesRef.current = newObstacles
      setObstacles([...newObstacles])
    }, MOVING_OBSTACLE_INTERVAL)
    movingObstacleIntervalRef.current = id
    return () => clearInterval(id)
  }, [isRunning])

  // ── handleGameOver ───────────────────────────────────────────────────────
  const handleGameOver = useCallback(() => {
    isRunningRef.current = false
    setIsRunning(false)
    setIsGameOver(true)
    clearPowerUpSpawnTimer()
    clearActiveEffect()
    if (movingObstacleIntervalRef.current) {
      clearInterval(movingObstacleIntervalRef.current)
    }
  }, [clearPowerUpSpawnTimer, clearActiveEffect])

  // ── Public API ───────────────────────────────────────────────────────────
  const startGame = useCallback((settings) => {
    settingsRef.current = settings
    const cols = settings.gridSize
    const rows = settings.gridSize
    const diff = DIFFICULTIES[settings.difficulty]

    // Init snake in center facing right
    const midX = Math.floor(cols / 2)
    const midY = Math.floor(rows / 2)
    const initSnake = [
      { x: midX + 1, y: midY },
      { x: midX,     y: midY },
      { x: midX - 1, y: midY },
    ]

    // Init food
    const initFood = randomPosition(cols, rows, initSnake)

    // Init obstacles
    const initObstacles = diff.obstacles !== 'none'
      ? generateObstacles(cols, rows, OBSTACLE_COUNT[cols] || 5, initSnake)
      : []

    // Reset all refs
    snakeRef.current      = initSnake
    foodRef.current       = initFood
    powerUpRef.current    = null
    activeEffRef.current  = null
    obstaclesRef.current  = initObstacles
    scoreRef.current      = 0
    currentDirRef.current = 'RIGHT'
    dirQueueRef.current   = []
    shieldRef.current     = false
    scoreMultRef.current  = 1
    isRunningRef.current  = true

    // Reset state
    setSnake([...initSnake])
    setFood(initFood ? { ...initFood } : null)
    setPowerUpItem(null)
    setActiveEffect(null)
    setObstacles([...initObstacles])
    setScore(0)
    setDirection('RIGHT')
    setShieldActive(false)
    setIntervalSpeed(diff.speed)
    setIsGameOver(false)
    setIsRunning(true)

    // Schedule first power-up
    if (settings.powerupsOn) schedulePowerUpSpawn()
  }, [schedulePowerUpSpawn])

  const pauseGame = useCallback(() => {
    isRunningRef.current = false
    setIsRunning(false)
  }, [])

  const resumeGame = useCallback(() => {
    isRunningRef.current = true
    setIsRunning(true)
  }, [])

  const changeDirection = useCallback((newDir) => {
    const last = dirQueueRef.current.length > 0
      ? dirQueueRef.current[dirQueueRef.current.length - 1]
      : currentDirRef.current
    if (newDir !== OPPOSITES[last] && dirQueueRef.current.length < 2) {
      dirQueueRef.current.push(newDir)
    }
  }, [])

  const resetGame = useCallback(() => {
    isRunningRef.current = false
    setIsRunning(false)
    setIsGameOver(false)
    clearPowerUpSpawnTimer()
    clearActiveEffect()
    if (movingObstacleIntervalRef.current) {
      clearInterval(movingObstacleIntervalRef.current)
    }
  }, [clearPowerUpSpawnTimer, clearActiveEffect])

  // Cleanup on unmount
  useEffect(() => () => {
    isRunningRef.current = false
    clearPowerUpSpawnTimer()
    if (movingObstacleIntervalRef.current) clearInterval(movingObstacleIntervalRef.current)
    if (activeEffectTimerRef.current) clearTimeout(activeEffectTimerRef.current)
  }, [clearPowerUpSpawnTimer])

  return {
    snake, food, powerUpItem, activeEffect, obstacles,
    score, direction, shieldActive, isRunning, isGameOver,
    currentSettings: settingsRef.current,
    startGame, pauseGame, resumeGame, changeDirection, resetGame,
  }
}
