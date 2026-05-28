import {
  CANVAS_W, CANVAS_H, GROUND_Y,
  COIN_SPAWN_CHANCE, GEM_SPAWN_CHANCE, STAR_SPAWN_CHANCE, CITEM_SPAWN_CHANCE,
  COIN_RADIUS, GEM_RADIUS, STAR_RADIUS, COLLECT_ITEM_RADIUS,
  POWERUP_SPAWN_INTERVAL, POWERUP_SPAWN_CHANCE, POWERUP_RADIUS,
  POWERUP_TYPES, COLLECTIONS,
} from '../constants.js'
import { randBetween, randInt } from '../utils.js'

let _nextId = 1
const nextId = () => _nextId++

/**
 * Try to spawn collectibles inside a pipe gap.
 * Called once per pipe spawn with the pipe's gap data.
 */
export function spawnCollectiblesInGap(pipe, collections) {
  const items = []
  const gapTop    = pipe.gapCenterY - pipe.gap / 2 + 20
  const gapBottom = pipe.gapCenterY + pipe.gap / 2 - 20
  const spawnX    = pipe.x + 30   // slightly ahead of pipe center

  // Determine which collection items are still needed
  const neededItems = getNeededCollectionItems(collections)

  // Collection item (rarest, first priority in slot)
  if (neededItems.length > 0 && Math.random() < CITEM_SPAWN_CHANCE) {
    const ci = neededItems[randInt(0, neededItems.length - 1)]
    items.push({
      id:     nextId(),
      type:   'collection',
      collId: ci.collId,
      itemId: ci.itemId,
      color:  ci.color,
      radius: COLLECT_ITEM_RADIUS,
      x:      spawnX,
      y:      randBetween(gapTop, gapBottom),
      collected: false,
    })
    return items   // only one collectible per gap
  }

  // Star
  if (Math.random() < STAR_SPAWN_CHANCE) {
    items.push({
      id: nextId(), type: 'star', radius: STAR_RADIUS, color: '#fde047',
      x: spawnX, y: randBetween(gapTop, gapBottom), collected: false,
    })
    return items
  }

  // Gem
  if (Math.random() < GEM_SPAWN_CHANCE) {
    items.push({
      id: nextId(), type: 'gem', radius: GEM_RADIUS, color: '#a78bfa',
      x: spawnX, y: randBetween(gapTop, gapBottom), collected: false,
    })
    return items
  }

  // Coins (1-3 in a row)
  if (Math.random() < COIN_SPAWN_CHANCE) {
    const count = randInt(1, 3)
    for (let i = 0; i < count; i++) {
      items.push({
        id: nextId(), type: 'coin', radius: COIN_RADIUS, color: '#fbbf24',
        x: spawnX + i * 28, y: pipe.gapCenterY + randBetween(-20, 20), collected: false,
      })
    }
  }

  return items
}

/**
 * Try to spawn a power-up. Called each frame with a timer.
 * Returns a power-up object or null.
 */
export function trySpawnPowerup(timeSinceLast, stageData) {
  if (timeSinceLast < POWERUP_SPAWN_INTERVAL) return null
  if (Math.random() > POWERUP_SPAWN_CHANCE) return null

  const type = POWERUP_TYPES[randInt(0, POWERUP_TYPES.length - 1)]
  return {
    id:   nextId(),
    type,
    radius: POWERUP_RADIUS,
    x:   CANVAS_W + POWERUP_RADIUS,
    y:   randBetween(80, GROUND_Y - 80),
    collected: false,
    pulseTimer: 0,
  }
}

/**
 * Update collectible positions (scroll left, apply magnet pull).
 */
export function updateCollectibles(items, dt, pipeSpeed, timeScale, birdX, birdY, magnetActive) {
  const sDt = dt * timeScale
  return items
    .map(item => {
      let { x, y } = item
      x -= pipeSpeed * sDt

      if (magnetActive && !item.collected) {
        const dx = birdX - x
        const dy = birdY - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const pull = Math.min(350 * sDt, dist)
          x += (dx / dist) * pull
          y += (dy / dist) * pull
        }
      }

      return { ...item, x, y }
    })
    .filter(item => item.x > -30)
}

/**
 * Update power-up positions.
 */
export function updatePowerups(powerups, dt, pipeSpeed, timeScale) {
  const sDt = dt * timeScale
  return powerups
    .map(p => ({
      ...p,
      x: p.x - pipeSpeed * sDt,
      pulseTimer: p.pulseTimer + dt,
    }))
    .filter(p => p.x > -30)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNeededCollectionItems(collectedMap) {
  const needed = []
  for (const set of COLLECTIONS) {
    for (const item of set.items) {
      if (!collectedMap?.[item.id]) {
        needed.push({ collId: set.id, itemId: item.id, color: item.color })
      }
    }
  }
  return needed
}
