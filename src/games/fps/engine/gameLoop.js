/**
 * Grimhold — simulation core. `createGameState` builds the world from a parsed
 * level + run data; `update` advances one frame (input → movement, combat, AI,
 * doors, pickups, win/lose) and returns events for the hook to surface.
 */
import {
  RENDER_W, PLANE_LEN, MOVE_SPEED, SPRINT_MULT, PLAYER_RADIUS, MAX_HEALTH,
  STAMINA_MAX, STAMINA_DRAIN, STAMINA_REGEN, RESPAWN_HEALTH, MOUSE_SENS_BASE,
} from '../constants.js'
import { paletteFor } from './textureManager.js'
import { tryMove } from './collision.js'
import { updateDoors, tryInteractDoor } from './doorSystem.js'
import { tryInteractSecret } from './secretSystem.js'
import { updateEnemies } from './enemyAI.js'
import { updateProjectiles } from './projectileSystem.js'
import { updatePickups } from './pickupSystem.js'
import { fireWeapon, reload } from './weaponSystem.js'
import { solidAt } from './raycaster.js'
import { getEnemyDef } from '../data/enemies.js'
import { WEAPONS, AMMO } from '../data/weapons.js'
import { clamp, normalizeAngle } from '../utils.js'

export function createGameState({ parsed, difficulty, run }) {
  const a = parsed.spawn.angle
  const dirX = Math.cos(a), dirY = Math.sin(a)
  const initialEnemies = parsed.enemies.filter(e => !e.boss).length

  return {
    map: parsed.map, wallGrid: parsed.wallGrid, doors: parsed.doors, secrets: parsed.secrets,
    exitTile: parsed.exitTile, torchSet: parsed.torchSet,
    enemies: parsed.enemies, pickups: parsed.pickups, decorations: parsed.decorations, barrels: parsed.barrels,
    projectiles: [], particles: [],
    player: {
      x: parsed.spawn.x, y: parsed.spawn.y, dir: a,
      dirX, dirY, planeX: -dirY * PLANE_LEN, planeY: dirX * PLANE_LEN,
      health: run.health ?? MAX_HEALTH, armor: run.armor ?? 0, lives: run.lives,
      stamina: STAMINA_MAX, keys: {}, weapon: run.weapon || 'flintlock', bobPhase: 0,
    },
    ammo: run.ammo, ownedWeapons: run.ownedWeapons, upgrades: run.upgrades, temp: {}, buffTimers: {},
    gold: run.gold, goldLevel: 0,
    zbuffer: new Float32Array(RENDER_W),
    visited: new Set(),
    difficulty, palette: paletteFor(parsed.episode),
    time: 0, kills: 0, totalEnemies: initialEnemies, secretsFound: 0, totalSecrets: parsed.totalSecrets,
    status: 'playing', fireCooldown: 0, weaponRecoil: 0, muzzle: 0,
    damageFlash: 0, pickupFlash: 0, shake: 0, deathFade: 0,
    showMinimap: false, alert: false, aimEnemy: false, noiseAt: null, noiseT: 0,
    damageDirs: [],
    events: [], moving: false, firedRanged: false, barrelKills: 0,
    parTime: parsed.parTime, name: parsed.name, episode: parsed.episode, boss: parsed.boss,
    _spawnX: parsed.spawn.x, _spawnY: parsed.spawn.y, _bossWasAlive: false, footstepT: 0,
  }
}

function setDir(p, ang) {
  p.dir = normalizeAngle(ang)
  p.dirX = Math.cos(p.dir); p.dirY = Math.sin(p.dir)
  p.planeX = -p.dirY * PLANE_LEN; p.planeY = p.dirX * PLANE_LEN
}

function markVisited(g) {
  const px = g.player.x | 0, py = g.player.y | 0, w = g.map.w
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const x = px + dx, y = py + dy
    if (x >= 0 && y >= 0 && x < w && y < g.map.h) g.visited.add(y * w + x)
  }
}

export function update(g, dt, input) {
  g.events.length = 0
  dt = Math.min(dt, 0.05)

  // Timers / decays
  g.fireCooldown = Math.max(0, g.fireCooldown - dt)
  g.weaponRecoil = Math.max(0, g.weaponRecoil - dt * 6)
  g.muzzle = Math.max(0, g.muzzle - dt * 12)
  g.damageFlash = Math.max(0, g.damageFlash - dt * 1.6)
  g.pickupFlash = Math.max(0, g.pickupFlash - dt * 2.5)
  g.shake = Math.max(0, g.shake - dt * 24)
  if (g.noiseT > 0) { g.noiseT -= dt; if (g.noiseT <= 0) g.noiseAt = null }
  if (g.damageDirs.length) { for (const d of g.damageDirs) d.life -= dt; g.damageDirs = g.damageDirs.filter(d => d.life > 0) }
  for (const k in g.buffTimers) { g.buffTimers[k] -= dt; if (g.buffTimers[k] <= 0) { delete g.buffTimers[k]; if (k === 'bloodCurse') delete g.temp.bloodCurse } }
  // mana regen
  if (AMMO.mana.regen) g.ammo.mana = Math.min(AMMO.mana.max, (g.ammo.mana || 0) + AMMO.mana.regen * dt)

  if (g.status === 'dead') { g.deathFade = Math.min(1, g.deathFade + dt); updateProjectiles(g, dt); return g.events }
  if (g.status !== 'playing') return g.events

  g.time += dt
  const p = g.player

  // Turn
  if (input.turn) setDir(p, p.dir + input.turn)

  // Move (WASD: fwd along dir, strafe along plane)
  const sprinting = input.sprint && p.stamina > 1 && (input.fwd !== 0 || input.strafe !== 0)
  const speed = MOVE_SPEED * (sprinting ? SPRINT_MULT : 1)
  if (sprinting) p.stamina = Math.max(0, p.stamina - STAMINA_DRAIN * dt)
  else p.stamina = Math.min(STAMINA_MAX, p.stamina + STAMINA_REGEN * dt)
  const planeNX = -p.dirY, planeNY = p.dirX // unit strafe
  let dx = (p.dirX * input.fwd + planeNX * input.strafe) * speed * dt
  let dy = (p.dirY * input.fwd + planeNY * input.strafe) * speed * dt
  const moving = (input.fwd !== 0 || input.strafe !== 0)
  g.moving = moving
  if (moving) {
    tryMove(g, p, dx, dy, PLAYER_RADIUS)
    p.bobPhase += dt * (sprinting ? 14 : 9)
    g.footstepT = (g.footstepT || 0) + dt
    const interval = sprinting ? 0.3 : 0.42
    if (g.footstepT >= interval) { g.footstepT = 0; g.events.push({ type: 'footstep', sprint: sprinting }) }
  }
  markVisited(g)

  // Weapon switch
  if (input.weaponSlot) {
    const id = Object.keys(WEAPONS).find(k => WEAPONS[k].slot === input.weaponSlot)
    if (id && (id === 'dagger' || g.ownedWeapons.has(id))) p.weapon = id
  }
  // Interact
  if (input.interact) {
    const ev = tryInteractDoor(g) || tryInteractSecret(g)
    if (ev) g.events.push(ev)
  }
  // Reload
  if (input.reload) { const ev = reload(g); if (ev) g.events.push(ev) }
  // Fire
  if (input.fire) { const ev = fireWeapon(g); if (ev) g.events.push(ev) }
  if (input.minimap) g.showMinimap = !g.showMinimap

  // Sound propagation from shots
  for (const e of g.events) if (e.type === 'shot') { g.noiseAt = { x: e.x, y: e.y }; g.noiseT = 0.5 }

  // Systems
  updateDoors(g, dt)
  updateEnemies(g, dt)
  updateProjectiles(g, dt)
  const pevents = updatePickups(g)
  for (const ev of pevents) { g.events.push(ev); g.pickupFlash = 0.6 }

  // Crosshair aim highlight
  g.aimEnemy = aimingAtEnemy(g)
  // Combat-music alert flag
  g.alert = g.enemies.some(e => e.alerted && e.state !== 'dead')

  // Post-process loop events (deaths, win)
  for (const ev of g.events) {
    if (ev.type === 'player_died') handleDeath(g)
    if (ev.type === 'boss_killed') { /* boss level completes when all bosses dead */ }
  }
  // Win conditions
  if (g.status === 'playing') {
    if (g.boss) {
      const bossAlive = g.enemies.some(e => getEnemyDef(e.type)?.boss && e.state !== 'dead')
      if (!bossAlive && !g._bossWasAlive) { /* never had boss? */ }
      if (g._bossWasAlive && !bossAlive) { g.status = 'levelcomplete'; g.events.push({ type: 'level_complete' }) }
      if (bossAlive) g._bossWasAlive = true
    } else if (g.exitTile && (p.x | 0) === g.exitTile.x && (p.y | 0) === g.exitTile.y) {
      g.status = 'levelcomplete'; g.events.push({ type: 'level_complete' })
    }
  }

  return g.events
}

function handleDeath(g) {
  const p = g.player
  if (g.difficulty.permadeath || p.lives <= 1) {
    p.lives = Math.max(0, p.lives - 1)
    g.status = 'dead'
    g.events.push({ type: 'game_over' })
  } else {
    p.lives -= 1
    // respawn at level start, keep weapons
    p.x = g._spawnX ?? p.x; p.y = g._spawnY ?? p.y
    p.health = RESPAWN_HEALTH; p.armor = Math.min(p.armor, 50)
    g.damageFlash = 0
    g.events.push({ type: 'respawn' })
  }
}

function aimingAtEnemy(g) {
  const p = g.player
  let x = p.x, y = p.y
  for (let t = 0; t < 20; t += 0.1) {
    x += p.dirX * 0.1; y += p.dirY * 0.1
    if (solidAt(g, x | 0, y | 0)) return false
    for (const e of g.enemies) {
      if (e.state === 'dead') continue
      if (Math.hypot(e.x - x, e.y - y) < 0.45 * (getEnemyDef(e.type)?.scale || 1)) return true
    }
  }
  return false
}

/** Bonus gold awarded at level end. */
export function levelBonus(g) {
  const killFrac = g.totalEnemies ? clamp(g.kills / g.totalEnemies, 0, 1) : 1
  const secretFrac = g.totalSecrets ? clamp(g.secretsFound / g.totalSecrets, 0, 1) : 1
  const par = g.time <= g.parTime ? 250 : 0
  return Math.round(200 * killFrac + 150 * secretFrac + par)
}

export const MOUSE_SENS = MOUSE_SENS_BASE
