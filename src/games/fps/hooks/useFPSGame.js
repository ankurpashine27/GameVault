/**
 * Grimhold — game orchestration hook. Owns the offscreen render canvas, the RAF
 * loop, raw keyboard/mouse input, the persistent "run" state, level lifecycle,
 * and routing of engine events to audio / achievements / HUD.
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import {
  RENDER_W, RENDER_H, TURN_KEY_SPEED, MOUSE_SENS_BASE, DIFFICULTIES, MAX_HEALTH,
} from '../constants.js'
import { createGameState, update, levelBonus } from '../engine/gameLoop.js'
import { drawFrame } from '../engine/renderer.js'
import { parseLevel } from '../engine/mapLoader.js'
import { initTextures } from '../engine/textureManager.js'
import { initSprites } from '../engine/spriteManager.js'
import { effectiveWeapon, AMMO, WEAPONS, STARTING_WEAPONS } from '../data/weapons.js'
import { getEnemyDef } from '../data/enemies.js'
import { makeCanvas } from '../utils.js'

function startingAmmo() {
  const a = {}
  for (const k in AMMO) a[k] = AMMO[k].start
  return a
}

export function useFPSGame({ audio, settingsApi, canvasRef, pointer, callbacks }) {
  const gameRef = useRef(null)
  const runRef = useRef(null)
  const offRef = useRef(null)
  const offCtxRef = useRef(null)
  const rafRef = useRef(null)
  const loopRef = useRef(null)
  const lastRef = useRef(0)
  const runningRef = useRef(false)
  const keys = useRef(new Set())
  const mouseDown = useRef(false)
  const pending = useRef({ interact: false, reload: false, minimap: false, weapon: 0 })
  const hudTick = useRef(0)
  const [hud, setHud] = useState(null)

  const { settings } = settingsApi

  if (!offRef.current) {
    initTextures(); initSprites()
    offRef.current = makeCanvas(RENDER_W, RENDER_H)
    offCtxRef.current = offRef.current.getContext('2d')
  }

  // ─── Input listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    const MOVE = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab']
    const down = (e) => {
      if (MOVE.includes(e.code)) e.preventDefault()
      keys.current.add(e.code)
      if (e.repeat) return
      if (e.code === 'KeyE') pending.current.interact = true
      else if (e.code === 'KeyR') pending.current.reload = true
      else if (e.code === 'Tab') pending.current.minimap = true
      else if (/^Digit[1-8]$/.test(e.code)) pending.current.weapon = +e.code.slice(5)
    }
    const up = (e) => keys.current.delete(e.code)
    const md = (e) => { if (e.button === 0) mouseDown.current = true }
    const mu = (e) => { if (e.button === 0) mouseDown.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('mousedown', md)
    window.addEventListener('mouseup', mu)
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up)
      window.removeEventListener('mousedown', md); window.removeEventListener('mouseup', mu)
    }
  }, [])

  function gatherInput(dt) {
    const k = keys.current
    const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) + (k.has('KeyS') || k.has('ArrowDown') ? -1 : 0)
    const strafe = (k.has('KeyD') ? 1 : 0) + (k.has('KeyA') ? -1 : 0)
    let turn = pointer.readDX() * MOUSE_SENS_BASE * settings.sensitivity * (settings.invertMouse ? -1 : 1)
    // Cap per-frame rotation so an accumulated/spiky mouse delta can't snap the
    // camera. 0.35 rad ≈ 20° per frame is still a very fast turn.
    if (turn > 0.35) turn = 0.35; else if (turn < -0.35) turn = -0.35
    if (!pointer.lockedRef.current) turn += ((k.has('ArrowRight') ? 1 : 0) - (k.has('ArrowLeft') ? 1 : 0)) * TURN_KEY_SPEED * dt
    const p = pending.current
    const input = {
      fwd, strafe, turn,
      sprint: k.has('ShiftLeft') || k.has('ShiftRight'),
      fire: k.has('Space') || mouseDown.current,
      interact: p.interact, reload: p.reload, minimap: p.minimap, weaponSlot: p.weapon || null,
    }
    pending.current = { interact: false, reload: false, minimap: false, weapon: 0 }
    return input
  }

  const ach = useCallback((id) => { if (settingsApi.unlockAchievement(id)) callbacks.toast?.(id) }, [settingsApi, callbacks])

  function handleEvents(events, g) {
    for (const ev of events) {
      if (ev.sfx) audio.playSfx(ev.sfx, ev)
      if (ev.found) ach('secret_finder')
      switch (ev.type) {
        case 'footstep': audio.playSfx('footstep', { sprint: ev.sprint }); break
        case 'kill':
          audio.playSfx('enemy_die'); ach('first_blood')
          if (ev.boss) { ach('boss_slayer'); if (ev.enemyType === 'demon_lord') ach('demon_slayer') }
          break
        case 'player_hurt': audio.playSfx('hurt'); break
        case 'explosion': audio.playSfx('explosion'); if ((g.barrelKills || 0) >= 3) ach('powder_keg'); break
        case 'boss_phase': audio.playSfx('boss_roar'); break
        case 'enemy_alert': audio.playSfx('enemy_alert'); break
        case 'enemy_attack': audio.playSfx('enemy_attack'); break
        case 'player_died': audio.playSfx('death'); break
        case 'level_complete': audio.playSfx('level_complete'); break
        case 'game_over': audio.playSfx('game_over'); break
        default: break
      }
    }
  }

  function snapshotHud(g) {
    const w = effectiveWeapon(g.player.weapon, g.upgrades, g.temp)
    const ammoType = w?.ammo
    const boss = g.enemies.find(e => getEnemyDef(e.type)?.boss && e.state !== 'dead')
    setHud({
      health: Math.ceil(g.player.health), armor: Math.ceil(g.player.armor), lives: g.player.lives,
      stamina: g.player.stamina,
      weapon: g.player.weapon, weaponName: WEAPONS[g.player.weapon]?.name || '',
      ammo: ammoType ? Math.floor(g.ammo[ammoType] || 0) : null,
      ammoMax: ammoType ? (AMMO[ammoType]?.max || 0) : null,
      gold: g.gold, name: g.name, keys: { ...g.player.keys },
      kills: g.kills, totalEnemies: g.totalEnemies, secretsFound: g.secretsFound, totalSecrets: g.totalSecrets,
      boss: boss ? { hp: boss.hp, max: boss.maxHp, name: getEnemyDef(boss.type)?.name } : null,
      showMinimap: g.showMinimap,
    })
  }

  // ─── Loop ──────────────────────────────────────────────────────────────────
  loopRef.current = (ts) => {
    const g = gameRef.current
    if (!g || !runningRef.current) return
    let dt = (ts - lastRef.current) / 1000
    lastRef.current = ts
    if (!isFinite(dt) || dt < 0) dt = 0
    dt = Math.min(dt, 0.05)

    const input = gatherInput(dt)
    const events = update(g, dt, input)
    handleEvents(events, g)
    audio.setAlert(g.alert)

    // Render → offscreen → display
    drawFrame(offCtxRef.current, g, performance.now() / 1000)
    const disp = canvasRef.current?.getCanvas?.()
    if (disp) {
      const dctx = disp.getContext('2d')
      dctx.imageSmoothingEnabled = false
      dctx.drawImage(offRef.current, 0, 0, disp.width, disp.height)
    }

    if (++hudTick.current % 3 === 0) snapshotHud(g)

    if (g.status === 'levelcomplete') { runningRef.current = false; finishLevel(g); return }
    if (g.status === 'dead' && g.deathFade >= 1) { runningRef.current = false; finishGameOver(g); return }

    rafRef.current = requestAnimationFrame(loopRef.current)
  }

  const startLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastRef.current = performance.now()
    runningRef.current = true
    rafRef.current = requestAnimationFrame(loopRef.current)
  }, [])
  const stopLoop = useCallback(() => { runningRef.current = false; if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }, [])

  // ─── Run lifecycle ──────────────────────────────────────────────────────────
  function newRun(diffName, endless) {
    const difficulty = DIFFICULTIES[diffName] || DIFFICULTIES.normal
    runRef.current = {
      difficulty, diffName, endless: !!endless, floor: 1,
      gold: 0, ownedWeapons: new Set(STARTING_WEAPONS), upgrades: {},
      ammo: startingAmmo(), weapon: 'flintlock', lives: difficulty.lives,
      health: MAX_HEALTH, armor: 0, episode: 1,
    }
    return runRef.current
  }

  const renderNow = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    drawFrame(offCtxRef.current, g, performance.now() / 1000)
    const disp = canvasRef.current?.getCanvas?.()
    if (disp) { const dctx = disp.getContext('2d'); dctx.imageSmoothingEnabled = false; dctx.drawImage(offRef.current, 0, 0, disp.width, disp.height) }
  }, [canvasRef])

  // Load a level and start the render loop immediately. The "Click to play"
  // overlay covers the scene until the pointer locks; this keeps the world
  // rendering in every environment (incl. ones where Pointer Lock is blocked).
  const loadLevel = useCallback((def) => {
    const run = runRef.current
    audio.ensureCtx()
    const parsed = parseLevel(def, run.difficulty)
    const g = createGameState({ parsed, difficulty: run.difficulty, run })
    g._levelDef = def
    gameRef.current = g
    audio.startMusic(g.boss ? 'boss' : (def.episode === 2 ? 'catacombs' : def.episode === 3 ? 'sanctum' : 'exploration'))
    snapshotHud(g)
    renderNow()
    requestAnimationFrame(() => startLoop())
  }, [audio, renderNow, startLoop])

  function syncRun(g) {
    const run = runRef.current
    run.health = g.player.health; run.armor = g.player.armor; run.lives = g.player.lives
    run.weapon = g.player.weapon; run.gold = g.gold
  }

  function finishLevel(g) {
    const bonus = levelBonus(g)
    g.gold += bonus; syncRun(g)
    audio.stopMusic()
    settingsApi.addStats({ totalKills: g.kills, totalSecretsFound: g.secretsFound, totalGold: bonus + g.goldLevel })
    settingsApi.setMaxStat('highestEndlessFloor', runRef.current.endless ? runRef.current.floor : (settingsApi.stats.highestEndlessFloor || 0))
    // Per-completion achievements
    if (g.time <= g.parTime) ach('speedrun')
    if (g.totalSecrets > 0 && g.secretsFound >= g.totalSecrets) ach('secret_master')
    if (g.totalEnemies > 0 && g.kills >= g.totalEnemies) ach('exterminator')
    if (!g.firedRanged) ach('pacifist')
    if (g.ownedWeapons.size >= 8) ach('armed')
    callbacks.onLevelComplete?.({
      name: g.name, time: g.time, parTime: g.parTime, kills: g.kills, totalEnemies: g.totalEnemies,
      secretsFound: g.secretsFound, totalSecrets: g.totalSecrets, bonus, levelGold: g.goldLevel,
      totalGold: g.gold, isBoss: !!g.boss, episode: g.episode, def: g._levelDef,
    })
  }

  function finishGameOver(g) {
    syncRun(g)
    audio.stopMusic()
    settingsApi.addStats({ totalDeaths: 1, totalKills: g.kills })
    callbacks.onGameOver?.({ gold: g.gold, floor: runRef.current.floor, endless: runRef.current.endless, diffName: runRef.current.diffName, kills: g.kills })
  }

  // Public API
  const pause = useCallback(() => { stopLoop(); audio.suspend() }, [stopLoop, audio])
  const resume = useCallback(() => { audio.resume(); startLoop() }, [audio, startLoop])
  const stop = useCallback(() => { stopLoop(); audio.stopMusic(); gameRef.current = null }, [stopLoop, audio])

  useEffect(() => {
    const onVis = () => { if (document.hidden && runningRef.current) { pause(); callbacks.onAutoPause?.() } }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pause, callbacks])

  // Unmount-only cleanup. Must NOT depend on stopLoop/audio (their identities
  // change every render, which would otherwise stop the loop on each re-render
  // — e.g. the throttled HUD setState).
  const cleanupRef = useRef(null)
  cleanupRef.current = () => { stopLoop(); audio.stopMusic() }
  useEffect(() => () => cleanupRef.current?.(), [])

  return { hud, gameRef, runRef, newRun, loadLevel, pause, resume, stop, isRunning: () => runningRef.current }
}
