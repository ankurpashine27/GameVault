/**
 * Pulse Rush — Central constants.
 * ALL magic numbers (resolution, physics, beat width, portal effects,
 * icon-unlock thresholds, etc.) live here per the design spec.
 */

// ─── Logical resolution ───────────────────────────────────────────────────────
export const LOGICAL_W = 854
export const LOGICAL_H = 480

export const TILE = 32                       // 1 grid unit in px
export const PLAYER_X = Math.round(LOGICAL_W * 0.25) // player horizontal anchor

// Ground & ceiling bars
export const GROUND_H = 70
export const CEIL_H = 70
export const GROUND_Y = LOGICAL_H - GROUND_H // top edge of the floor bar
export const CEIL_Y = CEIL_H                 // bottom edge of the ceiling bar
export const PLAY_TOP = CEIL_Y
export const PLAY_BOTTOM = GROUND_Y

// ─── Beat / scroll ─────────────────────────────────────────────────────────────
// beatWidth = pixels scrolled per beat. With BASE_SPEED_PPS px/sec at speed ×1
// and a beat interval of (60/bpm) sec, beatWidth = BASE_SPEED_PPS * 60 / bpm.
// We instead fix beatWidth and derive scroll px/sec from it so spacing is
// visually consistent across BPMs (a "beat" is always the same distance).
export const BEAT_WIDTH = 140                // px per beat at speed ×1
export const SPEED_MULTIPLIERS = {
  0.5: 0.5, 1: 1, 1.5: 1.5, 2: 2, 3: 3,
}

// ─── Physics (tuned at speed ×1, scaled by speed where noted) ──────────────────
export const GRAVITY = {
  cube:  2600,
  ball:  2600,
  ufo:   1700,
  robot: 2600,
  spider: 0,      // instantaneous, no gravity integration
  swing: 2200,
  ship:  1150,    // downward pull while not thrusting (gentle for fine control)
  ufo:   1500,
}
export const JUMP_VELOCITY = {
  cube:  -780,
  robotMin: -560,
  robotMax: -980,
  ufo:   -540,
  swing: -640,
}
// Ship thrust is symmetric with ship gravity so holding rises as fast as
// releasing falls — and vertical speed is capped (SHIP_MAX_VY) so it never
// runs away into a "slow then suddenly fast" feel.
export const SHIP_THRUST = -2300      // upward accel while held (net ≈ -1150)
export const SHIP_MAX_VY = 290        // cap |vy| for the ship (× speedScale)
export const UFO_MAX_VY = 600         // cap |vy| for the UFO  (× speedScale)
export const WAVE_SLOPE = 1           // 45° → |vy| == scroll px/sec
export const TERMINAL_VY = 1400
export const DOUBLE_JUMP = true

// Orb / pad impulses
export const ORB_IMPULSE = {
  yellow: -820,
  pink:   -560,
  blue:   -820,   // + gravity flip
  green:  0,      // gravity flip only
  red:     760,
  black:  -760,   // reverse momentum + flip
}
export const PAD_IMPULSE = {
  yellow: -900,
  pink:   -600,
  blue:   -820,
  red:     780,
}

// ─── Input buffering ───────────────────────────────────────────────────────────
export const DEFAULT_BUFFER_FRAMES = 3
export const MAX_BUFFER_FRAMES = 5

// ─── Sizes ─────────────────────────────────────────────────────────────────────
export const MINI_SCALE = 0.5

// ─── Practice ──────────────────────────────────────────────────────────────────
export const MAX_CHECKPOINTS = 5

// ─── Forms & portals ───────────────────────────────────────────────────────────
export const FORMS = ['cube', 'ship', 'ball', 'ufo', 'wave', 'robot', 'spider', 'swing']
export const FORM_LABELS = {
  cube: 'Cube', ship: 'Ship', ball: 'Ball', ufo: 'UFO',
  wave: 'Wave', robot: 'Robot', spider: 'Spider', swing: 'Swing',
}

// ─── Difficulty metadata ───────────────────────────────────────────────────────
export const DIFFICULTIES = {
  auto:          { label: 'Auto',          color: '#3fb950', tier: 0, demon: false },
  easy:          { label: 'Easy',          color: '#56d364', tier: 1, demon: false },
  normal:        { label: 'Normal',        color: '#d29922', tier: 2, demon: false },
  hard:          { label: 'Hard',          color: '#db6d28', tier: 3, demon: false },
  harder:        { label: 'Harder',        color: '#f85149', tier: 4, demon: false },
  insane:        { label: 'Insane',        color: '#da3633', tier: 5, demon: false },
  demon_easy:    { label: 'Demon (Easy)',  color: '#8957e5', tier: 6, demon: true },
  demon_medium:  { label: 'Demon (Med)',   color: '#6e40c9', tier: 7, demon: true },
  demon_hard:    { label: 'Demon (Hard)',  color: '#a371f7', tier: 8, demon: true },
  demon_insane:  { label: 'Demon (Insane)', color: '#bc8cff', tier: 9, demon: true },
  demon_extreme: { label: 'Demon (Extreme)', color: '#ff7b72', tier: 10, demon: true },
}

// Stars awarded for completing a level in Normal mode, by difficulty.
export const DIFFICULTY_STARS = {
  auto: 1, easy: 3, normal: 5, hard: 7, harder: 9, insane: 10,
  demon_easy: 10, demon_medium: 10, demon_hard: 10,
  demon_insane: 10, demon_extreme: 10,
}

// ─── Infinite mode tiers ───────────────────────────────────────────────────────
export const INFINITE_TIERS = [
  { from: 0,   to: 50,   forms: ['cube', 'ship'],                           speedRange: [1, 1] },
  { from: 50,  to: 150,  forms: ['cube', 'ship', 'ball', 'ufo'],            speedRange: [1, 1.5] },
  { from: 150, to: 300,  forms: ['cube', 'ship', 'ball', 'ufo', 'wave', 'robot'], speedRange: [1.5, 2] },
  { from: 300, to: 500,  forms: FORMS,                                      speedRange: [2, 2] },
  { from: 500, to: Infinity, forms: FORMS,                                  speedRange: [2, 3] },
]

// ─── Icon kit ──────────────────────────────────────────────────────────────────
export const ICONS_PER_FORM = 15
export const TOTAL_ICONS = ICONS_PER_FORM * FORMS.length // 120
export const DEFAULT_UNLOCKED_PER_FORM = 3
export const STAR_MILESTONES = [10, 25, 50, 100, 150, 200]
export const COIN_MILESTONES = [25, 75, 150]
export const TRAIL_STYLES = ['none', 'default', 'fire', 'electric', 'rainbow', 'neon']
export const DEATH_EFFECTS = ['explosion', 'shatter', 'implode', 'vaporize']

// ─── Tips (Game Over screen) ───────────────────────────────────────────────────
export const TIPS = [
  'The spikes are not your friends.',
  'Hold to fly. Let go to fall. Revolutionary.',
  'Practice mode exists for a reason.',
  'The wave does not forgive. Neither does gravity.',
  'Every demon was once a beginner. A very persistent beginner.',
  'Tap to the beat — it really does help.',
  'That coin? You did not need it. (You did.)',
  'Mini portals: small player, big problems.',
  'Death is just attempt N+1 in disguise.',
  'The ship hates ceilings. Respect the ceiling.',
  'Spider: blink and you teleport. Literally.',
  'Robots jump higher the longer you believe in them.',
]

// ─── localStorage keys ─────────────────────────────────────────────────────────
export const LS = {
  PLAYER_NAME:    'gd_player_name',
  ICON_CONFIG:    'gd_icon_config',
  PROGRESS:       'gd_progress',
  CURRENCY:       'gd_currency',
  ACHIEVEMENTS:   'gd_achievements',
  ICONS_UNLOCKED: 'gd_icons_unlocked',
  LEADERBOARD:    'gd_leaderboard',
  INFINITE_BEST:  'gd_infinite_best',
  SETTINGS:       'gd_settings',
  STATS:          'gd_stats',
}

export const DEFAULT_SETTINGS = {
  musicVolume: 0.6,
  sfxVolume: 0.7,
  showHitbox: false,
  inputBufferFrames: DEFAULT_BUFFER_FRAMES,
}
