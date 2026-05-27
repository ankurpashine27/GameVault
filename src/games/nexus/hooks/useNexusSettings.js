import { useState } from 'react'
import {
  LS_PLAYER_NAME, LS_MODE, LS_FILTER_THEME,
  LS_LEADERBOARD, LS_STREAK_RECORDS, LS_DAILY_HISTORY,
  LS_DAILY_STREAK, LS_PERSONAL_BESTS,
  LEADERBOARD_MAX, LEADERBOARD_SHOWN,
} from '../constants.js'
import { todayString } from '../utils.js'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function useNexusSettings() {
  const [playerName, setPlayerNameState] = useState(
    () => localStorage.getItem(LS_PLAYER_NAME) || 'Anonymous',
  )
  const [mode, setModeState] = useState(
    () => localStorage.getItem(LS_MODE) || 'classic',
  )
  const [filterTheme, setFilterThemeState] = useState(
    () => localStorage.getItem(LS_FILTER_THEME) || 'animals',
  )

  const setPlayerName = (n) => {
    localStorage.setItem(LS_PLAYER_NAME, n)
    setPlayerNameState(n)
  }
  const setMode = (m) => {
    localStorage.setItem(LS_MODE, m)
    setModeState(m)
  }
  const setFilterTheme = (t) => {
    localStorage.setItem(LS_FILTER_THEME, t)
    setFilterThemeState(t)
  }

  // ── Personal Bests ──────────────────────────────────────────────────────────
  const getPersonalBest = (modeId) => {
    const bests = readJSON(LS_PERSONAL_BESTS, {})
    return bests[modeId] ?? 0
  }
  const savePersonalBest = (modeId, score) => {
    const bests = readJSON(LS_PERSONAL_BESTS, {})
    if (score > (bests[modeId] ?? 0)) {
      bests[modeId] = score
      writeJSON(LS_PERSONAL_BESTS, bests)
    }
  }

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  const saveToLeaderboard = ({ name, mode: modeId, score, streak, date }) => {
    const board = readJSON(LS_LEADERBOARD, [])
    board.push({ name, mode: modeId, score: score ?? 0, streak: streak ?? 0, date: date ?? todayString() })
    board.sort((a, b) => b.score - a.score)
    writeJSON(LS_LEADERBOARD, board.slice(0, LEADERBOARD_MAX))
  }
  const getLeaderboard = (modeFilter = null) => {
    const board = readJSON(LS_LEADERBOARD, [])
    const filtered = modeFilter ? board.filter(e => e.mode === modeFilter) : board
    return filtered.slice(0, LEADERBOARD_SHOWN)
  }

  // ── Streak Records ───────────────────────────────────────────────────────────
  const getStreakRecords = () => readJSON(LS_STREAK_RECORDS, [])
  const saveStreakRecord = ({ name, streak, date }) => {
    const records = readJSON(LS_STREAK_RECORDS, [])
    records.push({ name, streak, date: date ?? todayString() })
    records.sort((a, b) => b.streak - a.streak)
    writeJSON(LS_STREAK_RECORDS, records.slice(0, LEADERBOARD_MAX))
  }

  // ── Daily ────────────────────────────────────────────────────────────────────
  const getDailyStreak = () => readJSON(LS_DAILY_STREAK, { current: 0, best: 0, lastDate: null })

  const saveDailyResult = ({ puzzleId, hintsUsed, correct, dayNumber }) => {
    // Append to history
    const history = readJSON(LS_DAILY_HISTORY, [])
    history.push({ puzzleId, hintsUsed, correct, dayNumber, date: todayString() })
    writeJSON(LS_DAILY_HISTORY, history)

    // Update streak
    const streakData = getDailyStreak()
    const today = todayString()
    const last = streakData.lastDate

    let newCurrent
    if (!last) {
      newCurrent = correct ? 1 : 0
    } else {
      const lastDate = new Date(last)
      const todayDate = new Date(today)
      const diffDays = Math.round((todayDate - lastDate) / 86400000)
      if (diffDays === 1 && correct) {
        newCurrent = streakData.current + 1
      } else if (diffDays === 0) {
        // Same day re-save — keep current
        newCurrent = streakData.current
      } else {
        newCurrent = correct ? 1 : 0
      }
    }

    const newBest = Math.max(streakData.best, newCurrent)
    writeJSON(LS_DAILY_STREAK, { current: newCurrent, best: newBest, lastDate: today })
  }

  const getDailyHistory = () => readJSON(LS_DAILY_HISTORY, [])

  // Has already played today?
  const getDailyTodayResult = () => {
    const history = getDailyHistory()
    const today = todayString()
    return history.find(h => h.date === today) ?? null
  }

  return {
    playerName, setPlayerName,
    mode, setMode,
    filterTheme, setFilterTheme,
    getPersonalBest, savePersonalBest,
    saveToLeaderboard, getLeaderboard,
    getStreakRecords, saveStreakRecord,
    getDailyStreak, saveDailyResult, getDailyHistory, getDailyTodayResult,
  }
}
