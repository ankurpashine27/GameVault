import {
  CANVAS_W, CANVAS_H, GROUND_Y,
  PIPE_WIDTH, PIPE_SPAWN_X,
  STAGES,
} from '../constants.js'
import { randBetween, lerp } from '../utils.js'

/**
 * Create a new pipe pair.
 * @param {object} stageData - current blended stage parameters
 * @param {number} id        - unique incrementing id
 * @param {number} sessionTime - for moving pipe phase offset
 */
export function spawnPipe(stageData, id, sessionTime = 0) {
  const gap    = stageData.pipeGap
  const usableH = GROUND_Y - 60           // safe spawn range (top margin 60px)
  const gapMin  = 80                      // min distance from top
  const gapMax  = usableH - gap - 40      // min distance from ground

  const gapCenterY = randBetween(gapMin + gap / 2, gapMax + gap / 2)

  return {
    id,
    x:       PIPE_SPAWN_X,
    gapCenterY,
    gap,
    passed:  false,
    // Moving-pipe state
    moving:        stageData.movingPipes,
    moveAmplitude: stageData.movingAmplitude || 0,
    moveFrequency: stageData.movingFrequency || 0,
    movePhase:     sessionTime,            // offset so pipes don't sync
    baseGapCenterY: gapCenterY,
  }
}

/**
 * Update all pipes: move left, oscillate if moving, cull off-screen.
 * @param {object[]} pipes
 * @param {number}   dt
 * @param {number}   pipeSpeed
 * @param {number}   timeScale
 * @param {number}   totalTime - current session time for oscillation
 * @returns {{ pipes: object[], scored: number }} - pipes after update + how many passed
 */
export function updatePipes(pipes, dt, pipeSpeed, timeScale = 1.0, totalTime = 0) {
  const sDt = dt * timeScale
  let scored = 0

  const updated = pipes
    .map(p => {
      const np = { ...p, x: p.x - pipeSpeed * sDt }

      // Vertical oscillation for moving pipes
      if (np.moving) {
        const elapsed = totalTime - np.movePhase
        np.gapCenterY = np.baseGapCenterY + np.moveAmplitude * Math.sin(2 * Math.PI * np.moveFrequency * elapsed)
      }

      return np
    })
    .filter(p => {
      if (p.x < -PIPE_WIDTH) return false
      return true
    })

  return { pipes: updated, scored }
}

/**
 * Mark pipes as passed when the bird crosses them, return score delta.
 */
export function checkPipesPassed(pipes, birdX) {
  let score = 0
  for (const p of pipes) {
    if (!p.passed && p.x + PIPE_WIDTH / 2 < birdX) {
      p.passed = true
      score++
    }
  }
  return score
}

/**
 * Blend stage parameters based on current score.
 */
export function blendStage(score) {
  let stageIdx = 0
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (score >= STAGES[i].scoreThreshold) { stageIdx = i; break }
  }
  const cur  = STAGES[stageIdx]
  const next = STAGES[Math.min(stageIdx + 1, STAGES.length - 1)]
  if (cur === next) return { ...cur, stageIdx }

  // Blend between stages over 5 score points
  const start = cur.scoreThreshold
  const end   = next.scoreThreshold
  const t     = Math.min((score - start) / (end - start), 1)

  return {
    stageIdx,
    id:             cur.id,
    name:           cur.name,
    pipeSpeed:      lerp(cur.pipeSpeed,      next.pipeSpeed,      t),
    pipeGap:        lerp(cur.pipeGap,        next.pipeGap,        t),
    spawnInterval:  lerp(cur.spawnInterval,  next.spawnInterval,  t),
    movingPipes:    t >= 1 ? next.movingPipes : cur.movingPipes,
    movingAmplitude:lerp(cur.movingAmplitude || 0, next.movingAmplitude || 0, t),
    movingFrequency:lerp(cur.movingFrequency || 0, next.movingFrequency || 0, t),
  }
}
