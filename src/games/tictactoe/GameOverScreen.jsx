import { BOARD_MODES, SERIES_MODES, P1_COLOR, P2_COLOR } from './constants.js'

export default function GameOverScreen({
  winResult,
  seriesScore,
  seriesWinner,
  seriesWinsNeeded,
  settings,
  p1Name, p2Name,
  p1Avatar, p2Avatar,
  vsAI,
  onPlayAgain,
  onNextGame,
  onLeaderboard,
}) {
  const { boardMode, seriesMode } = settings
  const modeLabel = BOARD_MODES[boardMode]?.label || boardMode
  const isSeries = seriesMode !== 'single'
  const seriesEnded = !!seriesWinner

  // Result for this game
  let headline, headlineColor
  if (winResult?.draw) {
    headline = "It's a Draw!"
    headlineColor = '#94A3B8'
  } else if (winResult?.winner === 'X') {
    headline = `${p1Avatar} ${p1Name} Wins!`
    headlineColor = P1_COLOR
  } else if (winResult?.winner === 'O') {
    headline = `${p2Avatar} ${vsAI ? 'AI' : p2Name} Wins!`
    headlineColor = P2_COLOR
  } else {
    headline = 'Game Over'
    headlineColor = '#94A3B8'
  }

  // Series winner text
  let seriesHeadline = null
  if (isSeries && seriesEnded) {
    seriesHeadline = seriesWinner === 'X'
      ? { text: `${p1Name} wins the series!`, color: P1_COLOR }
      : { text: `${vsAI ? 'AI' : p2Name} wins the series!`, color: P2_COLOR }
  }

  return (
    // Compact footer panel — sits below the board so the winning move stays fully visible
    <div className="flex-shrink-0 border-t-2 animate-fadeIn"
      style={{ borderColor: headlineColor + '55', backgroundColor: headlineColor + '0e' }}>

      {/* Series score bar (only when playing a series) */}
      {isSeries && (
        <div className="flex items-center justify-between border-b border-vault-border/60
          px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <span>{p1Avatar}</span>
            <span className="font-heading font-bold text-base" style={{ color: P1_COLOR }}>
              {seriesScore.X}
            </span>
            <span className="text-text-muted text-xs">–</span>
            <span className="font-heading font-bold text-base" style={{ color: P2_COLOR }}>
              {seriesScore.O}
            </span>
            <span>{p2Avatar}</span>
            {seriesScore.draws > 0 && (
              <span className="text-text-muted text-xs ml-1">{seriesScore.draws}D</span>
            )}
          </div>
          <span className="text-text-muted text-xs">
            {SERIES_MODES.find(s => s.id === seriesMode)?.label}
          </span>
          {seriesHeadline && (
            <span className="text-xs font-semibold" style={{ color: seriesHeadline.color }}>
              🏆 {seriesHeadline.text}
            </span>
          )}
        </div>
      )}

      {/* Main result row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">

        {/* Result label */}
        <div className="min-w-0">
          <h2
            className="font-heading font-bold text-xl leading-tight truncate"
            style={{ color: headlineColor }}
          >
            {headline}
          </h2>
          <p className="text-text-muted text-xs mt-0.5">{modeLabel} · winning move shown above</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Next game in series */}
          {isSeries && !seriesEnded && (
            <button
              onClick={onNextGame}
              className="px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-500 text-white
                font-heading font-bold text-sm transition-all duration-200
                hover:scale-[1.03] active:scale-100 shadow-glow-sm"
            >
              ▶ Next Game
            </button>
          )}

          <button
            onClick={onPlayAgain}
            className={`px-4 py-2 rounded-xl font-heading font-bold text-sm
              transition-all duration-200 hover:scale-[1.03] active:scale-100
              ${isSeries && !seriesEnded
                ? 'border border-vault-border text-text-muted hover:text-text-primary bg-vault-surface'
                : 'bg-accent-blue hover:bg-blue-500 text-white shadow-glow-sm'
              }`}
          >
            {!isSeries ? '▶ Play Again' : seriesEnded ? '▶ New Series' : '↩ Restart'}
          </button>

          <button
            onClick={onLeaderboard}
            className="px-3 py-2 rounded-xl border border-vault-border text-text-muted
              hover:border-accent-blue hover:text-text-primary transition-colors duration-200
              font-heading text-sm"
            title="Leaderboard"
          >
            🏆
          </button>
        </div>
      </div>
    </div>
  )
}
