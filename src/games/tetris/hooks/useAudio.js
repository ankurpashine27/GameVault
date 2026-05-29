import { useRef, useEffect, useCallback } from 'react'
import {
  playMove, playRotate, playSoftDrop, playHardDrop, playLock, playHold,
  playLineClear, playTSpin, playCombo, playBackToBack, playPerfectClear,
  playLevelUp, playPowerupEarn, playPowerupActivate, playGameOver, playWarning,
} from '../audio/sfx.js'
import { startMusic, stopMusic, setMusicVolume, setMusicTempo } from '../audio/musicGenerator.js'

const SFX_MAP = {
  move:             (ctx, vol) => playMove(ctx, vol),
  rotate:           (ctx, vol) => playRotate(ctx, vol),
  soft_drop:        (ctx, vol) => playSoftDrop(ctx, vol),
  hard_drop:        (ctx, vol) => playHardDrop(ctx, vol),
  lock:             (ctx, vol) => playLock(ctx, vol),
  hold:             (ctx, vol) => playHold(ctx, vol),
  line_clear:       (ctx, vol, lines) => playLineClear(ctx, vol, lines),
  tspin:            (ctx, vol) => playTSpin(ctx, vol),
  combo:            (ctx, vol, count) => playCombo(ctx, vol, count),
  back_to_back:     (ctx, vol) => playBackToBack(ctx, vol),
  perfect_clear:    (ctx, vol) => playPerfectClear(ctx, vol),
  level_up:         (ctx, vol) => playLevelUp(ctx, vol),
  powerup_earn:     (ctx, vol) => playPowerupEarn(ctx, vol),
  powerup_activate: (ctx, vol, type) => playPowerupActivate(ctx, vol, type),
  game_over:        (ctx, vol) => playGameOver(ctx, vol),
  warning:          (ctx, vol) => playWarning(ctx, vol),
}

export function useAudio(settings) {
  const ctxRef      = useRef(null)
  const settingsRef = useRef(settings)

  // Keep settingsRef in sync with latest settings without re-creating callbacks
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch {
        return null
      }
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {})
    }
    return ctxRef.current
  }, [])

  const play = useCallback((name, ...args) => {
    const vol = settingsRef.current?.sfxVolume ?? 0.6
    if (!vol) return
    const ctx = ensureCtx()
    if (!ctx) return
    const fn = SFX_MAP[name]
    if (fn) fn(ctx, vol, ...args)
  }, [ensureCtx])

  const startTrack = useCallback((trackId) => {
    const vol = settingsRef.current?.musicVolume ?? 0.4
    if (!vol) return
    const ctx = ensureCtx()
    if (!ctx) return
    startMusic(ctx, trackId, vol)
  }, [ensureCtx])

  const stopTrack = useCallback(() => {
    if (ctxRef.current) {
      stopMusic(ctxRef.current)
    }
  }, [])

  const setVolume = useCallback((vol) => {
    if (ctxRef.current) {
      setMusicVolume(ctxRef.current, vol)
    }
  }, [])

  const setTempo = useCallback((bpm) => {
    if (ctxRef.current) {
      setMusicTempo(ctxRef.current, bpm)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        stopMusic(ctxRef.current)
        ctxRef.current.close().catch(() => {})
      }
    }
  }, [])

  return { play, startTrack, stopTrack, setVolume, setTempo, ensureCtx }
}
