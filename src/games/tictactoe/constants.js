// ─── Board Modes ───────────────────────────────────────────────────────────────
export const BOARD_MODES = {
  classic:  { id: 'classic',  label: 'Classic',  size: 3,  winLength: 3, description: '3×3 · First to 3-in-a-row wins' },
  extended: { id: 'extended', label: 'Extended', size: 5,  winLength: 4, description: '5×5 · First to 4-in-a-row wins' },
  gomoku:   { id: 'gomoku',   label: 'Gomoku',   size: 15, winLength: 5, description: '15×15 · First to 5-in-a-row wins' },
}

// ─── AI Difficulties ───────────────────────────────────────────────────────────
export const AI_DIFFICULTIES = {
  easy:       { id: 'easy',       label: 'Easy',       description: 'Makes random moves' },
  medium:     { id: 'medium',     label: 'Medium',     description: 'Wins or blocks when it can' },
  hard:       { id: 'hard',       label: 'Hard',       description: 'Depth-limited minimax' },
  unbeatable: { id: 'unbeatable', label: 'Unbeatable', description: 'Perfect play — impossible to beat' },
}

// ─── Minimax Search Depth ──────────────────────────────────────────────────────
export const MINIMAX_DEPTH = {
  hard:       { classic: 6, extended: 4, gomoku: 3 },
  unbeatable: { classic: 20, extended: 7, gomoku: 4 },
}

// ─── Series Modes ─────────────────────────────────────────────────────────────
export const SERIES_MODES = [
  { id: 'single', label: 'Single',    wins: 1 },
  { id: 'bo3',    label: 'Best of 3', wins: 2 },
  { id: 'bo5',    label: 'Best of 5', wins: 3 },
  { id: 'bo7',    label: 'Best of 7', wins: 4 },
]

// ─── Player Colors ─────────────────────────────────────────────────────────────
export const P1_COLOR = '#3b82f6'   // blue
export const P2_COLOR = '#f97316'   // orange

// ─── Power-ups ────────────────────────────────────────────────────────────────
// Each player gets 1 use of EACH power-up per game when powerupsOn = true
export const POWER_UPS = {
  block:      { id: 'block',      icon: '🚫', label: 'Block',      description: 'Block an empty cell — no one can place there.' },
  swap:       { id: 'swap',       icon: '🔄', label: 'Swap',       description: "Remove one of your opponent's pieces, then place yours." },
  extra_turn: { id: 'extra_turn', icon: '⚡', label: 'Extra Turn', description: 'Place your piece and take another turn immediately.' },
}

// ─── Timer Options ────────────────────────────────────────────────────────────
export const TIMER_OPTIONS = [
  { value: 0,  label: 'Off' },
  { value: 5,  label: '5s'  },
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
]

// ─── Avatars ─────────────────────────────────────────────────────────────────
export const AVATAR_GROUPS = [
  { group: 'Animals',  avatars: ['🐶', '🐱', '🦊', '🐺'] },
  { group: 'Fantasy',  avatars: ['🧙', '🧝', '🧚', '🧜'] },
  { group: 'Space',    avatars: ['👽', '🚀', '🌙', '⭐'] },
  { group: 'Nature',   avatars: ['🌿', '🔥', '💧', '⚡'] },
  { group: 'Food',     avatars: ['🍕', '🍔', '🍩', '🌮'] },
  { group: 'Sports',   avatars: ['⚽', '🏀', '🎯', '🎮'] },
  { group: 'Symbols',  avatars: ['💎', '👑', '🏆', '⚔️'] },
]

export const ALL_AVATARS = AVATAR_GROUPS.flatMap(g => g.avatars)

// ─── Default Settings ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  boardMode:    'classic',
  vsAI:         true,
  aiDifficulty: 'medium',
  seriesMode:   'single',
  powerupsOn:   false,
  timerSeconds: 0,
}

// ─── localStorage Keys ────────────────────────────────────────────────────────
export const LS_P1_NAME   = 'ttt_p1_name'
export const LS_P2_NAME   = 'ttt_p2_name'
export const LS_P1_AVATAR = 'ttt_p1_avatar'
export const LS_P2_AVATAR = 'ttt_p2_avatar'
export const LS_SETTINGS  = 'ttt_settings'
export const LS_HISTORY   = 'ttt_history'
export const HISTORY_MAX  = 200
