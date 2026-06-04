/**
 * Grimhold — audio hook. AudioContext + SFX bus + two music tracks
 * (exploration & combat) crossfaded by alert state, plus boss/ambient swaps.
 */
import { useRef, useEffect, useCallback } from 'react'
import { playSfx as playSfxRaw } from '../audio/sfx.js'
import { createMood } from '../audio/musicGenerator.js'

export function useAudio(settings) {
  const ctxRef = useRef(null)
  const sfxGain = useRef(null)
  const musicGain = useRef(null)
  const calmRef = useRef(null)
  const combatRef = useRef(null)
  const baseMoodRef = useRef('exploration')

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      const ctx = new AC()
      ctxRef.current = ctx
      const sg = ctx.createGain(); sg.gain.value = settings.sfxVol; sg.connect(ctx.destination); sfxGain.current = sg
      const mg = ctx.createGain(); mg.gain.value = settings.musicVol; mg.connect(ctx.destination); musicGain.current = mg
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [settings.sfxVol, settings.musicVol])

  useEffect(() => {
    if (sfxGain.current) sfxGain.current.gain.value = settings.sfxVol
    if (musicGain.current) musicGain.current.gain.value = settings.musicVol
  }, [settings.sfxVol, settings.musicVol])

  const playSfx = useCallback((name, opts) => {
    const ctx = ctxRef.current
    if (ctx && sfxGain.current) playSfxRaw(ctx, sfxGain.current, name, opts)
  }, [])

  const startMusic = useCallback((baseMood) => {
    const ctx = ensureCtx()
    stopMusic()
    baseMoodRef.current = baseMood
    if (settings.musicVol <= 0) return
    calmRef.current = createMood(ctx, musicGain.current, baseMood); calmRef.current.start(0.8)
    combatRef.current = createMood(ctx, musicGain.current, baseMood === 'boss' ? 'boss' : 'combat'); combatRef.current.start(0.0001)
  }, [ensureCtx, settings.musicVol]) // eslint-disable-line

  const setAlert = useCallback((alert) => {
    if (!calmRef.current || !combatRef.current) return
    calmRef.current.setVol(alert ? 0.0001 : 0.8)
    combatRef.current.setVol(alert ? 0.8 : 0.0001)
  }, [])

  function stopMusic() {
    calmRef.current?.stop(); calmRef.current = null
    combatRef.current?.stop(); combatRef.current = null
  }
  const stop = useCallback(() => stopMusic(), [])
  const suspend = useCallback(() => ctxRef.current?.suspend?.(), [])
  const resume = useCallback(() => ctxRef.current?.resume?.(), [])

  useEffect(() => () => { stopMusic(); try { ctxRef.current?.close() } catch { /* noop */ } }, [])

  return { ensureCtx, playSfx, startMusic, stopMusic: stop, setAlert, suspend, resume }
}
