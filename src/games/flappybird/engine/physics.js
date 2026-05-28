import {
  GRAVITY, FLAP_IMPULSE, TERMINAL_VELOCITY,
  BIRD_ROTATION_UP, BIRD_ROTATION_DOWN, BIRD_ROTATION_SPEED,
  GROUND_Y, BIRD_VISUAL_R,
} from '../constants.js'
import { clamp, lerp, degToRad } from '../utils.js'

/**
 * Apply gravity and velocity to bird for one frame.
 * @param {object} bird - mutable bird state
 * @param {number} dt   - delta time in seconds
 * @param {number} timeScale - 1.0 normal, <1 slow-mo
 */
export function updateBird(bird, dt, timeScale = 1.0) {
  const sDt = dt * timeScale
  bird.vy = clamp(bird.vy + GRAVITY * sDt, -FLAP_IMPULSE * 1.2, TERMINAL_VELOCITY)
  bird.y  += bird.vy * sDt

  // Rotation: map velocity to angle
  const targetAngle = clamp(
    lerp(BIRD_ROTATION_UP, BIRD_ROTATION_DOWN, (bird.vy + 520) / (TERMINAL_VELOCITY + 520)),
    BIRD_ROTATION_UP,
    BIRD_ROTATION_DOWN
  )
  const maxRotDelta = BIRD_ROTATION_SPEED * sDt
  const diff = targetAngle - bird.angle
  bird.angle += clamp(diff, -maxRotDelta, maxRotDelta)

  // Wing flap animation
  bird.flapTimer += sDt * (bird.vy < 0 ? 3.5 : 2.0)
}

/**
 * Apply flap impulse.
 */
export function flapBird(bird) {
  bird.vy = FLAP_IMPULSE
  bird.angle = BIRD_ROTATION_UP
  bird.flapTimer = 0
}

/**
 * Returns true if bird has hit the ground or ceiling.
 */
export function checkBoundaryCollision(bird) {
  const topEdge = BIRD_VISUAL_R
  const botEdge = GROUND_Y - BIRD_VISUAL_R
  return bird.y <= topEdge || bird.y >= botEdge
}

/**
 * Create a fresh bird state object at the given starting position.
 */
export function createBird(x, y) {
  return {
    x,
    y,
    vy: 0,
    angle: 0,
    flapTimer: 0,
  }
}
