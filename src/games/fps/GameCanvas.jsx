/**
 * Grimhold — display canvas. The engine renders to a 640×400 offscreen canvas;
 * this canvas is the upscale target (drawImage). Sized to fill the GameFrame.
 */
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'

const GameCanvas = forwardRef(function GameCanvas({ onCanvasClick }, ref) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }), [])

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current
    if (!canvas || !wrap) return
    const resize = () => {
      // Upscaling a 640×400 image — device pixels beyond CSS size add no detail.
      const w = Math.max(1, wrap.clientWidth | 0), h = Math.max(1, wrap.clientHeight | 0)
      canvas.width = w; canvas.height = h
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener('resize', resize)
    return () => { ro.disconnect(); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-black">
      <canvas
        ref={canvasRef}
        onClick={onCanvasClick}
        className="block w-full h-full cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
})

export default GameCanvas
