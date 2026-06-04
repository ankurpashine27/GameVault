/**
 * Grimhold — parse a level definition (rows of chars + entity list) into the
 * runtime game structures (wall grid, doors, secrets, enemies, pickups, etc.).
 *
 * Char map: '1'-'9'=wall tex, 'G'=boss-gate wall(10), '.'/' '=floor,
 * 'D'=door, 'R'/'B'/'Y'=locked door, 'A'=rune(boss) door, 'S'=secret, 'X'=exit.
 */
import { TEX } from '../constants.js'
import { ENEMIES } from '../data/enemies.js'
import { ITEMS } from '../data/items.js'
import { makeEnemy } from './enemyAI.js'

export function parseLevel(def, difficulty) {
  const rows = def.rows
  const h = rows.length, w = rows[0].length
  const wallGrid = new Uint8Array(w * h)
  const doors = new Map(), secrets = new Map()
  let exitTile = null
  let spawn = { x: 1.5, y: 1.5, angle: 0 }
  const secretCells = []

  for (let y = 0; y < h; y++) {
    const row = rows[y]
    for (let x = 0; x < w; x++) {
      const ch = row[x]
      const idx = y * w + x
      if (ch >= '1' && ch <= '9') wallGrid[idx] = ch.charCodeAt(0) - 48
      else if (ch === 'G') wallGrid[idx] = TEX.BOSS_GATE
      else if (ch === 'D') doors.set(idx, { x, y, tex: TEX.DOOR, openness: 0, locked: null })
      else if (ch === 'R' || ch === 'B' || ch === 'Y') doors.set(idx, { x, y, tex: TEX.LOCKED_DOOR, openness: 0, locked: ch })
      else if (ch === 'A') doors.set(idx, { x, y, tex: TEX.BOSS_GATE, openness: 0, locked: 'rune' })
      else if (ch === 'S') { secrets.set(idx, { x, y, tex: TEX.STONE_BRICK, openness: 0 }); secretCells.push([x, y, idx]) }
      else if (ch === 'X') exitTile = { x, y }
    }
  }
  // Resolve secret texture from a neighbouring wall (no visual tell).
  for (const [x, y, idx] of secretCells) {
    const s = secrets.get(idx)
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const t = wallGrid[ny * w + nx]
      if (t) { s.tex = t; break }
    }
  }

  const enemies = [], pickups = [], decorations = [], barrels = []
  for (const ent of (def.entities || [])) {
    const cx = ent.x + 0.5, cy = ent.y + 0.5
    if (ent.type === 'player_spawn') { spawn = { x: cx, y: cy, angle: ent.angle || 0 }; continue }
    if (ENEMIES[ent.type]) {
      const e = makeEnemy(ent.type, cx, cy, difficulty.hp)
      if (ent.patrol) e.patrol = ent.patrol
      enemies.push(e); continue
    }
    const item = ITEMS[ent.type]
    if (!item) continue
    if (item.kind === 'deco') decorations.push({ type: ent.type, x: cx, y: cy })
    else if (item.kind === 'barrel') barrels.push({ x: cx, y: cy, dead: false })
    else pickups.push({ type: ent.type, x: cx, y: cy, taken: false, value: ent.value })
  }

  if (def.boss) {
    const e = makeEnemy(def.boss.type, def.boss.x + 0.5, def.boss.y + 0.5, difficulty.hp)
    e.bossActive = true
    enemies.push(e)
  }

  const torchSet = new Set((def.torchWalls || []).map(([x, y]) => y * w + x))

  return {
    map: { w, h }, wallGrid, doors, secrets, exitTile, spawn, enemies, pickups,
    decorations, barrels, torchSet, totalSecrets: secrets.size,
    parTime: def.parTime || 120, name: def.name || 'Level', episode: def.episode || 1,
    boss: def.boss ? def.boss.type : null,
  }
}
