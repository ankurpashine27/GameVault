import { useEffect, useRef } from 'react'
import { DIFFICULTIES, GRID_SIZES } from './constants.js'

export default function GameOverScreen({
  score, gridSize, difficulty,
  playerName, isNewRecord, personalBest, prevPersonalBest,
  onPlayAgain, onLeaderboard,
}) {
  const savedRef = useRef(false)

  const gridLabel = GRID_SIZES.find(g => g.id === gridSize)?.label || gridSize
  const diffLabel = DIFFICULTIES[difficulty]?.name || difficulty

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0f] text-center px-6 animate-fadeIn">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-5">

        {/* Heading */}
        <div>
          <p className="text-text-muted text-sm uppercase tracking-widest mb-1">Game Over</p>
          <p className="text-text-secondary text-sm">
            {gridLabel} · {diffLabel}
          </p>
        </div>

        {/* Score */}
        <div className="relative">
          <p className="font-heading text-8xl font-bold gradient-text leading-none">{score}</p>
          <p className="text-text-muted text-sm mt-2">points</p>
        </div>

        {/* New record celebration */}
        {isNewRecord ? (
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-5 py-3 animate-scaleIn">
            <p className="text-accent-blue font-heading font-bold text-lg">🎉 New Personal Best!</p>
            <p className="text-accent-blue/70 text-sm">Previous best: {prevPersonalBest || 0}</p>
          </div>
        ) : (
          <div className="bg-vault-surface border border-vault-border rounded-xl px-5 py-3">
            <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Personal Best</p>
            <p className="font-heading font-bold text-xl text-text-primary">{personalBest || score}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-lg bg-accent-blue hover:bg-blue-500 text-white
              font-heading font-bold text-lg transition-all duration-200
              hover:scale-105 active:scale-100 shadow-glow-sm hover:shadow-glow-blue"
          >
            ▶ Play Again
          </button>
          <button
            onClick={onLeaderboard}
            className="w-full py-3 rounded-lg border border-vault-border text-text-secondary
              hover:border-accent-blue hover:text-accent-blue transition-colors duration-200
              font-heading font-semibold"
          >
            🏆 Leaderboard
          </button>
        </div>

        <p className="text-xs text-text-muted">
          <kbd className="bg-vault-elevated border border-vault-border px-1.5 py-0.5 rounded font-mono">Shift+Esc</kbd>
          {' '}to exit
        </p>
      </div>
    </div>
  )
}
