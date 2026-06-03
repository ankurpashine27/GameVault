import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_005', name: 'Circuit Breaker', difficulty: 'normal', stars: 5,
  bpm: 120, songName: 'Voltage', initialForm: 'cube', forms: ['cube', 'ball', 'ship', 'cube'], tier: 2,
  totalBeats: 144, seed: 5055,
  theme: { bg: '#08160c', ground: '#0e2615', accent: '#9bff3f', pattern: 'circuit' },
})
