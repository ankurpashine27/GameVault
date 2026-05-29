// ─── Board ────────────────────────────────────────────────────────────────────
export const BOARD_COLS = 10
export const BOARD_ROWS = 20

// ─── Canvas ───────────────────────────────────────────────────────────────────
export const CANVAS_W = 360
export const CANVAS_H = 720
export const CELL_SIZE = CANVAS_W / BOARD_COLS // 36

// ─── Speed curves ─────────────────────────────────────────────────────────────
// Seconds per row, levels 1–20 (index 0 = level 1)
export const MODERN_GRAVITY = [
  1.0, 0.793, 0.618, 0.473, 0.355, 0.262, 0.190, 0.135, 0.094, 0.064,
  0.043, 0.028, 0.018, 0.011, 0.007, 0.005, 0.003, 0.002, 0.001, 0.0005,
]

// Frames per cell at 60 fps, NES levels 0–29 (index 0 = level 0)
export const NES_GRAVITY_FRAMES = [
  48, 43, 38, 33, 28, 23, 18, 13, 8, 6,
   5,  5,  5,  4,  4,  4,  3,  3, 3, 2,
   2,  2,  2,  2,  2,  2,  2,  2, 2, 1,
]

// ─── Input timing ─────────────────────────────────────────────────────────────
export const DAS_DELAY = 167   // ms before auto-repeat starts
export const ARR_DELAY = 33    // ms between auto-repeat moves

// ─── Lock delay ───────────────────────────────────────────────────────────────
export const LOCK_DELAY     = 500   // ms
export const MAX_LOCK_RESETS = 15

// ─── ARE (classic entry delay) ────────────────────────────────────────────────
export const ARE_DELAY = 300   // ms

// ─── Scoring tables ───────────────────────────────────────────────────────────
// Modern scoring: base points per line count [0,single,double,triple,tetris]
export const MODERN_SCORE = {
  base: [0, 100, 300, 500, 800],
  tspin: [400, 800, 1200, 1600],
  tspin_mini: [100, 200, 400],
  back_to_back_multiplier: 1.5,
  combo_base: 50,
  soft_drop: 1,
  hard_drop: 2,
  perfect_clear_single: 800,
  perfect_clear_double: 1200,
  perfect_clear_triple: 1800,
  perfect_clear_tetris: 2000,
  perfect_clear_b2b_tetris: 3200,
}

// NES/Classic scoring
export const CLASSIC_SCORE = {
  base: [0, 40, 100, 300, 1200],
  soft_drop: 1,
  hard_drop: 2,
}

// ─── Power-ups ────────────────────────────────────────────────────────────────
export const POWERUP_DEFS = {
  bomb: {
    id: 'bomb',
    name: 'Bomb',
    description: 'Clears the bottom 2 rows instantly',
    icon: '💣',
    color: '#ef4444',
  },
  slow: {
    id: 'slow',
    name: 'Slow-Mo',
    description: 'Halves gravity for 8 seconds',
    icon: '⏱',
    color: '#3b82f6',
    duration: 8000,
  },
  ghost_clear: {
    id: 'ghost_clear',
    name: 'Ghost Clear',
    description: 'Removes all isolated cells from the board',
    icon: '👻',
    color: '#8b5cf6',
  },
  swap: {
    id: 'swap',
    name: 'Swap',
    description: 'Swap current piece with held piece (bypasses cooldown)',
    icon: '🔄',
    color: '#10b981',
  },
}

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'first_tetris',    name: 'First Tetris',      description: 'Clear 4 lines at once',             icon: '🔷' },
  { id: 'tspin_master',    name: 'T-Spin Master',     description: 'Perform a T-Spin',                  icon: '🌀' },
  { id: 'back_to_back',    name: 'Back-to-Back',      description: 'Achieve Back-to-Back Tetris',       icon: '🔗' },
  { id: 'perfect_clear',   name: 'Perfect Clear',     description: 'Clear the board completely',        icon: '✨' },
  { id: 'combo_5',         name: 'Combo x5',          description: 'Achieve a 5-combo',                 icon: '🔥' },
  { id: 'combo_10',        name: 'Combo x10',         description: 'Achieve a 10-combo',                icon: '💥' },
  { id: 'level_10',        name: 'Level 10',          description: 'Reach level 10 in marathon',        icon: '⬆️' },
  { id: 'level_20',        name: 'Level 20',          description: 'Reach the max level',               icon: '🏆' },
  { id: 'score_10k',       name: '10K Score',         description: 'Score 10,000 points',               icon: '🎯' },
  { id: 'score_100k',      name: '100K Score',        description: 'Score 100,000 points',              icon: '💎' },
  { id: 'sprint_sub2',     name: 'Speed Demon',       description: 'Complete 40-line sprint in under 2 minutes', icon: '⚡' },
  { id: 'sprint_sub1',     name: 'Blazing Fast',      description: 'Complete 40-line sprint in under 1 minute',  icon: '🚀' },
  { id: 'ultra_100k',      name: 'Ultra Champion',    description: 'Score 100,000 in 3-minute Ultra',   icon: '👑' },
  { id: 'daily_first',     name: 'Daily Starter',     description: 'Complete your first Daily Challenge', icon: '📅' },
  { id: 'daily_streak_7',  name: 'Weekly Warrior',    description: 'Complete 7 daily challenges in a row', icon: '🗓️' },
  { id: 'powerup_bomb',    name: 'Demolition',        description: 'Use the Bomb power-up',             icon: '💣' },
  { id: 'powerup_all',     name: 'Power Player',      description: 'Use all 4 power-ups',               icon: '⚡' },
  { id: 'survival_5min',   name: 'Survivor',          description: 'Survive 5 minutes in marathon',     icon: '🛡️' },
]

// ─── Skins ────────────────────────────────────────────────────────────────────
export const SKIN_IDS = ['classic', 'neon', 'crystal', 'retro', 'metallic', 'pastel', 'monochrome', 'wireframe']

export const SKIN_LABELS = {
  classic:     'Classic',
  neon:        'Neon',
  crystal:     'Crystal',
  retro:       'Retro',
  metallic:    'Metallic',
  pastel:      'Pastel',
  monochrome:  'Mono',
  wireframe:   'Wire',
}

// ─── Backgrounds ─────────────────────────────────────────────────────────────
export const BG_IDS = [
  'classic_dark', 'deep_space', 'neon_city', 'aurora',
  'underwater', 'lava_cave', 'matrix', 'forest_night',
]

export const BG_LABELS = {
  classic_dark:  'Classic',
  deep_space:    'Deep Space',
  neon_city:     'Neon City',
  aurora:        'Aurora',
  underwater:    'Underwater',
  lava_cave:     'Lava Cave',
  matrix:        'Matrix',
  forest_night:  'Forest Night',
}

// ─── Game modes ───────────────────────────────────────────────────────────────
export const GAME_MODES = {
  marathon: {
    id: 'marathon',
    name: 'Marathon',
    description: 'Race to level 20. Speed increases every 10 lines.',
    icon: '🏃',
  },
  sprint: {
    id: 'sprint',
    name: 'Sprint (40L)',
    description: 'Clear 40 lines as fast as possible.',
    icon: '⚡',
  },
  ultra: {
    id: 'ultra',
    name: 'Ultra',
    description: 'Score as many points as possible in 3 minutes.',
    icon: '🔥',
  },
  blitz: {
    id: 'blitz',
    name: 'Blitz',
    description: 'How long can you survive with increasing gravity?',
    icon: '💀',
  },
  daily: {
    id: 'daily',
    name: 'Daily Challenge',
    description: 'A seeded board — same challenge for everyone today.',
    icon: '📅',
  },
}

// ─── localStorage keys ────────────────────────────────────────────────────────
export const LS = {
  SETTINGS:           'tetris_settings',
  PLAYER_NAME:        'tetris_player_name',
  HIGH_SCORE:         'tetris_high_score',
  MARATHON_BEST:      'tetris_marathon_best',
  SPRINT_BEST:        'tetris_sprint_best',
  ULTRA_BEST:         'tetris_ultra_best',
  LEADERBOARD:        'tetris_leaderboard',
  ACHIEVEMENTS:       'tetris_achievements',
  DAILY_DATE:         'tetris_daily_date',
  DAILY_SCORE:        'tetris_daily_score',
  DAILY_STREAK:       'tetris_daily_streak',
  TOTAL_GAMES:        'tetris_total_games',
  UNLOCKED_SKINS:     'tetris_unlocked_skins',
}

// ─── Default settings ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  skin:           'classic',
  background:     'classic_dark',
  musicTrack:     'classic_dark',
  musicVolume:    0.4,
  sfxVolume:      0.6,
  ghostPiece:     true,
  showGrid:       true,
  rotationSystem: 'modern',  // 'modern' | 'classic'
  dasDelay:       DAS_DELAY,
  arrDelay:       ARR_DELAY,
}
