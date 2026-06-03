import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_003', name: 'Afterglow', difficulty: 'easy', stars: 3,
  bpm: 108, songName: 'Glass Sky', initialForm: 'cube', forms: ['cube', 'ship', 'cube'], tier: 1,
  totalBeats: 128, seed: 3033,
  theme: { bg: '#06201d', ground: '#0c3330', accent: '#5cf2c7', pattern: 'wave' },
})
