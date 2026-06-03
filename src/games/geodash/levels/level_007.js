import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_007', name: 'Tidal', difficulty: 'normal', stars: 5,
  bpm: 130, songName: 'Waveform', initialForm: 'cube', forms: ['cube', 'ufo', 'wave', 'cube'], tier: 2,
  totalBeats: 150, seed: 7077,
  theme: { bg: '#06181f', ground: '#0c2a35', accent: '#33e0e0', pattern: 'wave' },
})
