import { useRef, useCallback } from 'react'
import { COLLECTIONS, ACHIEVEMENTS } from '../constants.js'

/**
 * Tracks run-level collection/achievement state.
 * Does NOT touch localStorage — the parent hook (useFlappySettings) owns persistence.
 * Returns helpers that accept a "save functions" object each call.
 */
export function useCollections() {
  // Mutable run-level counters (not React state — no re-renders needed mid-game)
  const runStatsRef = useRef(createEmptyRunStats())

  const resetRun = useCallback(() => {
    runStatsRef.current = createEmptyRunStats()
  }, [])

  /**
   * Call when a collectible is picked up.
   * @param {object} item  - the collected item
   * @param {object} fns   - { collectItem, unlockAchievement, getUnlockedAchievements }
   * @returns {{ newSet, newAchievements }}
   */
  const onCollect = useCallback((item, fns) => {
    const stats = runStatsRef.current
    const results = { newSet: null, newAchievements: [] }

    if (item.type === 'coin') {
      stats.coinsThisRun++
    } else if (item.type === 'gem') {
      stats.gemsThisRun++
    } else if (item.type === 'star') {
      stats.starsThisRun++
    } else if (item.type === 'collection') {
      stats.collectionItemsThisRun++
      const completedSet = fns.collectItem(item.itemId)
      if (completedSet) {
        stats.completedSets = (fns.getCompletedSets?.() || []).length
        results.newSet = completedSet
      }
    }

    return results
  }, [])

  /**
   * Check achievements against current run + lifetime stats.
   * @param {object} scoreSummary - { score, maxStage, powerupsUsed, shieldSaves, ghostPipes, slowMoScore, totalGames, completedSets }
   * @param {object} fns          - { unlockAchievement, getUnlockedAchievements }
   * @returns {string[]} newly unlocked achievement ids
   */
  const checkAchievements = useCallback((scoreSummary, fns) => {
    const stats   = runStatsRef.current
    const already = new Set(fns.getUnlockedAchievements())
    const newlyUnlocked = []

    const combined = {
      ...scoreSummary,
      coinsThisRun: stats.coinsThisRun,
    }

    for (const ach of ACHIEVEMENTS) {
      if (already.has(ach.id)) continue
      if (ach.check(combined)) {
        const didUnlock = fns.unlockAchievement(ach.id)
        if (didUnlock) newlyUnlocked.push(ach.id)
      }
    }

    return newlyUnlocked
  }, [])

  const getRunStats = useCallback(() => ({ ...runStatsRef.current }), [])

  const updateRunStats = useCallback((partial) => {
    Object.assign(runStatsRef.current, partial)
  }, [])

  return { resetRun, onCollect, checkAchievements, getRunStats, updateRunStats }
}

function createEmptyRunStats() {
  return {
    coinsThisRun:           0,
    gemsThisRun:            0,
    starsThisRun:           0,
    collectionItemsThisRun: 0,
    completedSets:          0,
    powerupsUsed:           new Set(),
    shieldSaves:            0,
    ghostPipes:             0,
    slowMoScore:            0,
    maxStage:               0,
  }
}
