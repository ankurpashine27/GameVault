import { useState, useCallback } from 'react'
import { lsGet, lsSet, todayStr } from '../utils.js'
import { LS, DEFAULT_SETTINGS } from '../constants.js'

export function useTetrisSettings() {
  const [playerName, setPlayerNameState] = useState(
    () => lsGet(LS.PLAYER_NAME, 'Player')
  )

  const setPlayerName = useCallback((name) => {
    setPlayerNameState(name)
    lsSet(LS.PLAYER_NAME, name)
  }, [])

  const [settings, setSettings] = useState(
    () => ({ ...DEFAULT_SETTINGS, ...lsGet(LS.SETTINGS, {}) })
  )

  const updateSettings = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      lsSet(LS.SETTINGS, next)
      return next
    })
  }, [])

  // ─── High scores ────────────────────────────────────────────────────────
  const getHighScore = useCallback((mode = 'marathon') => {
    const key = mode === 'marathon' ? LS.MARATHON_BEST
               : mode === 'sprint'  ? LS.SPRINT_BEST
               : mode === 'ultra'   ? LS.ULTRA_BEST
               : LS.HIGH_SCORE
    return lsGet(key, mode === 'sprint' ? Infinity : 0)
  }, [])

  const saveHighScore = useCallback((score, mode = 'marathon') => {
    const key = mode === 'marathon' ? LS.MARATHON_BEST
               : mode === 'sprint'  ? LS.SPRINT_BEST
               : mode === 'ultra'   ? LS.ULTRA_BEST
               : LS.HIGH_SCORE

    const current = lsGet(key, mode === 'sprint' ? Infinity : 0)
    const isBetter = mode === 'sprint' ? score < current : score > current
    if (isBetter || current === Infinity || current === 0) {
      lsSet(key, score)
      return score
    }
    return current
  }, [])

  const isNewHighScore = useCallback((score, mode = 'marathon') => {
    const current = getHighScore(mode)
    if (mode === 'sprint') return score < (current === Infinity ? 9999999 : current)
    return score > current
  }, [getHighScore])

  // ─── Leaderboard ────────────────────────────────────────────────────────
  const getLeaderboard = useCallback(() => {
    return lsGet(LS.LEADERBOARD, [])
  }, [])

  const saveToLeaderboard = useCallback((entry) => {
    const board = lsGet(LS.LEADERBOARD, [])
    board.push({ ...entry, date: todayStr() })
    board.sort((a, b) => b.score - a.score)
    lsSet(LS.LEADERBOARD, board.slice(0, 20))
  }, [])

  // ─── Achievements ───────────────────────────────────────────────────────
  const getUnlockedAchievements = useCallback(() => {
    return lsGet(LS.ACHIEVEMENTS, [])
  }, [])

  const unlockAchievement = useCallback((id) => {
    const list = lsGet(LS.ACHIEVEMENTS, [])
    if (list.includes(id)) return false
    list.push(id)
    lsSet(LS.ACHIEVEMENTS, list)
    return true
  }, [])

  // ─── Daily challenge ────────────────────────────────────────────────────
  const getDailyData = useCallback(() => {
    const date = lsGet(LS.DAILY_DATE, null)
    const score = lsGet(LS.DAILY_SCORE, null)
    const streak = lsGet(LS.DAILY_STREAK, 0)
    return { date, score, streak }
  }, [])

  const saveDailyScore = useCallback((score) => {
    const today = todayStr()
    const { date: lastDate, streak } = getDailyData()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)

    const newStreak = lastDate === yStr ? streak + 1 : 1
    lsSet(LS.DAILY_DATE, today)
    lsSet(LS.DAILY_SCORE, score)
    lsSet(LS.DAILY_STREAK, newStreak)
    return newStreak
  }, [getDailyData])

  const hasDailyScore = useCallback(() => {
    return lsGet(LS.DAILY_DATE, null) === todayStr()
  }, [])

  // ─── Total games ────────────────────────────────────────────────────────
  const getTotalGames = useCallback(() => {
    return lsGet(LS.TOTAL_GAMES, 0)
  }, [])

  const incrementTotalGames = useCallback(() => {
    const n = lsGet(LS.TOTAL_GAMES, 0) + 1
    lsSet(LS.TOTAL_GAMES, n)
    return n
  }, [])

  return {
    playerName, setPlayerName,
    settings, updateSettings,
    getHighScore, saveHighScore, isNewHighScore,
    getLeaderboard, saveToLeaderboard,
    getUnlockedAchievements, unlockAchievement,
    getDailyData, saveDailyScore, hasDailyScore,
    getTotalGames, incrementTotalGames,
  }
}
