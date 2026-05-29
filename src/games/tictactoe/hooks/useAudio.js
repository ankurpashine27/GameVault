import { useRef, useCallback, useEffect } from 'react'
import { startMusic, stopMusic, setMusicVolume } from '../audio/musicGenerator.js'
import * as SFX from '../audio/sfx.js'

/**
 * Unified audio hook for Tic-Tac-Toe.
 * Manages a single AudioContext, SFX dispatch, and background music.
 *
 * settings shape: { sfxVol: 0–1, musicVol: 0–1, musicTrack: string }
 */
export function useAudio(settings) {
  const ctxRef      = useRef(null)
  const settingsRef = useRef(settings)

  useEffect(() => { settingsRef.current = settings }, [settings])

  // ── AudioContext (lazy, user-gesture-gated) ────────────────────────────────
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {})
    }
    return ctxRef.current
  }, [])

  // ── SFX ───────────────────────────────────────────────────────────────────
  const play = useCallback((name) => {
    const vol = settingsRef.current.sfxVol
    if (vol <= 0) return
    const ctx = ensureCtx()
    const map = {
      place:       SFX.playPlace,
      win:         SFX.playWin,
      lose:        SFX.playLose,
      draw:        SFX.playDraw,
      powerUpArm:  SFX.playPowerUpArm,
      timerTick:   SFX.playTimerTick,
    }
    map[name]?.(ctx, vol)
  }, [ensureCtx])

  // ── Music ─────────────────────────────────────────────────────────────────
  const startTrack = useCallback((trackId) => {
    if (!trackId || trackId === 'none') return
    const vol = settingsRef.current.musicVol
    if (vol <= 0) return
    const ctx = ensureCtx()
    startMusic(ctx, trackId, vol)
  }, [ensureCtx])

  const stopTrack = useCallback(() => {
    if (!ctxRef.current) return
    stopMusic(ctxRef.current)
  }, [])

  const setVolume = useCallback((vol) => {
    if (!ctxRef.current) return
    setMusicVolume(ctxRef.current, vol)
  }, [])

  // Keep live music volume in sync with settings changes
  useEffect(() => {
    setVolume(settings.musicVol)
  }, [settings.musicVol, setVolume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        stopMusic(ctxRef.current)
        ctxRef.current.close().catch(() => {})
        ctxRef.current = null
      }
    }
  }, [])

  return { play, startTrack, stopTrack, setVolume, ensureCtx }
}
