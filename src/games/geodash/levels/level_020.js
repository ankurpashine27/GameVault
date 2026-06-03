import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_020', name: 'Singularity', difficulty: 'demon_extreme', stars: 10,
  bpm: 200, songName: 'Event Horizon', initialForm: 'cube', initialSpeed: 2,
  forms: FORMS, tier: 10, speedChanges: true, gravityFlips: true, sizeMini: true, mirror: true,
  totalBeats: 220, seed: 20200,
  theme: { bg: '#000000', ground: '#0a0a14', accent: '#ffffff', pattern: 'stars' },
})
