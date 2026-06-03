import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_006', name: 'Liftoff', difficulty: 'normal', stars: 5,
  bpm: 124, songName: 'Orbital', initialForm: 'cube', forms: ['cube', 'ship', 'ufo', 'cube'], tier: 2,
  totalBeats: 148, seed: 6066,
  theme: { bg: '#0a1030', ground: '#121a47', accent: '#5eb8ff', pattern: 'stars' },
})
