/**
 * Pulse Rush — achievement definitions + evaluator.
 * `achievementsToUnlock` returns the ids whose conditions are currently met,
 * derived from persistent data; a few session-scoped ones (checkpoint_pro,
 * practiced_hard, speed_demon) are unlocked inline during play.
 */
import { LEVELS } from './levels/index.js'
import { DIFFICULTIES, TOTAL_ICONS } from './constants.js'

export const ACHIEVEMENTS = [
  { id: 'first_jump', name: 'First Jump', desc: 'Play your first attempt.', cat: 'Progress' },
  { id: 'first_completion', name: 'First Completion', desc: 'Complete any level.', cat: 'Progress' },
  { id: 'auto_complete', name: 'Auto Complete', desc: 'Complete the Auto level.', cat: 'Progress' },
  { id: 'easy_cleared', name: 'Easy Cleared', desc: 'Complete all Easy levels.', cat: 'Progress' },
  { id: 'normal_cleared', name: 'Normal Cleared', desc: 'Complete all Normal levels.', cat: 'Progress' },
  { id: 'hard_cleared', name: 'Hard Cleared', desc: 'Complete all Hard levels.', cat: 'Progress' },
  { id: 'harder_cleared', name: 'Harder Cleared', desc: 'Complete all Harder levels.', cat: 'Progress' },
  { id: 'insane_cleared', name: 'Insane Cleared', desc: 'Complete all Insane levels.', cat: 'Progress' },
  { id: 'demon_slayer', name: 'Demon Slayer', desc: 'Complete any Demon level.', cat: 'Progress' },
  { id: 'all_demons', name: 'All Demons', desc: 'Complete all Demon levels.', cat: 'Progress' },
  { id: 'coin_hunter', name: 'Coin Hunter', desc: 'Collect any secret coin.', cat: 'Coins' },
  { id: 'treasure_seeker', name: 'Treasure Seeker', desc: 'Collect 10 secret coins.', cat: 'Coins' },
  { id: 'coin_master', name: 'Coin Master', desc: 'Collect all 60 secret coins.', cat: 'Coins' },
  { id: 'perfect_level', name: 'Perfect Level', desc: 'Collect all 3 coins in one level.', cat: 'Coins' },
  { id: 'full_completion', name: 'Full Completion', desc: '100% every level.', cat: 'Coins' },
  { id: 'inf_novice', name: 'Infinite Novice', desc: 'Survive 100 beats in Infinite.', cat: 'Infinite' },
  { id: 'inf_adept', name: 'Infinite Adept', desc: 'Survive 300 beats.', cat: 'Infinite' },
  { id: 'inf_master', name: 'Infinite Master', desc: 'Survive 500 beats.', cat: 'Infinite' },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Survive 100 beats at ×3 speed.', cat: 'Infinite' },
  { id: 'checkpoint_pro', name: 'Checkpoint Pro', desc: 'Place 5 checkpoints in one session.', cat: 'Practice' },
  { id: 'practiced_hard', name: 'Practiced Hard', desc: 'Use practice on a Demon level.', cat: 'Practice' },
  { id: 'resilient', name: 'Resilient', desc: 'Die 100 times total.', cat: 'Perseverance' },
  { id: 'determined', name: 'Determined', desc: 'Die 500 times total.', cat: 'Perseverance' },
  { id: 'never_give_up', name: 'Never Give Up', desc: 'Die 1000 times total.', cat: 'Perseverance' },
  { id: 'stylist', name: 'Stylist', desc: 'Unlock 20 icons.', cat: 'Customization' },
  { id: 'collector', name: 'Collector', desc: 'Unlock 60 icons.', cat: 'Customization' },
  { id: 'full_kit', name: 'Full Kit', desc: `Unlock all ${TOTAL_ICONS} icons.`, cat: 'Customization' },
]

const byDiff = (diff) => LEVELS.filter(l => l.difficulty === diff)
const allDone = (levels, progress) => levels.length > 0 && levels.every(l => progress[l.id]?.completed)

export function achievementsToUnlock({ stats, currency, progress, unlockedIconsCount, infinite }) {
  const out = []
  const add = (cond, id) => { if (cond) out.push(id) }

  add((stats.totalAttempts || 0) >= 1, 'first_jump')
  add(currency.completions >= 1, 'first_completion')
  add(progress['level_001']?.completed, 'auto_complete')
  add(allDone(byDiff('easy'), progress), 'easy_cleared')
  add(allDone(byDiff('normal'), progress), 'normal_cleared')
  add(allDone(byDiff('hard'), progress), 'hard_cleared')
  add(allDone(byDiff('harder'), progress), 'harder_cleared')
  add(allDone(byDiff('insane'), progress), 'insane_cleared')
  add(currency.demonStars >= 1, 'demon_slayer')
  add(LEVELS.filter(l => DIFFICULTIES[l.difficulty]?.demon).every(l => progress[l.id]?.completed), 'all_demons')

  add(currency.coins >= 1, 'coin_hunter')
  add(currency.coins >= 10, 'treasure_seeker')
  add(currency.coins >= 60, 'coin_master')
  add(Object.values(progress).some(p => (p.coinsCollected?.length || 0) >= 3), 'perfect_level')
  add(LEVELS.every(l => progress[l.id]?.completed && (progress[l.id]?.coinsCollected?.length || 0) >= 3), 'full_completion')

  add((stats.totalDeaths || 0) >= 100, 'resilient')
  add((stats.totalDeaths || 0) >= 500, 'determined')
  add((stats.totalDeaths || 0) >= 1000, 'never_give_up')

  add(unlockedIconsCount >= 20, 'stylist')
  add(unlockedIconsCount >= 60, 'collector')
  add(unlockedIconsCount >= TOTAL_ICONS, 'full_kit')

  if (infinite) {
    add(infinite.beats >= 100, 'inf_novice')
    add(infinite.beats >= 300, 'inf_adept')
    add(infinite.beats >= 500, 'inf_master')
  }
  return out
}
