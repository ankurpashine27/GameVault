/**
 * Pulse Rush — audio hook. Owns the AudioContext, separate music/SFX gain
 * buses, the procedural music track, and the beat clock. Context is created /
 * resumed on first user interaction (ensureCtx).
 */
import { useRef, useEffect, useCallback } from 'react'
import { playSfx as playSfxRaw } from '../audio/sfx.js'
import { createMusicTrack } from '../audio/musicGenerator.js'
import { createBeatClock } from '../audio/beatSync.js'

export function useAudio(settings) {
  const ctxRef = useRef(null)
  const musicGainRef = useRef(null)
  const sfxGainRef = useRef(null)
  const trackRef = useRef(null)
  const clockRef = useRef(null)

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      const ctx = new AC()
      ctxRef.current = ctx
      const mg = ctx.createGain(); mg.gain.value = settings.musicVolume; mg.connect(ctx.destination)
      const sg = ctx.createGain(); sg.gain.value = settings.sfxVolume; sg.connect(ctx.destination)
      musicGainRef.current = mg
      sfxGainRef.current = sg
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [settings.musicVolume, settings.sfxVolume])

  // Keep gains synced to settings.
  useEffect(() => {
    if (musicGainRef.current) musicGainRef.current.gain.value = settings.musicVolume
    if (sfxGainRef.current) sfxGainRef.current.gain.value = settings.sfxVolume
  }, [settings.musicVolume, settings.sfxVolume])

  const playSfx = useCallback((name, opts) => {
    const ctx = ctxRef.current
    if (!ctx || !sfxGainRef.current) return
    playSfxRaw(ctx, sfxGainRef.current, name, opts)
  }, [])

  const startMusic = useCallback((level) => {
    const ctx = ensureCtx()
    if (trackRef.current) { trackRef.current.stop(); trackRef.current = null }
    if (settings.musicVolume > 0 && isFinite(level.bpm)) {
      trackRef.current = createMusicTrack(ctx, musicGainRef.current, level)
      trackRef.current.start()
    }
    clockRef.current = createBeatClock(ctx, level.bpm || 120)
    clockRef.current.start(ctx.currentTime)
  }, [ensureCtx, settings.musicVolume])

  const stopMusic = useCallback(() => {
    if (trackRef.current) { trackRef.current.stop(); trackRef.current = null }
  }, [])

  const suspend = useCallback(() => { ctxRef.current?.suspend?.() }, [])
  const resume = useCallback(() => { ctxRef.current?.resume?.() }, [])

  /** Beat info for visual pulse: { phase 0..1, onKick }. */
  const getBeatInfo = useCallback(() => {
    const c = clockRef.current
    if (!c) return { phase: 0, onKick: false, beat: 0 }
    const beat = c.beat
    const phase = beat - Math.floor(beat)
    const inBar = Math.floor(beat) % 4
    return { phase, onKick: (inBar === 0 || inBar === 2) && phase < 0.12, beat }
  }, [])

  useEffect(() => () => {
    try { trackRef.current?.stop() } catch { /* noop */ }
    try { ctxRef.current?.close() } catch { /* noop */ }
  }, [])

  return { ensureCtx, playSfx, startMusic, stopMusic, suspend, resume, getBeatInfo }
}
