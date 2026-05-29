// ─── Math helpers ─────────────────────────────────────────────────────────────
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

// Linear congruential generator seeded RNG
export function seededRandom(seed) {
  let s = seed >>> 0
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dailySeed() {
  const str = todayStr()
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
export function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────
export function formatTime(ms) {
  if (!ms && ms !== 0) return '0:00.00'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const centisec = Math.floor((ms % 1000) / 10)
  return `${m}:${String(s).padStart(2, '0')}.${String(centisec).padStart(2, '0')}`
}

// ─── Device detection ─────────────────────────────────────────────────────────
export function isTouchDevice() {
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0)
  )
}

// ─── T-Spin detection (3-corner rule) ─────────────────────────────────────────
// Returns 'full' | 'mini' | null
// corners: top-left, top-right, bottom-left, bottom-right of 3×3 bounding box
export function checkTSpin(board, piece, lastActionWasRotation) {
  if (!lastActionWasRotation) return null
  if (!piece || piece.type !== 'T') return null

  const { row, col, rotation } = piece
  // 3×3 bounding box corners relative to piece origin
  const corners = [
    [row,     col    ],
    [row,     col + 2],
    [row + 2, col    ],
    [row + 2, col + 2],
  ]

  const ROWS = board.length
  const COLS = board[0]?.length ?? 10

  let filledCorners = 0
  for (const [r, c] of corners) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c]) {
      filledCorners++
    }
  }

  if (filledCorners < 3) return null

  // Front corners (the two corners the T "faces")
  const frontCorners = {
    0: [[row,     col    ], [row,     col + 2]],  // facing up    → top corners
    1: [[row,     col + 2], [row + 2, col + 2]],  // facing right → right corners
    2: [[row + 2, col    ], [row + 2, col + 2]],  // facing down  → bottom corners
    3: [[row,     col    ], [row + 2, col    ]],   // facing left  → left corners
  }

  const fc = frontCorners[rotation] ?? frontCorners[0]
  let frontFilled = 0
  for (const [r, c] of fc) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c]) {
      frontFilled++
    }
  }

  if (frontFilled === 2) return 'full'
  return 'mini'
}
