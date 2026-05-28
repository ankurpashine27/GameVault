import { useRef, useCallback, useEffect } from 'react'
import { startMusic, stopMusic, setMusicVolume } from '../audio/musicGenerator.js'
import * as SFX from '../audio/sfx.js'

/**
 * Manages a single AudioContext for the lifetime of the game component.
 * Provides play() for SFX and startTrack() / stopTrack() for music.
 */
export function useAudio(settings) {
  const ctxRef      = useRef(null)
  const settingsRef = useRef(settings)

  // Keep settings ref current
  useEffect(() => { settingsRef.current = settings }, [settings])

  // Lazy AudioContext init — must be triggered by a user gesture
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {})
    }
    return ctxRef.current
  }, [])

  // ─── SFX ──────────────────────────────────────────────────────────────────
  const play = useCallback((name) => {
    if (settingsRef.current.sfxVolume <= 0) return
    const ctx = ensureCtx()
    const vol = settingsRef.current.sfxVolume
    const map = {
      flap:            SFX.playFlap,
      score:           SFX.playScore,
      death:           SFX.playDeath,
      hit:             SFX.playHit,
      coin:            SFX.playCoin,
      gem:             SFX.playGem,
      star:            SFX.playStar,
      collection_item: SFX.playCollectionItem,
      powerup:         SFX.playPowerup,
      stage_up:        SFX.playStageUp,
      shield_hit:      SFX.playShieldHit,
      powerup_expire:  SFX.playPowerupExpire,
      achievement:     SFX.playAchievement,
    }
    map[name]?.(ctx, vol)
  }, [ensureCtx])

  // ─── Music ────────────────────────────────────────────────────────────────
  const startTrack = useCallback((track) => {
    if (settingsRef.current.musicVolume <= 0) return
    const ctx = ensureCtx()
    startMusic(ctx, track, settingsRef.current.musicVolume)
  }, [ensureCtx])

  const stopTrack = useCallback(() => {
    if (!ctxRef.current) return
    stopMusic(ctxRef.current)
  }, [])

  const setVolume = useCallback((vol) => {
    if (!ctxRef.current) return
    setMusicVolume(ctxRef.current, vol)
  }, [])

  // Update music volume when settings change
  useEffect(() => {
    setVolume(settings.musicVolume)
  }, [settings.musicVolume, setVolume])

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
