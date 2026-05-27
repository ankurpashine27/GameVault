import { OBSTACLE_COUNT } from './constants.js'

export const DIR_DELTAS = {
  UP:    { dx: 0,  dy: -1 },
  DOWN:  { dx: 0,  dy:  1 },
  LEFT:  { dx: -1, dy:  0 },
  RIGHT: { dx: 1,  dy:  0 },
}

export const OPPOSITES = {
  UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
}

export const isOccupied = (pos, arr) =>
  arr.some(p => p.x === pos.x && p.y === pos.y)

export const randomPosition = (cols, rows, occupied = []) => {
  const all = []
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      if (!isOccupied({ x, y }, occupied)) all.push({ x, y })
  if (all.length === 0) return null
  return all[Math.floor(Math.random() * all.length)]
}

export const generateObstacles = (cols, rows, count, snake = []) => {
  const midX = Math.floor(cols / 2)
  const midY = Math.floor(rows / 2)
  const safeZone = []
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -4; dx <= 4; dx++)
      safeZone.push({ x: midX + dx, y: midY + dy })

  const occupied = [...snake, ...safeZone]
  const obstacles = []
  let attempts = 0

  while (obstacles.length < count && attempts < count * 20) {
    attempts++
    const pos = randomPosition(cols, rows, [...occupied, ...obstacles])
    if (pos) obstacles.push(pos)
  }
  return obstacles
}

export const calcScore = (base, diffMultiplier, activeScoreMultiplier = 1) =>
  Math.round(base * diffMultiplier * activeScoreMultiplier)

export const pbKey = (gridSize, difficulty) => `${gridSize}_${difficulty}`

export const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

// Build a Set-like key string for fast cell lookup
export const cellKey = (x, y) => `${x},${y}`
