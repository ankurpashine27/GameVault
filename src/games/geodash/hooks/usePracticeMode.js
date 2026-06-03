/**
 * Pulse Rush — practice mode checkpoints. Up to MAX_CHECKPOINTS per session,
 * stored in memory only (never persisted). A checkpoint snapshots everything
 * needed to respawn mid-level.
 */
import { useRef, useState, useCallback } from 'react'
import { MAX_CHECKPOINTS, BEAT_WIDTH } from '../constants.js'

function snapshot(g) {
  return {
    worldX: g.worldX,
    speedScale: g.speedScale,
    mirror: { ...g.mirror },
    bgEventIdx: g.bgEventIdx,
    player: { ...g.player },
    collectedCoins: new Set(g.collectedCoins),
    triggered: new Set(g.triggered),
  }
}

export function usePracticeMode() {
  const checkpointsRef = useRef([])
  const [positions, setPositions] = useState([]) // worldX list for HUD flags

  const placeCheckpoint = useCallback((g) => {
    if (checkpointsRef.current.length >= MAX_CHECKPOINTS) return false
    checkpointsRef.current.push(snapshot(g))
    setPositions(checkpointsRef.current.map(c => c.worldX / (g.level.totalBeats * BEAT_WIDTH)))
    return true
  }, [])

  const respawn = useCallback((g) => {
    const cp = checkpointsRef.current[checkpointsRef.current.length - 1]
    if (!cp) return false
    g.worldX = cp.worldX
    g.speedScale = cp.speedScale
    g.mirror = { ...cp.mirror }
    g.bgEventIdx = cp.bgEventIdx
    g.player = { ...cp.player }
    g.collectedCoins = new Set(cp.collectedCoins)
    g.triggered = new Set(cp.triggered)
    g.particles = []
    g.waveTrail = []
    g.camera.shake = 0
    g.flash = { color: '#fff', t: 0 }
    g.status = 'running'
    return true
  }, [])

  const clearCheckpoints = useCallback(() => {
    checkpointsRef.current = []
    setPositions([])
  }, [])

  const remaining = MAX_CHECKPOINTS - positions.length

  return { placeCheckpoint, respawn, clearCheckpoints, positions, remaining, count: positions.length }
}
