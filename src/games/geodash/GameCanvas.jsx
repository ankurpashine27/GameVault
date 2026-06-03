/**
 * Pulse Rush — canvas element with DPR-aware, aspect-preserving sizing.
 * Stores the logical→device transform (_scale/_ox/_oy) on the canvas so the
 * game loop can letterbox the fixed LOGICAL_W×LOGICAL_H render into any size.
 */
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { LOGICAL_W, LOGICAL_H } from './constants.js'

const GameCanvas = forwardRef(function GameCanvas(_props, ref) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = wrap.clientWidth || LOGICAL_W
      const ch = wrap.clientHeight || LOGICAL_H
      canvas.width = Math.max(1, Math.floor(cw * dpr))
      canvas.height = Math.max(1, Math.floor(ch * dpr))
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'
      const scale = Math.min(cw / LOGICAL_W, ch / LOGICAL_H) * dpr
      canvas._scale = scale
      canvas._ox = (canvas.width - LOGICAL_W * scale) / 2
      canvas._oy = (canvas.height - LOGICAL_H * scale) / 2
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener('resize', resize)
    return () => { ro.disconnect(); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block" />
    </div>
  )
})

export default GameCanvas
