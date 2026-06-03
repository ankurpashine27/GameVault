import { makeLevel } from './builders.js'
import { FORMS } from '../constants.js'
export default makeLevel({
  id: 'level_018', name: "Inferno's Gate", difficulty: 'demon_easy', stars: 10,
  bpm: 180, songName: "Demon's Waltz", initialForm: 'cube', initialSpeed: 1.5,
  forms: FORMS, tier: 6, speedChanges: true, gravityFlips: true, sizeMini: true, mirror: true,
  totalBeats: 196, seed: 18180,
  theme: { bg: '#1c0410', ground: '#320820', accent: '#c14bff', pattern: 'geometric' },
})
