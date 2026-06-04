/**
 * Grimhold — firing: melee, hitscan (with pellets/spread), and projectile/
 * explosive spawns. Ammo is a per-type pool; fireDelay enforces rate (slow
 * delays on muzzleloaders stand in for reload time).
 */
import { solidAt } from './raycaster.js'
import { damageEnemy, hitBarrel } from './combat.js'
import { effectiveWeapon, AMMO } from '../data/weapons.js'
import { getEnemyDef } from '../data/enemies.js'

const SFX = {
  dagger: 'w_dagger', flintlock: 'w_flintlock', blunderbuss: 'w_blunderbuss',
  crossbow: 'w_crossbow', musket: 'w_musket', flask: 'w_flask', staff: 'w_staff', cannon: 'w_cannon',
}

export function fireWeapon(g) {
  if (g.fireCooldown > 0) return null
  const id = g.player.weapon
  const w = effectiveWeapon(id, g.upgrades, g.temp)
  if (!w) return null

  if (w.type !== 'melee') {
    const cost = w.cost || 1
    if ((g.ammo[w.ammo] || 0) < cost) { g.fireCooldown = 0.25; return { sfx: 'empty' } }
    g.ammo[w.ammo] -= cost
    g.firedRanged = true
  }

  g.fireCooldown = w.fireDelay
  g.weaponRecoil = 1
  g.muzzle = w.type === 'melee' ? 0 : 1
  g.events.push({ type: 'shot', x: g.player.x, y: g.player.y })

  if (w.type === 'melee') melee(g, w)
  else if (w.type === 'hitscan') { for (let i = 0; i < (w.pellets || 1); i++) hitscan(g, w) }
  else if (w.type === 'projectile') spawnProjectile(g, w, false)
  else if (w.type === 'explosive') spawnProjectile(g, w, true)

  return { sfx: SFX[id] || 'w_flintlock' }
}

function melee(g, w) {
  const p = g.player
  let best = null, bestD = w.range
  for (const e of g.enemies) {
    if (e.state === 'dead') continue
    const dx = e.x - p.x, dy = e.y - p.y
    const d = Math.hypot(dx, dy)
    if (d > w.range) continue
    const dot = (dx / d) * p.dirX + (dy / d) * p.dirY
    if (dot < 0.4) continue
    if (d < bestD) { bestD = d; best = e }
  }
  if (best) damageEnemy(g, best, w.damage, {})
}

function hitscan(g, w) {
  const p = g.player
  const ang = Math.atan2(p.dirY, p.dirX) + (Math.random() - 0.5) * (w.spread || 0)
  const dx = Math.cos(ang), dy = Math.sin(ang)
  const step = 0.06
  let x = p.x, y = p.y
  const max = w.range
  for (let t = 0; t < max; t += step) {
    x += dx * step; y += dy * step
    if (solidAt(g, x | 0, y | 0)) return
    // barrels
    for (const b of g.barrels) { if (!b.dead && Math.hypot(b.x - x, b.y - y) < 0.4) { hitBarrel(g, b); return } }
    // enemies
    for (const e of g.enemies) {
      if (e.state === 'dead') continue
      const def = getEnemyDef(e.type)
      const r = 0.42 * (def?.scale || 1)
      const ed = Math.hypot(e.x - x, e.y - y)
      if (ed < r) {
        const head = def?.headshot && ed < r * 0.45
        damageEnemy(g, e, w.damage, { headshot: head })
        return
      }
    }
  }
}

function spawnProjectile(g, w, explosive) {
  const p = g.player
  g.projectiles.push({
    x: p.x + p.dirX * 0.4, y: p.y + p.dirY * 0.4,
    vx: p.dirX * w.projSpeed, vy: p.dirY * w.projSpeed,
    damage: w.damage, splash: explosive ? w.splash : 0, explosive,
    owner: 'player', color: explosive ? '#40ff60' : (w.id === 'staff' ? '#c060ff' : '#ffc060'),
    life: 3,
  })
}

/** Reload is a no-op in the pooled-ammo model; kept for the keybind + sfx. */
export function reload(g) {
  const w = effectiveWeapon(g.player.weapon, g.upgrades, g.temp)
  if (w && w.type !== 'melee' && w.ammo) {
    const cap = AMMO[w.ammo]?.max ?? 99
    if ((g.ammo[w.ammo] || 0) > 0 && (g.ammo[w.ammo] || 0) < cap) return { sfx: 'reload' }
  }
  return null
}
