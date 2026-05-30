/**
 * 2048 — Audio hook. Stable callbacks, single AudioContext.
 */

import { useRef, useCallback, useEffect } from 'react'
import { startMusic, stopMusic, setMusicVolume } from '../audio/musicGenerator.js'
import * as SFX from '../audio/sfx.js'

export function useAudio(settings) {
  const ctxRef      = useRef(null)
  const settingsRef = useRef(settings)

  useEffect(() => { settingsRef.current = settings }, [settings])

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {})
    }
    return ctxRef.current
  }, [])

  const play = useCallback((name, ...args) => {
    if (settingsRef.current.sfxVolume <= 0) return
    const ctx = ensureCtx()
    const vol = settingsRef.current.sfxVolume
    const map = {
      slide:     () => SFX.playSlide(ctx, vol),
      merge:     (v) => SFX.playMerge(ctx, vol, v),
      spawn:     () => SFX.playSpawn(ctx, vol),
      undo:      () => SFX.playUndo(ctx, vol),
      gameover:  () => SFX.playGameOver(ctx, vol),
      win:       () => SFX.playWin(ctx, vol),
      milestone: () => SFX.playMilestone(ctx, vol),
      combo:     (level) => SFX.playComboTick(ctx, vol, level),
    }
    if (map[name]) map[name](...args)
  }, [ensureCtx])

  const startTrack = useCallback((trackId) => {
    if (settingsRef.current.musicVolume <= 0) return
    const ctx = ensureCtx()
    startMusic(ctx, trackId, settingsRef.current.musicVolume)
  }, [ensureCtx])

  const stopTrack = useCallback(() => {
    if (!ctxRef.current) return
    stopMusic(ctxRef.current)
  }, [])

  const setVolume = useCallback((vol) => {
    if (!ctxRef.current) return
    setMusicVolume(ctxRef.current, vol)
  }, [])

  useEffect(() => {
    setVolume(settings.musicVolume)
  }, [settings.musicVolume, setVolume])

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
