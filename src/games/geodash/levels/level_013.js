import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_013', name: 'Kaleidoscope', difficulty: 'harder', stars: 9,
  bpm: 156, songName: 'Spectrum', initialForm: 'cube',
  forms: FORMS, tier: 4, speedChanges: true, mirror: true,
  totalBeats: 176, seed: 13130,
  theme: { bg: '#120a2a', ground: '#1f1147', accent: '#7ee787', pattern: 'stars' },
})
