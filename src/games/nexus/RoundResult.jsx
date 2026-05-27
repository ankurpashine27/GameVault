import { useEffect } from 'react'
import DailyShareCard from './DailyShareCard.jsx'
import { SCORE_TABLE } from './constants.js'
import { dailyNumber } from './utils.js'

export default function RoundResult({
  puzzle,
  roundStatus,    // 'correct' | 'failed'
  hintsUsed,
  roundScore,
  mode,
  streakCount,
  onNext,         // proceed to next puzzle / game over
  onMenu,         // back to pregame
}) {
  const correct = roundStatus === 'correct'

  // Time Attack auto-advances
  useEffect(() => {
    if (mode === 'time_attack') {
      const t = setTimeout(onNext, 1500)
      return () => clearTimeout(t)
    }
  }, [mode, onNext])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 text-center">
      {/* Result icon */}
      <div className={`nexus-pop text-6xl ${correct ? '' : ''}`}>
        {correct ? '✅' : '❌'}
      </div>

      {/* Category reveal */}
      <div>
        <p className="text-text-secondary text-sm mb-1">The category was</p>
        <p className={`text-2xl font-bold nexus-pop ${correct ? 'text-green-400' : 'text-red-400'}`}>
          {puzzle?.category}
        </p>
      </div>

      {/* Score / hints info */}
      {correct && (
        <div className="space-y-1">
          <p className="text-3xl font-bold text-violet-300">+{roundScore}</p>
          <p className="text-text-secondary text-sm">
            Guessed in {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Streak mode: chain counter */}
      {mode === 'streak' && correct && (
        <div className="flex items-center gap-2 text-orange-400 text-lg font-bold">
          🔥 Streak: {streakCount}
        </div>
      )}

      {/* Daily share */}
      {mode === 'daily' && (
        <DailyShareCard
          hintsUsed={hintsUsed}
          correct={correct}
          dayNumber={dailyNumber()}
        />
      )}

      {/* Time Attack: auto-advance notice */}
      {mode === 'time_attack' && (
        <p className="text-text-secondary text-sm animate-pulse">Next puzzle loading…</p>
      )}

      {/* Action buttons */}
      {mode !== 'time_attack' && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          {/* Streak: next puzzle if correct, game over if wrong */}
          {mode === 'streak' && correct && (
            <button
              onClick={onNext}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-95
                rounded-lg font-semibold text-white transition-all"
            >
              Next Puzzle →
            </button>
          )}

          {(mode === 'classic' || mode === 'filter' || mode === 'reverse' || mode === 'daily'
            || (mode === 'streak' && !correct)) && (
            <>
              {mode !== 'daily' && (
                <button
                  onClick={onNext}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-95
                    rounded-lg font-semibold text-white transition-all"
                >
                  Play Again
                </button>
              )}
              <button
                onClick={onMenu}
                className="flex-1 py-2.5 bg-vault-surface hover:bg-vault-border active:scale-95
                  rounded-lg font-semibold text-text-secondary transition-all
                  border border-vault-border"
              >
                Main Menu
              </button>
            </>
          )}
        </div>
      )}

      {/* Score table reminder */}
      {mode !== 'time_attack' && (
        <div className="text-xs text-text-secondary space-y-0.5">
          {SCORE_TABLE.map((pts, i) => (
            <p key={i} className={hintsUsed === i + 1 && correct ? 'text-violet-300 font-semibold' : ''}>
              Hint {i + 1}: {pts} pts
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
