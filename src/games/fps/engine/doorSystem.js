/**
 * Grimhold — door open/close animation (portcullis sink) + locked doors +
 * facing interaction.
 */
import { DOOR_SPEED, DOOR_AUTOCLOSE, INTERACT_RANGE } from '../constants.js'

function occupied(g, tx, ty) {
  const p = g.player
  if ((p.x | 0) === tx && (p.y | 0) === ty) return true
  for (const e of g.enemies) if (e.state !== 'dead' && (e.x | 0) === tx && (e.y | 0) === ty) return true
  return false
}

export function updateDoors(g, dt) {
  for (const d of g.doors.values()) {
    if (d.opening) {
      d.openness = Math.min(1, d.openness + DOOR_SPEED * dt)
      if (d.openness >= 1) { d.opening = false; d.open = true; d.timer = DOOR_AUTOCLOSE }
    } else if (d.open) {
      d.timer -= dt
      if (d.timer <= 0) {
        if (occupied(g, d.x, d.y)) d.timer = 1
        else { d.open = false; d.closing = true }
      }
    } else if (d.closing) {
      d.openness = Math.max(0, d.openness - DOOR_SPEED * dt)
      if (d.openness <= 0) d.closing = false
    }
  }
  for (const s of g.secrets.values()) {
    if (s.opening) { s.openness = Math.min(1, s.openness + DOOR_SPEED * dt); if (s.openness >= 1) { s.opening = false; s.open = true } }
  }
}

/**
 * Open the nearest door the player is roughly facing (forgiving — doesn't
 * require pixel-perfect aim at the 1-tile door). Locked doors need the key.
 */
export function tryInteractDoor(g) {
  const p = g.player
  let best = null, bestD = INTERACT_RANGE + 0.4
  for (const d of g.doors.values()) {
    if (d.open || d.opening) continue
    const cx = d.x + 0.5, cy = d.y + 0.5
    const dx = cx - p.x, dy = cy - p.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist > bestD) continue
    const dot = (dx / dist) * p.dirX + (dy / dist) * p.dirY
    if (dot < 0.35) continue            // must be in front
    bestD = dist; best = d
  }
  if (!best) return null
  if (best.locked && !g.player.keys[best.locked]) return { sfx: 'locked', locked: best.locked }
  best.opening = true; best.closing = false
  return { sfx: 'door', opened: true }
}
