/**
 * Grimhold — shared combat: damage to enemies/player, deaths & drops, and
 * barrel/area explosions. Events are pushed to g.events for the loop to handle.
 */
import { ARMOR_ABSORB, BARREL_RADIUS, BARREL_DAMAGE } from '../constants.js'
import { getEnemyDef } from '../data/enemies.js'
import { makePRNG } from '../utils.js'

const rng = makePRNG(0xC0FFEE)

export function damageEnemy(g, e, amount, opts = {}) {
  if (e.state === 'dead') return
  const def = getEnemyDef(e.type)
  let dmg = amount
  if (def.blockReduce && !e.charging) dmg *= (1 - def.blockReduce)
  if (def.explosiveWeak && opts.explosive) dmg *= def.explosiveWeak
  if (def.headshot && opts.headshot) dmg *= def.headshot
  // Boss immune while its guardian summons live (Lich p2)
  if (e.invuln) return
  e.hp -= dmg
  e.alerted = true
  e.painTimer = 0.18
  if (e.hp <= 0) killEnemy(g, e, opts)
  else if (e.state !== 'attack') e.state = 'pain'
}

function killEnemy(g, e, opts) {
  const def = getEnemyDef(e.type)
  e.state = 'dead'; e.deathFrame = 0; e.deathTimer = 0; e.solid = false
  g.kills++
  g.gold += def.gold; g.goldLevel += def.gold
  if (opts.barrel) g.barrelKills = (g.barrelKills || 0) + 1
  // Drops
  const spawn = (type) => g.pickups.push({ type, x: e.x, y: e.y, taken: false })
  if (def.ammoDrop && rng() < 0.7) spawn('ammo_' + (def.ammoDrop === 'ball' ? 'balls' : def.ammoDrop === 'mana' ? 'mana' : def.ammoDrop === 'flasks' ? 'flasks' : def.ammoDrop))
  if (def.dropHealth && rng() < def.dropHealth) spawn('health_small')
  if (def.dropUpgrade && rng() < def.dropUpgrade) spawn(['sharpening', 'powder', 'bandolier'][rng() * 3 | 0])
  if (def.gold >= 30 && rng() < 0.3) spawn('gold_pile')
  g.events.push({ type: 'kill', boss: def.boss, enemyType: e.type })
  if (def.boss) {
    if (def.dropKey) spawn('rune_key')
    g.events.push({ type: 'boss_killed', boss: e.type, final: def.final })
  }
}

export function damagePlayer(g, amount, srcX, srcY) {
  if (g.player.health <= 0) return
  let dmg = amount
  if (g.player.armor > 0) {
    const absorbed = dmg * ARMOR_ABSORB
    g.player.armor = Math.max(0, g.player.armor - absorbed)
    dmg -= absorbed
  }
  g.player.health -= dmg
  g.damageFlash = Math.min(0.6, 0.25 + dmg / 60)
  g.shake = Math.max(g.shake, Math.min(4, dmg / 10))
  // Directional damage indicator — record the world-angle to the hit source.
  if (srcX != null && (srcX !== g.player.x || srcY !== g.player.y)) {
    if (!g.damageDirs) g.damageDirs = []
    g.damageDirs.push({ ang: Math.atan2(srcY - g.player.y, srcX - g.player.x), life: 1.4 })
    if (g.damageDirs.length > 8) g.damageDirs.shift()
  }
  g.events.push({ type: 'player_hurt', amount: dmg })
  if (g.player.health <= 0) { g.player.health = 0; g.events.push({ type: 'player_died' }) }
}

/** Explode at a point: area damage to player, enemies, and chain barrels. */
export function explode(g, x, y, radius = BARREL_RADIUS, dmg = BARREL_DAMAGE) {
  g.particles.push({ x, y, t: 0, life: 0.4, r: radius })
  g.shake = Math.max(g.shake, 4)
  g.events.push({ type: 'explosion', x, y })
  for (const e of g.enemies) {
    if (e.state === 'dead') continue
    const d = Math.hypot(e.x - x, e.y - y)
    if (d < radius) damageEnemy(g, e, dmg * (1 - d / radius), { explosive: true, barrel: true })
  }
  const pd = Math.hypot(g.player.x - x, g.player.y - y)
  if (pd < radius) damagePlayer(g, dmg * 0.6 * (1 - pd / radius), x, y)
  // chain barrels
  for (const b of g.barrels) {
    if (b.dead) continue
    if (Math.hypot(b.x - x, b.y - y) < radius + 0.5) hitBarrel(g, b)
  }
}

export function hitBarrel(g, b) {
  if (b.dead) return
  b.dead = true
  explode(g, b.x, b.y)
}
