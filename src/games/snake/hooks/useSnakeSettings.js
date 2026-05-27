import { useState, useCallback } from 'react'
import {
  DEFAULT_SETTINGS, SKINS,
  LS_PLAYER_NAME, LS_SKIN, LS_SETTINGS, LS_LEADERBOARD, LS_PERSONAL_BESTS,
  LEADERBOARD_MAX_STORED,
} from '../constants.js'
import { pbKey } from '../utils.js'

const readLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

const writeLS = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}

export function useSnakeSettings() {
  const [playerName, setPlayerNameState] = useState(() =>
    readLS(LS_PLAYER_NAME, 'Anonymous')
  )

  const [skin, setSkinState] = useState(() => {
    const saved = readLS(LS_SKIN, 'classic')
    return SKINS[saved] ? saved : 'classic'
  })

  const [settings, setSettingsState] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...readLS(LS_SETTINGS, {}),
  }))

  const setPlayerName = useCallback((name) => {
    const trimmed = name.trim() || 'Anonymous'
    writeLS(LS_PLAYER_NAME, trimmed)
    setPlayerNameState(trimmed)
  }, [])

  const setSkin = useCallback((id) => {
    if (!SKINS[id]) return
    writeLS(LS_SKIN, id)
    setSkinState(id)
  }, [])

  const updateSettings = useCallback((patch) => {
    setSettingsState(prev => {
      const next = { ...prev, ...patch }
      writeLS(LS_SETTINGS, next)
      return next
    })
  }, [])

  const getPersonalBest = useCallback((gridSize, difficulty) => {
    const bests = readLS(LS_PERSONAL_BESTS, {})
    return bests[pbKey(gridSize, difficulty)] ?? 0
  }, [])

  const savePersonalBest = useCallback((gridSize, difficulty, score) => {
    const bests = readLS(LS_PERSONAL_BESTS, {})
    const key = pbKey(gridSize, difficulty)
    if (score > (bests[key] ?? 0)) {
      bests[key] = score
      writeLS(LS_PERSONAL_BESTS, bests)
      return true // new record
    }
    return false
  }, [])

  const saveToLeaderboard = useCallback((entry) => {
    const board = readLS(LS_LEADERBOARD, [])
    board.push({ ...entry, date: new Date().toISOString() })
    board.sort((a, b) => b.score - a.score)
    writeLS(LS_LEADERBOARD, board.slice(0, LEADERBOARD_MAX_STORED))
  }, [])

  const getLeaderboard = useCallback(() =>
    readLS(LS_LEADERBOARD, []), [])

  return {
    playerName, setPlayerName,
    skin, setSkin,
    settings, updateSettings,
    getPersonalBest, savePersonalBest,
    saveToLeaderboard, getLeaderboard,
  }
}
