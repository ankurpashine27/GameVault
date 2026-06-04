/**
 * Grimhold — campaign: 3 episodes × 5 levels. Layouts are produced by the
 * themed generator with fixed per-level seeds (deterministic, distinct, always
 * solvable), tuned by episode for texture set, enemy roster, density and boss.
 */
import { generateLevel } from '../engine/infiniteGenerator.js'

export const EPISODES = [
  {
    id: 1, name: 'The Outer Walls', music: 'exploration',
    intro: 'A village lies slaughtered overnight. The trail leads to Castle Dread — its outer gates crawling with cultists and the newly risen dead. You are the last hunter. Go in.',
    outro: 'The Count is ash. His rune key still warm in your hand opens a passage beneath the castle…',
  },
  {
    id: 2, name: 'The Catacombs', music: 'catacombs',
    intro: 'Beneath the castle sprawl ancient catacombs — dark, drowned, and thick with undead that have not rested in centuries.',
    outro: 'The Lich shatters into cold light. Its rune key reveals a deeper door — one that should never be opened.',
  },
  {
    id: 3, name: 'The Inner Sanctum', music: 'sanctum',
    intro: 'A rift between worlds bleeds into the castle\'s heart. The Inner Sanctum is no longer stone and mortar — it is a demon\'s dominion.',
    outro: 'The Demon Lord falls. The rift collapses. Dawn, impossibly, breaks over Castle Dread. You walk out alive.',
  },
]

const EP = {
  1: { wall: 1, alt: 2, enemies: ['cultist', 'skeleton'], itemRate: 1.1 },
  2: { wall: 3, alt: 7, enemies: ['skeleton', 'zombie', 'cultist'], itemRate: 0.85 },
  3: { wall: 5, alt: 6, enemies: ['gargoyle', 'darkknight', 'imp', 'wraith', 'cultist_death'], itemRate: 0.7 },
}
const BOSS = { 1: 'the_count', 2: 'the_lich', 3: 'demon_lord' }

export const LEVEL_META = [
  { id: 'e1l1', ep: 1, name: 'Gatehouse',          size: 24, par: 90,  secrets: 2, weapon: 'blunderbuss', intro: 'The gates of Castle Dread loom before you…' },
  { id: 'e1l2', ep: 1, name: 'Outer Courtyard',    size: 26, par: 110, secrets: 2, weapon: null },
  { id: 'e1l3', ep: 1, name: 'Guard Barracks',     size: 26, par: 120, secrets: 3, weapon: 'crossbow' },
  { id: 'e1l4', ep: 1, name: 'Chapel of Blood',    size: 28, par: 130, secrets: 3, weapon: null },
  { id: 'e1l5', ep: 1, name: "The Count's Tower",  size: 28, par: 180, secrets: 2, weapon: null, boss: true },
  { id: 'e2l1', ep: 2, name: 'Crypt Entrance',     size: 28, par: 120, secrets: 3, weapon: null },
  { id: 'e2l2', ep: 2, name: 'Bone Corridors',     size: 30, par: 140, secrets: 3, weapon: 'musket' },
  { id: 'e2l3', ep: 2, name: 'The Ossuary',        size: 32, par: 150, secrets: 3, weapon: null },
  { id: 'e2l4', ep: 2, name: 'Ritual Chamber',     size: 32, par: 160, secrets: 3, weapon: 'staff' },
  { id: 'e2l5', ep: 2, name: "The Lich's Throne",  size: 32, par: 200, secrets: 2, weapon: null, boss: true },
  { id: 'e3l1', ep: 3, name: 'The Rift Gate',      size: 32, par: 150, secrets: 3, weapon: null },
  { id: 'e3l2', ep: 3, name: "Demon's Ante-Chamber", size: 34, par: 160, secrets: 3, weapon: 'flask' },
  { id: 'e3l3', ep: 3, name: 'The Burning Library', size: 36, par: 180, secrets: 4, weapon: null },
  { id: 'e3l4', ep: 3, name: 'Hall of the Fallen', size: 38, par: 200, secrets: 4, weapon: 'cannon' },
  { id: 'e3l5', ep: 3, name: "Demon Lord's Throne", size: 38, par: 240, secrets: 2, weapon: null, boss: true },
]

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }

/** Build a ready-to-parse level definition for a campaign level id. */
export function buildCampaignLevel(id) {
  const meta = LEVEL_META.find(m => m.id === id)
  if (!meta) return null
  const ep = EP[meta.ep]
  const idxInEp = LEVEL_META.filter(m => m.ep === meta.ep).indexOf(meta)
  const def = generateLevel({
    seed: hash(id),
    w: meta.size, h: meta.size,
    wallTex: ep.wall, altTex: ep.alt,
    rooms: 6 + idxInEp + meta.ep,
    enemyTypes: ep.enemies,
    enemyCount: meta.boss ? 4 + meta.ep : 7 + idxInEp * 2 + meta.ep * 2,
    itemRate: ep.itemRate,
    secrets: meta.secrets,
    episode: meta.ep,
    parTime: meta.par,
    name: meta.name,
    boss: meta.boss ? BOSS[meta.ep] : null,
    weaponDrop: meta.weapon,
  })
  def.id = id
  def.intro = meta.intro
  return def
}

/**
 * Hand-authored tutorial: shoot an enemy → open a door → grab the red key →
 * open the locked (red) door → find a secret → reach the exit.
 */
export function buildTutorialLevel() {
  const W = 20, H = 13
  const g = Array.from({ length: H }, () => Array(W).fill('1'))
  const carve = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = '.' }
  carve(1, 1, 5, 7)    // Room A (start)
  carve(7, 1, 12, 7)   // Room B (enemies + key)
  carve(14, 1, 18, 7)  // Room C (exit)
  g[4][6] = 'D'        // standard door  A → B
  g[4][13] = 'R'       // red locked door B → C
  g[8][3] = '.'; g[9][3] = 'S'; carve(2, 10, 4, 11) // secret stub → hidden pocket
  g[4][17] = 'X'       // exit

  const entities = [
    { type: 'player_spawn', x: 3, y: 4, angle: 0 },
    { type: 'ammo_balls', x: 4, y: 6 },
    { type: 'cultist', x: 9, y: 2 },
    { type: 'skeleton', x: 10, y: 6 },
    { type: 'barrel', x: 8, y: 5 },
    { type: 'key_red', x: 11, y: 4 },
    { type: 'gold_pile', x: 16, y: 2 },
    { type: 'health_large', x: 3, y: 10 }, // secret reward
    { type: 'torch_deco', x: 1, y: 1 },
    { type: 'torch_deco', x: 18, y: 7 },
  ]
  return {
    id: 'tutorial', name: 'Training Grounds', episode: 1, parTime: 999, totalSecrets: 1,
    rows: g.map(r => r.join('')), entities, torchWalls: [[6, 3], [6, 5], [13, 3], [13, 5]],
    intro: 'TRAINING GROUNDS',
  }
}

export const FIRST_LEVEL = 'e1l1'
export function nextLevelId(id) {
  const i = LEVEL_META.findIndex(m => m.id === id)
  return i >= 0 && i < LEVEL_META.length - 1 ? LEVEL_META[i + 1].id : null
}
export function levelMeta(id) { return LEVEL_META.find(m => m.id === id) || null }
export function episodeLevels(ep) { return LEVEL_META.filter(m => m.ep === ep) }
