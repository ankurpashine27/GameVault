import { POWERUP_DEFS, GAME_MODES } from './constants.js'
import { formatTime } from './utils.js'
import { getPieceGrid } from './engine/tetrominoes.js'

// ─── Mini piece preview (CSS grid) ───────────────────────────────────────────
const PIECE_COLORS_CSS = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000',
}

function MiniPiece({ type, size = 10 }) {
  if (!type) return <div style={{ width: size * 4, height: size * 4 }} />
  const grid = getPieceGrid(type, 0, 'modern')
  const color = PIECE_COLORS_CSS[type] ?? '#888'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${size}px)`,
        gridTemplateRows: `repeat(4, ${size}px)`,
        gap: 0,
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: size, height: size,
              background: cell ? color : 'transparent',
              border: cell ? '0.5px solid rgba(255,255,255,0.2)' : 'none',
              boxSizing: 'border-box',
            }}
          />
        ))
      )}
    </div>
  )
}

// ─── HUD component ────────────────────────────────────────────────────────────
export default function HUD({
  score = 0,
  bestScore = 0,
  level = 1,
  lines = 0,
  timeMs = 0,
  mode = 'marathon',
  holdType = null,
  nextQueue = [],
  backToBack = false,
  combo = 0,
  slowActive = false,
  slowTimer = 0,
  powerups = [],
  onPause,
}) {
  const modeDef = GAME_MODES[mode] ?? GAME_MODES.marathon

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
    >
      {/* Left panel — HOLD + score info */}
      <div
        className="absolute top-2 left-2 flex flex-col gap-2"
        style={{ width: 68 }}
      >
        {/* Hold */}
        <div className="bg-black/60 rounded-lg px-2 py-1 text-white text-center border border-white/10">
          <div className="text-[9px] text-white/50 uppercase tracking-wider mb-1">Hold</div>
          <div className="flex items-center justify-center">
            <MiniPiece type={holdType} size={9} />
          </div>
        </div>

        {/* Score */}
        <div className="bg-black/60 rounded-lg px-2 py-1 text-white border border-white/10">
          <div className="text-[9px] text-white/50 uppercase tracking-wider">Score</div>
          <div className="text-xs font-bold text-yellow-300 tabular-nums">{score.toLocaleString()}</div>
          <div className="text-[9px] text-white/40 mt-0.5">Best</div>
          <div className="text-[9px] text-white/60 tabular-nums">{bestScore.toLocaleString()}</div>
        </div>

        {/* Level */}
        <div className="bg-black/60 rounded-lg px-2 py-1 text-white border border-white/10">
          <div className="text-[9px] text-white/50 uppercase tracking-wider">Level</div>
          <div className="text-sm font-bold text-cyan-300">{level}</div>
          <div className="text-[9px] text-white/40 mt-0.5">Lines</div>
          <div className="text-xs font-bold text-white/80 tabular-nums">{lines}</div>
        </div>

        {/* Time (sprint/ultra modes) */}
        {(mode === 'sprint' || mode === 'ultra') && (
          <div className="bg-black/60 rounded-lg px-2 py-1 text-white border border-white/10">
            <div className="text-[9px] text-white/50 uppercase tracking-wider">
              {mode === 'sprint' ? 'Time' : 'Time Left'}
            </div>
            <div className="text-xs font-bold text-green-300 tabular-nums">
              {mode === 'ultra'
                ? formatTime(Math.max(0, 3 * 60 * 1000 - timeMs))
                : formatTime(timeMs)
              }
            </div>
          </div>
        )}

        {/* Sprint lines remaining */}
        {mode === 'sprint' && (
          <div className="bg-black/60 rounded-lg px-2 py-1 text-white border border-white/10">
            <div className="text-[9px] text-white/50 uppercase tracking-wider">Left</div>
            <div className="text-sm font-bold text-orange-300 tabular-nums">{Math.max(0, 40 - lines)}</div>
          </div>
        )}

        {/* Combo / B2B */}
        {(combo > 1 || backToBack) && (
          <div className="bg-black/60 rounded-lg px-2 py-1 text-white border border-white/10">
            {backToBack && (
              <div className="text-[9px] text-yellow-400 font-bold">B2B</div>
            )}
            {combo > 1 && (
              <div className="text-xs font-bold text-orange-400">×{combo}</div>
            )}
          </div>
        )}

        {/* Power-ups */}
        {powerups.length > 0 && (
          <div className="bg-black/60 rounded-lg px-2 py-1 border border-white/10 flex flex-col gap-1">
            {powerups.map(pu => (
              <div key={pu.id} className="text-center text-xs" title={pu.id}>
                {POWERUP_DEFS[pu.id]?.icon ?? '⚡'}
              </div>
            ))}
          </div>
        )}

        {/* Slow active indicator */}
        {slowActive && (
          <div className="bg-blue-900/70 rounded-lg px-2 py-1 text-white border border-blue-400/30">
            <div className="text-[9px] text-blue-300">SLOW</div>
            <div className="text-xs tabular-nums text-blue-200">
              {(slowTimer / 1000).toFixed(1)}s
            </div>
          </div>
        )}
      </div>

      {/* Right panel — NEXT queue */}
      <div
        className="absolute top-2 right-2 flex flex-col gap-1"
        style={{ width: 68 }}
      >
        <div className="bg-black/60 rounded-lg px-2 py-1 text-white border border-white/10">
          <div className="text-[9px] text-white/50 uppercase tracking-wider mb-1">Next</div>
          <div className="flex flex-col gap-1 items-center">
            {nextQueue.slice(0, 5).map((type, i) => (
              <MiniPiece key={i} type={type} size={i === 0 ? 10 : 8} />
            ))}
          </div>
        </div>
      </div>

      {/* Pause button (pointer-events-auto) */}
      <button
        onClick={onPause}
        className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1 rounded-full border border-white/20 pointer-events-auto transition-colors"
        style={{ zIndex: 30 }}
      >
        ⏸ Pause
      </button>

      {/* Mode badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white/50 text-[9px] px-2 py-0.5 rounded-full">
        {modeDef.icon} {modeDef.name}
      </div>
    </div>
  )
}
