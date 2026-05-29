// ─── Tetromino definitions (SRS + Classic) ────────────────────────────────────
// Each rotation state is a 4×4 grid stored as a flat array of 16 booleans.
// Index layout: row * 4 + col.

// Helper to convert a string map into a cell array
function parseGrid(strings) {
  return strings.map(row => row.split('').map(c => c !== '.'))
}

// SRS rotation states for each piece
const SRS_STATES = {
  I: [
    parseGrid([
      '....',
      'XXXX',
      '....',
      '....',
    ]),
    parseGrid([
      '..X.',
      '..X.',
      '..X.',
      '..X.',
    ]),
    parseGrid([
      '....',
      '....',
      'XXXX',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.X..',
      '.X..',
      '.X..',
    ]),
  ],
  O: [
    parseGrid([
      '.XX.',
      '.XX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.XX.',
      '.XX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.XX.',
      '.XX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.XX.',
      '.XX.',
      '....',
      '....',
    ]),
  ],
  T: [
    parseGrid([
      '.X..',
      'XXX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.XX.',
      '.X..',
      '....',
    ]),
    parseGrid([
      '....',
      'XXX.',
      '.X..',
      '....',
    ]),
    parseGrid([
      '.X..',
      'XX..',
      '.X..',
      '....',
    ]),
  ],
  S: [
    parseGrid([
      '.XX.',
      'XX..',
      '....',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.XX.',
      '..X.',
      '....',
    ]),
    parseGrid([
      '....',
      '.XX.',
      'XX..',
      '....',
    ]),
    parseGrid([
      'X...',
      'XX..',
      '.X..',
      '....',
    ]),
  ],
  Z: [
    parseGrid([
      'XX..',
      '.XX.',
      '....',
      '....',
    ]),
    parseGrid([
      '..X.',
      '.XX.',
      '.X..',
      '....',
    ]),
    parseGrid([
      '....',
      'XX..',
      '.XX.',
      '....',
    ]),
    parseGrid([
      '.X..',
      'XX..',
      'X...',
      '....',
    ]),
  ],
  J: [
    parseGrid([
      'X...',
      'XXX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.XX.',
      '.X..',
      '.X..',
      '....',
    ]),
    parseGrid([
      '....',
      'XXX.',
      '..X.',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.X..',
      'XX..',
      '....',
    ]),
  ],
  L: [
    parseGrid([
      '..X.',
      'XXX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.X..',
      '.XX.',
      '....',
    ]),
    parseGrid([
      '....',
      'XXX.',
      'X...',
      '....',
    ]),
    parseGrid([
      'XX..',
      '.X..',
      '.X..',
      '....',
    ]),
  ],
}

// NES (classic) rotation states — simpler, 2-state for most pieces
const NES_STATES = {
  I: [
    parseGrid([
      '....',
      'XXXX',
      '....',
      '....',
    ]),
    parseGrid([
      '..X.',
      '..X.',
      '..X.',
      '..X.',
    ]),
    parseGrid([
      '....',
      'XXXX',
      '....',
      '....',
    ]),
    parseGrid([
      '..X.',
      '..X.',
      '..X.',
      '..X.',
    ]),
  ],
  O: SRS_STATES.O, // O has no rotation
  T: [
    parseGrid([
      '.X..',
      'XXX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.XX.',
      '.X..',
      '....',
    ]),
    parseGrid([
      '....',
      'XXX.',
      '.X..',
      '....',
    ]),
    parseGrid([
      '.X..',
      'XX..',
      '.X..',
      '....',
    ]),
  ],
  S: [
    parseGrid([
      '.XX.',
      'XX..',
      '....',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.XX.',
      '..X.',
      '....',
    ]),
    parseGrid([
      '.XX.',
      'XX..',
      '....',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.XX.',
      '..X.',
      '....',
    ]),
  ],
  Z: [
    parseGrid([
      'XX..',
      '.XX.',
      '....',
      '....',
    ]),
    parseGrid([
      '..X.',
      '.XX.',
      '.X..',
      '....',
    ]),
    parseGrid([
      'XX..',
      '.XX.',
      '....',
      '....',
    ]),
    parseGrid([
      '..X.',
      '.XX.',
      '.X..',
      '....',
    ]),
  ],
  J: [
    parseGrid([
      'X...',
      'XXX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.XX.',
      '.X..',
      '.X..',
      '....',
    ]),
    parseGrid([
      '....',
      'XXX.',
      '..X.',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.X..',
      'XX..',
      '....',
    ]),
  ],
  L: [
    parseGrid([
      '..X.',
      'XXX.',
      '....',
      '....',
    ]),
    parseGrid([
      '.X..',
      '.X..',
      '.XX.',
      '....',
    ]),
    parseGrid([
      '....',
      'XXX.',
      'X...',
      '....',
    ]),
    parseGrid([
      'XX..',
      '.X..',
      '.X..',
      '....',
    ]),
  ],
}

// Color IDs per piece type
export const PIECE_COLORS = {
  I: 'I',
  O: 'O',
  T: 'T',
  S: 'S',
  Z: 'Z',
  J: 'J',
  L: 'L',
}

// Spawn positions (row, col) — top of board
const SPAWN_POSITIONS = {
  I: { row: 0, col: 0 },
  O: { row: 0, col: 0 },
  T: { row: 0, col: 0 },
  S: { row: 0, col: 0 },
  Z: { row: 0, col: 0 },
  J: { row: 0, col: 0 },
  L: { row: 0, col: 0 },
}

export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

/**
 * Get the cells occupied by a piece at a given rotation state.
 * Returns array of {row, col} in board-space.
 */
export function getOccupiedCells(piece) {
  const { type, rotation, row: pr, col: pc, system = 'modern' } = piece
  const states = system === 'classic' ? NES_STATES : SRS_STATES
  const grid = states[type]?.[rotation & 3]
  if (!grid) return []

  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c]) {
        cells.push({ row: pr + r, col: pc + c })
      }
    }
  }
  return cells
}

/**
 * Get the raw 4×4 grid for a piece at a given rotation.
 */
export function getPieceGrid(type, rotation, system = 'modern') {
  const states = system === 'classic' ? NES_STATES : SRS_STATES
  return states[type]?.[rotation & 3] ?? []
}

/**
 * Spawn a new piece of the given type at the top of the board.
 */
export function spawnPiece(type, system = 'modern') {
  const spawn = SPAWN_POSITIONS[type] ?? { row: 0, col: 0 }
  // Center the piece horizontally (board is 10 wide, piece is 4 wide → offset 3)
  const spawnCol = type === 'O' ? 3 : 3
  return {
    type,
    rotation: 0,
    row: spawn.row,
    col: spawnCol,
    system,
    colorId: PIECE_COLORS[type],
  }
}

export const PIECES = { SRS: SRS_STATES, NES: NES_STATES }
