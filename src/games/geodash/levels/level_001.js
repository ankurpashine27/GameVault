import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_001', name: 'First Steps', difficulty: 'auto', stars: 1,
  bpm: 90, songName: 'Neon Dawn', initialForm: 'cube', forms: ['cube'], tier: 0,
  totalBeats: 112, seed: 1011,
  theme: { bg: '#10131f', ground: '#1b2233', accent: '#39d0ff', pattern: 'grid' },
})
