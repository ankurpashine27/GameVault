import { useRef, useState, useEffect, useMemo } from 'react'
import { SKINS, HEAD_RADIUS, BODY_RADIUS, TAIL_RADIUS, POWER_UP_TYPES } from './constants.js'
import { cellKey } from './utils.js'

// Individual cell
function GameCell({ type, skin, direction, powerUpItem }) {
  const base = {
    width: '100%',
    height: '100%',
    transition: 'background-color 80ms ease, border-radius 120ms ease',
  }

  if (type === 'head') {
    return (
      <div style={{
        ...base,
        backgroundColor: skin.head,
        borderRadius: HEAD_RADIUS[direction] || '4px',
        boxShadow: skin.glow ? `0 0 8px ${skin.glow}` : undefined,
        position: 'relative',
      }}>
        {/* eye */}
        <div style={{
          position: 'absolute',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.9)',
          top: direction === 'DOWN'  ? '55%' : direction === 'UP' ? '15%' : '25%',
          left: direction === 'RIGHT' ? '55%' : direction === 'LEFT' ? '15%' : '60%',
        }} />
      </div>
    )
  }

  if (type === 'body') {
    return (
      <div style={{
        ...base,
        backgroundColor: skin.body,
        borderRadius: BODY_RADIUS,
        margin: '1px',
        boxShadow: skin.glow ? `0 0 4px ${skin.glow}40` : undefined,
      }} />
    )
  }

  if (type === 'tail') {
    return (
      <div style={{
        ...base,
        backgroundColor: skin.tail,
        borderRadius: TAIL_RADIUS,
        margin: '2px',
      }} />
    )
  }

  if (type === 'food') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '65%',
          height: '65%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #dc2626)',
          boxShadow: '0 0 6px rgba(220,38,38,0.6)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
    )
  }

  if (type === 'powerup' && powerUpItem) {
    const timeLeft = Math.ceil(Math.max(0, powerUpItem.expiresAt - Date.now()) / 1000)
    return (
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${powerUpItem.color}22`,
        borderRadius: '4px',
        border: `1px solid ${powerUpItem.color}66`,
        boxShadow: `0 0 8px ${powerUpItem.color}44`,
        fontSize: '70%',
      }}>
        <span style={{ lineHeight: 1 }}>{powerUpItem.icon}</span>
        {timeLeft > 0 && (
          <span style={{
            position: 'absolute',
            bottom: 1,
            right: 2,
            fontSize: '55%',
            color: powerUpItem.color,
            fontWeight: 700,
            lineHeight: 1,
          }}>
            {timeLeft}
          </span>
        )}
      </div>
    )
  }

  if (type === 'obstacle') {
    return (
      <div style={{
        ...base,
        backgroundColor: '#374151',
        backgroundImage: `
          linear-gradient(135deg, rgba(255,255,255,0.04) 25%, transparent 25%),
          linear-gradient(225deg, rgba(255,255,255,0.04) 25%, transparent 25%),
          linear-gradient(45deg,  rgba(0,0,0,0.1) 25%, transparent 25%),
          linear-gradient(315deg, rgba(0,0,0,0.1) 25%, transparent 25%)
        `,
        backgroundSize: '4px 4px',
        borderRadius: '2px',
        border: '1px solid rgba(255,255,255,0.06)',
      }} />
    )
  }

  // empty
  return <div style={{ ...base, borderRadius: 0 }} />
}

export default function GameBoard({
  gridSize, snake, food, powerUpItem, obstacles, direction, skin: skinId,
  onSwipe,
}) {
  const containerRef = useRef(null)
  const [cellSize, setCellSize] = useState(0)
  const skin = SKINS[skinId] || SKINS.classic

  // Touch swipe state
  const touchStartRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const calc = () => {
      const { width, height } = el.getBoundingClientRect()
      const size = Math.min(
        Math.floor(width / gridSize),
        Math.floor(height / gridSize),
      )
      setCellSize(Math.max(size, 4))
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [gridSize])

  // Build cell map for O(1) lookup
  const cellMap = useMemo(() => {
    const map = new Map()
    if (food) map.set(cellKey(food.x, food.y), 'food')
    obstacles.forEach(o => map.set(cellKey(o.x, o.y), 'obstacle'))
    if (powerUpItem) map.set(cellKey(powerUpItem.position.x, powerUpItem.position.y), 'powerup')
    // Snake (head first)
    snake.forEach((seg, i) => {
      if (i === 0) map.set(cellKey(seg.x, seg.y), 'head')
      else if (i === snake.length - 1) map.set(cellKey(seg.x, seg.y), 'tail')
      else map.set(cellKey(seg.x, seg.y), 'body')
    })
    return map
  }, [snake, food, powerUpItem, obstacles])

  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !onSwipe) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return // too small
    if (Math.abs(dx) > Math.abs(dy)) onSwipe(dx > 0 ? 'RIGHT' : 'LEFT')
    else onSwipe(dy > 0 ? 'DOWN' : 'UP')
    touchStartRef.current = null
  }

  const gridPixels = cellSize * gridSize

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {cellSize > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            width: gridPixels,
            height: gridPixels,
            backgroundColor: '#0a0f1e',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, i) => {
            const x = i % gridSize
            const y = Math.floor(i / gridSize)
            const key = cellKey(x, y)
            const type = cellMap.get(key) || 'empty'
            return (
              <div
                key={i}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRight:  '1px solid rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  position: 'relative',
                  display: 'flex',
                }}
              >
                <GameCell
                  type={type}
                  skin={skin}
                  direction={direction}
                  powerUpItem={type === 'powerup' ? powerUpItem : null}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
