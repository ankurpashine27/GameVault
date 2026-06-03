/**
 * Pulse Rush — persistence hook. Owns all localStorage state: player name, icon
 * kit config, per-level progress, currency (derived), achievements, leaderboard,
 * infinite best, settings, and lifetime stats.
 */
import { useState, useCallback } from 'react'
import { LS, DEFAULT_SETTINGS, FORMS, DIFFICULTIES } from '../constants.js'
import { LEVELS } from '../levels/index.js'
import { ICON_LIST, isIconUnlocked } from '../icons/iconDefinitions.js'
import { safeParse, todayStr } from '../utils.js'

const DEFAULT_PRIMARY = {
  cube: '#39d0ff', ship: '#ff5a5a', ball: '#3fe08a', ufo: '#b06bff',
  wave: '#ff6bd6', robot: '#ffb13f', spider: '#a371f7', swing: '#ffd23f',
}

function defaultIconConfig() {
  const cfg = {}
  for (const f of FORMS) {
    cfg[f] = {
      icon: 0, primary: DEFAULT_PRIMARY[f], secondary: '#ffffff',
      glow: true, glowColor: DEFAULT_PRIMARY[f], trail: 'default', death: 'explosion',
    }
  }
  return cfg
}

const read = (key, fallback) => safeParse(localStorage.getItem(key), fallback)
const write = (key, val) => localStorage.setItem(key, JSON.stringify(val))

export function useGeoDashSettings() {
  const [playerName, setPlayerNameState] = useState(() => localStorage.getItem(LS.PLAYER_NAME) || 'Anonymous')
  const [iconConfig, setIconConfig] = useState(() => ({ ...defaultIconConfig(), ...read(LS.ICON_CONFIG, {}) }))
  const [progress, setProgress] = useState(() => read(LS.PROGRESS, {}))
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...read(LS.SETTINGS, {}) }))
  const [achievements, setAchievements] = useState(() => read(LS.ACHIEVEMENTS, {}))
  const [stats, setStats] = useState(() => read(LS.STATS, {
    totalDeaths: 0, totalAttempts: 0, totalCompletions: 0, totalCoins: 0, totalStars: 0, totalTimePlayed: 0,
  }))
  const [infiniteBest, setInfiniteBest] = useState(() => read(LS.INFINITE_BEST, { score: 0, beatsReached: 0, date: '' }))

  // ─── Player name ──────────────────────────────────────────────────────────
  const setPlayerName = useCallback((n) => {
    const name = (n || 'Anonymous').slice(0, 18)
    localStorage.setItem(LS.PLAYER_NAME, name)
    setPlayerNameState(name)
  }, [])

  // ─── Icon kit ─────────────────────────────────────────────────────────────
  const setFormIconConfig = useCallback((form, patch) => {
    setIconConfig(prev => {
      const next = { ...prev, [form]: { ...prev[form], ...patch } }
      write(LS.ICON_CONFIG, next)
      return next
    })
  }, [])

  // ─── Settings ─────────────────────────────────────────────────────────────
  const updateSettings = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      write(LS.SETTINGS, next)
      return next
    })
  }, [])

  // ─── Stats ────────────────────────────────────────────────────────────────
  const bumpStats = useCallback((patch) => {
    setStats(prev => {
      const next = { ...prev }
      for (const k in patch) next[k] = (next[k] || 0) + patch[k]
      write(LS.STATS, next)
      return next
    })
  }, [])

  // ─── Progress ─────────────────────────────────────────────────────────────
  const getLevelProgress = useCallback((id) =>
    progress[id] || { completed: false, bestPercent: 0, normalAttempts: 0, practiceAttempts: 0, coinsCollected: [] },
    [progress])

  const saveAttempt = useCallback((id, practice) => {
    setProgress(prev => {
      const cur = prev[id] || { completed: false, bestPercent: 0, normalAttempts: 0, practiceAttempts: 0, coinsCollected: [] }
      const next = {
        ...prev,
        [id]: { ...cur, [practice ? 'practiceAttempts' : 'normalAttempts']: (cur[practice ? 'practiceAttempts' : 'normalAttempts'] || 0) + 1 },
      }
      write(LS.PROGRESS, next)
      return next
    })
  }, [])

  const saveLevelResult = useCallback((id, { percent, completed, coins }) => {
    setProgress(prev => {
      const cur = prev[id] || { completed: false, bestPercent: 0, normalAttempts: 0, practiceAttempts: 0, coinsCollected: [] }
      const mergedCoins = Array.from(new Set([...(cur.coinsCollected || []), ...(coins || [])]))
      const next = {
        ...prev,
        [id]: {
          ...cur,
          completed: cur.completed || completed,
          bestPercent: Math.max(cur.bestPercent || 0, percent || 0),
          coinsCollected: mergedCoins,
        },
      }
      write(LS.PROGRESS, next)
      return next
    })
  }, [])

  // ─── Derived currency ─────────────────────────────────────────────────────
  const currency = (() => {
    let stars = 0, demonStars = 0, coins = 0, completions = 0
    for (const lvl of LEVELS) {
      const pr = progress[lvl.id]
      if (pr?.completed) {
        completions++
        if (DIFFICULTIES[lvl.difficulty]?.demon) demonStars++
        else stars += lvl.stars
      }
      coins += (pr?.coinsCollected?.length || 0)
    }
    return { stars, demonStars, coins, completions }
  })()

  // ─── Icons unlocked ───────────────────────────────────────────────────────
  const getUnlockedIcons = useCallback(() => {
    const data = currency
    const ids = new Set()
    for (const icon of ICON_LIST) if (isIconUnlocked(icon, data)) ids.add(icon.id)
    return ids
  }, [currency])

  // ─── Achievements ─────────────────────────────────────────────────────────
  const unlockAchievement = useCallback((id) => {
    let isNew = false
    setAchievements(prev => {
      if (prev[id]) return prev
      isNew = true
      const next = { ...prev, [id]: true }
      write(LS.ACHIEVEMENTS, next)
      return next
    })
    return isNew
  }, [])

  // ─── Leaderboard ──────────────────────────────────────────────────────────
  const getLeaderboard = useCallback(() => read(LS.LEADERBOARD, { levels: [], infinite: [] }), [])

  const addLevelCompletion = useCallback((entry) => {
    const lb = read(LS.LEADERBOARD, { levels: [], infinite: [] })
    lb.levels.push({ ...entry, date: todayStr() })
    lb.levels = lb.levels.slice(-300)
    write(LS.LEADERBOARD, lb)
  }, [])

  const addInfiniteScore = useCallback((entry) => {
    const lb = read(LS.LEADERBOARD, { levels: [], infinite: [] })
    lb.infinite.push({ ...entry, date: todayStr() })
    lb.infinite.sort((a, b) => b.score - a.score)
    lb.infinite = lb.infinite.slice(0, 20)
    write(LS.LEADERBOARD, lb)
    setInfiniteBest(prev => {
      if (entry.score > (prev.score || 0)) {
        const nb = { score: entry.score, beatsReached: entry.beatsReached, date: todayStr() }
        write(LS.INFINITE_BEST, nb)
        return nb
      }
      return prev
    })
  }, [])

  return {
    playerName, setPlayerName,
    iconConfig, setFormIconConfig,
    settings, updateSettings,
    progress, getLevelProgress, saveAttempt, saveLevelResult,
    currency, getUnlockedIcons,
    achievements, unlockAchievement,
    stats, bumpStats,
    infiniteBest,
    getLeaderboard, addLevelCompletion, addInfiniteScore,
  }
}
