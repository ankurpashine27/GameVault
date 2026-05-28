import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { CANVAS_W, CANVAS_H } from './constants.js'
/**
 * GameCanvas — manages the <canvas> element and handles resize/scaling.
 * Exposes `getScale()` and `logicalCoords(e)` via ref.
 */
const GameCanvas = forwardRef(function GameCanvas({ onFlap, bgLayers, gameRef }, ref) {
  const canvasRef = useRef(null)
  const scaleRef  = useRef(1)

  // Compute scale so the 480×640 logical canvas fills the parent while letterboxing
  const computeScale = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const pw = parent.clientWidth
    const ph = parent.clientHeight
    const scale = Math.min(pw / CANVAS_W, ph / CANVAS_H)
    scaleRef.current = scale

    canvas.width  = CANVAS_W
    canvas.height = CANVAS_H
    canvas.style.width  = `${CANVAS_W  * scale}px`
    canvas.style.height = `${CANVAS_H * scale}px`
  }, [])

  useEffect(() => {
    computeScale()
    const ro = new ResizeObserver(computeScale)
    const parent = canvasRef.current?.parentElement
    if (parent) ro.observe(parent)
    return () => ro.disconnect()
  }, [computeScale])

  // Expose scale/coord helpers via ref
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getScale:  () => scaleRef.current,
    logicalCoords: (e) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect  = canvas.getBoundingClientRect()
      const scale = scaleRef.current
      return {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top)  / scale,
      }
    },
  }), [])

  // Input handlers
  const handleClick = useCallback(() => { onFlap?.() }, [onFlap])

  const handleTouch = useCallback((e) => {
    e.preventDefault()
    onFlap?.()
  }, [onFlap])

  const handleKey = useCallback((e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault()
      onFlap?.()
    }
  }, [onFlap])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div
      className="flex items-center justify-center w-full h-full bg-black overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display:      'block',
          imageRendering: 'pixelated',
          cursor:       'pointer',
          touchAction:  'none',
        }}
        onClick={handleClick}
        onTouchStart={handleTouch}
      />
    </div>
  )
})

export default GameCanvas
