/**
 * Pulse Rush — collision & interaction detection.
 *
 * Pure: reads player + objects, returns a description of what happened this
 * frame. The game loop applies the consequences (death, landing, portal/orb/pad
 * effects, coin pickup). No side effects here beyond resolving landing position.
 */
import { PLAYER_X, GROUND_Y, CEIL_Y, BEAT_WIDTH } from '../constants.js'
import { aabb } from '../utils.js'
import { categoryOf, objRect, coinRect, hazardHitRect } from './objectTypes.js'

const VISIBLE_PAD = 120 // px margin around the player to consider objects

/** Absolute player body box (full visual size) for solids/portals/pads. */
function bodyBox(p) {
  return { x: PLAYER_X - p.size / 2, y: p.y, w: p.size, h: p.size }
}

/** Absolute form hitbox (the form returns x centered at 0). */
function absHitbox(hb) {
  return { x: hb.x + PLAYER_X, y: hb.y, w: hb.w, h: hb.h }
}

export function detect(p, hitbox, objects, worldX) {
  const hb = absHitbox(hitbox)
  const body = bodyBox(p)
  const res = {
    dead: false,
    deathRect: null,
    landY: null,
    supportDir: 0,
    orbsInRange: [],
    padsHit: [],
    portalsHit: [],
    coinsHit: [],
  }

  // Lethal floor/ceiling for wave (and any deadlyBounds form).
  if (p.deadlyBounds) {
    if (p.y <= CEIL_Y + 0.5 || p.y + p.size >= GROUND_Y - 0.5) {
      res.dead = true
      res.deathRect = { x: PLAYER_X - p.size / 2, y: p.y, w: p.size, h: p.size }
      return res
    }
  }

  const minX = -VISIBLE_PAD
  const maxX = PLAYER_X + p.size + VISIBLE_PAD
  let bestLand = null

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i]
    const cat = categoryOf(obj.type)
    const rect = objRect(obj, worldX)
    if (rect.x + rect.w < minX || rect.x > maxX) continue

    if (cat === 'hazard') {
      const kill = hazardHitRect(obj, rect)
      if (aabb(hb, kill)) { res.dead = true; res.deathRect = rect; }
    } else if (cat === 'solid') {
      const horiz = body.x < rect.x + rect.w && body.x + body.w > rect.x
      if (!horiz) continue
      if (p.gravityDir > 0) {
        const bottom = p.y + p.size
        if (p.vy >= -1 && bottom >= rect.y - 8 && bottom <= rect.y + p.size * 0.5) {
          const ly = rect.y - p.size
          if (bestLand === null || ly < bestLand) bestLand = ly
        } else if (aabb(body, rect)) {
          res.dead = true; res.deathRect = rect
        }
      } else {
        const top = p.y
        const cb = rect.y + rect.h
        if (p.vy <= 1 && top <= cb + 8 && top >= cb - p.size * 0.5) {
          const ly = cb
          if (bestLand === null || ly > bestLand) bestLand = ly
        } else if (aabb(body, rect)) {
          res.dead = true; res.deathRect = rect
        }
      }
    } else if (cat === 'orb') {
      // Activation radius around the orb center.
      const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2
      const pcx = PLAYER_X, pcy = p.y + p.size / 2
      const dist = Math.hypot(cx - pcx, cy - pcy)
      if (dist < rect.w * 0.5 + p.size * 0.9) {
        res.orbsInRange.push({ obj, dist, index: i })
      }
    } else if (cat === 'pad') {
      if (aabb(body, rect)) res.padsHit.push({ obj, index: i })
    } else if (cat === 'portal') {
      if (aabb(body, rect)) res.portalsHit.push({ obj, index: i })
    } else if (cat === 'coin') {
      // coins live in a separate array; handled by detectCoins
    }
  }

  if (bestLand !== null && !res.dead) {
    res.landY = bestLand
    res.supportDir = p.gravityDir > 0 ? 1 : -1
  }
  res.orbsInRange.sort((a, b) => a.dist - b.dist)
  return res
}

/** Coin pickups are checked separately against the level's coin list. */
export function detectCoins(p, hitbox, coins, collectedIds, worldX) {
  const hb = absHitbox(hitbox)
  const hits = []
  for (const c of coins) {
    if (collectedIds.has(c.id)) continue
    const r = coinRect(c, worldX)
    if (r.x + r.w < -40 || r.x > PLAYER_X + 200) continue
    if (aabb(hb, r)) hits.push(c.id)
  }
  return hits
}

/** Level completion check: player crossed the finish (last beat). */
export function reachedEnd(worldX, totalBeats) {
  return worldX >= totalBeats * BEAT_WIDTH
}
