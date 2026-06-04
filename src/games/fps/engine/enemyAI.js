/**
 * Grimhold — enemy & boss AI. State machine per enemy: idle/patrol → chase →
 * attack, plus pain/death. Ranged keep distance & shoot; melee chase & strike;
 * flying ignore walls; wraiths phase through walls; bosses run multi-phase
 * scripts (summons, teleport, stomp, spread shots). All delta-time scaled.
 */
import { ENEMY_CULL_RANGE, ALERT_SOUND_RADIUS } from '../constants.js'
import { getEnemyDef } from '../data/enemies.js'
import { lineOfSight, passableAt } from './raycaster.js'
import { tryMove, freeMove } from './collision.js'
import { damagePlayer } from './combat.js'
import { makePRNG } from '../utils.js'

const rng = makePRNG(0xBEEF)

export function makeEnemy(type, x, y, hpMult = 1) {
  const def = getEnemyDef(type)
  return {
    type, x, y, hp: Math.round(def.hp * hpMult), maxHp: Math.round(def.hp * hpMult),
    kind: def.kind, sprite: def.sprite, scale: def.scale,
    state: 'idle', animTime: rng() * 2, atkCd: rng() * (def.attackDelay || 1),
    alerted: false, painTimer: 0, stateTimer: 0, deathFrame: 0, deathTimer: 0,
    phaseTimer: 0, phaseActive: false, phaseAlpha: 1,
    summonTimer: def.summon?.every || 0, healTimer: 8, bossPhase: 1, charging: false,
    patrol: null, patrolIdx: 0, wanderDir: rng() * 6.28,
    boss: !!def.boss,
  }
}

const PROJ_COLOR = { bullet: '#ffd060', fireball: '#ff7020', bolt: '#c060ff', bigfireball: '#ff4020' }

function shoot(g, e, def, spreadCount = 1, dmgScale = 1) {
  const p = g.player
  const baseAng = Math.atan2(p.y - e.y, p.x - e.x)
  const speed = def.proj === 'bigfireball' ? 4.5 : 6
  const dmg = def.damage * g.difficulty.dmg * dmgScale
  const n = spreadCount
  for (let i = 0; i < n; i++) {
    const ang = baseAng + (n > 1 ? (i - (n - 1) / 2) * 0.18 : 0)
    g.projectiles.push({
      x: e.x, y: e.y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
      damage: dmg, owner: 'enemy', color: PROJ_COLOR[def.proj] || '#ffd060',
      explosive: def.proj === 'bigfireball', splash: 1.8, life: 4,
    })
  }
  g.events.push({ type: 'enemy_attack', enemy: e.type })
}

function moveToward(g, e, tx, ty, speed, dt, flying) {
  const dx = tx - e.x, dy = ty - e.y
  const d = Math.hypot(dx, dy) || 1
  const mx = (dx / d) * speed * dt, my = (dy / d) * speed * dt
  if (flying || e.phaseActive) freeMove(e, mx, my)
  else if (!tryMove(g, e, mx, my, 0.3)) {
    // blocked: nudge perpendicular (basic pathfind)
    tryMove(g, e, -my, mx, 0.3) || tryMove(g, e, my, -mx, 0.3)
  }
}

export function updateEnemies(g, dt) {
  const p = g.player
  const noise = g.noiseAt
  for (const e of g.enemies) {
    e.animTime += dt
    if (e.state === 'dead') { e.deathTimer += dt; e.deathFrame = Math.min(4, e.deathTimer * 9); continue }

    const def = getEnemyDef(e.type)
    const dx = p.x - e.x, dy = p.y - e.y
    const dist = Math.hypot(dx, dy)
    if (e.painTimer > 0) { e.painTimer -= dt; if (e.painTimer <= 0 && e.state === 'pain') e.state = e.alerted ? 'walk' : 'idle' }

    // Wall-phase (wraith)
    if (def.wallPhase) {
      e.phaseTimer += dt
      if (!e.phaseActive && e.phaseTimer > 5) { e.phaseActive = true; e.phaseTimer = 0 }
      else if (e.phaseActive && e.phaseTimer > 2) { e.phaseActive = false; e.phaseTimer = 0 }
      e.phaseAlpha = e.phaseActive ? 0.5 : 1
    }

    if (dist > ENEMY_CULL_RANGE) { if (def.patrols || def.kind === 'melee') patrol(g, e, def, dt); continue }

    // Alerting
    if (!e.alerted) {
      const sees = dist < def.sightRange * g.difficulty.alert && lineOfSight(g, e.x, e.y, p.x, p.y)
      const hears = noise && Math.hypot(noise.x - e.x, noise.y - e.y) < ALERT_SOUND_RADIUS * g.difficulty.alert
      if (sees || hears) { e.alerted = true; g.events.push({ type: 'enemy_alert', enemy: e.type }); if (def.social) alertNearby(g, e, 'zombie', 5) }
    }

    if (e.boss) { bossUpdate(g, e, def, dist, dt); continue }

    if (!e.alerted) { patrol(g, e, def, dt); continue }
    if (def.social && e.alerted) alertNearby(g, e, 'zombie', 5)

    // Combat behaviour
    e.atkCd -= dt
    if (e.stateTimer > 0) { e.stateTimer -= dt; if (e.stateTimer <= 0 && e.state === 'attack') e.state = 'walk' }
    const inRange = dist <= def.attackRange
    const sees = lineOfSight(g, e.x, e.y, p.x, p.y)

    if (inRange && sees && e.atkCd <= 0 && e.state !== 'attack') {
      e.state = 'attack'; e.stateTimer = 0.35; e.atkCd = def.attackDelay
      if (def.kind === 'melee') { if (dist <= def.attackRange + 0.2) damagePlayer(g, def.damage * g.difficulty.dmg, e.x, e.y) }
      else shoot(g, e, def)
    } else if (e.state !== 'attack') {
      e.state = 'walk'
      const flying = def.kind === 'flying'
      const keep = def.keepDist || 0
      if (def.kind === 'ranged' && dist < keep) moveToward(g, e, e.x - dx, e.y - dy, def.speed, dt, flying) // back off
      else if (dist > def.attackRange * 0.8 || def.kind === 'melee') moveToward(g, e, p.x, p.y, def.speed, dt, flying)
    }

    // Death cultist heal aura
    if (def.healer) {
      e.healTimer -= dt
      if (e.healTimer <= 0) { e.healTimer = 8; healAlly(g, e) }
    }
  }

  // Separation: keep living enemies from converging onto one tile (which would
  // make two enemies look like a single sprite). Gentle push apart.
  const list = g.enemies
  for (let i = 0; i < list.length; i++) {
    const a = list[i]; if (a.state === 'dead') continue
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j]; if (b.state === 'dead') continue
      const dx = b.x - a.x, dy = b.y - a.y
      const d2 = dx * dx + dy * dy
      if (d2 < 0.36 && d2 > 1e-5) {
        const d = Math.sqrt(d2), push = (0.6 - d) * 0.5 * dt * 12
        const nx = dx / d, ny = dy / d
        tryMove(g, b, nx * push, ny * push, 0.28)
        tryMove(g, a, -nx * push, -ny * push, 0.28)
      } else if (d2 <= 1e-5) {
        tryMove(g, b, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, 0.28)
      }
    }
  }
}

function patrol(g, e, def, dt) {
  if (e.state === 'attack' || e.state === 'pain') return
  e.state = (def.patrols || e.patrol) ? 'walk' : 'idle'
  if (e.patrol && e.patrol.length) {
    const [tx, ty] = e.patrol[e.patrolIdx]
    if (Math.hypot(tx + 0.5 - e.x, ty + 0.5 - e.y) < 0.3) e.patrolIdx = (e.patrolIdx + 1) % e.patrol.length
    moveToward(g, e, tx + 0.5, ty + 0.5, def.speed * 0.6, dt, false)
  } else if (def.patrols) {
    // wander
    const mx = Math.cos(e.wanderDir) * def.speed * 0.5 * dt, my = Math.sin(e.wanderDir) * def.speed * 0.5 * dt
    if (!tryMove(g, e, mx, my, 0.3)) e.wanderDir = rng() * 6.28
  }
}

function alertNearby(g, src, type, radius) {
  for (const e of g.enemies) {
    if (e === src || e.alerted || e.state === 'dead') continue
    if (e.type === type && Math.hypot(e.x - src.x, e.y - src.y) < radius) e.alerted = true
  }
}

function healAlly(g, src) {
  let target = null, low = 1
  for (const e of g.enemies) {
    if (e === src || e.state === 'dead' || !e.maxHp) continue
    if (Math.hypot(e.x - src.x, e.y - src.y) > 6) continue
    const frac = e.hp / e.maxHp
    if (frac < low && frac < 1) { low = frac; target = e }
  }
  if (target) { target.hp = target.maxHp; g.events.push({ type: 'enemy_heal' }) }
}

// ─── Boss scripts ────────────────────────────────────────────────────────────
function bossUpdate(g, e, def, dist, dt) {
  const p = g.player
  const frac = e.hp / e.maxHp
  // phase transitions
  const newPhase = def.phases === 3 ? (frac < 0.25 ? 3 : frac < 0.5 ? 2 : 1) : (frac < (def.name === 'The Lich' ? 0.4 : 0.5) ? 2 : 1)
  if (newPhase !== e.bossPhase) { e.bossPhase = newPhase; g.events.push({ type: 'boss_phase', phase: newPhase }) }
  if (!e.alerted) e.alerted = true

  e.atkCd -= dt
  e.summonTimer -= dt
  if (e.stateTimer > 0) { e.stateTimer -= dt; if (e.stateTimer <= 0) e.state = 'walk' }

  // Lich immunity while wraiths alive (phase 2)
  if (def.name === 'The Lich' && e.bossPhase === 2) {
    e.invuln = g.enemies.some(x => x.type === 'wraith' && x.state !== 'dead')
  } else e.invuln = false

  // Summons
  if (def.summon && e.summonTimer <= 0) {
    e.summonTimer = def.summon.every
    const stype = e.bossPhase >= 2 ? def.summon.p2 : def.summon.p1
    for (let i = 0; i < def.summon.count; i++) {
      const a = rng() * 6.28
      const sx = e.x + Math.cos(a) * 1.5, sy = e.y + Math.sin(a) * 1.5
      if (passableAt(g, sx | 0, sy | 0)) g.enemies.push(makeEnemy(stype, sx, sy, g.difficulty.hp))
    }
    g.events.push({ type: 'boss_summon' })
  }

  // Teleport (Count)
  if (def.teleports && e.atkCd <= 0 && dist > 3 && rng() < 0.3) {
    for (let tries = 0; tries < 8; tries++) {
      const a = rng() * 6.28, r = 3 + rng() * 3
      const tx = p.x + Math.cos(a) * r, ty = p.y + Math.sin(a) * r
      if (passableAt(g, tx | 0, ty | 0)) { e.x = tx; e.y = ty; g.events.push({ type: 'boss_teleport' }); break }
    }
  }

  // Stomp (Demon Lord)
  if (def.stomp && dist < 3 && e.atkCd <= 0) {
    damagePlayer(g, def.damage * 0.8 * g.difficulty.dmg, e.x, e.y); g.shake = 6
    e.atkCd = def.attackDelay; e.state = 'attack'; e.stateTimer = 0.4
    g.events.push({ type: 'boss_stomp' }); return
  }

  const sees = lineOfSight(g, e.x, e.y, p.x, p.y) || def.flies
  if (e.atkCd <= 0 && sees && dist <= def.attackRange) {
    e.atkCd = def.attackDelay; e.state = 'attack'; e.stateTimer = 0.4
    if (def.kind === 'melee') { if (dist < def.attackRange) damagePlayer(g, def.damage * g.difficulty.dmg, e.x, e.y) }
    else {
      const spread = def.spread ? (def.spread['p' + e.bossPhase] || def.spread.p1 || 1) : 1
      shoot(g, e, def, spread, e.bossPhase >= 3 ? 1.3 : 1)
    }
  } else if (e.state !== 'attack') {
    e.state = 'walk'
    const speed = def.speed * (e.bossPhase >= 3 ? 1.6 : e.bossPhase >= 2 ? 1.2 : 1)
    if (dist > def.attackRange * 0.6) moveToward(g, e, p.x, p.y, speed, dt, def.flies)
  }
}
