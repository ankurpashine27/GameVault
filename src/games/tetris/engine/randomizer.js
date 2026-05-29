import { PIECE_TYPES } from './tetrominoes.js'
import { seededRandom } from '../utils.js'

// ─── Shuffle in-place using Fisher-Yates ─────────────────────────────────────
function shuffle(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ─── 7-Bag Randomizer (modern SRS standard) ──────────────────────────────────
export class SevenBagRandomizer {
  constructor() {
    this._bag = []
    this._fill()
  }

  _fill() {
    this._bag = shuffle([...PIECE_TYPES])
  }

  next() {
    if (!this._bag.length) this._fill()
    return this._bag.pop()
  }

  peek(n = 1) {
    const result = []
    let bag = [...this._bag]
    let extra = []

    while (result.length < n) {
      if (!bag.length) {
        bag = shuffle([...PIECE_TYPES])
        extra = bag
      }
      result.push(bag[bag.length - 1 - (result.length - (this._bag.length - bag.length))])
    }

    // Simpler approach — pre-fill and slice
    return this._peekSimple(n)
  }

  _peekSimple(n) {
    const result = []
    let bag1 = [...this._bag]

    for (let i = bag1.length - 1; i >= 0 && result.length < n; i--) {
      result.push(bag1[i])
    }

    if (result.length < n) {
      const bag2 = shuffle([...PIECE_TYPES])
      for (let i = bag2.length - 1; i >= 0 && result.length < n; i--) {
        result.push(bag2[i])
      }
    }

    if (result.length < n) {
      const bag3 = shuffle([...PIECE_TYPES])
      for (let i = bag3.length - 1; i >= 0 && result.length < n; i--) {
        result.push(bag3[i])
      }
    }

    return result.slice(0, n)
  }
}

// ─── Classic NES-style randomizer ────────────────────────────────────────────
// Re-rolls once if same as last piece. Picks from a history pool.
export class ClassicRandomizer {
  constructor() {
    this._last = null
    this._history = [...PIECE_TYPES]
  }

  next() {
    let piece = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
    // Reroll once if same as last
    if (piece === this._last) {
      piece = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
    }
    this._last = piece
    return piece
  }

  peek(n = 1) {
    // Classic only shows 1 next piece
    return [this._last ?? PIECE_TYPES[0]]
  }
}

// ─── Seeded Randomizer (for Daily Challenge) ──────────────────────────────────
export class SeededRandomizer extends SevenBagRandomizer {
  constructor(seed) {
    super()
    this._rng = seededRandom(seed)
    // Re-fill with seeded RNG
    this._bag = this._seededFill()
  }

  _seededFill() {
    return shuffle([...PIECE_TYPES], this._rng)
  }

  _fill() {
    this._bag = this._seededFill()
  }
}
