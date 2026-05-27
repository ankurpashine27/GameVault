import { useRef, useState, useEffect, useCallback } from 'react'
import { P1_COLOR, P2_COLOR, POWER_UPS } from './constants.js'

// ─── Single Cell ──────────────────────────────────────────────────────────────
function Cell({
  value,        // null | 'X' | 'O'
  isWinCell,
  isBlocked,
  row, col,
  size,
  cellSize,
  p1Avatar, p2Avatar,
  currentPlayer,
  armedPowerUp,
  gameStatus,
  onClick,
}) {
  const isEmpty = value === null && !isBlocked
  const isOpponent = value !== null && value !== currentPlayer
  const isSwapTarget = armedPowerUp === 'swap' && isOpponent
  const isBlockTarget = armedPowerUp === 'block' && isEmpty

  const playerColor = value === 'X' ? P1_COLOR : P2_COLOR
  const curColor = currentPlayer === 'X' ? P1_COLOR : P2_COLOR

  // Cell can be interacted with?
  const clickable = gameStatus === 'playing' && (
    (armedPowerUp === 'block' && isEmpty) ||
    (armedPowerUp === 'swap' && isOpponent) ||
    (!armedPowerUp && isEmpty)
  )

  const fontSize = size <= 3 ? cellSize * 0.55
    : size <= 5 ? cellSize * 0.5
    : cellSize * 0.6

  return (
    <div
      onClick={clickable ? () => onClick(row, col) : undefined}
      style={{
        width: cellSize,
        height: cellSize,
        cursor: clickable ? 'pointer' : 'default',
        border: `1px solid rgba(30,45,69,0.8)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'background-color 120ms ease, box-shadow 120ms ease',
        backgroundColor: isWinCell
          ? playerColor + '38'
          : isBlocked
            ? '#0E1421'
            : 'transparent',
        boxShadow: isWinCell
          ? `inset 0 0 ${cellSize * 0.5}px ${playerColor}88, 0 0 ${cellSize * 0.3}px ${playerColor}55`
          : 'none',
      }}
      className={`
        ${clickable && !isBlocked ? 'hover:bg-white/[0.04]' : ''}
        ${isSwapTarget ? 'hover:bg-red-500/10' : ''}
        ${isBlockTarget ? 'hover:bg-yellow-500/10' : ''}
      `}
    >
      {/* Blocked pattern */}
      {isBlocked && (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(30,45,69,0.6) 4px, rgba(30,45,69,0.6) 5px)',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: Math.max(10, cellSize * 0.3), opacity: 0.4 }}>🚫</span>
        </div>
      )}

      {/* Piece */}
      {value && (
        <span
          style={{
            fontSize,
            lineHeight: 1,
            filter: isWinCell
              ? `drop-shadow(0 0 ${cellSize * 0.2}px ${playerColor}) drop-shadow(0 0 ${cellSize * 0.1}px ${playerColor})`
              : undefined,
            animation: 'tttPieceIn 0.18s ease-out',
            display: 'block',
          }}
        >
          {value === 'X' ? p1Avatar : p2Avatar}
        </span>
      )}

      {/* Swap target indicator */}
      {isSwapTarget && (
        <div style={{
          position: 'absolute',
          inset: 2,
          border: '2px dashed #ef4444',
          borderRadius: 3,
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
      )}

      {/* Win cell border pulse */}
      {isWinCell && (
        <div
          className="animate-pulse-slow"
          style={{
            position: 'absolute',
            inset: 0,
            border: `2px solid ${playerColor}aa`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function GameBoard({
  board,
  size,
  winCells,
  blockedCells,
  currentPlayer,
  armedPowerUp,
  gameStatus,
  p1Avatar, p2Avatar,
  onCellClick,
  isAIThinking,
}) {
  const containerRef = useRef(null)
  const [cellSize, setCellSize] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const calc = () => {
      const { width, height } = el.getBoundingClientRect()
      const cs = Math.floor(Math.min(width, height) / size)
      setCellSize(cs)
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [size])

  const winSet = new Set((winCells || []).map(([r, c]) => `${r},${c}`))
  const blockedSet = new Set((blockedCells || []).map(([r, c]) => `${r},${c}`))

  const boardPx = cellSize * size
  const curColor = currentPlayer === 'X' ? P1_COLOR : P2_COLOR

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center"
      style={{ minHeight: 0 }}
    >
      {cellSize > 0 && (
        <div
          style={{
            width: boardPx,
            height: boardPx,
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
            border: `2px solid ${curColor}33`,
            borderRadius: 4,
            overflow: 'hidden',
            opacity: isAIThinking ? 0.6 : 1,
            transition: 'opacity 200ms ease, border-color 300ms ease',
            boxShadow: isAIThinking ? 'none' : `0 0 20px ${curColor}18`,
          }}
        >
          {board && board.map((row, r) =>
            row.map((cell, c) => (
              <Cell
                key={`${r},${c}`}
                value={cell}
                isWinCell={winSet.has(`${r},${c}`)}
                isBlocked={blockedSet.has(`${r},${c}`)}
                row={r} col={c}
                size={size}
                cellSize={cellSize}
                p1Avatar={p1Avatar}
                p2Avatar={p2Avatar}
                currentPlayer={currentPlayer}
                armedPowerUp={armedPowerUp}
                gameStatus={gameStatus}
                onClick={onCellClick}
              />
            ))
          )}
        </div>
      )}

      {isAIThinking && (
        <div className="absolute flex items-center gap-2 pointer-events-none">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: P2_COLOR, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
