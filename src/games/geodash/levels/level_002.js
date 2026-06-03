import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_002', name: 'Skyline', difficulty: 'easy', stars: 3,
  bpm: 100, songName: 'Pulse Drive', initialForm: 'cube', forms: ['cube', 'ship'], tier: 1,
  totalBeats: 124, seed: 2022,
  theme: { bg: '#161033', ground: '#241a4d', accent: '#ff5ea8', pattern: 'stars' },
})
