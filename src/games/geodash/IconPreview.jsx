/**
 * Pulse Rush — small reusable canvas that renders a single icon design.
 * Used by the level-select header, pre-game, and the icon customizer.
 * `animate` adds an idle bob + trail dots for the customizer preview.
 */
import { useRef, useEffect } from 'react'
import { drawIcon } from './icons/iconDefinitions.js'

export default function IconPreview({
  form, variant = 0, primary = '#39d0ff', secondary = '#ffffff',
  glow = false, glowColor, trail = 'none', size = 64, animate = false, locked = false,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    let raf, t0 = performance.now(), running = true

    const draw = (now) => {
      const t = (now - t0) / 1000
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)
      const bob = animate ? Math.sin(t * 3) * size * 0.05 : 0
      const iconSize = size * 0.62
      ctx.save()
      ctx.translate(size / 2, size / 2 + bob)
      if (locked) ctx.globalAlpha = 0.25
      if (glow) { ctx.shadowColor = glowColor || primary; ctx.shadowBlur = 14 }
      drawIcon(ctx, form, variant, { size: iconSize, primary, secondary })
      ctx.restore()
      if (animate && running) raf = requestAnimationFrame(draw)
    }
    draw(t0)
    return () => { running = false; if (raf) cancelAnimationFrame(raf) }
  }, [form, variant, primary, secondary, glow, glowColor, trail, size, animate, locked])

  return <canvas ref={ref} style={{ width: size, height: size }} className="block" />
}
