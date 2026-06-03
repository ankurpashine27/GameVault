/**
 * Pulse Rush — object type catalogue and world-geometry helpers.
 * Every level object's screen geometry is derived here so the renderer and
 * collision system agree exactly.
 */
import { TILE, GROUND_Y, PLAYER_X, BEAT_WIDTH } from '../constants.js'

export const CATEGORY = {
  spike: 'hazard', spike_down: 'hazard', spike_small: 'hazard', saw: 'hazard',
  block: 'solid', platform: 'solid', slab: 'solid',
  orb_yellow: 'orb', orb_pink: 'orb', orb_blue: 'orb', orb_green: 'orb',
  orb_red: 'orb', orb_black: 'orb',
  pad_yellow: 'pad', pad_pink: 'pad', pad_blue: 'pad', pad_red: 'pad',
  portal_cube: 'portal', portal_ship: 'portal', portal_ball: 'portal',
  portal_ufo: 'portal', portal_wave: 'portal', portal_robot: 'portal',
  portal_spider: 'portal', portal_swing: 'portal',
  portal_speed_slow: 'portal', portal_speed_normal: 'portal',
  portal_speed_fast: 'portal', portal_speed_faster: 'portal',
  portal_speed_fastest: 'portal', portal_gravity: 'portal',
  portal_size_mini: 'portal', portal_size_normal: 'portal', portal_mirror: 'portal',
  coin: 'coin',
}

export const categoryOf = (type) => CATEGORY[type] || 'decor'

/** Orb color from type, e.g. 'orb_yellow' -> 'yellow'. */
export const orbColor = (type) => type.split('_')[1]
export const padColor = (type) => type.split('_')[1]

/**
 * World (screen) rect for an object given the player's accumulated worldX.
 * y in level data is "px above ground" (0 = ground), height/width in tiles.
 * Returns { x, y, w, h } in canvas pixels (top-left origin).
 */
export function objRect(obj, worldX) {
  const w = (obj.width || 1) * TILE
  const h = (obj.height || 1) * TILE
  const screenX = PLAYER_X + (obj.beatOffset * BEAT_WIDTH - worldX)
  const top = GROUND_Y - (obj.y || 0) - h
  return { x: screenX, y: top, w, h }
}

/** Coins are point-like; give them a forgiving pickup box (collecting a coin
 *  mid-jump requires aligning both axes, so the hitbox is a little larger than
 *  the drawn ring). */
export function coinRect(coin, worldX) {
  const size = TILE * 1.2
  const screenX = PLAYER_X + (coin.beatOffset * BEAT_WIDTH - worldX)
  const cy = GROUND_Y - (coin.y || 0) - size / 2
  return { x: screenX - size / 2, y: cy - size / 2, w: size, h: size, cx: screenX, cy }
}

/**
 * The lethal sub-rect of a hazard (spikes only kill near their point/blade).
 * Keeps the game fair — visual triangle is bigger than its kill box.
 */
export function hazardHitRect(obj, rect) {
  if (obj.type === 'saw') {
    const inset = rect.w * 0.16
    return { x: rect.x + inset, y: rect.y + inset, w: rect.w - 2 * inset, h: rect.h - 2 * inset }
  }
  // Spikes: a slim central wedge.
  const inset = rect.w * 0.28
  const topInset = rect.h * 0.18
  return { x: rect.x + inset, y: rect.y + topInset, w: rect.w - 2 * inset, h: rect.h - topInset }
}
