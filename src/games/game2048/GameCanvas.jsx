/**
 * 2048 GameCanvas — canvas sizing via ResizeObserver.
 * Identical pattern to FlappyBird's GameCanvas.
 */

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { CANVAS_W, CANVAS_H } from './constants.js'

const GameCanvas = forwardRef(function GameCanvas(_props, ref) {
  const canvasRef = useRef(null)
  const scaleRef  = useRef(1)

  const computeScale = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const pw = parent.clientWidth
    const ph = parent.clientHeight
    if (!pw || !ph) return

    const scale = Math.min(pw / CANVAS_W, ph / CANVAS_H)
    scaleRef.current = scale

    canvas.width  = CANVAS_W
    canvas.height = CANVAS_H
    canvas.style.width  = `${Math.round(CANVAS_W * scale)}px`
    canvas.style.height = `${Math.round(CANVAS_H * scale)}px`
  }, [])

  useEffect(() => {
    computeScale()
    const ro = new ResizeObserver(computeScale)
    const parent = canvasRef.current?.parentElement
    if (parent) ro.observe(parent)
    return () => ro.disconnect()
  }, [computeScale])

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getScale:  () => scaleRef.current,
  }), [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display:        'block',
        imageRendering: 'pixelated',
        pointerEvents:  'none',
      }}
    />
  )
})

export default GameCanvas
