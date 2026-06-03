import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_010', name: 'Arachnophase', difficulty: 'hard', stars: 7,
  bpm: 146, songName: 'Web Crawler', initialForm: 'cube',
  forms: ['cube', 'robot', 'spider', 'ufo'], tier: 3,
  totalBeats: 164, seed: 10100,
  theme: { bg: '#160a24', ground: '#26113d', accent: '#b06bff', pattern: 'geometric' },
})
