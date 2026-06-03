import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_008', name: 'Crosswinds', difficulty: 'normal', stars: 5,
  bpm: 128, songName: 'Crossfade', initialForm: 'cube', forms: ['cube', 'ship', 'wave', 'ball'], tier: 2,
  totalBeats: 152, seed: 8088, mirror: true,
  theme: { bg: '#1a0b2e', ground: '#2a134a', accent: '#ff6bd6', pattern: 'grid' },
})
