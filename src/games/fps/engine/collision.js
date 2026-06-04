/**
 * Grimhold — movement collision with wall sliding (two independent axis checks,
 * never a hard stop). Circular radius sampled at several offsets.
 */
import { passableAt } from './raycaster.js'

function freeAt(g, x, y, r) {
  const pts = [[-r, 0], [r, 0], [0, -r], [0, r], [-r * 0.7, -r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, r * 0.7]]
  for (const [ox, oy] of pts) {
    if (!passableAt(g, (x + ox) | 0, (y + oy) | 0)) return false
  }
  return true
}

/** Move an entity with sliding. Mutates ent.x / ent.y. Returns true if it moved. */
export function tryMove(g, ent, dx, dy, r) {
  let moved = false
  if (dx !== 0 && freeAt(g, ent.x + dx, ent.y, r)) { ent.x += dx; moved = true }
  if (dy !== 0 && freeAt(g, ent.x, ent.y + dy, r)) { ent.y += dy; moved = true }
  return moved
}

/** Flying entity move (ignores walls). */
export function freeMove(ent, dx, dy) { ent.x += dx; ent.y += dy }
