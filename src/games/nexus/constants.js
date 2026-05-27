// ── Nexus Game Constants ──────────────────────────────────────────────────────

export const MODES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    icon: '🎯',
    description: 'One puzzle — reveal hints one by one, guess after each.',
  },
  streak: {
    id: 'streak',
    name: 'Streak',
    icon: '🔥',
    description: 'Chain puzzles until you get one wrong. How far can you go?',
  },
  time_attack: {
    id: 'time_attack',
    name: 'Time Attack',
    icon: '⚡',
    description: '10 puzzles, 2 minutes — race against the clock.',
  },
  reverse: {
    id: 'reverse',
    name: 'Reverse',
    icon: '🔄',
    description: 'All 5 hints shown at once — but you only get 2 guesses.',
  },
  filter: {
    id: 'filter',
    name: 'Category Filter',
    icon: '🔍',
    description: 'Practice a specific theme of your choice.',
  },
  daily: {
    id: 'daily',
    name: 'Daily',
    icon: '📅',
    description: 'One puzzle per day — same for everyone. Track your streak.',
  },
}

export const THEMES = [
  'animals', 'foods', 'sports', 'movies', 'music', 'geography', 'science',
  'technology', 'history', 'books', 'art', 'colors', 'nature', 'space',
  'mythology', 'languages', 'fashion', 'architecture', 'mathematics',
  'health', 'transportation', 'games', 'weather', 'emotions', 'pop_culture',
]

export const THEME_LABELS = {
  animals:       'Animals',
  foods:         'Foods & Drinks',
  sports:        'Sports',
  movies:        'Movies & TV',
  music:         'Music',
  geography:     'Geography',
  science:       'Science',
  technology:    'Technology',
  history:       'History',
  books:         'Books & Literature',
  art:           'Art',
  colors:        'Colors & Shades',
  nature:        'Plants & Nature',
  space:         'Space & Astronomy',
  mythology:     'Mythology & Legends',
  languages:     'Languages',
  fashion:       'Fashion & Style',
  architecture:  'Architecture',
  mathematics:   'Mathematics',
  health:        'Health & Medicine',
  transportation:'Transportation',
  games:         'Games & Hobbies',
  weather:       'Weather & Seasons',
  emotions:      'Emotions & Psychology',
  pop_culture:   'Pop Culture',
}

// Points awarded based on hints used (index = hintsUsed - 1, so 1 hint = 500, 5 hints = 100)
export const SCORE_TABLE          = [500, 400, 300, 200, 100]
export const SCORE_REVERSE_FIRST  = 500
export const SCORE_REVERSE_SECOND = 250

export const TIME_ATTACK_PUZZLES    = 10    // puzzles per Time Attack session
export const TIME_ATTACK_TIME_BONUS = 10    // bonus points per second remaining at end
export const TIME_ATTACK_TOTAL_SECS = 120   // 2 minutes total

// localStorage keys — all prefixed "nexus_" to avoid collisions
export const LS_PLAYER_NAME    = 'nexus_player_name'
export const LS_MODE           = 'nexus_mode'
export const LS_FILTER_THEME   = 'nexus_filter_theme'
export const LS_LEADERBOARD    = 'nexus_leaderboard'
export const LS_STREAK_RECORDS = 'nexus_streak_records'
export const LS_DAILY_HISTORY  = 'nexus_daily_history'
export const LS_DAILY_STREAK   = 'nexus_daily_streak'
export const LS_PERSONAL_BESTS = 'nexus_personal_bests'

export const LEADERBOARD_MAX   = 100
export const LEADERBOARD_SHOWN = 20
