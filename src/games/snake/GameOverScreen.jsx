import { DIFFICULTIES, GRID_SIZES } from './constants.js'

export default function GameOverScreen({
  score, gridSize, difficulty,
  playerName, isNewRecord, personalBest, prevPersonalBest,
  onPlayAgain, onLeaderboard,
}) {
  const gridLabel = GRID_SIZES.find(g => g.id === gridSize)?.label || gridSize
  const diffLabel = DIFFICULTIES[difficulty]?.name || difficulty

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#060e08] text-center px-6 animate-fadeIn">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-5">

        {/* Heading */}
        <div>
          <p className="text-[#4a7a54] text-sm uppercase tracking-widest mb-1">Game Over</p>
          <p className="text-green-300/60 text-sm">
            {gridLabel} · {diffLabel}
          </p>
        </div>

        {/* Score */}
        <div className="relative">
          <p className="font-heading text-8xl font-bold snake-gradient-text leading-none">{score}</p>
          <p className="text-[#4a7a54] text-sm mt-2">points</p>
        </div>

        {/* New record celebration */}
        {isNewRecord ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3 animate-scaleIn">
            <p className="text-green-400 font-heading font-bold text-lg">🎉 New Personal Best!</p>
            <p className="text-green-400/60 text-sm">Previous best: {prevPersonalBest || 0}</p>
          </div>
        ) : (
          <div className="bg-[#0d1e10] border border-[rgba(34,197,94,0.2)] rounded-xl px-5 py-3">
            <p className="text-[#4a7a54] text-xs uppercase tracking-wider mb-0.5">Personal Best</p>
            <p className="font-heading font-bold text-xl text-green-100">{personalBest || score}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-lg bg-green-700 hover:bg-green-600 text-white
              font-heading font-bold text-lg transition-all duration-200
              hover:scale-105 active:scale-100
              shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:shadow-[0_0_22px_rgba(34,197,94,0.55)]"
          >
            ▶ Play Again
          </button>
          <button
            onClick={onLeaderboard}
            className="w-full py-3 rounded-lg border border-[rgba(34,197,94,0.2)] text-green-300/70
              hover:border-green-500 hover:text-green-400 transition-colors duration-200
              font-heading font-semibold"
          >
            🏆 Leaderboard
          </button>
        </div>

        <p className="text-xs text-[#4a7a54]">
          <kbd className="bg-[#0d1e10] border border-[rgba(34,197,94,0.2)] px-1.5 py-0.5 rounded font-mono text-green-300/50">
            Shift+Esc
          </kbd>
          {' '}to exit
        </p>
      </div>
    </div>
  )
}
