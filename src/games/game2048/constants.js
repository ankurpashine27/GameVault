/**
 * 2048 — All constants and configuration.
 */

export const CANVAS_W = 600
export const CANVAS_H = 600

// ─── Grid sizes ───────────────────────────────────────────────────────────────
export const GRID_SIZES = {
  3: { cols: 3, name: 'Tiny',     defaultTarget: 512,  easy: 50,  medium: 35,  hard: 25  },
  4: { cols: 4, name: 'Classic',  defaultTarget: 2048, easy: 100, medium: 75,  hard: 50  },
  5: { cols: 5, name: 'Relaxed',  defaultTarget: 2048, easy: 200, medium: 150, hard: 100 },
  6: { cols: 6, name: 'Marathon', defaultTarget: 4096, easy: 400, medium: 300, hard: 200 },
  8: { cols: 8, name: 'Endless',  defaultTarget: 8192, easy: 700, medium: 500, hard: 400 },
}

export const TARGET_OPTIONS = [512, 1024, 2048, 4096, 8192]

// ─── Animation durations (ms) ─────────────────────────────────────────────────
export const ANIMATION_DURATIONS = {
  slide:       100,
  merge:       150,
  spawn:       120,
  scorePopup:  600,
}

export const ANIM_SPEED_MULTIPLIERS = {
  slow:   2.0,
  normal: 1.0,
  fast:   0.5,
  off:    0,
}

// ─── Tile themes ──────────────────────────────────────────────────────────────
export const TILE_THEMES = {
  numbers: {
    name: 'Numbers',
    values: {
      2: '2', 4: '4', 8: '8', 16: '16', 32: '32', 64: '64',
      128: '128', 256: '256', 512: '512', 1024: '1024', 2048: '2048',
      4096: '4096', 8192: '8192', 16384: '16384',
    },
  },
  space: {
    name: 'Space',
    values: {
      2: '🌑', 4: '🌒', 8: '⭐', 16: '💫', 32: '☄️', 64: '🌙',
      128: '🪐', 256: '🌟', 512: '🌠', 1024: '🌌', 2048: '🚀',
      4096: '👽', 8192: '🛸', 16384: '🌞',
    },
  },
  food: {
    name: 'Food',
    values: {
      2: '🍎', 4: '🍊', 8: '🍋', 16: '🍇', 32: '🍓', 64: '🥝',
      128: '🌮', 256: '🍕', 512: '🍣', 1024: '🦞', 2048: '👑',
      4096: '🎂', 8192: '🏆', 16384: '💎',
    },
  },
  animals: {
    name: 'Animals',
    values: {
      2: '🐭', 4: '🐱', 8: '🐶', 16: '🐸', 32: '🐰', 64: '🦊',
      128: '🐼', 256: '🦁', 512: '🐯', 1024: '🦅', 2048: '🐲',
      4096: '🦄', 8192: '🦕', 16384: '🦖',
    },
  },
  medieval: {
    name: 'Medieval',
    values: {
      2: '🪨', 4: '🪵', 8: '⚔️', 16: '🛡️', 32: '🏹', 64: '🪄',
      128: '💎', 256: '👑', 512: '🏰', 1024: '🐉', 2048: '🔮',
      4096: '⚡', 8192: '🌟', 16384: '🎆',
    },
  },
  seasons: {
    name: 'Seasons',
    values: {
      2: '🌱', 4: '🌸', 8: '☀️', 16: '🌊', 32: '🍂', 64: '❄️',
      128: '🌈', 256: '⛄', 512: '🌺', 1024: '🌙', 2048: '✨',
      4096: '🌍', 8192: '🌠', 16384: '🌞',
    },
  },
}

// ─── Color palettes ───────────────────────────────────────────────────────────
export const COLOR_PALETTES = {
  classic: {
    name: 'Classic',
    tiles: {
      2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
      32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
      512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
      4096: '#3c3a32', 8192: '#3c3a32', 16384: '#3c3a32',
    },
    text: {
      2: '#776e65', 4: '#776e65', 8: '#f9f6f2', 16: '#f9f6f2',
      32: '#f9f6f2', 64: '#f9f6f2', 128: '#f9f6f2', 256: '#f9f6f2',
      512: '#f9f6f2', 1024: '#f9f6f2', 2048: '#f9f6f2',
      4096: '#f9f6f2', 8192: '#f9f6f2', 16384: '#f9f6f2',
    },
    board: '#bbada0',
    cell: '#cdc1b4',
    bg: '#faf8ef',
  },
  dark: {
    name: 'Dark',
    tiles: {
      2: '#2d2d3a', 4: '#3a3a50', 8: '#5a4a6a', 16: '#7a5a8a',
      32: '#9a6aaa', 64: '#ba7aca', 128: '#c08a2a', 256: '#d0a030',
      512: '#e0b040', 1024: '#f0c050', 2048: '#ffdd00',
      4096: '#ff8800', 8192: '#ff4400', 16384: '#ff0044',
    },
    text: {
      2: '#aaaacc', 4: '#bbbbdd', 8: '#eeddff', 16: '#eeddff',
      32: '#ffffff', 64: '#ffffff', 128: '#ffffff', 256: '#ffffff',
      512: '#ffffff', 1024: '#ffffff', 2048: '#ffffff',
      4096: '#ffffff', 8192: '#ffffff', 16384: '#ffffff',
    },
    board: '#1a1a2e',
    cell: '#252540',
    bg: '#0d0d1a',
  },
  neon: {
    name: 'Neon',
    tiles: {
      2: '#001a2e', 4: '#003044', 8: '#0a4a5e', 16: '#0066aa',
      32: '#0088ff', 64: '#00aaff', 128: '#ff0088', 256: '#ff22aa',
      512: '#ff44cc', 1024: '#ffee00', 2048: '#00ffcc',
      4096: '#ff00ff', 8192: '#00ff88', 16384: '#ffffff',
    },
    text: {
      2: '#00aaff', 4: '#00ccff', 8: '#00eeff', 16: '#ffffff',
      32: '#ffffff', 64: '#ffffff', 128: '#ffffff', 256: '#ffffff',
      512: '#ffffff', 1024: '#000000', 2048: '#000000',
      4096: '#ffffff', 8192: '#000000', 16384: '#000000',
    },
    board: '#000d1a',
    cell: '#001122',
    bg: '#000811',
  },
  ocean: {
    name: 'Ocean',
    tiles: {
      2: '#e0f0ff', 4: '#c0e0f8', 8: '#80c4f0', 16: '#50a8e8',
      32: '#2090e0', 64: '#0078d4', 128: '#005aaa', 256: '#004080',
      512: '#003060', 1024: '#002050', 2048: '#001030',
      4096: '#ffaa00', 8192: '#ff8800', 16384: '#ff6600',
    },
    text: {
      2: '#004080', 4: '#003060', 8: '#002040', 16: '#ffffff',
      32: '#ffffff', 64: '#ffffff', 128: '#ffffff', 256: '#ffffff',
      512: '#ffffff', 1024: '#ffffff', 2048: '#ffffff',
      4096: '#ffffff', 8192: '#ffffff', 16384: '#ffffff',
    },
    board: '#1a4a6a',
    cell: '#0d3050',
    bg: '#0a2040',
  },
  sunset: {
    name: 'Sunset',
    tiles: {
      2: '#fff0e8', 4: '#ffe0c0', 8: '#ffcc88', 16: '#ffaa44',
      32: '#ff8822', 64: '#ff6600', 128: '#cc4400', 256: '#aa2200',
      512: '#882200', 1024: '#660000', 2048: '#ff00aa',
      4096: '#dd0099', 8192: '#bb0088', 16384: '#990077',
    },
    text: {
      2: '#aa4400', 4: '#884400', 8: '#663300', 16: '#ffffff',
      32: '#ffffff', 64: '#ffffff', 128: '#ffffff', 256: '#ffffff',
      512: '#ffffff', 1024: '#ffffff', 2048: '#ffffff',
      4096: '#ffffff', 8192: '#ffffff', 16384: '#ffffff',
    },
    board: '#6a2a1a',
    cell: '#4a1a0a',
    bg: '#2a0a00',
  },
  forest: {
    name: 'Forest',
    tiles: {
      2: '#e8f5e0', 4: '#c8eaaa', 8: '#98d468', 16: '#66bb2a',
      32: '#449a10', 64: '#2a7a00', 128: '#1a5a00', 256: '#0d3d00',
      512: '#082800', 1024: '#051a00', 2048: '#ddaa00',
      4096: '#bb8800', 8192: '#996600', 16384: '#774400',
    },
    text: {
      2: '#2a5a00', 4: '#1a4a00', 8: '#0d2a00', 16: '#ffffff',
      32: '#ffffff', 64: '#ffffff', 128: '#ffffff', 256: '#ffffff',
      512: '#aaddaa', 1024: '#88cc88', 2048: '#ffffff',
      4096: '#ffffff', 8192: '#ffffff', 16384: '#ffffff',
    },
    board: '#2a4a1a',
    cell: '#1a3a0a',
    bg: '#0d2008',
  },
  candy: {
    name: 'Candy',
    tiles: {
      2: '#ffeeee', 4: '#ffccee', 8: '#ff99cc', 16: '#ff66bb',
      32: '#ff33aa', 64: '#ee0099', 128: '#cc88ff', 256: '#aa55ff',
      512: '#8833ff', 1024: '#6611dd', 2048: '#ffee00',
      4096: '#ffcc00', 8192: '#ff8800', 16384: '#ff4400',
    },
    text: {
      2: '#cc6688', 4: '#aa4466', 8: '#880044', 16: '#ffffff',
      32: '#ffffff', 64: '#ffffff', 128: '#ffffff', 256: '#ffffff',
      512: '#ffffff', 1024: '#ffffff', 2048: '#333300',
      4096: '#333300', 8192: '#ffffff', 16384: '#ffffff',
    },
    board: '#cc44aa',
    cell: '#aa2288',
    bg: '#880066',
  },
}

// ─── Backgrounds ──────────────────────────────────────────────────────────────
export const BACKGROUNDS = [
  { id: 'minimal_dark', name: 'Minimal Dark' },
  { id: 'paper',        name: 'Paper'        },
  { id: 'neon_grid',    name: 'Neon Grid'    },
  { id: 'starfield',    name: 'Starfield'    },
  { id: 'bokeh',        name: 'Bokeh'        },
  { id: 'aurora',       name: 'Aurora'       },
]

// ─── Milestones ───────────────────────────────────────────────────────────────
export const MILESTONE_VALUES = [256, 512, 1024, 2048, 4096, 8192, 16384]

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'first_512',      name: 'Half-way There',      description: 'Reach 512 for the first time',       icon: '🌟' },
  { id: 'first_1024',     name: 'Getting Serious',     description: 'Reach 1024 for the first time',      icon: '💫' },
  { id: 'first_2048',     name: 'The Classic',         description: 'Reach 2048 for the first time',      icon: '🏆' },
  { id: 'first_4096',     name: 'Beyond the Limit',    description: 'Reach 4096 for the first time',      icon: '🌠' },
  { id: 'first_8192',     name: 'Legendary',           description: 'Reach 8192 for the first time',      icon: '👑' },
  { id: 'score_10k',      name: 'Five Figures',        description: 'Score 10,000+ points in one game',   icon: '💰' },
  { id: 'score_50k',      name: 'High Roller',         description: 'Score 50,000+ points in one game',   icon: '💎' },
  { id: 'score_100k',     name: 'Centurion',           description: 'Score 100,000+ points in one game',  icon: '🎯' },
  { id: 'daily_first',    name: 'Daily Player',        description: 'Complete your first Daily Challenge', icon: '📅' },
  { id: 'daily_streak_3', name: 'On a Roll',           description: 'Complete Daily Challenge 3 days in a row', icon: '🔥' },
  { id: 'daily_streak_7', name: 'Weekly Warrior',      description: 'Complete Daily Challenge 7 days in a row', icon: '⚡' },
  { id: 'undo_master',    name: 'Second Chances',      description: 'Use Undo 10 times',                  icon: '↩️' },
  { id: 'no_undo_win',    name: 'Purist',              description: 'Win without using Undo',             icon: '🎖️' },
  { id: 'tiny_win',       name: 'Small Victory',       description: 'Win on the Tiny (3×3) grid',         icon: '🐾' },
  { id: 'big_win',        name: 'Marathon Champion',   description: 'Win on the Marathon (6×6) grid',     icon: '🏅' },
  { id: 'obstacle_win',   name: 'Obstacle Course',     description: 'Win in Obstacle Mode',               icon: '🚧' },
  { id: 'time_attack_win',name: 'Speed Demon',         description: 'Win in Time Attack mode',            icon: '⏱️' },
  { id: 'combo_5',        name: 'Combo King',          description: 'Reach a 5x combo in Time Attack',    icon: '🔥' },
]

// ─── Gameplay constants ───────────────────────────────────────────────────────
export const SPAWN_PROBABILITY_4 = 0.1
export const SWIPE_MIN_DIST      = 30
export const COMBO_WINDOW_MS     = 2000
export const COMBO_INCREMENT     = 0.1
export const MAX_COMBO           = 2.0
export const MAX_UNDO_STACK      = 50
export const INPUT_QUEUE_MAX     = 2

// ─── localStorage keys ────────────────────────────────────────────────────────
export const LS_SETTINGS        = 'g2048_settings'
export const LS_PLAYER_NAME     = 'g2048_player_name'
export const LS_LEADERBOARD     = 'g2048_leaderboard'
export const LS_PERSONAL_BESTS  = 'g2048_personal_bests'
export const LS_ACHIEVEMENTS    = 'g2048_achievements'
export const LS_DAILY           = 'g2048_daily'
export const LS_STATS           = 'g2048_stats'

// ─── Game modes ───────────────────────────────────────────────────────────────
export const GAME_MODES = {
  classic:       { id: 'classic',       name: 'Classic',        icon: '🎯', description: 'Slide tiles and reach the target number.' },
  time_attack:   { id: 'time_attack',   name: 'Time Attack',    icon: '⏱️',  description: 'Score as high as possible before time runs out.' },
  limited_moves: { id: 'limited_moves', name: 'Limited Moves',  icon: '🎲', description: 'Reach the target with a limited number of moves.' },
  obstacle:      { id: 'obstacle',      name: 'Obstacle Mode',  icon: '🚧', description: 'Navigate around fixed blocked cells.' },
  sandbox:       { id: 'sandbox',       name: 'Sandbox',        icon: '🏖️',  description: 'Unlimited undos, reshuffle anytime — just explore.' },
  daily:         { id: 'daily',         name: 'Daily Challenge', icon: '📅', description: 'A new puzzle every day. Same seed for everyone.' },
}
