import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_016', name: 'Hyperdrive', difficulty: 'insane', stars: 10,
  bpm: 172, songName: 'Lightspeed', initialForm: 'cube', initialSpeed: 1.5,
  forms: FORMS, tier: 5, speedChanges: true, gravityFlips: true, sizeMini: true, mirror: true,
  totalBeats: 192, seed: 16160,
  theme: { bg: '#04101a', ground: '#0a2030', accent: '#39d0ff', pattern: 'grid' },
})
