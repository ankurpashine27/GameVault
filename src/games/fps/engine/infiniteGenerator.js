/**
 * Grimhold — procedural level generator (rooms + corridors). Guarantees a
 * connected path to the exit, places one key/door pair, scatters enemies/items,
 * and hides secret pockets. Produces a level definition (rows + entities)
 * consumed by mapLoader — used by Endless mode and most campaign levels.
 */
import { makePRNG, randInt, pick } from '../utils.js'
import { ENDLESS_TIERS } from '../constants.js'

const overlap = (a, b, pad) =>
  a.x - pad < b.x + b.w && a.x + a.w + pad > b.x && a.y - pad < b.y + b.h && a.y + a.h + pad > b.y

export function generateLevel(opts) {
  const rng = makePRNG(opts.seed >>> 0)
  const w = opts.w, h = opts.h
  const wallCh = String(opts.wallTex || 1)
  const grid = Array.from({ length: h }, () => Array(w).fill(wallCh))

  // Rooms
  const rooms = []
  const want = opts.rooms || 8
  for (let i = 0; i < want * 5 && rooms.length < want; i++) {
    const rw = randInt(rng, 4, 7), rh = randInt(rng, 4, 7)
    const rx = randInt(rng, 1, w - rw - 2), ry = randInt(rng, 1, h - rh - 2)
    const r = { x: rx, y: ry, w: rw, h: rh, cx: (rx + rw / 2) | 0, cy: (ry + rh / 2) | 0 }
    if (rooms.some(o => overlap(o, r, 1))) continue
    const rch = (opts.altTex && rng() < 0.35) ? String(opts.altTex) : wallCh
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) grid[y][x] = '.'
    r.ch = rch
    rooms.push(r)
  }
  if (rooms.length < 2) return generateLevel({ ...opts, seed: opts.seed + 1 })

  // Order rooms into a nearest-neighbour chain from the first room. The exit
  // (chain end) then sits at the end of a real path the player must traverse,
  // and corridors stay short (fewer accidental shortcuts).
  {
    const chain = [rooms[0]]
    const rest = rooms.slice(1)
    while (rest.length) {
      const cur = chain[chain.length - 1]
      let bi = 0, bd = Infinity
      for (let i = 0; i < rest.length; i++) { const d = (rest[i].cx - cur.cx) ** 2 + (rest[i].cy - cur.cy) ** 2; if (d < bd) { bd = d; bi = i } }
      chain.push(rest.splice(bi, 1)[0])
    }
    rooms.length = 0; rooms.push(...chain)
  }

  const carveH = (x1, x2, y) => { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) if (grid[y][x] === wallCh || grid[y][x] === String(opts.altTex)) grid[y][x] = '.' }
  const carveV = (y1, y2, x) => { for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) if (grid[y][x] === wallCh || grid[y][x] === String(opts.altTex)) grid[y][x] = '.' }
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1], b = rooms[i]
    if (rng() < 0.5) { carveH(a.cx, b.cx, a.cy); carveV(a.cy, b.cy, b.cx) }
    else { carveV(a.cy, b.cy, a.cx); carveH(a.cx, b.cx, b.cy) }
  }

  const entities = []
  const first = rooms[0], last = rooms[rooms.length - 1]
  const second = rooms[1] || rooms[0]
  const angle = Math.atan2(second.cy - first.cy, second.cx - first.cx)
  entities.push({ type: 'player_spawn', x: first.cx, y: first.cy, angle })

  if (!opts.boss) {
    grid[last.cy][last.cx] = 'X' // exit at the chain end (farthest by path)
    // Gate EVERY entrance of the exit room with a red door. One red key opens
    // all red doors, so there's no soft-lock; the key sits in an early room on
    // the way, forcing real traversal before the level can be completed.
    if (rooms.length >= 3) {
      const ent = roomEntrances(grid, last, w, h)
      if (ent.length) {
        for (const [ex, ey] of ent) grid[ey][ex] = 'R'
        entities.push({ type: 'key_red', x: second.cx, y: second.cy })
      }
    }
  }

  // Occupancy tracker — guarantees no two entities (especially enemies) land
  // on the same tile, so nothing stacks into a single overlapping sprite.
  const occ = new Set()
  const okey = (x, y) => x + ',' + y
  occ.add(okey(first.cx, first.cy))
  if (!opts.boss) { occ.add(okey(last.cx, last.cy)); occ.add(okey(second.cx, second.cy)) }
  const placeIn = (r) => {
    for (let t = 0; t < 16; t++) {
      const x = r.x + 1 + (rng() * (r.w - 2) | 0), y = r.y + 1 + (rng() * (r.h - 2) | 0)
      if (grid[y][x] === '.' && !occ.has(okey(x, y))) { occ.add(okey(x, y)); return [x, y] }
    }
    return null
  }
  // Enemy placement keeps a safe bubble around the spawn: never within
  // SPAWN_CLEAR tiles, and never with a clear line-of-sight to the spawn point
  // while still close-ish — so nothing can shoot you the moment you appear.
  const SPAWN_CLEAR = 7
  const placeEnemy = (r) => {
    for (let t = 0; t < 22; t++) {
      const x = r.x + 1 + (rng() * (r.w - 2) | 0), y = r.y + 1 + (rng() * (r.h - 2) | 0)
      if (grid[y][x] !== '.' || occ.has(okey(x, y))) continue
      const d = Math.hypot(x - first.cx, y - first.cy)
      if (d < SPAWN_CLEAR) continue
      if (d < 13 && gridLOS(grid, first.cx, first.cy, x, y)) continue
      occ.add(okey(x, y)); return [x, y]
    }
    return null
  }

  // Enemies — start from a room past the spawn + key room so the opening is calm.
  const eTypes = opts.enemyTypes || ['cultist', 'skeleton']
  const eCount = opts.enemyCount ?? 8
  const startIdx = rooms.length >= 4 ? 2 : 1
  for (let i = 0; i < eCount; i++) {
    const p = placeEnemy(rooms[startIdx + (i % (rooms.length - startIdx))])
    if (p) entities.push({ type: pick(rng, eTypes), x: p[0], y: p[1] })
  }

  // Items
  const rate = opts.itemRate ?? 1
  const itemPool = ['health_small', 'health_large', 'armor_shard', 'ammo_balls', 'ammo_shells', 'gold_pile', 'gold_pile', 'gold_gem']
  for (let i = 0; i < Math.round(6 * rate); i++) {
    const p = placeIn(pick(rng, rooms))
    if (p) entities.push({ type: pick(rng, itemPool), x: p[0], y: p[1] })
  }
  // Weapon pickup chance
  if (opts.weaponDrop && rng() < 0.6) { const p = placeIn(pick(rng, rooms)); if (p) entities.push({ type: opts.weaponDrop, x: p[0], y: p[1] }) }
  // Barrels + decorations
  for (let i = 0; i < Math.round(4 * rate); i++) { const p = placeIn(pick(rng, rooms)); if (p) entities.push({ type: rng() < 0.5 ? 'barrel' : 'skull_deco', x: p[0], y: p[1] }) }

  // Secrets: carve hidden pockets behind room walls.
  const torchWalls = []
  const secretCount = opts.secrets ?? 2
  let made = 0
  for (let attempt = 0; attempt < 40 && made < secretCount; attempt++) {
    const r = pick(rng, rooms)
    const side = randInt(rng, 0, 3)
    let wx, wy, bx, by
    if (side === 0) { wx = r.x + 1 + (rng() * (r.w - 2) | 0); wy = r.y - 1; bx = wx; by = wy - 1 }
    else if (side === 1) { wx = r.x + 1 + (rng() * (r.w - 2) | 0); wy = r.y + r.h; bx = wx; by = wy + 1 }
    else if (side === 2) { wx = r.x - 1; wy = r.y + 1 + (rng() * (r.h - 2) | 0); bx = wx - 1; by = wy }
    else { wx = r.x + r.w; wy = r.y + 1 + (rng() * (r.h - 2) | 0); bx = wx + 1; by = wy }
    if (bx < 1 || by < 1 || bx >= w - 1 || by >= h - 1) continue
    if (grid[wy] === undefined || grid[wy][wx] !== r.ch && grid[wy][wx] !== wallCh) continue
    if (grid[by][bx] !== wallCh && grid[by][bx] !== r.ch) continue
    grid[wy][wx] = 'S'; grid[by][bx] = '.'
    const reward = pick(rng, ['health_large', 'gold_gem', 'treasure', 'sharpening', 'powder', 'armor_full'])
    entities.push({ type: reward, x: bx, y: by })
    made++
  }
  // a couple torches on first room
  torchWalls.push([first.x, first.cy], [first.x + first.w - 1, first.cy])

  // Boss — boss levels end on the boss's death (no exit tile needed).
  let boss = null
  if (opts.boss) { grid[last.cy][last.cx] = '.'; boss = { type: opts.boss, x: last.cx, y: last.cy - 1, angle: Math.PI } }

  return {
    name: opts.name || 'Procedural', episode: opts.episode || 1, parTime: opts.parTime || 120,
    rows: grid.map(r => r.join('')), entities, torchWalls, boss,
  }
}

/** True if there's an unobstructed straight line between two tiles (floor/doors
 *  are passable; walls/secrets block). Used to keep enemies out of sight of the
 *  spawn point. */
function gridLOS(grid, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay
  const steps = Math.ceil(Math.hypot(dx, dy) * 3)
  for (let i = 1; i < steps; i++) {
    const x = Math.floor(ax + dx * i / steps), y = Math.floor(ay + dy * i / steps)
    const c = grid[y]?.[x]
    if (c && c !== '.' && c !== 'X' && c !== 'D' && c !== 'R') return false
  }
  return true
}

/** Floor tiles directly outside a room's rectangle (its corridor openings). */
function roomEntrances(grid, room, W, H) {
  const ent = []
  for (let x = room.x; x < room.x + room.w; x++) {
    if (room.y - 1 >= 0 && grid[room.y - 1][x] === '.') ent.push([x, room.y - 1])
    if (room.y + room.h < H && grid[room.y + room.h][x] === '.') ent.push([x, room.y + room.h])
  }
  for (let y = room.y; y < room.y + room.h; y++) {
    if (room.x - 1 >= 0 && grid[y][room.x - 1] === '.') ent.push([room.x - 1, y])
    if (room.x + room.w < W && grid[y][room.x + room.w] === '.') ent.push([room.x + room.w, y])
  }
  return ent
}

/** Build an Endless floor definition. */
export function endlessFloor(floor, diffName) {
  const tier = ENDLESS_TIERS.find(t => floor >= t.from && floor <= t.to) || ENDLESS_TIERS[ENDLESS_TIERS.length - 1]
  const size = Math.min(40, 22 + Math.floor(floor / 2))
  const wallTex = 1 + (floor % 7)
  const boss = floor % 5 === 0 ? pick(makePRNG(floor * 99), ['the_count', 'the_lich', 'demon_lord']) : null
  return generateLevel({
    seed: 1000 + floor * 131, w: size, h: size, wallTex, altTex: 3,
    rooms: 6 + Math.floor(floor / 3),
    enemyTypes: tier.enemies, enemyCount: boss ? 4 : 6 + floor, itemRate: Math.max(0.4, 1.2 - floor * 0.04),
    secrets: 2, episode: ((floor - 1) % 3) + 1, parTime: 9999, name: `Floor ${floor}`,
    boss, weaponDrop: pick(makePRNG(floor * 7 + 3), ['blunderbuss', 'crossbow', 'musket', 'staff']),
  })
}
