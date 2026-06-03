import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_011', name: 'Mirage', difficulty: 'hard', stars: 7,
  bpm: 138, songName: 'Phantom', initialForm: 'cube',
  forms: ['cube', 'ship', 'spider', 'wave'], tier: 3, mirror: true,
  totalBeats: 162, seed: 11110,
  theme: { bg: '#101820', ground: '#1c2c38', accent: '#ff7a9c', pattern: 'wave' },
})
