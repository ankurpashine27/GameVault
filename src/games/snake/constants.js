export const GRID_SIZES = [
  { id: 10, label: '10×10', name: 'Tiny'   },
  { id: 16, label: '16×16', name: 'Small'  },
  { id: 20, label: '20×20', name: 'Medium' },
  { id: 32, label: '32×32', name: 'Large'  },
]

export const DEFAULT_GRID_SIZE = 20

export const DIFFICULTIES = {
  casual:   { name: 'Casual',   speed: 200, wallLethal: false, obstacles: 'none',   multiplier: 1,   description: 'Walls wrap around. Chill vibes.' },
  classic:  { name: 'Classic',  speed: 150, wallLethal: true,  obstacles: 'none',   multiplier: 1.5, description: 'Lethal walls. The real deal.' },
  hardcore: { name: 'Hardcore', speed: 100, wallLethal: true,  obstacles: 'static', multiplier: 2,   description: 'Lethal walls + static obstacles.' },
  insane:   { name: 'Insane',   speed: 65,  wallLethal: true,  obstacles: 'moving', multiplier: 3,   description: 'Maximum speed. Obstacles move.' },
}

// Scoring base values (all multiplied by difficulty.multiplier)
export const SCORE_FOOD_BASE   = 10
export const SCORE_BONUS_FOOD  = 50
export const SCORE_SPEED_BOOST = 30
export const SCORE_SHRINK_PILL = 20

// Power-up durations in ms (0 = instant effect)
export const POWER_UP_DURATION = {
  bonus_food:       8000,
  speed_boost:      5000,
  score_multiplier: 8000,
  shrink_pill:      0,
  shield:           0,
}

export const POWER_UP_SPAWN_MIN    = 10000  // ms
export const POWER_UP_SPAWN_MAX    = 20000  // ms
export const POWER_UP_SPEED_FACTOR = 0.6   // Speed Boost: interval × this = faster
export const MOVING_OBSTACLE_INTERVAL = 3000

export const OBSTACLE_COUNT = { 10: 3, 16: 5, 20: 8, 32: 15 }

export const POWER_UP_TYPES = {
  bonus_food:       { id: 'bonus_food',       icon: '⭐', label: 'Bonus Food',       color: '#fbbf24', points: 50 },
  speed_boost:      { id: 'speed_boost',      icon: '⚡', label: 'Speed Boost',      color: '#3b82f6', points: 30 },
  score_multiplier: { id: 'score_multiplier', icon: '×2', label: 'Score ×2',         color: '#a855f7', points: 0  },
  shrink_pill:      { id: 'shrink_pill',      icon: '💊', label: 'Shrink',           color: '#10b981', points: 20 },
  shield:           { id: 'shield',           icon: '🛡', label: 'Shield',           color: '#f59e0b', points: 0  },
}

export const SKINS = {
  classic: { id: 'classic', name: 'Classic', head: '#22c55e', body: '#16a34a', tail: '#15803d', glow: null       },
  neon:    { id: 'neon',    name: 'Neon',    head: '#06b6d4', body: '#0891b2', tail: '#0e7490', glow: '#06b6d4'  },
  fire:    { id: 'fire',    name: 'Fire',    head: '#f97316', body: '#dc2626', tail: '#991b1b', glow: '#f97316'  },
  ice:     { id: 'ice',     name: 'Ice',     head: '#bae6fd', body: '#7dd3fc', tail: '#38bdf8', glow: '#bae6fd'  },
  galaxy:  { id: 'galaxy',  name: 'Galaxy',  head: '#a855f7', body: '#7c3aed', tail: '#5b21b6', glow: '#a855f7'  },
  gold:    { id: 'gold',    name: 'Gold',    head: '#fbbf24', body: '#d97706', tail: '#b45309', glow: '#fbbf24'  },
  toxic:   { id: 'toxic',   name: 'Toxic',   head: '#a3e635', body: '#65a30d', tail: '#3f6212', glow: '#a3e635'  },
  shadow:  { id: 'shadow',  name: 'Shadow',  head: '#4b5563', body: '#374151', tail: '#1f2937', glow: null       },
}

export const DEFAULT_SETTINGS = {
  gridSize: 20,
  difficulty: 'classic',
  powerupsOn: true,
  controlScheme: 'keyboard',
}

export const LS_PLAYER_NAME    = 'snake_player_name'
export const LS_SKIN           = 'snake_skin'
export const LS_SETTINGS       = 'snake_settings'
export const LS_LEADERBOARD    = 'snake_leaderboard'
export const LS_PERSONAL_BESTS = 'snake_personal_bests'

export const LEADERBOARD_MAX_STORED = 100
export const LEADERBOARD_MAX_SHOWN  = 20

// Head border-radius based on direction of travel (rounded on the leading edge)
export const HEAD_RADIUS = {
  RIGHT: '4px 40% 40% 4px',
  LEFT:  '40% 4px 4px 40%',
  UP:    '40% 40% 4px 4px',
  DOWN:  '4px 4px 40% 40%',
}

// Body border-radius by segment index (tighter at tail, looser at body)
export const BODY_RADIUS = '4px'
export const TAIL_RADIUS = '40%'
