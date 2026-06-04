/**
 * Grimhold — Pointer Lock management. Accumulates mouse movementX into a ref the
 * game loop reads each frame. Falls back to arrow-key turning when unsupported.
 */
import { useRef, useState, useEffect, useCallback } from 'react'

// Pointer Lock can emit huge/garbage movementX values (OS pointer warping,
// mouse acceleration, the first event after (re)locking). Clamp each event so a
// single spike can't snap the camera across the room.
const MAX_EVENT_DX = 120

export function usePointerLock(canvasRef, onChange) {
  const [locked, setLocked] = useState(false)
  const lockedRef = useRef(false)
  const mouseDX = useRef(0)
  const skipNext = useRef(false)
  const supported = typeof document !== 'undefined' && 'pointerLockElement' in document

  const request = useCallback(() => {
    const el = canvasRef.current?.getCanvas?.() || canvasRef.current
    if (el && el.requestPointerLock) el.requestPointerLock()
  }, [canvasRef])

  useEffect(() => {
    const onLockChange = () => {
      const el = canvasRef.current?.getCanvas?.() || canvasRef.current
      const isLocked = document.pointerLockElement === el
      lockedRef.current = isLocked
      // Drop any accumulated movement and ignore the first delta after (re)lock,
      // which browsers often deliver as a large jump.
      mouseDX.current = 0
      if (isLocked) skipNext.current = true
      setLocked(isLocked)
      onChange?.(isLocked)
    }
    const onMove = (e) => {
      if (!lockedRef.current) return
      if (skipNext.current) { skipNext.current = false; return }
      let dx = e.movementX || 0
      if (dx > MAX_EVENT_DX) dx = MAX_EVENT_DX
      else if (dx < -MAX_EVENT_DX) dx = -MAX_EVENT_DX
      mouseDX.current += dx
    }
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMove)
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMove)
    }
  }, [canvasRef, onChange])

  const readDX = useCallback(() => { const d = mouseDX.current; mouseDX.current = 0; return d }, [])

  return { locked, lockedRef, request, readDX, supported }
}
