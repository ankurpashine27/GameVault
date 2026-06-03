import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_019', name: 'Abyssal', difficulty: 'demon_hard', stars: 10,
  bpm: 190, songName: 'Void Pulse', initialForm: 'cube', initialSpeed: 2,
  forms: FORMS, tier: 8, speedChanges: true, gravityFlips: true, sizeMini: true, mirror: true,
  totalBeats: 204, seed: 19190,
  theme: { bg: '#020a0c', ground: '#06181c', accent: '#33f0c0', pattern: 'wave' },
})
