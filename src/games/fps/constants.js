/**
 * Grimhold — central constants. ALL magic numbers live here.
 * A pure-canvas raycasting FPS (DDA), gothic horror castle theme.
 */

// ─── Render ──────────────────────────────────────────────────────────────────
export const RENDER_W = 640
export const RENDER_H = 400
export const HALF_H = RENDER_H / 2
export const FOV = 66 * Math.PI / 180
export const PLANE_LEN = Math.tan(FOV / 2)   // camera-plane half-length
export const TEX_SIZE = 64
export const MAX_RAY_DEPTH = 64

// ─── Player ──────────────────────────────────────────────────────────────────
export const MOVE_SPEED = 3.0        // tiles / sec
export const SPRINT_MULT = 1.7
export const PLAYER_RADIUS = 0.28
export const TURN_KEY_SPEED = 2.6    // rad/sec (arrow-key fallback)
export const MOUSE_SENS_BASE = 0.0022
export const START_HEALTH = 100
export const MAX_HEALTH = 100
export const MAX_ARMOR = 100
export const ARMOR_ABSORB = 0.5
export const STAMINA_MAX = 100
export const STAMINA_DRAIN = 32      // per sec sprinting
export const STAMINA_REGEN = 22      // per sec resting
export const RESPAWN_HEALTH = 50

// ─── Doors / secrets ─────────────────────────────────────────────────────────
export const DOOR_SPEED = 2.0        // openness units / sec (0..1)
export const DOOR_AUTOCLOSE = 5.0    // sec
export const DOOR_PASSABLE_AT = 0.75 // openness needed to walk through
export const INTERACT_RANGE = 1.6
export const INTERACT_DOT = 0.55     // cos of half-angle for facing check

// ─── Torch flicker ───────────────────────────────────────────────────────────
export const TORCH_FREQ = 7.0
export const TORCH_AMP = 0.22

// ─── Wall shading ────────────────────────────────────────────────────────────
export const SIDE_DARKEN = 0.72      // horizontal-hit walls darker
export const FOG_BASE = 7.5          // distance at which walls ~halve brightness

// ─── Combat ──────────────────────────────────────────────────────────────────
export const BARREL_RADIUS = 2.5
export const BARREL_DAMAGE = 80
export const ALERT_SOUND_RADIUS = 8
export const ENEMY_CULL_RANGE = 22   // only update AI within this many tiles
export const PROJECTILE_SPEED = 6.0  // tiles/sec default

// ─── Difficulty ──────────────────────────────────────────────────────────────
export const DIFFICULTIES = {
  easy:      { label: 'Easy',      dmg: 0.5, hp: 0.75, alert: 0.7, pickups: 1.4, lives: 5, permadeath: false },
  normal:    { label: 'Normal',    dmg: 1.0, hp: 1.0,  alert: 1.0, pickups: 1.0, lives: 3, permadeath: false },
  hard:      { label: 'Hard',      dmg: 1.5, hp: 1.25, alert: 1.3, pickups: 0.7, lives: 2, permadeath: false },
  nightmare: { label: 'Nightmare', dmg: 2.0, hp: 1.5,  alert: 1.6, pickups: 0.45, lives: 1, permadeath: true },
}

// ─── Economy ─────────────────────────────────────────────────────────────────
export const GOLD_BONUS_PAR = 250
export const GOLD_BONUS_KILLS = 200   // × kill fraction
export const GOLD_BONUS_SECRETS = 150 // × secret fraction
export const LIFE_COST = 1500
export const ARMOR_COST = 400
export const AMMO_BUNDLE_COST = 150

// ─── Endless scaling ─────────────────────────────────────────────────────────
export const ENDLESS_TIERS = [
  { from: 1,  to: 5,  enemies: ['cultist', 'skeleton'] },
  { from: 6,  to: 10, enemies: ['cultist', 'skeleton', 'zombie', 'gargoyle'] },
  { from: 11, to: 15, enemies: ['cultist', 'skeleton', 'zombie', 'gargoyle', 'darkknight', 'imp'] },
  { from: 16, to: 20, enemies: ['skeleton', 'zombie', 'gargoyle', 'darkknight', 'imp', 'wraith', 'cultist_death'] },
  { from: 21, to: Infinity, enemies: ['skeleton', 'zombie', 'gargoyle', 'darkknight', 'imp', 'wraith', 'cultist_death'] },
]

// ─── Minimap ─────────────────────────────────────────────────────────────────
export const MINIMAP_TILE = 4
export const MINIMAP_SIZE = 96

// ─── Wall texture IDs (see textureManager) ──────────────────────────────────
export const TEX = {
  STONE_BRICK: 1, CARVED_STONE: 2, DUNGEON_BRICK: 3, WOOD_PANEL: 4,
  CATHEDRAL: 5, BOOKCASE: 6, TORTURE: 7, LOCKED_DOOR: 8, SECRET: 9, BOSS_GATE: 10,
  DOOR: 11,
}

// ─── localStorage keys ───────────────────────────────────────────────────────
export const LS = {
  NAME: 'fps_player_name',
  SETTINGS: 'fps_settings',
  PROGRESS: 'fps_campaign_progress',
  LEADERBOARD: 'fps_leaderboard',
  ACHIEVEMENTS: 'fps_achievements',
  STATS: 'fps_stats',
}

export const DEFAULT_SETTINGS = {
  difficulty: 'normal', musicVol: 0.5, sfxVol: 0.7, sensitivity: 1.0, invertMouse: false,
}
