import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_017', name: 'Meltdown', difficulty: 'insane', stars: 10,
  bpm: 165, songName: 'Reactor', initialForm: 'cube', initialSpeed: 1.5,
  forms: FORMS, tier: 5, speedChanges: true, gravityFlips: true, sizeMini: true,
  totalBeats: 190, seed: 17170,
  theme: { bg: '#1a0604', ground: '#300c08', accent: '#ff6b3f', pattern: 'circuit' },
})
