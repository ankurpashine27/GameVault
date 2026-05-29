import { getOccupiedCells, getPieceGrid } from './tetrominoes.js'
import { isValidPosition } from './board.js'

// ─── SRS Wall Kick Tables ─────────────────────────────────────────────────────
// Each entry: [rowOffset, colOffset]
// Format: kicks[fromState][toState] = [[dr, dc], ...]

const JLSTZ_KICKS = {
  '0>1': [[ 0, 0], [ 0,-1], [ 1,-1], [-2, 0], [-2,-1]],
  '1>0': [[ 0, 0], [ 0, 1], [-1, 1], [ 2, 0], [ 2, 1]],
  '1>2': [[ 0, 0], [ 0, 1], [-1, 1], [ 2, 0], [ 2, 1]],
  '2>1': [[ 0, 0], [ 0,-1], [ 1,-1], [-2, 0], [-2,-1]],
  '2>3': [[ 0, 0], [ 0, 1], [ 1, 1], [-2, 0], [-2, 1]],
  '3>2': [[ 0, 0], [ 0,-1], [-1,-1], [ 2, 0], [ 2,-1]],
  '3>0': [[ 0, 0], [ 0,-1], [-1,-1], [ 2, 0], [ 2,-1]],
  '0>3': [[ 0, 0], [ 0, 1], [ 1, 1], [-2, 0], [-2, 1]],
}

const I_KICKS = {
  '0>1': [[ 0, 0], [ 0,-2], [ 0, 1], [ 1,-2], [-2, 1]],
  '1>0': [[ 0, 0], [ 0, 2], [ 0,-1], [-1, 2], [ 2,-1]],
  '1>2': [[ 0, 0], [ 0,-1], [ 0, 2], [-2,-1], [ 1, 2]],
  '2>1': [[ 0, 0], [ 0, 1], [ 0,-2], [ 2, 1], [-1,-2]],
  '2>3': [[ 0, 0], [ 0, 2], [ 0,-1], [-1, 2], [ 2,-1]],
  '3>2': [[ 0, 0], [ 0,-2], [ 0, 1], [ 1,-2], [-2, 1]],
  '3>0': [[ 0, 0], [ 0, 1], [ 0,-2], [-2, 1], [ 1,-2]],
  '0>3': [[ 0, 0], [ 0,-1], [ 0, 2], [ 2,-1], [-1, 2]],
}

// O piece has no kicks (no rotation)
const O_KICKS = {
  '0>1': [[ 0, 0]],
  '1>0': [[ 0, 0]],
  '1>2': [[ 0, 0]],
  '2>1': [[ 0, 0]],
  '2>3': [[ 0, 0]],
  '3>2': [[ 0, 0]],
  '3>0': [[ 0, 0]],
  '0>3': [[ 0, 0]],
}

function getKickTable(type) {
  if (type === 'I') return I_KICKS
  if (type === 'O') return O_KICKS
  return JLSTZ_KICKS
}

/**
 * Attempt to rotate a piece.
 * direction: 1 = CW, -1 = CCW
 * system: 'modern' (SRS with kicks) | 'classic' (no kicks)
 *
 * Returns { piece: newPiece, kicked: bool } or null if rotation fails.
 */
export function tryRotate(board, piece, direction, system = 'modern') {
  const fromRot = piece.rotation
  const toRot = ((fromRot + direction) % 4 + 4) % 4
  const rotatedPiece = { ...piece, rotation: toRot }

  if (system === 'classic') {
    // Classic: just try the rotation, no kicks
    const cells = getOccupiedCells(rotatedPiece)
    if (isValidPosition(board, cells)) {
      return { piece: rotatedPiece, kicked: false }
    }
    return null
  }

  // Modern SRS: try kick offsets
  const key = `${fromRot}>${toRot}`
  const kicks = getKickTable(piece.type)[key] ?? [[ 0, 0]]

  for (const [dr, dc] of kicks) {
    const kicked = { ...rotatedPiece, row: piece.row + dr, col: piece.col + dc }
    const cells = getOccupiedCells(kicked)
    if (isValidPosition(board, cells)) {
      return { piece: kicked, kicked: dr !== 0 || dc !== 0 }
    }
  }

  return null
}

/**
 * Rotate 180 degrees (used for some modes).
 */
export function tryRotate180(board, piece, system = 'modern') {
  const toRot = (piece.rotation + 2) % 4
  const rotatedPiece = { ...piece, rotation: toRot }
  const cells = getOccupiedCells(rotatedPiece)
  if (isValidPosition(board, cells)) {
    return { piece: rotatedPiece, kicked: false }
  }
  return null
}
