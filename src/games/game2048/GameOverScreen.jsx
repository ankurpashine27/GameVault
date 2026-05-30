/**
 * 2048 GameOverScreen.
 */

export default function GameOverScreen({
  score, bestScore, isNewBest, highestTile, mode,
  onPlayAgain, onMenu, onLeaderboard,
}) {
  const won = false // this screen is only shown for game over, not win

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm
      flex items-center justify-center p-4">
      <div className="bg-gray-900/98 border border-white/10 rounded-2xl p-6 w-full max-w-sm
        flex flex-col gap-4 shadow-2xl text-center">

        <div className="text-5xl">😔</div>
        <h2 className="text-white font-black text-2xl">Game Over</h2>

        <div className="bg-white/5 rounded-xl p-4 grid grid-cols-2 gap-3">
          <Stat label="Score"  value={score.toLocaleString()}  highlight={isNewBest} />
          <Stat label="Best"   value={bestScore.toLocaleString()} />
          <Stat label="Highest Tile" value={highestTile.toLocaleString()} />
        </div>

        {isNewBest && (
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl py-2 px-4 text-amber-300 font-bold text-sm">
            🏆 New Personal Best!
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button onClick={onPlayAgain}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-black
              rounded-xl transition-colors shadow-lg">
            Play Again
          </button>
          <button onClick={onLeaderboard}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white/80
              font-bold rounded-xl transition-colors text-sm">
            🏆 Leaderboard
          </button>
          <button onClick={onMenu}
            className="w-full py-2.5 text-white/40 hover:text-white/70 text-sm transition-colors">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className="text-white/50 text-xs mb-0.5">{label}</div>
      <div className={`font-black text-lg ${highlight ? 'text-amber-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
