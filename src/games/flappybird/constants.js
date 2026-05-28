// ─── Logical canvas resolution ────────────────────────────────────────────────
export const CANVAS_W = 480
export const CANVAS_H = 640

// ─── Physics ──────────────────────────────────────────────────────────────────
export const GRAVITY            = 1800   // px/s² downward acceleration
export const FLAP_IMPULSE       = -520   // px/s upward velocity on flap
export const TERMINAL_VELOCITY  = 900    // px/s max downward speed
export const BIRD_ROTATION_UP   = -25    // degrees when rising fast
export const BIRD_ROTATION_DOWN = 90     // degrees when falling fast
export const BIRD_ROTATION_SPEED = 360   // degrees/s

// ─── Bird ─────────────────────────────────────────────────────────────────────
export const BIRD_X          = 120       // fixed horizontal position
export const BIRD_RADIUS     = 14        // hitbox radius (px), smaller than visual
export const BIRD_VISUAL_R   = 18        // visual radius (px)
export const BIRD_SHRINK_R   = 9         // hitbox radius when Shrink active

// ─── Pipes ────────────────────────────────────────────────────────────────────
export const PIPE_WIDTH       = 58
export const PIPE_CAP_H       = 14
export const PIPE_CORNER_R    = 6
export const PIPE_SPEED_BASE  = 180      // px/s
export const PIPE_GAP_BASE    = 180      // px vertical gap between top and bottom pipe
export const PIPE_SPAWN_X     = CANVAS_W + PIPE_WIDTH / 2
export const PIPE_SPAWN_INTERVAL_BASE = 1.8   // seconds between pipe spawns

// ─── Ground ───────────────────────────────────────────────────────────────────
export const GROUND_H     = 80
export const GROUND_Y     = CANVAS_H - GROUND_H

// ─── Parallax background layers ───────────────────────────────────────────────
export const BG_LAYER_SPEEDS = [0.2, 0.5, 1.0]  // multiplier of pipe speed

// ─── Difficulty stages ────────────────────────────────────────────────────────
// score thresholds to reach next stage
export const STAGES = [
  {
    id: 0, name: 'Tutorial',
    scoreThreshold: 0,
    pipeSpeed: 130,
    pipeGap: 220,
    spawnInterval: 2.4,
    movingPipes: false,
  },
  {
    id: 1, name: 'Easy',
    scoreThreshold: 5,
    pipeSpeed: 160,
    pipeGap: 195,
    spawnInterval: 2.0,
    movingPipes: false,
  },
  {
    id: 2, name: 'Normal',
    scoreThreshold: 15,
    pipeSpeed: 190,
    pipeGap: 175,
    spawnInterval: 1.85,
    movingPipes: false,
  },
  {
    id: 3, name: 'Hard',
    scoreThreshold: 30,
    pipeSpeed: 220,
    pipeGap: 158,
    spawnInterval: 1.7,
    movingPipes: false,
  },
  {
    id: 4, name: 'Expert',
    scoreThreshold: 50,
    pipeSpeed: 255,
    pipeGap: 142,
    spawnInterval: 1.55,
    movingPipes: false,
  },
  {
    id: 5, name: 'Master',
    scoreThreshold: 75,
    pipeSpeed: 290,
    pipeGap: 128,
    spawnInterval: 1.42,
    movingPipes: false,
  },
  {
    id: 6, name: 'Insane',
    scoreThreshold: 100,
    pipeSpeed: 330,
    pipeGap: 115,
    spawnInterval: 1.3,
    movingPipes: true,
    movingAmplitude: 55,   // px
    movingFrequency: 0.7,  // Hz
  },
]
export const STAGE_TRANSITION_DURATION = 2.0   // seconds for smooth interpolation

// ─── Collectibles ─────────────────────────────────────────────────────────────
export const COIN_RADIUS       = 10
export const GEM_RADIUS        = 11
export const STAR_RADIUS       = 12
export const COLLECT_ITEM_RADIUS = 13

export const COIN_SPAWN_CHANCE  = 0.55   // probability per pipe gap
export const GEM_SPAWN_CHANCE   = 0.18
export const STAR_SPAWN_CHANCE  = 0.08
export const CITEM_SPAWN_CHANCE = 0.04

export const COIN_VALUE   = 1
export const GEM_VALUE    = 5
export const STAR_VALUE   = 25
export const CITEM_VALUE  = 0            // not worth score points, tracked separately

export const MAGNET_RADIUS = 100         // pull radius when Magnet active
export const MAGNET_SPEED  = 350         // px/s pull speed

// ─── Power-ups ────────────────────────────────────────────────────────────────
export const POWERUP_RADIUS         = 13
export const POWERUP_SPAWN_INTERVAL = 8.0   // seconds between power-up spawns
export const POWERUP_SPAWN_CHANCE   = 0.7   // probability each spawn window

export const POWERUPS = {
  shield:     { id: 'shield',     name: 'Shield',       duration: 6,   color: '#38bdf8', desc: 'One-hit protection' },
  slow_mo:    { id: 'slow_mo',    name: 'Slow-Mo',      duration: 5,   color: '#a78bfa', desc: 'Half speed for 5 s' },
  magnet:     { id: 'magnet',     name: 'Magnet',       duration: 7,   color: '#f59e0b', desc: 'Attract all coins' },
  shrink:     { id: 'shrink',     name: 'Shrink',       duration: 8,   color: '#34d399', desc: 'Tiny hitbox' },
  score_x2:   { id: 'score_x2',  name: '2× Score',     duration: 10,  color: '#f97316', desc: 'Double points' },
  ghost:      { id: 'ghost',      name: 'Ghost',        duration: 4,   color: '#e879f9', desc: 'Pass through pipes' },
}
export const POWERUP_TYPES = Object.keys(POWERUPS)

export const SLOW_MO_FACTOR = 0.45    // time scale when Slow-Mo active

// ─── Scoring ──────────────────────────────────────────────────────────────────
export const SCORE_PER_PIPE         = 1
export const SCORE_COIN_BONUS       = 1
export const SCORE_GEM_BONUS        = 5
export const SCORE_STAR_BONUS       = 25

// ─── Collections (4 sets × 6 items each) ─────────────────────────────────────
export const COLLECTIONS = [
  {
    id: 'rainbow', name: 'Rainbow Set', reward: 'Rainbow skin unlocked',
    rewardSkin: 'rainbow',
    items: [
      { id: 'c_red',    color: '#ef4444', name: 'Red Gem'    },
      { id: 'c_orange', color: '#f97316', name: 'Orange Gem' },
      { id: 'c_yellow', color: '#eab308', name: 'Yellow Gem' },
      { id: 'c_green',  color: '#22c55e', name: 'Green Gem'  },
      { id: 'c_blue',   color: '#3b82f6', name: 'Blue Gem'   },
      { id: 'c_violet', color: '#8b5cf6', name: 'Violet Gem' },
    ],
  },
  {
    id: 'celestial', name: 'Celestial Set', reward: 'Galaxy skin unlocked',
    rewardSkin: 'galaxy',
    items: [
      { id: 'c_sun',    color: '#fbbf24', name: 'Sun'    },
      { id: 'c_moon',   color: '#e2e8f0', name: 'Moon'   },
      { id: 'c_comet',  color: '#7dd3fc', name: 'Comet'  },
      { id: 'c_star5',  color: '#fde047', name: 'Star'   },
      { id: 'c_planet', color: '#a78bfa', name: 'Planet' },
      { id: 'c_nova',   color: '#fb923c', name: 'Nova'   },
    ],
  },
  {
    id: 'nature', name: 'Nature Set', reward: 'Forest skin unlocked',
    rewardSkin: 'forest',
    items: [
      { id: 'c_leaf',    color: '#4ade80', name: 'Leaf'       },
      { id: 'c_flower',  color: '#f9a8d4', name: 'Flower'     },
      { id: 'c_mushroom',color: '#fb923c', name: 'Mushroom'   },
      { id: 'c_acorn',   color: '#a16207', name: 'Acorn'      },
      { id: 'c_feather', color: '#67e8f9', name: 'Feather'    },
      { id: 'c_crystal', color: '#a5f3fc', name: 'Crystal'    },
    ],
  },
  {
    id: 'fire', name: 'Fire Set', reward: 'Phoenix skin unlocked',
    rewardSkin: 'phoenix',
    items: [
      { id: 'c_ember',  color: '#ef4444', name: 'Ember'    },
      { id: 'c_flame',  color: '#f97316', name: 'Flame'    },
      { id: 'c_spark',  color: '#fbbf24', name: 'Spark'    },
      { id: 'c_ash',    color: '#9ca3af', name: 'Ash'      },
      { id: 'c_lava',   color: '#dc2626', name: 'Lava'     },
      { id: 'c_smoke',  color: '#6b7280', name: 'Smoke'    },
    ],
  },
]

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'first_flight',   name: 'First Flight',    desc: 'Score your first point',           icon: '🐣', check: s => s.score >= 1 },
  { id: 'score_10',       name: 'Getting Warm',    desc: 'Reach score 10',                   icon: '🌡️', check: s => s.score >= 10 },
  { id: 'score_25',       name: 'Rising Star',     desc: 'Reach score 25',                   icon: '⭐', check: s => s.score >= 25 },
  { id: 'score_50',       name: 'High Flyer',      desc: 'Reach score 50',                   icon: '🚀', check: s => s.score >= 50 },
  { id: 'score_100',      name: 'Century',         desc: 'Reach score 100',                  icon: '💯', check: s => s.score >= 100 },
  { id: 'score_150',      name: 'Legendary',       desc: 'Reach score 150',                  icon: '🏆', check: s => s.score >= 150 },
  { id: 'coin_50',        name: 'Coin Collector',  desc: 'Collect 50 coins in one run',      icon: '🪙', check: s => s.coinsThisRun >= 50 },
  { id: 'coin_100',       name: 'Gold Rush',       desc: 'Collect 100 coins in one run',     icon: '💰', check: s => s.coinsThisRun >= 100 },
  { id: 'powerup_all',    name: 'Power House',     desc: 'Use all 6 power-up types',         icon: '⚡', check: s => s.powerupsUsed?.size >= 6 },
  { id: 'shield_save',    name: 'Close Call',      desc: 'Survive a hit with Shield',        icon: '🛡️', check: s => s.shieldSaves >= 1 },
  { id: 'ghost_3',        name: 'Phantom',         desc: 'Pass through 3 pipes with Ghost',  icon: '👻', check: s => s.ghostPipes >= 3 },
  { id: 'slow_mo_score',  name: 'Time Bender',     desc: 'Score 5 points during Slow-Mo',    icon: '⏳', check: s => s.slowMoScore >= 5 },
  { id: 'no_powerup',     name: 'Purist',          desc: 'Reach score 20 with no power-ups', icon: '🎯', check: s => s.score >= 20 && s.powerupsUsed?.size === 0 },
  { id: 'insane_reach',   name: 'Into the Void',   desc: 'Reach Insane difficulty',          icon: '🌀', check: s => s.maxStage >= 6 },
  { id: 'collection_1',   name: 'Set Complete!',   desc: 'Complete any collection set',      icon: '🎁', check: s => s.completedSets >= 1 },
  { id: 'collection_all', name: 'Completionist',   desc: 'Complete all 4 collection sets',   icon: '💎', check: s => s.completedSets >= 4 },
  { id: 'games_10',       name: 'Frequent Flyer',  desc: 'Play 10 games',                    icon: '✈️', check: s => s.totalGames >= 10 },
  { id: 'games_50',       name: 'Veteran',         desc: 'Play 50 games',                    icon: '🎖️', check: s => s.totalGames >= 50 },
]

// ─── Bird skins ───────────────────────────────────────────────────────────────
export const BIRD_SKINS = [
  { id: 'classic',  name: 'Classic',   unlocked: true,  fill: '#fbbf24', eye: '#1e1b4b', wing: '#f59e0b' },
  { id: 'blue',     name: 'Blue Jay',  unlocked: true,  fill: '#3b82f6', eye: '#1e1b4b', wing: '#2563eb' },
  { id: 'red',      name: 'Cardinal',  unlocked: true,  fill: '#ef4444', eye: '#1e1b4b', wing: '#dc2626' },
  { id: 'green',    name: 'Parrot',    unlocked: true,  fill: '#22c55e', eye: '#1e1b4b', wing: '#16a34a' },
  { id: 'white',    name: 'Dove',      score: 15,        fill: '#f1f5f9', eye: '#1e1b4b', wing: '#cbd5e1' },
  { id: 'purple',   name: 'Raven',     score: 30,        fill: '#7c3aed', eye: '#fbbf24', wing: '#6d28d9' },
  { id: 'gold',     name: 'Goldfinch', score: 50,        fill: '#fcd34d', eye: '#1e1b4b', wing: '#f59e0b', shimmer: true },
  { id: 'silver',   name: 'Crane',     score: 75,        fill: '#94a3b8', eye: '#1e1b4b', wing: '#64748b', shimmer: true },
  { id: 'fire',     name: 'Firebird',  score: 100,       fill: '#f97316', eye: '#fbbf24', wing: '#ef4444', glow: '#f97316' },
  { id: 'ice',      name: 'Snowbird',  score: 100,       fill: '#7dd3fc', eye: '#1e1b4b', wing: '#38bdf8', glow: '#7dd3fc' },
  { id: 'dark',     name: 'Shadowbird',score: 150,       fill: '#1e1b4b', eye: '#8b5cf6', wing: '#312e81', glow: '#8b5cf6' },
  { id: 'rainbow',  name: 'Rainbow',   collection: 'rainbow', fill: 'rainbow', eye: '#fff', wing: 'rainbow' },
  { id: 'galaxy',   name: 'Galaxy',    collection: 'celestial', fill: 'galaxy', eye: '#fff', wing: 'galaxy' },
  { id: 'forest',   name: 'Forest',    collection: 'nature', fill: '#15803d', eye: '#fbbf24', wing: '#166534', glow: '#4ade80' },
  { id: 'phoenix',  name: 'Phoenix',   collection: 'fire', fill: '#dc2626', eye: '#fbbf24', wing: '#f97316', glow: '#f97316', wings: 'flame' },
]

// ─── Backgrounds ──────────────────────────────────────────────────────────────
export const BACKGROUNDS = [
  { id: 'day',     name: 'Daytime',   unlocked: true, sky: '#87CEEB', ground: '#5D4037', accent: '#FFFFFF' },
  { id: 'sunset',  name: 'Sunset',    unlocked: true, sky: '#FF7043', ground: '#4E342E', accent: '#FFA726' },
  { id: 'night',   name: 'Night',     score: 10,       sky: '#0d1b2a', ground: '#1a237e', accent: '#E8EAF6' },
  { id: 'space',   name: 'Space',     score: 25,       sky: '#020617', ground: '#1e1b4b', accent: '#e879f9' },
  { id: 'ocean',   name: 'Ocean',     score: 25,       sky: '#0ea5e9', ground: '#164e63', accent: '#67e8f9' },
  { id: 'jungle',  name: 'Jungle',    score: 40,       sky: '#166534', ground: '#14532d', accent: '#4ade80' },
  { id: 'desert',  name: 'Desert',    score: 50,       sky: '#d97706', ground: '#92400e', accent: '#fef3c7' },
  { id: 'neon',    name: 'Neon City', score: 75,       sky: '#0f0f23', ground: '#1a0a2e', accent: '#f0abfc' },
]

// ─── Particles ────────────────────────────────────────────────────────────────
export const PARTICLE_COUNT_DEATH = 18
export const PARTICLE_COUNT_COIN  = 6
export const PARTICLE_LIFE_MIN    = 0.5
export const PARTICLE_LIFE_MAX    = 1.2
export const PARTICLE_SPEED_MIN   = 60
export const PARTICLE_SPEED_MAX   = 200

// ─── localStorage keys ────────────────────────────────────────────────────────
export const LS_PLAYER_NAME     = 'fb_player_name'
export const LS_HIGH_SCORE      = 'fb_high_score'
export const LS_SETTINGS        = 'fb_settings'
export const LS_LEADERBOARD     = 'fb_leaderboard'
export const LS_ACHIEVEMENTS    = 'fb_achievements'
export const LS_COLLECTIONS     = 'fb_collections'
export const LS_UNLOCKED_SKINS  = 'fb_unlocked_skins'
export const LS_TOTAL_GAMES     = 'fb_total_games'
export const LS_TOTAL_COINS     = 'fb_total_coins'
export const LS_PERSONAL_BESTS  = 'fb_personal_bests'

// ─── UI ───────────────────────────────────────────────────────────────────────
export const LEADERBOARD_MAX    = 100
export const LEADERBOARD_SHOWN  = 20
