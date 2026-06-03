/**
 * Pulse Rush — level registry. All 20 handcrafted (config-driven) levels in
 * play order, plus difficulty-tier helpers for the level-select screen.
 */
import l1 from './level_001.js'
import l2 from './level_002.js'
import l3 from './level_003.js'
import l4 from './level_004.js'
import l5 from './level_005.js'
import l6 from './level_006.js'
import l7 from './level_007.js'
import l8 from './level_008.js'
import l9 from './level_009.js'
import l10 from './level_010.js'
import l11 from './level_011.js'
import l12 from './level_012.js'
import l13 from './level_013.js'
import l14 from './level_014.js'
import l15 from './level_015.js'
import l16 from './level_016.js'
import l17 from './level_017.js'
import l18 from './level_018.js'
import l19 from './level_019.js'
import l20 from './level_020.js'

export const LEVELS = [
  l1, l2, l3, l4, l5, l6, l7, l8, l9, l10,
  l11, l12, l13, l14, l15, l16, l17, l18, l19, l20,
]

export const getLevel = (id) => LEVELS.find(l => l.id === id) || null
export const levelIndex = (id) => LEVELS.findIndex(l => l.id === id)
