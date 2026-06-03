/**
 * Pulse Rush — Level data format (documentation + validation helper).
 *
 * A level object:
 * {
 *   id, name, difficulty, stars, bpm, initialSpeed, initialForm, initialGravity,
 *   bgColor, groundColor, accentColor, bgPattern, songName, totalBeats,
 *   objects: [ { type, beatOffset, y, width, height, variant } ],
 *   coins:   [ { id, beatOffset, y } ],
 *   bgEvents:[ { beatOffset, type, color?, intensity?, beats? } ],
 * }
 *
 * Coordinates:
 *   - x is derived: worldX = beatOffset * BEAT_WIDTH.
 *   - y is pixels ABOVE the ground (0 = ground). width/height are in tiles.
 *
 * Object types: see engine/objectTypes.js CATEGORY map. Summary:
 *   hazards: spike, spike_down, spike_small, saw
 *   solids:  block, platform, slab
 *   orbs:    orb_yellow|pink|blue|green|red|black
 *   pads:    pad_yellow|pink|blue|red
 *   portals: portal_<form>, portal_speed_<slow|normal|fast|faster|fastest>,
 *            portal_gravity, portal_size_<mini|normal>, portal_mirror
 *   coin
 */
export function validateLevel(level) {
  const errors = []
  if (!level.id) errors.push('missing id')
  if (!Array.isArray(level.objects)) errors.push('objects must be an array')
  if (!level.totalBeats) errors.push('missing totalBeats')
  return errors
}
