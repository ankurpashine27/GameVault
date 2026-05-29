import { BOARD_COLS, BOARD_ROWS, CANVAS_W, CANVAS_H, CELL_SIZE } from '../constants.js'

// ─── Piece color palettes per skin ───────────────────────────────────────────
const PALETTES = {
  classic: {
    I: '#00f0f0', O: '#f0f000', T: '#a000f0',
    S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000',
  },
  neon: {
    I: '#00ffff', O: '#ffff00', T: '#ff00ff',
    S: '#00ff44', Z: '#ff2244', J: '#4488ff', L: '#ffaa00',
  },
  crystal: {
    I: '#88eeff', O: '#ffee88', T: '#cc88ff',
    S: '#88ffaa', Z: '#ff8888', J: '#8899ff', L: '#ffcc88',
  },
  retro: {
    I: '#00c8c8', O: '#c8c800', T: '#8800c8',
    S: '#00c800', Z: '#c80000', J: '#0000c8', L: '#c88800',
  },
  metallic: {
    I: '#aabbcc', O: '#cccc99', T: '#9988aa',
    S: '#99aacc', Z: '#ccaa99', J: '#99aabb', L: '#ccbb99',
  },
  pastel: {
    I: '#aaeeff', O: '#ffeeaa', T: '#ddaaff',
    S: '#aaffcc', Z: '#ffaaaa', J: '#aabbff', L: '#ffddaa',
  },
  monochrome: {
    I: '#dddddd', O: '#bbbbbb', T: '#cccccc',
    S: '#aaaaaa', Z: '#eeeeee', J: '#888888', L: '#999999',
  },
  wireframe: {
    I: '#00f0f0', O: '#f0f000', T: '#a000f0',
    S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000',
  },
}

// ─── Draw a single block ──────────────────────────────────────────────────────
export function drawBlock(ctx, px, py, cellSize, colorId, skin = 'classic', alpha = 1) {
  const color = PALETTES[skin]?.[colorId] ?? PALETTES.classic[colorId] ?? '#888'
  const s = cellSize
  const pad = 1

  ctx.save()
  ctx.globalAlpha = alpha

  switch (skin) {
    case 'wireframe': {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.strokeRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      break
    }

    case 'neon': {
      ctx.shadowBlur = 8
      ctx.shadowColor = color
      ctx.fillStyle = color
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      // inner glow
      ctx.shadowBlur = 3
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillRect(px + pad + 2, py + pad + 2, s - pad * 2 - 4, 3)
      break
    }

    case 'crystal': {
      ctx.globalAlpha = alpha * 0.75
      ctx.fillStyle = color
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      // Shine overlay
      const shine = ctx.createLinearGradient(px, py, px + s, py + s)
      shine.addColorStop(0, 'rgba(255,255,255,0.5)')
      shine.addColorStop(0.4, 'rgba(255,255,255,0.15)')
      shine.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.globalAlpha = alpha * 0.75
      ctx.fillStyle = shine
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      // Border
      ctx.globalAlpha = alpha * 0.4
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      break
    }

    case 'retro': {
      // Main fill
      ctx.fillStyle = color
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      // Highlight (top-left bevel)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fillRect(px + pad, py + pad, s - pad * 2, 3)
      ctx.fillRect(px + pad, py + pad, 3, s - pad * 2)
      // Shadow (bottom-right bevel)
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(px + pad, py + s - pad - 3, s - pad * 2, 3)
      ctx.fillRect(px + s - pad - 3, py + pad, 3, s - pad * 2)
      break
    }

    case 'metallic': {
      const grad = ctx.createLinearGradient(px, py, px + s, py + s)
      grad.addColorStop(0, lighten(color, 0.4))
      grad.addColorStop(0.5, color)
      grad.addColorStop(1, darken(color, 0.3))
      ctx.fillStyle = grad
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      break
    }

    case 'pastel': {
      ctx.fillStyle = color
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.fillRect(px + pad, py + pad, s - pad * 2, 4)
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      break
    }

    case 'monochrome': {
      ctx.fillStyle = color
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(px + pad, py + pad, s - pad * 2, 3)
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(px + pad, py + s - pad - 3, s - pad * 2, 3)
      break
    }

    default: { // classic
      ctx.fillStyle = color
      ctx.fillRect(px + pad, py + pad, s - pad * 2, s - pad * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.fillRect(px + pad, py + pad, s - pad * 2, 3)
      ctx.fillRect(px + pad, py + pad, 3, s - pad * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(px + pad, py + s - pad - 3, s - pad * 2, 3)
      ctx.fillRect(px + s - pad - 3, py + pad, 3, s - pad * 2)
      break
    }
  }

  ctx.restore()
}

// ─── Color utils ──────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${Math.min(255, r + 255 * amount)},${Math.min(255, g + 255 * amount)},${Math.min(255, b + 255 * amount)})`
}

function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${Math.max(0, r - 255 * amount)},${Math.max(0, g - 255 * amount)},${Math.max(0, b - 255 * amount)})`
}

// ─── Board ────────────────────────────────────────────────────────────────────
export function drawBoard(ctx, board, skin, cellSize = CELL_SIZE, showGrid = true) {
  const cols = BOARD_COLS
  const rows = BOARD_ROWS

  // Optional grid lines
  if (showGrid) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath()
      ctx.moveTo(c * cellSize, 0)
      ctx.lineTo(c * cellSize, rows * cellSize)
      ctx.stroke()
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath()
      ctx.moveTo(0, r * cellSize)
      ctx.lineTo(cols * cellSize, r * cellSize)
      ctx.stroke()
    }
    ctx.restore()
  }

  // Draw locked cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r]?.[c]
      if (cell) {
        drawBlock(ctx, c * cellSize, r * cellSize, cellSize, cell, skin)
      }
    }
  }
}

import { getPieceGrid } from './tetrominoes.js'

// ─── Ghost piece ──────────────────────────────────────────────────────────────
export function drawGhostPiece(ctx, ghost, skin, cellSize = CELL_SIZE) {
  if (!ghost) return
  const { row: pr, col: pc, type, rotation, colorId, system = 'modern' } = ghost
  const grid = getPieceGrid(type, rotation, system)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r]?.[c]) {
        const px = (pc + c) * cellSize
        const py = (pr + r) * cellSize
        drawBlock(ctx, px, py, cellSize, colorId, skin, 0.22)
      }
    }
  }
}

// ─── Current piece ────────────────────────────────────────────────────────────
export function drawCurrentPiece(ctx, piece, skin, cellSize = CELL_SIZE) {
  if (!piece) return
  const { row: pr, col: pc, type, rotation, colorId, system = 'modern' } = piece
  const grid = getPieceGrid(type, rotation, system)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r]?.[c]) {
        const px = (pc + c) * cellSize
        const py = (pr + r) * cellSize
        drawBlock(ctx, px, py, cellSize, colorId, skin)
      }
    }
  }
}

// ─── Aliases for sync draw (same implementation) ─────────────────────────────
export const drawGhostPieceSync = drawGhostPiece
export const drawCurrentPieceSync = drawCurrentPiece

// Legacy overload kept for compatibility
export function drawCurrentPieceLegacy(ctx, piece, skin, cellSize = CELL_SIZE) {
  if (!piece) return
  const { row: pr, col: pc, type, rotation, colorId, system = 'modern' } = piece
  const grid = getPieceGrid(type, rotation, system)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r]?.[c]) {
        const px = (pc + c) * cellSize
        const py = (pr + r) * cellSize
        drawBlock(ctx, px, py, cellSize, colorId, skin)
      }
    }
  }
}

// ─── Particles ────────────────────────────────────────────────────────────────
export function createLineClearParticles(lineIndices, board, cellSize = CELL_SIZE) {
  const particles = []
  for (const row of lineIndices) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const colorId = board[row]?.[col]
      if (!colorId) continue
      const palette = PALETTES.classic
      const color = palette[colorId] ?? '#fff'
      const px = (col + 0.5) * cellSize
      const py = (row + 0.5) * cellSize
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4 + (Math.random() - 0.5) * 0.8
        const speed = 60 + Math.random() * 120
        particles.push({
          x: px, y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 80,
          color,
          size: 3 + Math.random() * 4,
          life: 0.8 + Math.random() * 0.4,
          maxLife: 0.8 + Math.random() * 0.4,
          alpha: 1,
        })
      }
    }
  }
  return particles
}

export function updateParticles(particles, dt) {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 200 * dt,
      life: p.life - dt,
      alpha: p.life / p.maxLife,
    }))
    .filter(p => p.life > 0)
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ─── Screen shake ─────────────────────────────────────────────────────────────
export function applyScreenShake(ctx, intensity) {
  if (intensity <= 0) return
  const dx = (Math.random() - 0.5) * intensity * 2
  const dy = (Math.random() - 0.5) * intensity * 2
  ctx.translate(dx, dy)
}

// ─── Stack warning ────────────────────────────────────────────────────────────
export function drawStackWarning(ctx, boardRect, topRow) {
  if (topRow > 6) return
  const alpha = Math.max(0, (6 - topRow) / 6) * 0.4
  ctx.save()
  ctx.globalAlpha = alpha
  const grad = ctx.createLinearGradient(0, 0, 0, boardRect.h * 0.4)
  grad.addColorStop(0, 'rgba(255,50,50,0.8)')
  grad.addColorStop(1, 'rgba(255,50,50,0)')
  ctx.fillStyle = grad
  ctx.fillRect(boardRect.x, boardRect.y, boardRect.w, boardRect.h * 0.4)
  ctx.restore()
}

// ─── Board flash ──────────────────────────────────────────────────────────────
export function drawBoardFlash(ctx, boardRect, color = '#ffffff', alpha = 0.4) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.fillRect(boardRect.x, boardRect.y, boardRect.w, boardRect.h)
  ctx.restore()
}

// ─── Score popup text ─────────────────────────────────────────────────────────
export function drawScorePopup(ctx, popup) {
  ctx.save()
  ctx.globalAlpha = popup.life / popup.maxLife
  ctx.font = `bold ${popup.size ?? 18}px monospace`
  ctx.fillStyle = popup.color ?? '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText(popup.text, popup.x, popup.y)
  ctx.restore()
}

// ─── Background draw functions ────────────────────────────────────────────────

export function drawClassicDark(ctx, w, h, time) {
  ctx.fillStyle = '#0a0a12'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.strokeStyle = 'rgba(80,80,120,0.08)'
  ctx.lineWidth = 0.5
  const gridSize = 24
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.restore()
}

export function drawDeepSpace(ctx, w, h, time) {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#000018')
  grad.addColorStop(1, '#0a0030')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Stars (pseudo-random but static)
  ctx.save()
  const starCount = 60
  for (let i = 0; i < starCount; i++) {
    const sx = ((i * 137.508) % w)
    const sy = ((i * 233.317) % h)
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.8 + i))
    ctx.globalAlpha = twinkle
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(sx, sy, 0.8, 0, Math.PI * 2)
    ctx.fill()
  }

  // Nebula wash
  ctx.globalAlpha = 0.06 + 0.03 * Math.sin(time * 0.2)
  const neb = ctx.createRadialGradient(w * 0.6, h * 0.3, 0, w * 0.6, h * 0.3, w * 0.5)
  neb.addColorStop(0, '#8040ff')
  neb.addColorStop(1, 'transparent')
  ctx.fillStyle = neb
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

export function drawNeonCity(ctx, w, h, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a001a')
  grad.addColorStop(0.6, '#12001a')
  grad.addColorStop(1, '#200010')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Buildings silhouette
  const buildings = [
    { x: 0, w: 40, h: 200 }, { x: 35, w: 30, h: 160 }, { x: 60, w: 50, h: 240 },
    { x: 105, w: 25, h: 140 }, { x: 125, w: 60, h: 280 }, { x: 180, w: 35, h: 190 },
    { x: 210, w: 45, h: 220 }, { x: 250, w: 30, h: 160 }, { x: 275, w: 55, h: 260 },
    { x: 325, w: 40, h: 180 },
  ]

  ctx.save()
  ctx.fillStyle = '#0d0008'
  for (const b of buildings) {
    ctx.fillRect(b.x, h - b.h, b.w, b.h)
  }

  // Glow lines
  ctx.globalAlpha = 0.4 + 0.1 * Math.sin(time * 0.5)
  const colors = ['#ff00aa', '#00ffee', '#aa00ff']
  for (let i = 0; i < 3; i++) {
    ctx.shadowBlur = 12
    ctx.shadowColor = colors[i % 3]
    ctx.strokeStyle = colors[i % 3]
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h - 10 - i * 8)
    ctx.lineTo(w, h - 10 - i * 8)
    ctx.stroke()
  }
  ctx.restore()
}

export function drawAurora(ctx, w, h, time) {
  ctx.fillStyle = '#010a0a'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  const colors = [
    ['#00ff88', '#00cc66'],
    ['#00ccff', '#0088ff'],
    ['#aa44ff', '#6622aa'],
  ]

  for (let band = 0; band < 3; band++) {
    const yBase = h * (0.15 + band * 0.12)
    const [c1, c2] = colors[band]
    const amp = 20 + band * 15
    const speed = 0.3 + band * 0.15
    const phase = band * Math.PI * 0.7

    ctx.globalAlpha = 0.18 + 0.06 * Math.sin(time * 0.4 + band)
    const grad = ctx.createLinearGradient(0, yBase - amp, 0, yBase + amp * 3)
    grad.addColorStop(0, c1)
    grad.addColorStop(0.5, c2)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad

    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 4) {
      const y = yBase + Math.sin((x / w) * Math.PI * 3 + time * speed + phase) * amp
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export function drawUnderwater(ctx, w, h, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#001428')
  grad.addColorStop(1, '#002844')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Light caustics (shimmer at top)
  ctx.save()
  for (let i = 0; i < 8; i++) {
    const lx = w * (i / 8) + Math.sin(time * 0.4 + i) * 20
    const gradL = ctx.createLinearGradient(lx, 0, lx, h * 0.3)
    gradL.addColorStop(0, 'rgba(100,200,255,0.08)')
    gradL.addColorStop(1, 'rgba(100,200,255,0)')
    ctx.fillStyle = gradL
    ctx.fillRect(lx - 10, 0, 20, h * 0.3)
  }

  // Rising bubbles
  const bubbles = 15
  for (let i = 0; i < bubbles; i++) {
    const bx = (i * 89.3) % w
    const speed = 30 + (i * 17.4) % 50
    const by = h - ((time * speed + i * 123.4) % h)
    const radius = 2 + (i * 7.3) % 6
    ctx.globalAlpha = 0.15 + 0.1 * Math.sin(time + i)
    ctx.strokeStyle = 'rgba(150,230,255,0.8)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(bx, by, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

export function drawLavaCave(ctx, w, h, time) {
  ctx.fillStyle = '#0a0000'
  ctx.fillRect(0, 0, w, h)

  // Glow from below
  ctx.save()
  const alpha = 0.15 + 0.07 * Math.sin(time * 0.6)
  const glow = ctx.createLinearGradient(0, h * 0.6, 0, h)
  glow.addColorStop(0, 'rgba(255,60,0,0)')
  glow.addColorStop(1, `rgba(255,60,0,${alpha})`)
  ctx.fillStyle = glow
  ctx.fillRect(0, h * 0.6, w, h * 0.4)

  // Rising lava blobs
  for (let i = 0; i < 6; i++) {
    const bx = w * ((i * 137 + 40) % 100) / 100
    const speed = 15 + (i * 23) % 20
    const by = h - ((time * speed + i * 200) % (h * 0.7))
    const r = 8 + (i * 11) % 15
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(time * 0.5 + i)
    ctx.fillStyle = i % 2 === 0 ? '#ff4400' : '#ff8800'
    ctx.beginPath()
    ctx.ellipse(bx, by, r, r * 1.3, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export function drawMatrix(ctx, w, h, time) {
  ctx.fillStyle = '#000a00'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  const cols = Math.floor(w / 14)
  const charList = '0123456789ABCDEFアイウエオカキクケコ'

  for (let col = 0; col < cols; col++) {
    const x = col * 14
    const speed = 60 + (col * 37) % 80
    const offset = (col * 197) % h

    // Only a few chars per column visible
    for (let j = 0; j < 3; j++) {
      const y = ((time * speed + offset + j * 80) % h)
      const charIdx = Math.floor(((time * 3 + col * 7 + j * 13)) % charList.length)
      const alpha = j === 0 ? 0.9 : 0.35 - j * 0.1

      ctx.globalAlpha = Math.max(0, alpha)
      ctx.fillStyle = j === 0 ? '#88ff88' : '#00aa00'
      ctx.font = '12px monospace'
      ctx.fillText(charList[charIdx], x, y)
    }
  }
  ctx.restore()
}

export function drawForestNight(ctx, w, h, time) {
  // Night sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#000820')
  grad.addColorStop(0.7, '#020a14')
  grad.addColorStop(1, '#000a04')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Stars
  ctx.save()
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137.5) % w
    const sy = (i * 89.3) % (h * 0.5)
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.5 + i * 0.7))
    ctx.globalAlpha = twinkle * 0.8
    ctx.fillStyle = '#ddeeff'
    ctx.fillRect(sx, sy, 1, 1)
  }

  // Tree silhouettes
  const trees = [
    { x: 0, h: 180 }, { x: 20, h: 220 }, { x: 45, h: 160 },
    { x: 70, h: 200 }, { x: 100, h: 240 }, { x: 135, h: 190 },
    { x: 165, h: 210 }, { x: 200, h: 170 }, { x: 230, h: 230 },
    { x: 260, h: 185 }, { x: 290, h: 215 }, { x: 320, h: 175 },
    { x: 345, h: 200 },
  ]

  ctx.globalAlpha = 1
  ctx.fillStyle = '#010d01'
  for (const t of trees) {
    // Triangle tree
    ctx.beginPath()
    ctx.moveTo(t.x + 15, h - t.h)
    ctx.lineTo(t.x - 15, h)
    ctx.lineTo(t.x + 45, h)
    ctx.closePath()
    ctx.fill()
  }

  // Fireflies
  for (let i = 0; i < 8; i++) {
    const fx = w * ((i * 137.5 + time * 8 + i * 30) % 100) / 100
    const fy = h * (0.5 + ((i * 89.3 + time * 5) % 50) / 100)
    const glow = 0.4 + 0.6 * Math.abs(Math.sin(time * 2 + i * 1.3))
    ctx.globalAlpha = glow * 0.7
    ctx.fillStyle = '#aaff44'
    ctx.beginPath()
    ctx.arc(fx, fy, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

const BG_DRAW_FNS = {
  classic_dark:  drawClassicDark,
  deep_space:    drawDeepSpace,
  neon_city:     drawNeonCity,
  aurora:        drawAurora,
  underwater:    drawUnderwater,
  lava_cave:     drawLavaCave,
  matrix:        drawMatrix,
  forest_night:  drawForestNight,
}

export function drawBackground(ctx, bgId, w, h, time) {
  const fn = BG_DRAW_FNS[bgId] ?? drawClassicDark
  fn(ctx, w, h, time)
}

// ─── Main draw function ───────────────────────────────────────────────────────
export function drawGame(ctx, renderState, time, settings = {}) {
  const {
    board, currentPiece, ghostPiece, particles = [], effects = {},
    scorePopups = [], flashAlpha = 0, shakeIntensity = 0,
  } = renderState

  const { skin = 'classic', background = 'classic_dark', showGrid = true, ghostPiece: showGhost = true } = settings

  ctx.save()

  // Screen shake
  if (shakeIntensity > 0) {
    applyScreenShake(ctx, shakeIntensity)
  }

  // 1. Background
  drawBackground(ctx, background, CANVAS_W, CANVAS_H, time)

  // 2. Board shadow
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(-2, -2, CANVAS_W + 4, CANVAS_H + 4)
  ctx.restore()

  // 3. Board
  drawBoard(ctx, board, skin, CELL_SIZE, showGrid)

  // 4. Ghost piece
  if (showGhost && ghostPiece) {
    drawGhostPieceSync(ctx, ghostPiece, skin)
  }

  // 5. Current piece
  if (currentPiece) {
    drawCurrentPieceSync(ctx, currentPiece, skin)
  }

  // 6. Particles
  drawParticles(ctx, particles)

  // 7. Flash
  if (flashAlpha > 0) {
    drawBoardFlash(ctx, { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H }, '#ffffff', flashAlpha)
  }

  // 8. Score popups
  for (const popup of scorePopups) {
    drawScorePopup(ctx, popup)
  }

  // 9. Stack warning
  if (board) {
    let topRow = BOARD_ROWS
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (board[r]?.some(c => c !== 0)) { topRow = r; break }
    }
    drawStackWarning(ctx, { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H }, topRow)
  }

  ctx.restore()
}
