import {
  PIPE_WIDTH, GROUND_Y,
  BIRD_RADIUS, BIRD_SHRINK_R,
} from '../constants.js'

/**
 * Circle vs Axis-Aligned Bounding Box collision.
 * Returns true if the circle overlaps the rect.
 */
function circleVsAABB(cx, cy, cr, rx, ry, rw, rh) {
  const nearX = Math.max(rx, Math.min(cx, rx + rw))
  const nearY = Math.max(ry, Math.min(cy, ry + rh))
  const dx    = cx - nearX
  const dy    = cy - nearY
  return (dx * dx + dy * dy) < (cr * cr)
}

/**
 * Circle vs circle collision.
 */
function circleVsCircle(ax, ay, ar, bx, by, br) {
  const dx  = ax - bx
  const dy  = ay - by
  const sum = ar + br
  return (dx * dx + dy * dy) < (sum * sum)
}

/**
 * Check if bird collides with any pipe.
 * Pipes: { x (center), gapCenterY, gap } - pipe.x is the LEFT EDGE center
 *
 * Returns the colliding pipe or null.
 */
export function checkPipeCollision(bird, pipes, shrinkActive = false) {
  const cr = shrinkActive ? BIRD_SHRINK_R : BIRD_RADIUS

  for (const pipe of pipes) {
    const pipeLeft  = pipe.x - PIPE_WIDTH / 2
    const pipeRight = pipe.x + PIPE_WIDTH / 2

    // Horizontal range check first (cheap)
    if (bird.x + cr < pipeLeft || bird.x - cr > pipeRight) continue

    const gapTop    = pipe.gapCenterY - pipe.gap / 2
    const gapBottom = pipe.gapCenterY + pipe.gap / 2

    // Top pipe: x spans [pipeLeft, pipeRight], y from 0 to gapTop
    if (circleVsAABB(bird.x, bird.y, cr, pipeLeft, 0, PIPE_WIDTH, gapTop)) {
      return pipe
    }

    // Bottom pipe: x spans [pipeLeft, pipeRight], y from gapBottom to GROUND_Y
    if (circleVsAABB(bird.x, bird.y, cr, pipeLeft, gapBottom, PIPE_WIDTH, GROUND_Y - gapBottom)) {
      return pipe
    }
  }
  return null
}

/**
 * Check collectible / power-up collection.
 * Returns array of collected ids.
 */
export function checkCollectibleCollision(bird, items, shrinkActive = false) {
  const cr = shrinkActive ? BIRD_SHRINK_R : BIRD_RADIUS
  const collected = []
  for (const item of items) {
    if (item.collected) continue
    if (circleVsCircle(bird.x, bird.y, cr, item.x, item.y, item.radius)) {
      collected.push(item.id)
    }
  }
  return collected
}

/**
 * Check ground/ceiling collision (already handled in physics, but also exposed here).
 */
export function checkBoundaryCollision(bird, shrinkActive = false) {
  const cr = shrinkActive ? BIRD_SHRINK_R : BIRD_RADIUS
  return bird.y - cr <= 0 || bird.y + cr >= GROUND_Y
}
