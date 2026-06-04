/**
 * Grimhold — projectile movement + collision (walls, enemies, player, barrels).
 * Delta-time scaled. Player projectiles hit enemies; enemy projectiles hit the
 * player. Explosive projectiles detonate on any impact (incl. walls).
 */
import { solidAt } from './raycaster.js'
import { damageEnemy, damagePlayer, explode, hitBarrel } from './combat.js'
import { getEnemyDef } from '../data/enemies.js'

export function updateProjectiles(g, dt) {
  const alive = []
  for (const pr of g.projectiles) {
    pr.life -= dt
    const steps = 4
    let hit = false
    for (let s = 0; s < steps && !hit; s++) {
      pr.x += pr.vx * dt / steps
      pr.y += pr.vy * dt / steps

      if (solidAt(g, pr.x | 0, pr.y | 0)) {
        if (pr.explosive) explode(g, pr.x, pr.y, pr.splash, pr.damage)
        hit = true; break
      }
      if (pr.owner === 'player') {
        for (const b of g.barrels) {
          if (!b.dead && Math.hypot(b.x - pr.x, b.y - pr.y) < 0.4) { hitBarrel(g, b); hit = true; break }
        }
        if (hit) break
        for (const e of g.enemies) {
          if (e.state === 'dead') continue
          const r = 0.45 * (getEnemyDef(e.type)?.scale || 1)
          if (Math.hypot(e.x - pr.x, e.y - pr.y) < r) {
            if (pr.explosive) explode(g, pr.x, pr.y, pr.splash, pr.damage)
            else damageEnemy(g, e, pr.damage, {})
            hit = true; break
          }
        }
      } else {
        if (Math.hypot(g.player.x - pr.x, g.player.y - pr.y) < 0.35) {
          if (pr.explosive) explode(g, pr.x, pr.y, pr.splash, pr.damage)
          else damagePlayer(g, pr.damage, pr.x, pr.y)
          hit = true; break
        }
      }
    }
    if (!hit && pr.life > 0) alive.push(pr)
  }
  g.projectiles = alive

  const pAlive = []
  for (const part of g.particles) { part.t += dt; if (part.t < part.life) pAlive.push(part) }
  g.particles = pAlive
}
