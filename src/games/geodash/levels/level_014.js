import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_014', name: 'Fault Line', difficulty: 'harder', stars: 9,
  bpm: 160, songName: 'Tremor', initialForm: 'cube',
  forms: FORMS, tier: 4, speedChanges: true, gravityFlips: true,
  totalBeats: 178, seed: 14140,
  theme: { bg: '#1a1206', ground: '#2c1f0c', accent: '#ffc23f', pattern: 'geometric' },
})
