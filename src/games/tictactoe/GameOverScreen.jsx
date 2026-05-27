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

  // What to show for this game
  let headline, subline, headlineColor
  if (winResult?.draw) {
    headline = "It's a Draw!"
    subline = modeLabel
    headlineColor = '#94A3B8'
  } else if (winResult?.winner === 'X') {
    headline = `${p1Avatar} ${p1Name} Wins!`
    subline = modeLabel
    headlineColor = P1_COLOR
  } else if (winResult?.winner === 'O') {
    headline = `${p2Avatar} ${vsAI ? 'AI' : p2Name} Wins!`
    subline = modeLabel
    headlineColor = P2_COLOR
  } else {
    headline = 'Game Over'
    subline = modeLabel
    headlineColor = '#94A3B8'
  }

  // Series summary
  let seriesHeadline = null
  if (isSeries && seriesEnded) {
    if (seriesWinner === 'X') {
      seriesHeadline = { text: `${p1Name} wins the series!`, color: P1_COLOR }
    } else {
      seriesHeadline = { text: `${vsAI ? 'AI' : p2Name} wins the series!`, color: P2_COLOR }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-vault-bg text-center
      px-6 animate-fadeIn">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-5">

        {/* Series score bar */}
        {isSeries && (
          <div className="flex items-center gap-4 bg-vault-elevated border border-vault-border
            rounded-xl px-5 py-3 w-full justify-between">
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{p1Avatar}</span>
              <span className="text-xs text-text-muted">{p1Name}</span>
              <span className="text-2xl font-heading font-bold mt-1" style={{ color: P1_COLOR }}>
                {seriesScore.X}
              </span>
            </div>
            <div className="text-center">
              <p className="text-text-muted text-xs uppercase tracking-wider">
                {SERIES_MODES.find(s => s.id === seriesMode)?.label || seriesMode}
              </p>
              {seriesScore.draws > 0 && (
                <p className="text-text-muted text-xs">{seriesScore.draws} draws</p>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{p2Avatar}</span>
              <span className="text-xs text-text-muted">{vsAI ? 'AI' : p2Name}</span>
              <span className="text-2xl font-heading font-bold mt-1" style={{ color: P2_COLOR }}>
                {seriesScore.O}
              </span>
            </div>
          </div>
        )}

        {/* Series winner banner */}
        {seriesHeadline && (
          <div
            className="w-full rounded-xl px-5 py-3 border animate-scaleIn"
            style={{
              backgroundColor: seriesHeadline.color + '18',
              borderColor: seriesHeadline.color + '44',
            }}
          >
            <p className="font-heading font-bold text-xl" style={{ color: seriesHeadline.color }}>
              🏆 {seriesHeadline.text}
            </p>
          </div>
        )}

        {/* Game result */}
        <div>
          <h2
            className="font-heading text-4xl font-bold leading-tight"
            style={{ color: headlineColor }}
          >
            {headline}
          </h2>
          <p className="text-text-muted text-sm mt-1">{subline}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Next game in series */}
          {isSeries && !seriesEnded && (
            <button
              onClick={onNextGame}
              className="w-full py-3.5 rounded-xl bg-accent-blue hover:bg-blue-500 text-white
                font-heading font-bold text-lg transition-all duration-200
                hover:scale-[1.02] active:scale-100 shadow-glow-blue"
            >
              ▶ Next Game
            </button>
          )}

          {/* Play again / new series */}
          <button
            onClick={onPlayAgain}
            className={`w-full py-3.5 rounded-xl text-white font-heading font-bold text-lg
              transition-all duration-200 hover:scale-[1.02] active:scale-100
              ${isSeries && !seriesEnded
                ? 'bg-vault-elevated border border-vault-border text-text-muted hover:text-text-primary hover:border-vault-muted py-3'
                : 'bg-accent-blue hover:bg-blue-500 shadow-glow-blue'
              }`}
          >
            {seriesEnded ? '▶ New Series' : isSeries ? '↩ Restart Series' : '▶ Play Again'}
          </button>

          <button
            onClick={onLeaderboard}
            className="w-full py-3 rounded-xl border border-vault-border text-text-muted
              hover:border-accent-blue hover:text-text-primary transition-colors duration-200
              font-heading font-semibold"
          >
            🏆 Leaderboard
          </button>
        </div>

        <p className="text-xs text-text-muted">
          <kbd className="bg-vault-elevated border border-vault-border px-1.5 py-0.5 rounded
            font-mono text-[10px] text-text-muted">
            Shift+Esc
          </kbd>
          {' '}to exit
        </p>
      </div>
    </div>
  )
}
