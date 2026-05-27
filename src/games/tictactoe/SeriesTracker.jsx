import { P1_COLOR, P2_COLOR } from './constants.js'

// Pip indicator for series wins
function WinPips({ wins, needed, color }) {
  return (
    <div className="flex gap-1.5 items-center justify-center">
      {Array.from({ length: needed }, (_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: i < wins ? color : 'transparent',
            border: `2px solid ${i < wins ? color : '#2A3A55'}`,
            boxShadow: i < wins ? `0 0 6px ${color}88` : 'none',
          }}
        />
      ))}
    </div>
  )
}

export default function SeriesTracker({
  seriesScore,
  seriesWinsNeeded,
  p1Name,
  p2Name,
  p1Avatar,
  p2Avatar,
  currentPlayer,
  seriesMode,
}) {
  if (seriesMode === 'single') return null

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2
      bg-vault-surface border-b border-vault-border">

      {/* P1 */}
      <div className="flex flex-col items-center gap-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{p1Avatar}</span>
          <span
            className="text-xs font-medium truncate max-w-[70px]"
            style={{ color: P1_COLOR }}
          >
            {p1Name}
          </span>
          {currentPlayer === 'X' && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: P1_COLOR }} />
          )}
        </div>
        <WinPips wins={seriesScore.X} needed={seriesWinsNeeded} color={P1_COLOR} />
      </div>

      {/* Score */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="text-sm font-heading font-bold text-text-primary">
          <span style={{ color: P1_COLOR }}>{seriesScore.X}</span>
          <span className="text-text-muted mx-1">-</span>
          <span style={{ color: P2_COLOR }}>{seriesScore.O}</span>
        </div>
        {seriesScore.draws > 0 && (
          <span className="text-[10px] text-text-muted">{seriesScore.draws}D</span>
        )}
      </div>

      {/* P2 */}
      <div className="flex flex-col items-center gap-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {currentPlayer === 'O' && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: P2_COLOR }} />
          )}
          <span
            className="text-xs font-medium truncate max-w-[70px]"
            style={{ color: P2_COLOR }}
          >
            {p2Name}
          </span>
          <span className="text-base leading-none">{p2Avatar}</span>
        </div>
        <WinPips wins={seriesScore.O} needed={seriesWinsNeeded} color={P2_COLOR} />
      </div>
    </div>
  )
}
