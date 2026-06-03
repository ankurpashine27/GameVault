import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_009', name: 'Iron Cadence', difficulty: 'hard', stars: 7,
  bpm: 140, songName: 'Machine Heart', initialForm: 'cube',
  forms: ['cube', 'ball', 'robot', 'ship'], tier: 3,
  totalBeats: 160, seed: 9099, mirror: true,
  theme: { bg: '#14171c', ground: '#23282f', accent: '#ffb13f', pattern: 'circuit' },
})
