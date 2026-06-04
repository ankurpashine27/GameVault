/**
 * Grimhold — procedural mood music (Web Audio). createMood(ctx, dest, mood)
 * returns { start, stop, gain }. The hook crossfades exploration↔combat by
 * adjusting each track's gain based on the alert state.
 */
const MOODS = {
  exploration: { bpm: 70,  scale: [0, 3, 5, 7, 10], root: 41, wave: 'sine',     bass: 'triangle', dark: 0.3 },
  combat:      { bpm: 132, scale: [0, 2, 3, 7, 8],  root: 45, wave: 'sawtooth', bass: 'sawtooth', dark: 0.6 },
  catacombs:   { bpm: 60,  scale: [0, 1, 3, 5, 8],  root: 36, wave: 'sine',     bass: 'sine',     dark: 0.8 },
  sanctum:     { bpm: 80,  scale: [0, 1, 4, 6, 8],  root: 38, wave: 'triangle', bass: 'sawtooth', dark: 0.7 },
  boss:        { bpm: 150, scale: [0, 1, 3, 6, 7],  root: 33, wave: 'sawtooth', bass: 'sawtooth', dark: 0.9 },
}
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12)

export function createMood(ctx, dest, moodName) {
  const m = MOODS[moodName] || MOODS.exploration
  const spb = 60 / m.bpm
  const master = ctx.createGain(); master.gain.value = 0; master.connect(dest)
  let beat = 0, next = 0, timer = null, running = false
  let seed = 7

  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }

  function osc(type, f, t, dur, gain, glide) {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = type; o.frequency.setValueAtTime(f, t)
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur)
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02)
  }
  function note(deg, oct) { return midi(m.root + 12 * oct + m.scale[((deg % m.scale.length) + m.scale.length) % m.scale.length]) }

  function scheduleBeat(idx, t) {
    // bass drone on downbeats
    if (idx % 2 === 0) osc(m.bass, note(0, 0) / 2, t, spb * 1.8, 0.12 * m.dark)
    // pad chord at bar start
    if (idx % 4 === 0) [0, 2, 4].forEach(d => osc(m.wave, note(d, 1), t, spb * 3.5, 0.04))
    // sparse melody
    if (rnd() < (moodName === 'combat' || moodName === 'boss' ? 0.8 : 0.4)) {
      osc(m.wave, note((rnd() * 5) | 0, 2), t + (rnd() < 0.5 ? 0 : spb * 0.5), spb * 0.5, 0.05)
    }
    // percussive hit for intense moods
    if ((moodName === 'combat' || moodName === 'boss') && idx % 2 === 1) osc('square', 60, t, 0.08, 0.1, 30)
  }

  function tick() {
    if (!running) return
    while (next < ctx.currentTime + 0.15) { scheduleBeat(beat, next); next += spb; beat++ }
  }

  return {
    gain: master,
    start(vol = 0) { if (running) return; running = true; beat = 0; next = ctx.currentTime + 0.1; master.gain.setValueAtTime(vol, ctx.currentTime); timer = setInterval(tick, 30); tick() },
    setVol(v, at = ctx.currentTime) { try { master.gain.cancelScheduledValues(at); master.gain.linearRampToValueAtTime(Math.max(0.0001, v), at + 0.4) } catch { /* noop */ } },
    stop() { running = false; if (timer) clearInterval(timer); try { master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3); setTimeout(() => { try { master.disconnect() } catch { /* noop */ } }, 400) } catch { /* noop */ } },
  }
}
