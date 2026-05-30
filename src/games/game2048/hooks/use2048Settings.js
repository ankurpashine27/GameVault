/**
 * 2048 — Settings and persistence hook.
 */

import { useCallback, useState } from 'react'
import { lsGet, lsSet, todayStr } from '../utils.js'
import {
  LS_SETTINGS, LS_PLAYER_NAME, LS_LEADERBOARD,
  LS_PERSONAL_BESTS, LS_ACHIEVEMENTS, LS_DAILY, LS_STATS,
} from '../constants.js'

const DEFAULT_SETTINGS = {
  gridSize:           4,
  targetTile:         2048,
  mode:               'classic',
  theme:              'numbers',
  palette:            'classic',
  background:         'minimal_dark',
  unlimitedUndos:     false,
  animSpeed:          'normal',
  musicVolume:        0.3,
  sfxVolume:          0.5,
  musicTrackId:       'calm',
  timeAttackDuration: 120,
  limitedMovesDiff:   'medium',
  obstaclePatternIndex: 0,
  obstacleRerolls:    0,
}

export function use2048Settings() {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...lsGet(LS_SETTINGS, {}),
  }))

  const [playerName, setPlayerNameState] = useState(() =>
    lsGet(LS_PLAYER_NAME, 'Player')
  )

  const updateSettings = useCallback((partial) => {
    setSettings(prev => {
      const next = { ...prev, ...partial }
      lsSet(LS_SETTINGS, next)
      return next
    })
  }, [])

  const setPlayerName = useCallback((name) => {
    setPlayerNameState(name)
    lsSet(LS_PLAYER_NAME, name)
  }, [])

  // ─── Leaderboard ──────────────────────────────────────────────────────────
  const getLeaderboard = useCallback(() =>
    lsGet(LS_LEADERBOARD, [])
  , [])

  const saveToLeaderboard = useCallback((entry) => {
    const lb = lsGet(LS_LEADERBOARD, [])
    lb.push(entry)
    lb.sort((a, b) => b.score - a.score)
    lsSet(LS_LEADERBOARD, lb.slice(0, 100))
  }, [])

  // ─── Personal bests ───────────────────────────────────────────────────────
  const getPersonalBests = useCallback(() =>
    lsGet(LS_PERSONAL_BESTS, {})
  , [])

  const savePersonalBest = useCallback((mode, gridSize, data) => {
    const pbs = lsGet(LS_PERSONAL_BESTS, {})
    const key = `${mode}_${gridSize}`
    const existing = pbs[key]
    if (!existing || data.score > existing.score) {
      pbs[key] = data
      lsSet(LS_PERSONAL_BESTS, pbs)
    }
  }, [])

  // ─── Achievements ─────────────────────────────────────────────────────────
  const getAchievements = useCallback(() =>
    lsGet(LS_ACHIEVEMENTS, [])
  , [])

  const unlockAchievement = useCallback((id) => {
    const achs = lsGet(LS_ACHIEVEMENTS, [])
    if (!achs.includes(id)) {
      achs.push(id)
      lsSet(LS_ACHIEVEMENTS, achs)
    }
  }, [])

  const isAchievementUnlocked = useCallback((id) => {
    const achs = lsGet(LS_ACHIEVEMENTS, [])
    return achs.includes(id)
  }, [])

  // ─── Daily challenge ──────────────────────────────────────────────────────
  const getDailyData = useCallback(() =>
    lsGet(LS_DAILY, {})
  , [])

  const saveDailyResult = useCallback((data) => {
    const daily = lsGet(LS_DAILY, {})
    daily[todayStr()] = data
    lsSet(LS_DAILY, daily)
  }, [])

  const getDailyStreak = useCallback(() => {
    const daily = lsGet(LS_DAILY, {})
    const today = new Date()
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (daily[key]) {
        streak++
      } else {
        break
      }
    }
    return streak
  }, [])

  // ─── Stats ────────────────────────────────────────────────────────────────
  const getStats = useCallback(() =>
    lsGet(LS_STATS, {
      totalGames: 0,
      totalUndos: 0,
      highestTileEver: 0,
      highScoreEver: 0,
      dailyCompleted: 0,
    })
  , [])

  const updateStats = useCallback((partial) => {
    const stats = lsGet(LS_STATS, {})
    const next = { ...stats, ...partial }
    lsSet(LS_STATS, next)
  }, [])

  return {
    settings,
    updateSettings,
    playerName,
    setPlayerName,
    getLeaderboard,
    saveToLeaderboard,
    getPersonalBests,
    savePersonalBest,
    getAchievements,
    unlockAchievement,
    isAchievementUnlocked,
    getDailyData,
    saveDailyResult,
    getDailyStreak,
    getStats,
    updateStats,
  }
}
