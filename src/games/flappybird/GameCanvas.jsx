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

  // Keep a ref to onFlap so keydown listener never goes stale
  const onFlapRef = useRef(onFlap)
  useEffect(() => { onFlapRef.current = onFlap }, [onFlap])

  // Keyboard: Space / ArrowUp / Enter
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        e.preventDefault()
        onFlapRef.current?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])   // registered once; always reads latest onFlap via ref

  // Click: whole container (covers letterbox bars)
  const handleClick = useCallback((e) => {
    // Ignore right-click
    if (e.button !== undefined && e.button !== 0) return
    onFlapRef.current?.()
  }, [])

  // Touch: whole container
  const handleTouch = useCallback((e) => {
    e.preventDefault()
    onFlapRef.current?.()
  }, [])

  return (
    <div
      className="flex items-center justify-center w-full h-full bg-black overflow-hidden"
      style={{ touchAction: 'none', cursor: 'pointer', userSelect: 'none' }}
      onClick={handleClick}
      onTouchStart={handleTouch}
    >
      <canvas
        ref={canvasRef}
        style={{
          display:        'block',
          imageRendering: 'pixelated',
          touchAction:    'none',
          pointerEvents:  'none',   // let the outer div handle all input
        }}
      />
    </div>
  )
})

export default GameCanvas
