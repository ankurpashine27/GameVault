/**
 * 2048 — Canvas renderer.
 * All drawing happens here. No React, no side effects.
 */

import { COLOR_PALETTES, TILE_THEMES, BACKGROUNDS, ANIMATION_DURATIONS, ANIM_SPEED_MULTIPLIERS, CANVAS_W, CANVAS_H } from '../constants.js'

// ─── Background drawing ───────────────────────────────────────────────────────

function drawMinimalDark(ctx, w, h) {
  ctx.fillStyle = '#111118'
  ctx.fillRect(0, 0, w, h)
  // Vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, w, h)
}

function drawPaper(ctx, w, h) {
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, w, h)
  // Grain
  const seed = 42
  let s = seed
  for (let i = 0; i < 800; i++) {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    const x = (s >>> 17) % w
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    const y = (s >>> 17) % h
    const alpha = 0.03 + ((s & 0xff) / 0xff) * 0.04
    ctx.fillStyle = `rgba(100,80,60,${alpha})`
    ctx.fillRect(x, y, 1, 1)
  }
}

function drawNeonGrid(ctx, w, h, time) {
  ctx.fillStyle = '#040810'
  ctx.fillRect(0, 0, w, h)
  // Perspective grid lines
  const horizon = h * 0.4
  const gridCount = 12
  const pulse = 0.3 + Math.sin(time * 1.5) * 0.1
  ctx.strokeStyle = `rgba(0,200,255,${pulse})`
  ctx.lineWidth = 0.6
  // Vertical lines converging to vanishing point
  for (let i = 0; i <= gridCount; i++) {
    const t = i / gridCount
    const bx = t * w
    ctx.beginPath()
    ctx.moveTo(w / 2, horizon)
    ctx.lineTo(bx, h)
    ctx.stroke()
  }
  // Horizontal lines
  for (let i = 0; i <= 8; i++) {
    const t = i / 8
    const y = horizon + (h - horizon) * (t * t)
    const alpha = 0.15 + 0.15 * t
    ctx.strokeStyle = `rgba(0,200,255,${alpha * pulse / 0.3})`
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  // Top glow
  const tg = ctx.createLinearGradient(0, 0, 0, horizon)
  tg.addColorStop(0, 'rgba(0,100,200,0.2)')
  tg.addColorStop(1, 'rgba(0,100,200,0)')
  ctx.fillStyle = tg
  ctx.fillRect(0, 0, w, horizon)
}

function drawStarfield(ctx, w, h, time) {
  ctx.fillStyle = '#08080f'
  ctx.fillRect(0, 0, w, h)
  // Procedural stars (seeded, no random per frame)
  let s = 9999
  for (let i = 0; i < 120; i++) {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    const x = (s >>> 17) % w
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    const y = (s >>> 17) % h
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    const size  = 0.5 + (s & 0xf) / 0xf * 1.5
    const layer = (s & 0x3)  // 0-3 for parallax
    const drift = (time * (0.3 + layer * 0.15)) % w
    const twinkle = 0.4 + Math.sin(time * 2 + i) * 0.3
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`
    ctx.beginPath()
    ctx.arc(((x + drift) % w), y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawBokeh(ctx, w, h, time) {
  ctx.fillStyle = '#0a0520'
  ctx.fillRect(0, 0, w, h)
  const circles = [
    { ox: 0.3, oy: 0.3, r: 120, color: '80,40,200' },
    { ox: 0.7, oy: 0.6, r: 100, color: '40,120,220' },
    { ox: 0.5, oy: 0.8, r: 90,  color: '150,40,180' },
    { ox: 0.2, oy: 0.7, r: 80,  color: '60,160,200' },
    { ox: 0.8, oy: 0.2, r: 70,  color: '200,80,120' },
  ]
  for (let i = 0; i < circles.length; i++) {
    const bo = circles[i]
    const cx = (bo.ox + Math.sin(time * 0.4 + i) * 0.08) * w
    const cy = (bo.oy + Math.cos(time * 0.3 + i) * 0.06) * h
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bo.r)
    grad.addColorStop(0, `rgba(${bo.color},0.18)`)
    grad.addColorStop(1, `rgba(${bo.color},0)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }
}

function drawAurora(ctx, w, h, time) {
  ctx.fillStyle = '#020810'
  ctx.fillRect(0, 0, w, h)
  const bands = [
    { color: '0,220,120', freq: 0.8, phase: 0,    speed: 0.5 },
    { color: '0,120,255', freq: 0.6, phase: 1.5,  speed: 0.4 },
    { color: '80,0,220',  freq: 1.0, phase: 3.1,  speed: 0.6 },
  ]
  for (const band of bands) {
    ctx.beginPath()
    ctx.moveTo(0, h)
    const baseY = h * 0.25
    const amplitude = h * 0.12
    for (let x = 0; x <= w; x += 4) {
      const t = x / w
      const y = baseY + Math.sin(t * band.freq * Math.PI * 2 + time * band.speed + band.phase) * amplitude
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, 0)
    ctx.lineTo(0, 0)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, `rgba(${band.color},0)`)
    grad.addColorStop(0.3, `rgba(${band.color},0.15)`)
    grad.addColorStop(0.6, `rgba(${band.color},0.08)`)
    grad.addColorStop(1, `rgba(${band.color},0)`)
    ctx.fillStyle = grad
    ctx.fill()
  }
}

export function drawBackground(ctx, bgId, w, h, time) {
  switch (bgId) {
    case 'paper':      drawPaper(ctx, w, h);             break
    case 'neon_grid':  drawNeonGrid(ctx, w, h, time);    break
    case 'starfield':  drawStarfield(ctx, w, h, time);   break
    case 'bokeh':      drawBokeh(ctx, w, h, time);       break
    case 'aurora':     drawAurora(ctx, w, h, time);      break
    default:           drawMinimalDark(ctx, w, h);       break
  }
}

// ─── Board drawing ────────────────────────────────────────────────────────────

export function getBoardLayout(cols) {
  const padding  = 12
  const gap      = cols <= 4 ? 12 : cols <= 6 ? 9 : 6
  const totalW   = CANVAS_W - padding * 2
  const cellSize = Math.floor((totalW - gap * (cols + 1)) / cols)
  const boardW   = cellSize * cols + gap * (cols + 1)
  const boardH   = boardW
  const boardX   = (CANVAS_W - boardW) / 2
  const boardY   = (CANVAS_H - boardH) / 2

  return { boardX, boardY, boardW, boardH, cellSize, gap }
}

export function getCellXY(col, row, layout) {
  const { boardX, boardY, cellSize, gap } = layout
  const x = boardX + gap + col * (cellSize + gap)
  const y = boardY + gap + row * (cellSize + gap)
  return { x, y }
}

export function drawBoard(ctx, cols, palette) {
  const pal = COLOR_PALETTES[palette] || COLOR_PALETTES.classic
  const layout = getBoardLayout(cols)
  const { boardX, boardY, boardW, boardH, cellSize, gap } = layout

  // Board background
  ctx.fillStyle = pal.board
  ctx.beginPath()
  ctx.roundRect(boardX, boardY, boardW, boardH, 8)
  ctx.fill()

  // Empty cells
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      const { x, y } = getCellXY(c, r, layout)
      ctx.fillStyle = pal.cell
      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, 6)
      ctx.fill()
    }
  }
}

// ─── Tile drawing ─────────────────────────────────────────────────────────────

function getTileColor(value, palette) {
  const pal = COLOR_PALETTES[palette] || COLOR_PALETTES.classic
  return pal.tiles[value] || (palette === 'dark' ? '#3c3a32' : '#3c3a32')
}

function getTileTextColor(value, palette) {
  const pal = COLOR_PALETTES[palette] || COLOR_PALETTES.classic
  return pal.text[value] || '#f9f6f2'
}

function getTileFontSize(text, cellSize) {
  const len = String(text).length
  if (len <= 1) return Math.floor(cellSize * 0.55)
  if (len === 2) return Math.floor(cellSize * 0.48)
  if (len === 3) return Math.floor(cellSize * 0.40)
  if (len === 4) return Math.floor(cellSize * 0.33)
  return Math.floor(cellSize * 0.26)
}

export function drawBlock(ctx, x, y, size, value, theme, palette, animScale = 1, alpha = 1) {
  if (animScale <= 0 || alpha <= 0) return

  const pal = COLOR_PALETTES[palette] || COLOR_PALETTES.classic

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x + size / 2, y + size / 2)
  ctx.scale(animScale, animScale)
  ctx.translate(-(size / 2), -(size / 2))

  if (value === 'obstacle') {
    // Crosshatch pattern for obstacles
    ctx.fillStyle = '#555550'
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, 6)
    ctx.fill()
    ctx.strokeStyle = '#333330'
    ctx.lineWidth = 1.5
    const step = Math.max(8, size / 6)
    ctx.save()
    ctx.clip()
    for (let d = -size; d < size * 2; d += step) {
      ctx.beginPath()
      ctx.moveTo(d, 0)
      ctx.lineTo(d + size, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(d, size)
      ctx.lineTo(d + size, 0)
      ctx.stroke()
    }
    ctx.restore()
    ctx.restore()
    return
  }

  // Tile background
  const bgColor = getTileColor(value, palette)
  ctx.fillStyle = bgColor
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, 6)
  ctx.fill()

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.roundRect(2, 2, size - 4, size * 0.35, 4)
  ctx.fill()

  // Get display text from theme
  const themeData = TILE_THEMES[theme] || TILE_THEMES.numbers
  const display = themeData.values[value] || String(value)

  const textColor = getTileTextColor(value, palette)
  const fontSize = getTileFontSize(display, size)

  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Detect emoji (multi-codepoint characters)
  const isEmoji = /\p{Emoji}/u.test(display) && display.length >= 2
  if (isEmoji) {
    ctx.font = `${Math.floor(fontSize * 0.9)}px sans-serif`
  } else {
    ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`
  }

  ctx.fillText(display, size / 2, size / 2)
  ctx.restore()
}

// ─── Tile animation state ─────────────────────────────────────────────────────

/**
 * Compute interpolated position and scale for a tile given animState.
 * animState.tiles[id] = { fromX, fromY, toX, toY, startTime, duration, type: 'slide'|'merge'|'spawn' }
 */
export function getTileAnimState(id, now, animState) {
  if (!animState || !animState.tiles) return { x: null, y: null, scale: 1, alpha: 1 }
  const anim = animState.tiles[id]
  if (!anim) return { x: null, y: null, scale: 1, alpha: 1 }

  const elapsed = now - anim.startTime
  const t = Math.min(elapsed / anim.duration, 1)
  const ease = easeOut(t)

  if (anim.type === 'spawn') {
    // Scale from 0.4 to 1.1 back to 1
    let scale
    if (t < 0.7) {
      scale = 0.4 + (1.1 - 0.4) * easeOut(t / 0.7)
    } else {
      scale = 1.1 - 0.1 * easeOut((t - 0.7) / 0.3)
    }
    return { x: anim.toX, y: anim.toY, scale, alpha: 1 }
  }

  if (anim.type === 'merge') {
    // Scale bounce: 1.0 → 1.25 → 1.0
    let scale
    if (t < 0.5) {
      scale = 1.0 + 0.25 * easeOut(t / 0.5)
    } else {
      scale = 1.25 - 0.25 * easeOut((t - 0.5) / 0.5)
    }
    return { x: anim.toX, y: anim.toY, scale, alpha: 1 }
  }

  // Slide
  const x = anim.fromX + (anim.toX - anim.fromX) * ease
  const y = anim.fromY + (anim.toY - anim.fromY) * ease
  return { x, y, scale: 1, alpha: 1 }
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 2)
}

// ─── Draw all tiles ───────────────────────────────────────────────────────────

export function drawTiles(ctx, board, cols, animState, theme, palette, now) {
  const layout = getBoardLayout(cols)
  const { cellSize } = layout

  // Build a map of tiles to render by position, handling animations
  const rendered = new Set()

  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r * cols + c]
      if (!cell) continue

      const basePos = getCellXY(c, r, layout)
      const animInfo = getTileAnimState(cell.id, now, animState)

      const drawX = animInfo.x !== null ? animInfo.x : basePos.x
      const drawY = animInfo.y !== null ? animInfo.y : basePos.y

      drawBlock(ctx, drawX, drawY, cellSize, cell.value, theme, palette, animInfo.scale, animInfo.alpha)
      rendered.add(cell.id)
    }
  }

  // Draw any "disappearing" tiles from merge animations (the src tile)
  if (animState && animState.vanishing) {
    for (const vt of animState.vanishing) {
      if (rendered.has(vt.id)) continue
      const elapsed = now - vt.startTime
      const t = Math.min(elapsed / vt.duration, 1)
      if (t < 1) {
        const ease = easeOut(t)
        const x = vt.fromX + (vt.toX - vt.fromX) * ease
        const y = vt.fromY + (vt.toY - vt.fromY) * ease
        const alpha = 1 - t
        drawBlock(ctx, x, y, cellSize, vt.value, theme, palette, 1, alpha)
      }
    }
  }
}

// ─── Score popups ─────────────────────────────────────────────────────────────

export function drawScorePopups(ctx, popups, now) {
  for (const popup of popups) {
    const elapsed = now - popup.startTime
    const dur = popup.duration
    if (elapsed > dur) continue
    const t = elapsed / dur
    const alpha = 1 - t * t
    const y = popup.y - elapsed * 0.04
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = popup.color || '#ffffff'
    ctx.font = `bold ${popup.size || 18}px 'Segoe UI', Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 4
    ctx.fillText(popup.text, popup.x, y)
    ctx.restore()
  }
}

// ─── Main draw entry ──────────────────────────────────────────────────────────

export function drawGame(ctx, state, now, settings) {
  const w = CANVAS_W
  const h = CANVAS_H
  const { board, cols, animState, scorePopups, palette, theme, background } = state

  drawBackground(ctx, background || 'minimal_dark', w, h, now / 1000)
  drawBoard(ctx, cols, palette || 'classic')
  drawTiles(ctx, board, cols, animState, theme || 'numbers', palette || 'classic', now)
  drawScorePopups(ctx, scorePopups || [], now)
}
