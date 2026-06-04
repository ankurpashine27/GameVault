/**
 * Grimhold — pushable secret walls. Identical to neighbouring walls (no visual
 * tell); revealed only by pressing interact while facing one.
 */
import { INTERACT_RANGE } from '../constants.js'

export function tryInteractSecret(g) {
  const p = g.player
  let best = null, bestD = INTERACT_RANGE + 0.4
  for (const s of g.secrets.values()) {
    if (s.opening || s.open) continue
    const cx = s.x + 0.5, cy = s.y + 0.5
    const dx = cx - p.x, dy = cy - p.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist > bestD) continue
    const dot = (dx / dist) * p.dirX + (dy / dist) * p.dirY
    if (dot < 0.35) continue
    bestD = dist; best = s
  }
  if (best) { best.opening = true; g.secretsFound++; return { sfx: 'secret', found: true } }
  return null
}

/** Background hint: stone grind if an undiscovered secret is nearby & lingering. */
export function secretHint(g) {
  for (const s of g.secrets.values()) {
    if (s.open || s.opening) continue
    const dx = s.x + 0.5 - g.player.x, dy = s.y + 0.5 - g.player.y
    if (dx * dx + dy * dy < 16) return true
  }
  return false
}
