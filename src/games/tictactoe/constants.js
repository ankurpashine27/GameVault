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
// Classic (3×3): depth 9 = full game tree — solves it perfectly in <1 ms with
//   alpha-beta + move ordering (was 20, but tree max is 9 anyway).
// Extended (5×5): dropped 7 → 5.  With move ordering + candidate moves (radius 1)
//   this runs in ~50–200 ms and plays at the same effective strength because
//   ordering means alpha-beta now prunes ~95 % of the tree that was previously
//   explored exhaustively.
// Gomoku (15×15): depth 4 kept; ordering + candidates already constrain it well.
export const MINIMAX_DEPTH = {
  hard:       { classic: 6, extended: 4, gomoku: 3 },
  unbeatable: { classic: 9, extended: 5, gomoku: 4 },
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

// ─── Backgrounds ──────────────────────────────────────────────────────────────
// `light: true` means the background is light-colored (affects text/icon contrast)
export const BACKGROUNDS = {
  dark:     { id: 'dark',     label: 'Dark',        bg: '#080B14', grid: '#1E3A5F', glow: '#3b82f6' },
  neon:     { id: 'neon',     label: 'Neon',        bg: '#050010', grid: '#00FFFF', glow: '#00FFFF' },
  wood:     { id: 'wood',     label: 'Wood',        bg: '#2C1A0E', grid: '#6B3A1F', glow: '#D97706' },
  space:    { id: 'space',    label: 'Space',       bg: '#000510', grid: '#1E293B', glow: '#818CF8' },
  marble:   { id: 'marble',   label: 'Marble',      bg: '#E2E8F0', grid: '#94A3B8', glow: '#3B82F6', light: true },
  midnight: { id: 'midnight', label: 'Midnight',    bg: '#020617', grid: '#1E3A8A', glow: '#60A5FA' },
}

// ─── Music Tracks ─────────────────────────────────────────────────────────────
export const MUSIC_TRACKS = {
  none:    { id: 'none',    label: 'Off',     icon: '🔇' },
  ambient: { id: 'ambient', label: 'Ambient', icon: '🌊' },
  tense:   { id: 'tense',   label: 'Tense',   icon: '⚡' },
  retro:   { id: 'retro',   label: 'Retro',   icon: '🎮' },
}

// ─── Default Settings ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  boardMode:    'classic',
  vsAI:         true,
  aiDifficulty: 'medium',
  seriesMode:   'single',
  powerupsOn:   false,
  timerSeconds: 0,
  background:   'dark',
  musicTrack:   'ambient',
  musicVol:     0.35,
  sfxVol:       1.0,
}

// ─── localStorage Keys ────────────────────────────────────────────────────────
export const LS_P1_NAME   = 'ttt_p1_name'
export const LS_P2_NAME   = 'ttt_p2_name'
export const LS_P1_AVATAR = 'ttt_p1_avatar'
export const LS_P2_AVATAR = 'ttt_p2_avatar'
export const LS_SETTINGS  = 'ttt_settings'
export const LS_HISTORY   = 'ttt_history'
export const HISTORY_MAX  = 200
