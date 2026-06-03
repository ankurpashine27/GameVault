import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_004', name: 'Rolling Thunder', difficulty: 'easy', stars: 3,
  bpm: 112, songName: 'Roller', initialForm: 'cube', forms: ['cube', 'ball', 'ship'], tier: 1,
  totalBeats: 132, seed: 4044,
  theme: { bg: '#220c0c', ground: '#3a1414', accent: '#ff8a3f', pattern: 'geometric' },
})
