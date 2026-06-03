/**
 * Pulse Rush — beat clock. Source of truth is AudioContext.currentTime so the
 * music and visual beat pulse never drift. (Level *scroll* is driven by a px
 * accumulator in the game loop; this clock drives music + on-beat visuals.)
 */
export function createBeatClock(ctx, bpm) {
  const beatInterval = 60 / bpm
  let startTime = ctx.currentTime

  return {
    beatInterval,
    start(at = ctx.currentTime) { startTime = at },
    /** Re-anchor the clock after a pause so `beat` is continuous. */
    resync(pausedFor) { startTime += pausedFor },
    get beat() { return (ctx.currentTime - startTime) / beatInterval },
    /** Fractional position inside the current beat, [0,1). */
    phase() {
      const b = (ctx.currentTime - startTime) / beatInterval
      return b - Math.floor(b)
    },
    /** True for a brief window right after each whole beat. */
    onBeat(thresh = 0.08) { return this.phase() < thresh },
  }
}

export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12)
