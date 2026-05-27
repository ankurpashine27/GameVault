import { useState, useCallback } from 'react'
import {
  LS_P1_NAME, LS_P2_NAME, LS_P1_AVATAR, LS_P2_AVATAR,
  LS_SETTINGS, LS_HISTORY, DEFAULT_SETTINGS, HISTORY_MAX, ALL_AVATARS,
} from '../constants.js'

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v != null ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function useTicTacToeSettings() {
  const [p1Name,   setP1NameState]   = useState(() => lsGet(LS_P1_NAME,   'Player 1'))
  const [p2Name,   setP2NameState]   = useState(() => lsGet(LS_P2_NAME,   'AI'))
  const [p1Avatar, setP1AvatarState] = useState(() => lsGet(LS_P1_AVATAR, ALL_AVATARS[0]))
  const [p2Avatar, setP2AvatarState] = useState(() => lsGet(LS_P2_AVATAR, ALL_AVATARS[4]))
  const [settings, setSettingsState] = useState(() => ({
    ...DEFAULT_SETTINGS, ...lsGet(LS_SETTINGS, {}),
  }))

  const setP1Name = useCallback(name => {
    lsSet(LS_P1_NAME, name)
    setP1NameState(name)
  }, [])

  const setP2Name = useCallback(name => {
    lsSet(LS_P2_NAME, name)
    setP2NameState(name)
  }, [])

  const setP1Avatar = useCallback(av => {
    lsSet(LS_P1_AVATAR, av)
    setP1AvatarState(av)
  }, [])

  const setP2Avatar = useCallback(av => {
    lsSet(LS_P2_AVATAR, av)
    setP2AvatarState(av)
  }, [])

  const updateSettings = useCallback(patch => {
    setSettingsState(prev => {
      const next = { ...prev, ...patch }
      lsSet(LS_SETTINGS, next)
      return next
    })
  }, [])

  // Save a completed match to history
  const saveMatchToHistory = useCallback(entry => {
    const history = lsGet(LS_HISTORY, [])
    history.unshift({ ...entry, date: new Date().toISOString() })
    if (history.length > HISTORY_MAX) history.length = HISTORY_MAX
    lsSet(LS_HISTORY, history)
  }, [])

  const getHistory = useCallback(() => lsGet(LS_HISTORY, []), [])

  return {
    p1Name, setP1Name,
    p2Name, setP2Name,
    p1Avatar, setP1Avatar,
    p2Avatar, setP2Avatar,
    settings, updateSettings,
    saveMatchToHistory, getHistory,
  }
}
