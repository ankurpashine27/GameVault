/**
 * Grimhold — persistence hook (player name, settings, campaign progress,
 * leaderboard, achievements, lifetime stats).
 */
import { useState, useCallback } from 'react'
import { LS, DEFAULT_SETTINGS } from '../constants.js'
import { safeParse, todayStr } from '../utils.js'

const read = (k, f) => safeParse(localStorage.getItem(k), f)
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))

export function useFPSSettings() {
  const [playerName, setNameState] = useState(() => localStorage.getItem(LS.NAME) || 'Anonymous')
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...read(LS.SETTINGS, {}) }))
  const [achievements, setAch] = useState(() => read(LS.ACHIEVEMENTS, {}))
  const [stats, setStats] = useState(() => read(LS.STATS, {
    totalKills: 0, totalDeaths: 0, totalSecretsFound: 0, totalGold: 0, totalPlaytime: 0, highestEndlessFloor: 0,
  }))

  const setPlayerName = useCallback((n) => { const name = (n || 'Anonymous').slice(0, 18); localStorage.setItem(LS.NAME, name); setNameState(name) }, [])
  const updateSettings = useCallback((patch) => setSettings(prev => { const next = { ...prev, ...patch }; write(LS.SETTINGS, next); return next }), [])
  const bumpStats = useCallback((patch) => setStats(prev => { const next = { ...prev }; for (const k in patch) next[k] = Math.max(next[k] || 0, patch._max?.includes?.(k) ? patch[k] : (next[k] || 0) + patch[k]); return next }), [])

  // Simpler explicit stat helpers
  const addStats = useCallback((patch) => setStats(prev => { const next = { ...prev }; for (const k in patch) next[k] = (next[k] || 0) + patch[k]; write(LS.STATS, next); return next }), [])
  const setMaxStat = useCallback((k, v) => setStats(prev => { if ((prev[k] || 0) >= v) return prev; const next = { ...prev, [k]: v }; write(LS.STATS, next); return next }), [])

  const unlockAchievement = useCallback((id) => {
    let isNew = false
    setAch(prev => { if (prev[id]) return prev; isNew = true; const next = { ...prev, [id]: true }; write(LS.ACHIEVEMENTS, next); return next })
    return isNew
  }, [])

  const getLeaderboard = useCallback(() => read(LS.LEADERBOARD, { campaign: [], endless: [] }), [])
  const addCampaignRecord = useCallback((entry) => { const lb = read(LS.LEADERBOARD, { campaign: [], endless: [] }); lb.campaign.push({ ...entry, date: todayStr() }); lb.campaign = lb.campaign.slice(-100); write(LS.LEADERBOARD, lb) }, [])
  const addEndlessScore = useCallback((entry) => { const lb = read(LS.LEADERBOARD, { campaign: [], endless: [] }); lb.endless.push({ ...entry, date: todayStr() }); lb.endless.sort((a, b) => b.score - a.score); lb.endless = lb.endless.slice(0, 20); write(LS.LEADERBOARD, lb) }, [])

  const getProgress = useCallback(() => read(LS.PROGRESS, { episodesUnlocked: 1 }), [])
  const saveProgress = useCallback((prog) => write(LS.PROGRESS, prog), [])

  return {
    playerName, setPlayerName, settings, updateSettings,
    achievements, unlockAchievement, stats, addStats, setMaxStat, bumpStats,
    getLeaderboard, addCampaignRecord, addEndlessScore, getProgress, saveProgress,
  }
}
