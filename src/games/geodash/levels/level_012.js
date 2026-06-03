import { makeLevel } from './builders.js'
export default makeLevel({
  id: 'level_012', name: 'Overdrive', difficulty: 'harder', stars: 9,
  bpm: 150, songName: 'Redline', initialForm: 'cube',
  forms: ['cube', 'ball', 'robot', 'ufo', 'wave'], tier: 4,
  speedChanges: true, totalBeats: 172, seed: 12120,
  theme: { bg: '#1f0810', ground: '#360e1c', accent: '#ff4d4d', pattern: 'grid' },
})
