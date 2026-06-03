import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_015', name: 'Supernova', difficulty: 'insane', stars: 10,
  bpm: 168, songName: 'Starfall', initialForm: 'cube', initialSpeed: 1.5,
  forms: FORMS, tier: 5, speedChanges: true, gravityFlips: true, sizeMini: true,
  totalBeats: 188, seed: 15150,
  theme: { bg: '#05060f', ground: '#0c1024', accent: '#9bdcff', pattern: 'stars' },
})
