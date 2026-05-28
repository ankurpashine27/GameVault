import { useState, useCallback } from 'react'
import {
  LS_PLAYER_NAME, LS_HIGH_SCORE, LS_LEADERBOARD, LS_ACHIEVEMENTS,
  LS_COLLECTIONS, LS_UNLOCKED_SKINS, LS_TOTAL_GAMES, LS_TOTAL_COINS,
  LS_PERSONAL_BESTS, LEADERBOARD_MAX, COLLECTIONS, BIRD_SKINS,
} from '../constants.js'
import { lsGet, lsSet, loadSettings, saveSettings, todayStr } from '../utils.js'

export function useFlappySettings() {
  const [playerName, setPlayerNameState] = useState(() => lsGet(LS_PLAYER_NAME, 'Player'))
  const [settings,   setSettingsState]   = useState(() => loadSettings())

  // ─── Player name ────────────────────────────────────────────────────────────
  const setPlayerName = useCallback((name) => {
    lsSet(LS_PLAYER_NAME, name)
    setPlayerNameState(name)
  }, [])

  // ─── Settings ────────────────────────────────────────────────────────────────
  const updateSettings = useCallback((partial) => {
    setSettingsState(prev => {
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }, [])

  // ─── High score ──────────────────────────────────────────────────────────────
  const getHighScore = useCallback(() => lsGet(LS_HIGH_SCORE, 0), [])

  const saveHighScore = useCallback((score) => {
    const cur = lsGet(LS_HIGH_SCORE, 0)
    if (score > cur) lsSet(LS_HIGH_SCORE, score)
    return Math.max(score, cur)
  }, [])

  // ─── Leaderboard ─────────────────────────────────────────────────────────────
  const getLeaderboard = useCallback(() => lsGet(LS_LEADERBOARD, []), [])

  const saveToLeaderboard = useCallback(({ name, score, date }) => {
    const board = lsGet(LS_LEADERBOARD, [])
    board.push({ name, score, date: date || todayStr() })
    board.sort((a, b) => b.score - a.score)
    lsSet(LS_LEADERBOARD, board.slice(0, LEADERBOARD_MAX))
  }, [])

  // ─── Personal bests ───────────────────────────────────────────────────────────
  const getPersonalBests = useCallback(() => lsGet(LS_PERSONAL_BESTS, []), [])

  const savePersonalBest = useCallback(({ name, score, date }) => {
    const bests = lsGet(LS_PERSONAL_BESTS, [])
    bests.push({ name, score, date: date || todayStr() })
    bests.sort((a, b) => b.score - a.score)
    lsSet(LS_PERSONAL_BESTS, bests.slice(0, LEADERBOARD_MAX))
  }, [])

  // ─── Achievements ─────────────────────────────────────────────────────────────
  const getUnlockedAchievements = useCallback(() => lsGet(LS_ACHIEVEMENTS, []), [])

  const unlockAchievement = useCallback((id) => {
    const list = lsGet(LS_ACHIEVEMENTS, [])
    if (list.includes(id)) return false
    list.push(id)
    lsSet(LS_ACHIEVEMENTS, list)
    return true
  }, [])

  // ─── Collections ─────────────────────────────────────────────────────────────
  const getCollectedItems = useCallback(() => lsGet(LS_COLLECTIONS, {}), [])

  const collectItem = useCallback((itemId) => {
    const items = lsGet(LS_COLLECTIONS, {})
    if (items[itemId]) return false
    items[itemId] = true
    lsSet(LS_COLLECTIONS, items)

    // Check if any set is now complete
    const completedSet = COLLECTIONS.find(set =>
      set.items.every(i => items[i.id])
    )
    return completedSet || null  // returns the set object or null
  }, [])

  const getCompletedSets = useCallback(() => {
    const items = lsGet(LS_COLLECTIONS, {})
    return COLLECTIONS.filter(set => set.items.every(i => items[i.id])).map(s => s.id)
  }, [])

  // ─── Unlocked skins ───────────────────────────────────────────────────────────
  const getUnlockedSkins = useCallback(() => {
    const stored  = lsGet(LS_UNLOCKED_SKINS, [])
    const base    = BIRD_SKINS.filter(s => s.unlocked).map(s => s.id)
    return [...new Set([...base, ...stored])]
  }, [])

  const unlockSkin = useCallback((skinId) => {
    const skins = lsGet(LS_UNLOCKED_SKINS, [])
    if (!skins.includes(skinId)) {
      skins.push(skinId)
      lsSet(LS_UNLOCKED_SKINS, skins)
    }
  }, [])

  const isSkinUnlocked = useCallback((skinId) => {
    const skin = BIRD_SKINS.find(s => s.id === skinId)
    if (!skin) return false
    if (skin.unlocked) return true
    // Score-based unlock
    if (skin.score) {
      const hs = lsGet(LS_HIGH_SCORE, 0)
      if (hs >= skin.score) return true
    }
    // Collection-based
    if (skin.collection) {
      const completed = getCompletedSets()
      if (completed.includes(skin.collection)) return true
    }
    // Explicitly unlocked
    const stored = lsGet(LS_UNLOCKED_SKINS, [])
    return stored.includes(skinId)
  }, [getCompletedSets])

  // ─── Global stats ─────────────────────────────────────────────────────────────
  const getTotalGames = useCallback(() => lsGet(LS_TOTAL_GAMES, 0), [])
  const incrementTotalGames = useCallback(() => {
    const n = lsGet(LS_TOTAL_GAMES, 0) + 1
    lsSet(LS_TOTAL_GAMES, n)
    return n
  }, [])

  const getTotalCoins = useCallback(() => lsGet(LS_TOTAL_COINS, 0), [])
  const addCoins = useCallback((n) => {
    const total = lsGet(LS_TOTAL_COINS, 0) + n
    lsSet(LS_TOTAL_COINS, total)
    return total
  }, [])

  return {
    playerName, setPlayerName,
    settings, updateSettings,
    getHighScore, saveHighScore,
    getLeaderboard, saveToLeaderboard,
    getPersonalBests, savePersonalBest,
    getUnlockedAchievements, unlockAchievement,
    getCollectedItems, collectItem, getCompletedSets,
    getUnlockedSkins, unlockSkin, isSkinUnlocked,
    getTotalGames, incrementTotalGames,
    getTotalCoins, addCoins,
  }
}
