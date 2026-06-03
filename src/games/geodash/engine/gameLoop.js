/**
 * Pulse Rush — simulation core.
 *
 * `createGameState` builds the mutable game state; `advance` steps it one frame
 * and returns a list of events ({type,...}) for the hook to turn into sound /
 * React state. Rendering reads the same state object (see renderer.js).
 *
 * Horizontal position's single source of truth is `g.worldX` (px), accumulated
 * from the current scroll speed each frame. Every object & particle screen
 * position derives from it.
 *
 * Particle model: each particle stores `wx` (world anchor where it spawned),
 * `ox`/`oy` (offsets integrated from vx/vy). Screen position is computed in
 * `syncParticles` as x = PLAYER_X + (wx - worldX) + ox, y = oy.
 */
import { BEAT_WIDTH, PLAYER_X, TILE } from '../constants.js'
import { getForm } from './forms/index.js'
import { floorRestY, ceilRestY } from './physics.js'
import { detect, detectCoins, reachedEnd } from './collision.js'
import { applyPortal, applyOrb, applyPad } from './portalHandler.js'
import { clamp } from '../utils.js'

const TRAIL_COLORS = {
  fire: ['#ffb13f', '#ff5a1f', '#ffd23f'],
  electric: ['#39d0ff', '#7ee7ff', '#ffffff'],
  rainbow: ['#ff5a5a', '#ffd23f', '#3fe08a', '#39a0ff', '#b06bff'],
  neon: ['#ff6bd6', '#7ee787', '#39d0ff'],
}

export function createGameState({ level, iconConfig, settings, practice = false, infinite = null }) {
  const gravityDir = level.initialGravity || 1
  const size = TILE
  const p = {
    form: level.initialForm || 'cube',
    y: gravityDir > 0 ? floorRestY(size) : ceilRestY(),
    vy: 0,
    size, baseSize: size, mini: false,
    gravityDir, onSurface: true, surfaceDir: gravityDir,
    rotation: 0, hopCount: 0, airJumpUsed: false,
    robotCharging: false, robotChargeT: 0, swingDir: 1,
    deadlyBounds: false, formEntryT: 0, prevY: 0,
  }
  return {
    level,
    infinite,
    status: 'running',
    worldX: 0,
    speedScale: level.initialSpeed || 1,
    player: p,
    formModule: getForm(p.form),
    objects: level.objects.slice(),
    coins: level.coins ? level.coins.slice() : [],
    collectedCoins: new Set(),
    triggered: new Set(),
    particles: [],
    waveTrail: [],
    camera: { shake: 0 },
    mirror: { active: false, untilWorldX: 0 },
    flash: { color: '#ffffff', t: 0 },
    beatPulse: 0, onKick: false,
    bgEventIdx: 0,
    iconConfig, settings, practice,
    accentColor: level.accentColor,
    trailTick: 0,
  }
}

function spawnTrail(g) {
  const p = g.player
  const cfg = g.iconConfig[p.form] || {}
  const style = cfg.trail || 'default'
  if (style === 'none' || p.form === 'wave') return
  const density = style === 'default' ? 2 : 1
  if (g.trailTick % density !== 0) return
  const palette = TRAIL_COLORS[style]
  const color = palette ? palette[g.trailTick % palette.length] : (cfg.primary || '#39d0ff')
  g.particles.push({
    type: 'trail', wx: g.worldX, ox: -p.size * 0.4, oy: p.y + p.size / 2,
    vx: 0, vy: (Math.random() - 0.5) * 24, grav: 0,
    color, size: p.size * 0.32, life: 0.4, maxLife: 0.4, x: 0, y: 0,
  })
}

function spawnDeath(g, rect) {
  const p = g.player
  const cfg = g.iconConfig[p.form] || {}
  const color = cfg.primary || '#39d0ff'
  const style = cfg.death || 'explosion'
  const cy = p.y + p.size / 2
  const n = 28
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4
    let speed = 180 + Math.random() * 220
    if (style === 'implode') speed = -speed * 0.6
    if (style === 'vaporize') speed *= 0.5
    g.particles.push({
      type: 'death', wx: g.worldX, ox: 0, oy: cy,
      vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      grav: style === 'vaporize' ? -200 : 600,
      color: (style === 'shatter' && i % 2) ? (cfg.secondary || '#fff') : color,
      size: style === 'vaporize' ? 4 : 6 + Math.random() * 4,
      life: 0.85, maxLife: 0.85, x: 0, y: 0,
    })
  }
}

function updateParticles(g, dt) {
  for (const pt of g.particles) {
    pt.life -= dt
    pt.ox += pt.vx * dt
    pt.vy += pt.grav * dt
    pt.oy += pt.vy * dt
  }
  if (g.particles.length) g.particles = g.particles.filter(p => p.life > 0)
}

/** Resolve every particle's screen-space x/y for the renderer. */
function syncParticles(g) {
  for (const pt of g.particles) {
    pt.x = PLAYER_X + (pt.wx - g.worldX) + pt.ox
    pt.y = pt.oy
  }
}

export function advance(g, dtRaw, input) {
  const events = []
  const dt = clamp(dtRaw, 0, 0.05)

  if (g.status !== 'running') {
    updateParticles(g, dt)
    decay(g, dt)
    syncParticles(g)
    return events
  }

  const p = g.player
  const bpm = g.level.bpm
  const scrollPps = BEAT_WIDTH * (bpm / 60) * g.speedScale
  g.worldX += scrollPps * dt
  p.prevY = p.y

  if (g.infinite) g.infinite.ensureAhead(g, scrollPps)

  const ctx = { dt, speedScale: g.speedScale, scrollPps, input }
  g.formModule = getForm(p.form)
  g.formModule.update(p, ctx)

  const hb = g.formModule.getHitbox(p)
  const d = detect(p, hb, g.objects, g.worldX)

  if (d.landY !== null) {
    p.y = d.landY; p.vy = 0; p.onSurface = true; p.surfaceDir = d.supportDir
  }

  g.actionTaken = false
  if (input.pressed) {
    if (d.orbsInRange.length) {
      const { obj, index } = d.orbsInRange[0]
      g.triggered.add('orb' + index)
      const ev = applyOrb(p, obj.type)
      if (ev) events.push({ type: 'sfx', name: ev.sfx, opts: ev })
      g.actionTaken = true
    } else {
      const ev = g.formModule.onInput(p, ctx)
      if (ev) { events.push({ type: 'sfx', name: ev.sfx, opts: ev }); g.actionTaken = true }
    }
  }

  for (const { obj, index } of d.padsHit) {
    const key = 'pad' + index
    if (!g.triggered.has(key)) {
      g.triggered.add(key)
      const ev = applyPad(p, obj.type)
      if (ev) events.push({ type: 'sfx', name: ev.sfx, opts: ev })
    }
  }

  for (const { obj, index } of d.portalsHit) {
    const key = 'portal' + index
    if (!g.triggered.has(key)) {
      g.triggered.add(key)
      const ev = applyPortal(p, gShim(g), obj.type)
      if (ev) {
        events.push({ type: 'sfx', name: ev.sfx, opts: ev })
        g.flash = { color: ev.flash || '#ffffff', t: 1 }
      }
    }
  }

  const coinHits = detectCoins(p, hb, g.coins, g.collectedCoins, g.worldX)
  for (const id of coinHits) {
    g.collectedCoins.add(id)
    events.push({ type: 'sfx', name: 'coin' })
    events.push({ type: 'coin', id })
  }

  if (d.dead) {
    g.status = 'dead'
    spawnDeath(g, d.deathRect)
    g.camera.shake = 14
    events.push({ type: 'death', rect: d.deathRect })
    events.push({ type: 'sfx', name: 'death' })
  }

  if (g.status === 'running' && !g.infinite && reachedEnd(g.worldX, g.level.totalBeats)) {
    g.status = 'complete'
    events.push({ type: 'complete' })
    events.push({ type: 'sfx', name: 'complete' })
  }

  g.trailTick++
  spawnTrail(g)
  if (p.form === 'wave') {
    g.waveTrail.push({ wx: g.worldX, y: p.y + p.size / 2 })
    if (g.waveTrail.length > 90) g.waveTrail.shift()
  } else if (g.waveTrail.length) {
    g.waveTrail.length = 0
  }

  processBgEvents(g, events)
  updateParticles(g, dt)
  decay(g, dt)
  syncParticles(g)
  return events
}

function gShim(g) {
  return {
    get speedScale() { return g.speedScale }, set speedScale(v) { g.speedScale = v },
    get worldX() { return g.worldX },
    get mirror() { return g.mirror }, set mirror(v) { g.mirror = v },
    accentColor: g.accentColor,
  }
}

function processBgEvents(g, events) {
  const evs = g.level.bgEvents
  if (!evs) return
  while (g.bgEventIdx < evs.length && g.worldX >= evs[g.bgEventIdx].beatOffset * BEAT_WIDTH) {
    const e = evs[g.bgEventIdx]
    if (e.type === 'shake') g.camera.shake = Math.max(g.camera.shake, (e.intensity || 3) * 2)
    else if (e.type === 'flash') g.flash = { color: e.color || '#ffffff', t: 1 }
    else if (e.type === 'bg_color') g.level = { ...g.level, bgColor: e.color }
    g.bgEventIdx++
  }
}

function decay(g, dt) {
  g.camera.shake = Math.max(0, g.camera.shake - dt * 50)
  g.flash.t = Math.max(0, g.flash.t - dt * 4)
  if (g.player.formEntryT > 0) g.player.formEntryT = Math.max(0, g.player.formEntryT - dt)
  if (g.mirror.active && g.worldX >= g.mirror.untilWorldX) g.mirror = { active: false, untilWorldX: 0 }
}

/** Progress 0..1 for HUD. */
export function progressOf(g) {
  if (g.infinite) return 0
  return clamp(g.worldX / (g.level.totalBeats * BEAT_WIDTH), 0, 1)
}
