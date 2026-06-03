/**
 * Pulse Rush — Infinite mode configuration.
 *
 * Difficulty tiers scale with beats survived. Each tier defines the form pool,
 * the speed options, and segment length range. SEGMENT_TEMPLATES enumerates the
 * pattern kinds available per form (the procedural generator in
 * infiniteGenerator.js draws from these, weighted by the active tier).
 */

export const TIER_CONFIGS = [
  { from: 0,   to: 50,   tier: 0, forms: ['cube', 'ship'], speeds: [1], seg: [10, 16] },
  { from: 50,  to: 150,  tier: 2, forms: ['cube', 'ship', 'ball', 'ufo'], speeds: [1, 1.5], seg: [9, 14] },
  { from: 150, to: 300,  tier: 3, forms: ['cube', 'ship', 'ball', 'ufo', 'wave', 'robot'], speeds: [1.5, 2], seg: [9, 13] },
  { from: 300, to: 500,  tier: 5, forms: ['cube', 'ship', 'ball', 'ufo', 'wave', 'robot', 'spider', 'swing'], speeds: [2], seg: [8, 12] },
  { from: 500, to: Infinity, tier: 6, forms: ['cube', 'ship', 'ball', 'ufo', 'wave', 'robot', 'spider', 'swing'], speeds: [2, 3], seg: [8, 11] },
]

export function tierForBeat(beat) {
  return TIER_CONFIGS.find(t => beat >= t.from && beat < t.to) || TIER_CONFIGS[TIER_CONFIGS.length - 1]
}

// At least 30 segment templates spanning all 8 forms / difficulties.
export const SEGMENT_TEMPLATES = [
  { form: 'cube', kind: 'spikes', minTier: 0 },
  { form: 'cube', kind: 'platforms', minTier: 0 },
  { form: 'cube', kind: 'orbjump', minTier: 2 },
  { form: 'cube', kind: 'double', minTier: 3 },
  { form: 'ship', kind: 'corridor', minTier: 0 },
  { form: 'ship', kind: 'narrow', minTier: 2 },
  { form: 'ship', kind: 'zigzag', minTier: 3 },
  { form: 'ball', kind: 'flipline', minTier: 2 },
  { form: 'ball', kind: 'ceiling', minTier: 3 },
  { form: 'ball', kind: 'orbflip', minTier: 4 },
  { form: 'ufo', kind: 'hops', minTier: 2 },
  { form: 'ufo', kind: 'tighthops', minTier: 3 },
  { form: 'ufo', kind: 'corridor', minTier: 4 },
  { form: 'wave', kind: 'easywave', minTier: 2 },
  { form: 'wave', kind: 'tunnel', minTier: 3 },
  { form: 'wave', kind: 'spam', minTier: 5 },
  { form: 'robot', kind: 'hops', minTier: 3 },
  { form: 'robot', kind: 'highjump', minTier: 4 },
  { form: 'robot', kind: 'mixed', minTier: 5 },
  { form: 'spider', kind: 'flips', minTier: 3 },
  { form: 'spider', kind: 'rapid', minTier: 5 },
  { form: 'spider', kind: 'maze', minTier: 6 },
  { form: 'swing', kind: 'pendulum', minTier: 3 },
  { form: 'swing', kind: 'tight', minTier: 5 },
  { form: 'swing', kind: 'chaos', minTier: 6 },
  { form: 'cube', kind: 'speedspikes', minTier: 5 },
  { form: 'ship', kind: 'mini', minTier: 5 },
  { form: 'ball', kind: 'gravity', minTier: 5 },
  { form: 'ufo', kind: 'mini', minTier: 6 },
  { form: 'wave', kind: 'mirror', minTier: 6 },
  { form: 'robot', kind: 'gauntlet', minTier: 6 },
  { form: 'spider', kind: 'demon', minTier: 6 },
]
