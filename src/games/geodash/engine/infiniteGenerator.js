/**
 * Pulse Rush — Infinite mode procedural generator.
 *
 * Produces an endless, seed-deterministic course by appending segments to the
 * live game state as the player advances. Difficulty (form pool, speed, segment
 * length) scales with beats survived per infiniteConfig.js.
 */
import { BEAT_WIDTH } from '../constants.js'
import { makePRNG, randInt, pick } from '../utils.js'
import { makeSegment, portalObj } from '../levels/builders.js'
import { tierForBeat } from '../levels/infiniteConfig.js'

const SPEED_NAME = { 0.5: 'slow', 1: 'normal', 1.5: 'fast', 2: 'faster', 3: 'fastest' }

export function createInfiniteRun(seed = Date.now()) {
  const rng = makePRNG(seed >>> 0)
  const st = { nextBeat: 8, currentForm: 'cube', lastSpeedName: 'normal' }

  function ensureAhead(g, _scrollPps) {
    const beat = g.worldX / BEAT_WIDTH
    while (st.nextBeat < beat + 40) {
      const cfg = tierForBeat(st.nextBeat)
      const form = pick(rng, cfg.forms)
      if (form !== st.currentForm) {
        g.objects.push(portalObj(form, st.nextBeat - 1, 4))
        st.currentForm = form
      }
      if (rng() < 0.3 && cfg.speeds.length > 1) {
        const sp = pick(rng, cfg.speeds)
        const name = SPEED_NAME[sp]
        if (name && name !== st.lastSpeedName) {
          g.objects.push(portalObj('speed_' + name, st.nextBeat - 0.5, 5))
          st.lastSpeedName = name
        }
      }
      const segLen = randInt(rng, cfg.seg[0], cfg.seg[1])
      const seg = makeSegment(form, st.nextBeat, segLen, cfg.tier, rng)
      for (const o of seg) g.objects.push(o)
      st.nextBeat += segLen + 2
    }
    // Note: we intentionally do NOT prune g.objects. Triggered orbs/portals are
    // tracked by array index, so the array must only grow (never reindex).
    // Far-behind objects are skipped cheaply by the x-range test in collision.
  }

  return {
    ensureAhead,
    beatsSurvived: (g) => g.worldX / BEAT_WIDTH,
  }
}

/** Stub "level" so the renderer / music engine work in Infinite mode. */
export function infiniteLevel() {
  return {
    id: 'infinite', name: 'Infinite Run', difficulty: 'insane',
    bpm: 150, songName: 'Endless', initialForm: 'cube', initialSpeed: 1, initialGravity: 1,
    bgColor: '#070b16', groundColor: '#0e1428', accentColor: '#39d0ff', bgPattern: 'stars',
    totalBeats: Infinity, objects: [], coins: [], bgEvents: [],
  }
}
