import { useRef, useState, useEffect, useCallback } from 'react'
import { BACKGROUNDS, P1_COLOR, P2_COLOR } from './constants.js'

// ─── Background drawing ──────────────────────────────────────────────────────

function drawBackground(ctx, bgId, W, H) {
  ctx.save()
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  switch (bgId) {

    case 'neon': {
      ctx.fillStyle = '#050010'
      ctx.fillRect(0, 0, W, H)
      // Central purple haze
      const haze = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.65)
      haze.addColorStop(0, 'rgba(130,0,200,0.10)')
      haze.addColorStop(0.5, 'rgba(0,200,255,0.04)')
      haze.addColorStop(1, 'transparent')
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, W, H)
      // Deterministic star field
      for (let i = 0; i < 70; i++) {
        const sx = (i * 157.3 + 23) % W
        const sy = (i * 89.7 + 47) % H
        const sr = i % 5 === 0 ? 1.3 : 0.6
        const alpha = 0.15 + (i % 6) * 0.07
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill()
      }
      break
    }

    case 'wood': {
      ctx.fillStyle = '#2C1A0E'
      ctx.fillRect(0, 0, W, H)
      // Warm gradient wash
      const wg = ctx.createLinearGradient(0, 0, W, H)
      wg.addColorStop(0, 'rgba(180,90,20,0.06)')
      wg.addColorStop(1, 'rgba(80,30,5,0.08)')
      ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H)
      // Horizontal grain lines (bezier waves)
      ctx.strokeStyle = 'rgba(100,55,18,0.28)'
      ctx.lineWidth = 1
      const step = Math.max(3, H / 60)
      for (let i = 0; i * step < H; i++) {
        const y = i * step
        const wave = Math.sin(i * 0.65) * 1.8
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(
          W * 0.25, y + wave,
          W * 0.75, y + Math.sin(i * 0.65 + 1.2) * 1.8,
          W, y + Math.sin(i * 0.65 + 2.4) * 1.5
        )
        ctx.stroke()
      }
      break
    }

    case 'space': {
      ctx.fillStyle = '#000510'
      ctx.fillRect(0, 0, W, H)
      // Nebula glow
      const ng = ctx.createRadialGradient(W * 0.3, H * 0.35, 0, W * 0.3, H * 0.35, Math.max(W, H) * 0.55)
      ng.addColorStop(0, 'rgba(80,0,130,0.07)')
      ng.addColorStop(1, 'transparent')
      ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H)
      // Star field
      for (let i = 0; i < 110; i++) {
        const sx = (i * 137.5 + 50) % W
        const sy = (i * 71.3 + 20) % H
        const size = i % 12 === 0 ? 1.6 : i % 4 === 0 ? 1.0 : 0.6
        const bright = 0.10 + (i % 7) * 0.08
        ctx.fillStyle = `rgba(255,255,255,${bright.toFixed(2)})`
        ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill()
      }
      break
    }

    case 'marble': {
      ctx.fillStyle = '#E2E8F0'
      ctx.fillRect(0, 0, W, H)
      // Marble swirl lines
      for (let i = 0; i < 10; i++) {
        const alpha = 0.15 + (i % 3) * 0.05
        ctx.strokeStyle = `rgba(148,163,184,${alpha.toFixed(2)})`
        ctx.lineWidth = 1 + (i % 2)
        const startX = (i / 9) * W
        ctx.beginPath(); ctx.moveTo(startX, 0)
        for (let y = 0; y <= H; y += 6) {
          ctx.lineTo(startX + Math.sin(y * 0.018 + i * 1.3) * 35, y)
        }
        ctx.stroke()
      }
      // Diagonal sheen
      const sg = ctx.createLinearGradient(0, 0, W, H)
      sg.addColorStop(0,   'rgba(255,255,255,0.10)')
      sg.addColorStop(0.5, 'rgba(255,255,255,0.04)')
      sg.addColorStop(1,   'rgba(226,232,240,0.08)')
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H)
      break
    }

    case 'midnight': {
      const mg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.72)
      mg.addColorStop(0,   '#0F172A')
      mg.addColorStop(0.7, '#040F24')
      mg.addColorStop(1,   '#020617')
      ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H)
      // Faint star field
      for (let i = 0; i < 45; i++) {
        const sx = (i * 163.4 + 10) % W
        const sy = (i * 97.8 + 15) % H
        const bright = 0.08 + (i % 5) * 0.04
        ctx.fillStyle = `rgba(148,163,184,${bright.toFixed(2)})`
        ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2); ctx.fill()
      }
      break
    }

    default: { // dark
      ctx.fillStyle = '#080B14'
      ctx.fillRect(0, 0, W, H)
      // Subtle blue center glow
      const dg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.55)
      dg.addColorStop(0, 'rgba(59,130,246,0.04)')
      dg.addColorStop(1, 'transparent')
      ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H)
      break
    }
  }
  ctx.restore()
}

// ─── Grid drawing ────────────────────────────────────────────────────────────

function drawGrid(ctx, bgId, boardX, boardY, boardPx, cellSize, size) {
  const bg = BACKGROUNDS[bgId] || BACKGROUNDS.dark
  ctx.save()

  const isLight = bg.light

  if (bgId === 'neon') {
    ctx.shadowBlur   = 7
    ctx.shadowColor  = bg.grid
    ctx.strokeStyle  = bg.grid
    ctx.lineWidth    = 1
  } else if (bgId === 'wood') {
    ctx.strokeStyle = 'rgba(107,58,31,0.80)'
    ctx.lineWidth   = 2
  } else if (bgId === 'marble') {
    ctx.strokeStyle = 'rgba(71,85,105,0.55)'
    ctx.lineWidth   = 1.5
  } else if (bgId === 'midnight') {
    ctx.shadowBlur  = 5
    ctx.shadowColor = bg.grid + '88'
    ctx.strokeStyle = bg.grid + 'BB'
    ctx.lineWidth   = 1
  } else {
    ctx.strokeStyle = bg.grid + 'AA'
    ctx.lineWidth   = 1
  }

  // Inner grid lines
  for (let c = 1; c < size; c++) {
    const x = boardX + c * cellSize
    ctx.beginPath(); ctx.moveTo(x, boardY); ctx.lineTo(x, boardY + boardPx); ctx.stroke()
  }
  for (let r = 1; r < size; r++) {
    const y = boardY + r * cellSize
    ctx.beginPath(); ctx.moveTo(boardX, y); ctx.lineTo(boardX + boardPx, y); ctx.stroke()
  }

  // Board border (slightly brighter)
  ctx.shadowBlur = bgId === 'neon' ? 14 : bgId === 'midnight' ? 8 : 0
  ctx.lineWidth  = bgId === 'wood' ? 3 : 2
  ctx.strokeStyle = isLight ? 'rgba(71,85,105,0.7)' : (bg.grid + (bgId === 'neon' ? 'EE' : 'CC'))
  ctx.strokeRect(boardX, boardY, boardPx, boardPx)

  ctx.restore()
}

// ─── Cell helpers ─────────────────────────────────────────────────────────────

function drawBlockedCell(ctx, x, y, cs, bgId) {
  const isLight = (BACKGROUNDS[bgId] || {}).light
  ctx.save()
  ctx.fillStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.35)'
  ctx.fillRect(x, y, cs, cs)
  // Hatching
  ctx.strokeStyle = isLight ? 'rgba(100,116,139,0.25)' : 'rgba(30,45,69,0.7)'
  ctx.lineWidth = 1
  const gap = Math.max(4, cs / 8)
  for (let d = -cs; d <= cs * 2; d += gap) {
    ctx.beginPath(); ctx.moveTo(x + d, y); ctx.lineTo(x + d + cs, y + cs); ctx.stroke()
  }
  // Blocked icon
  const iconSize = Math.max(10, cs * 0.28)
  ctx.font = `${iconSize}px serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.globalAlpha = 0.35
  ctx.fillText('🚫', x + cs / 2, y + cs / 2)
  ctx.restore()
}

function drawPiece(ctx, cx, cy, piece, avatar, color, cs, scale, glowColor, glowStrength, bgId) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  if (glowColor && glowStrength > 0) {
    ctx.shadowBlur  = cs * 0.55 * glowStrength
    ctx.shadowColor = glowColor
  }

  if (cs >= 28) {
    // Large cell: emoji avatar text
    const fontSize = cs * (cs >= 50 ? 0.54 : 0.62)
    ctx.font = `${Math.round(fontSize)}px serif`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(avatar, 0, 1)
  } else {
    // Small cell (Gomoku): geometric X or O in player color
    const s = cs * 0.30
    ctx.lineWidth = Math.max(1.5, cs * 0.12)
    ctx.lineCap   = 'round'
    ctx.strokeStyle = color
    if (piece === 'X') {
      ctx.beginPath(); ctx.moveTo(-s, -s); ctx.lineTo(s,  s); ctx.stroke()
      ctx.beginPath(); ctx.moveTo( s, -s); ctx.lineTo(-s, s); ctx.stroke()
    } else {
      ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.stroke()
    }
  }

  ctx.restore()
}

function drawHoverHighlight(ctx, x, y, cs, color, bgId) {
  const isLight = (BACKGROUNDS[bgId] || {}).light
  ctx.save()
  ctx.fillStyle = isLight
    ? color + '18'
    : color + '22'
  ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2)
  // Corner dots
  ctx.fillStyle = color + '55'
  const d = Math.max(3, cs * 0.06)
  ;[[x+2, y+2], [x+cs-2-d, y+2], [x+2, y+cs-2-d], [x+cs-2-d, y+cs-2-d]].forEach(([px, py]) => {
    ctx.beginPath(); ctx.arc(px + d/2, py + d/2, d/2, 0, Math.PI*2); ctx.fill()
  })
  ctx.restore()
}

function drawWinLine(ctx, winCells, boardX, boardY, cs, playerColor) {
  if (!winCells || winCells.length < 2) return
  ctx.save()
  const first = winCells[0]
  const last  = winCells[winCells.length - 1]
  const x1 = boardX + first[1] * cs + cs / 2
  const y1 = boardY + first[0] * cs + cs / 2
  const x2 = boardX + last[1]  * cs + cs / 2
  const y2 = boardY + last[0]  * cs + cs / 2

  ctx.strokeStyle = playerColor
  ctx.lineWidth   = Math.max(2, cs * 0.10)
  ctx.lineCap     = 'round'
  ctx.shadowBlur  = 12
  ctx.shadowColor = playerColor
  ctx.globalAlpha = 0.55
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.restore()
}

function drawAIThinking(ctx, W, H, now) {
  const dotCount = 3
  const dotR     = Math.max(4, Math.min(W, H) * 0.022)
  const gap      = dotR * 2.5
  const totalW   = (dotCount - 1) * gap
  const baseX    = W / 2 - totalW / 2
  const baseY    = H / 2

  for (let i = 0; i < dotCount; i++) {
    const phase  = (now / 300 + i * 0.33) % 1
    const alpha  = 0.3 + 0.7 * Math.pow(Math.sin(phase * Math.PI), 2)
    const scaleY = 0.7 + 0.3 * Math.sin(phase * Math.PI)
    ctx.save()
    ctx.translate(baseX + i * gap, baseY)
    ctx.scale(1, scaleY)
    ctx.fillStyle = `rgba(249,115,22,${alpha.toFixed(2)})`  // P2_COLOR
    ctx.shadowBlur  = 6
    ctx.shadowColor = P2_COLOR
    ctx.beginPath(); ctx.arc(0, 0, dotR, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GameCanvas({
  board,
  size,
  winCells,
  blockedCells,
  currentPlayer,
  armedPowerUp,
  gameStatus,
  p1Avatar,
  p2Avatar,
  onCellClick,
  isAIThinking,
  background,
}) {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const loopRef      = useRef(null)
  const rafRef       = useRef(null)

  // Hover state
  const hoverRef   = useRef(null)    // {r, c, valid} | null
  // Piece placement timestamps for pop-in animation
  const animMapRef = useRef({})      // 'r,c' → ms timestamp
  // Win highlight timing
  const winStartRef  = useRef(null)
  const prevWinKeyRef = useRef(null)
  // Board previous value (to detect new placements)
  const prevBoardRef = useRef(null)

  const [cellSize, setCellSize] = useState(0)
  const dprRef = useRef(window.devicePixelRatio || 1)

  // ── Resize observer — sizes canvas to container ────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const calc = () => {
      const { width: W, height: H } = el.getBoundingClientRect()
      if (W === 0 || H === 0) return
      const cs = Math.floor(Math.min(W, H) / size)
      setCellSize(cs)
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      canvas.width        = Math.round(W * dpr)
      canvas.height       = Math.round(H * dpr)
      canvas.style.width  = `${W}px`
      canvas.style.height = `${H}px`
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [size])

  // ── Track new piece placements for pop-in animation ───────────────────────
  useEffect(() => {
    if (!board) { prevBoardRef.current = null; return }
    const prev = prevBoardRef.current
    if (prev) {
      board.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell && !prev[r]?.[c]) {
            animMapRef.current[`${r},${c}`] = performance.now()
          }
        })
      )
    }
    prevBoardRef.current = board
  }, [board])

  // ── Track win highlight timing ────────────────────────────────────────────
  useEffect(() => {
    const key = winCells ? winCells.map(([r, c]) => `${r},${c}`).join('|') : null
    if (key && key !== prevWinKeyRef.current) {
      winStartRef.current = performance.now()
    }
    prevWinKeyRef.current = key
  }, [winCells])

  // ── RAF render loop (loopRef pattern — always fresh closure) ─────────────
  loopRef.current = () => {
    const canvas = canvasRef.current
    if (!canvas || cellSize === 0) {
      rafRef.current = requestAnimationFrame(() => loopRef.current?.())
      return
    }

    const dpr = dprRef.current
    const ctx = canvas.getContext('2d')
    const W   = canvas.width  / dpr
    const H   = canvas.height / dpr
    const now = performance.now()

    ctx.save()
    ctx.scale(dpr, dpr)

    // 1. Background
    drawBackground(ctx, background, W, H)

    // 2. Grid
    const boardPx = cellSize * size
    const boardX  = (W - boardPx) / 2
    const boardY  = (H - boardPx) / 2
    drawGrid(ctx, background, boardX, boardY, boardPx, cellSize, size)

    // 3. Win age → glow pulse
    const winAge  = winStartRef.current ? (now - winStartRef.current) / 1000 : 0
    const winPulse = winCells ? (Math.sin(winAge * 3) * 0.5 + 0.5) : 0

    // Cell lookup sets
    const winSet     = new Set((winCells     || []).map(([r, c]) => `${r},${c}`))
    const blockedSet = new Set((blockedCells || []).map(([r, c]) => `${r},${c}`))

    // 4. Draw cells
    if (board) {
      board.forEach((row, r) => {
        row.forEach((cell, c) => {
          const cx = boardX + c * cellSize + cellSize / 2
          const cy = boardY + r * cellSize + cellSize / 2
          const key = `${r},${c}`

          if (blockedSet.has(key)) {
            drawBlockedCell(ctx, boardX + c * cellSize, boardY + r * cellSize, cellSize, background)
          }

          if (cell) {
            const stamp  = animMapRef.current[key]
            const elapsed = stamp ? (now - stamp) : 9999
            const t     = Math.min(1, elapsed / 220)
            const scale = t < 1
              ? t * t * (3 - 2 * t)     // smoothstep ease-out
              : 1
            const isWin  = winSet.has(key)
            const color  = cell === 'X' ? P1_COLOR : P2_COLOR
            const avatar = cell === 'X' ? p1Avatar : p2Avatar

            drawPiece(
              ctx, cx, cy, cell, avatar, color, cellSize, scale,
              isWin ? color : null,
              isWin ? winPulse : 0,
              background
            )
          }
        })
      })
    }

    // 5. Win line overlay
    if (winCells && winCells.length >= 2) {
      const wColor = winCells.length > 0 && board?.[winCells[0][0]]?.[winCells[0][1]]
        ? (board[winCells[0][0]][winCells[0][1]] === 'X' ? P1_COLOR : P2_COLOR)
        : '#ffffff'
      drawWinLine(ctx, winCells, boardX, boardY, cellSize, wColor)
    }

    // 6. Hover highlight
    const hov = hoverRef.current
    if (hov?.valid && gameStatus === 'playing') {
      const color = currentPlayer === 'X' ? P1_COLOR : P2_COLOR
      drawHoverHighlight(
        ctx,
        boardX + hov.c * cellSize,
        boardY + hov.r * cellSize,
        cellSize, color, background
      )
    }

    // 7. AI thinking dots
    if (isAIThinking) {
      drawAIThinking(ctx, W, H, now)
    }

    ctx.restore()
    rafRef.current = requestAnimationFrame(() => loopRef.current?.())
  }

  // Start the loop once on mount
  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => loopRef.current?.())
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cell hit-test helper ──────────────────────────────────────────────────
  const getCellAt = useCallback((ex, ey) => {
    const canvas = canvasRef.current
    if (!canvas || cellSize === 0) return null
    const rect  = canvas.getBoundingClientRect()
    const mx    = ex - rect.left
    const my    = ey - rect.top
    const boardPx = cellSize * size
    const boardX  = (rect.width  - boardPx) / 2
    const boardY  = (rect.height - boardPx) / 2
    const c = Math.floor((mx - boardX) / cellSize)
    const r = Math.floor((my - boardY) / cellSize)
    if (r < 0 || r >= size || c < 0 || c >= size) return null
    return { r, c }
  }, [cellSize, size])

  const isValidClick = useCallback((r, c) => {
    if (!board || gameStatus !== 'playing') return false
    const cell      = board[r]?.[c]
    const isBlocked = (blockedCells || []).some(([br, bc]) => br === r && bc === c)
    if (armedPowerUp === 'block') return !cell && !isBlocked
    if (armedPowerUp === 'swap') {
      const opp = currentPlayer === 'X' ? 'O' : 'X'
      return cell === opp
    }
    return !cell && !isBlocked
  }, [board, gameStatus, armedPowerUp, currentPlayer, blockedCells])

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const cell = getCellAt(e.clientX, e.clientY)
    const valid = cell ? isValidClick(cell.r, cell.c) : false
    hoverRef.current = cell ? { ...cell, valid } : null
    // Update cursor via DOM — ref changes don't trigger re-renders
    if (canvasRef.current) canvasRef.current.style.cursor = valid ? 'pointer' : 'default'
  }, [getCellAt, isValidClick])

  const handleMouseLeave = useCallback(() => {
    hoverRef.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'default'
  }, [])

  const handleClick = useCallback((e) => {
    const cell = getCellAt(e.clientX, e.clientY)
    if (!cell) return
    onCellClick(cell.r, cell.c)
  }, [getCellAt, onCellClick])

  // Touch support
  const handleTouchEnd = useCallback((e) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    if (!touch) return
    const cell = getCellAt(touch.clientX, touch.clientY)
    if (!cell) return
    onCellClick(cell.r, cell.c)
  }, [getCellAt, onCellClick])

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{ minHeight: 0 }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  )
}
