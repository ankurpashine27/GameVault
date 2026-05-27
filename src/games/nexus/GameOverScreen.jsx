import DailyShareCard from './DailyShareCard.jsx'
import { MODES } from './constants.js'
import { dailyNumber, formatDate, todayString } from './utils.js'

export default function GameOverScreen({
  mode,
  sessionScore,
  streakCount,
  personalBest,
  roundsPlayed,
  correctCount,
  timeAttackTime,      // seconds elapsed for time attack
  timeBonus,
  hintsUsed,           // for classic/reverse/filter/daily
  correct,             // for classic/reverse/filter/daily
  puzzle,              // for classic/reverse/filter/daily
  dailyStreakData,     // { current, best }
  onPlayAgain,
  onLeaderboard,
}) {
  const modeLabel = MODES[mode]?.name ?? mode

  const isPB = sessionScore > 0 && sessionScore >= personalBest

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 space-y-5 overflow-y-auto">

      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-text-secondary text-sm font-medium tracking-widest uppercase">Game Over</p>
        <h2 className="text-3xl font-bold text-white">{modeLabel}</h2>
        {isPB && (
          <p className="text-yellow-400 text-sm font-semibold animate-pulse">
            🏆 New Personal Best!
          </p>
        )}
      </div>

      {/* ── Mode-specific stats ── */}

      {/* Classic / Filter / Reverse */}
      {(mode === 'classic' || mode === 'filter' || mode === 'reverse') && (
        <div className="w-full max-w-xs space-y-3">
          <StatRow label="Category" value={puzzle?.category ?? '—'} />
          <StatRow label="Result" value={correct ? '✅ Correct' : '❌ Failed'} />
          {correct && <StatRow label="Hints used" value={`${hintsUsed} / 5`} />}
          <StatRow label="Score" value={`${sessionScore} pts`} highlight />
          <StatRow label="Personal Best" value={`${personalBest} pts`} />
        </div>
      )}

      {/* Streak */}
      {mode === 'streak' && (
        <div className="w-full max-w-xs space-y-3">
          <div className="text-center py-2">
            <p className="text-6xl font-bold text-orange-400">🔥 {streakCount}</p>
            <p className="text-text-secondary text-sm mt-1">Puzzles in a row</p>
          </div>
          <StatRow label="Total Score" value={`${sessionScore} pts`} highlight />
          <StatRow label="Personal Best Streak" value={personalBest > 0 ? `${personalBest}` : '—'} />
        </div>
      )}

      {/* Time Attack */}
      {mode === 'time_attack' && (
        <div className="w-full max-w-xs space-y-3">
          <StatRow label="Total Score" value={`${sessionScore} pts`} highlight />
          <StatRow label="Time Bonus" value={`+${timeBonus} pts`} />
          <StatRow label="Puzzles Solved" value={`${correctCount} / ${roundsPlayed}`} />
          <StatRow
            label="Accuracy"
            value={roundsPlayed > 0 ? `${Math.round((correctCount / roundsPlayed) * 100)}%` : '0%'}
          />
          <StatRow
            label="Time Taken"
            value={timeAttackTime != null ? `${Math.round(timeAttackTime)}s` : '—'}
          />
          <StatRow label="Personal Best" value={`${personalBest} pts`} />
        </div>
      )}

      {/* Daily */}
      {mode === 'daily' && (
        <div className="w-full max-w-xs space-y-4">
          <div className="text-center">
            <p className="text-text-secondary text-xs">{formatDate(todayString())} · Day #{dailyNumber()}</p>
          </div>
          <DailyShareCard hintsUsed={hintsUsed} correct={correct} dayNumber={dailyNumber()} />
          {dailyStreakData && (
            <div className="flex justify-around pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{dailyStreakData.current}</p>
                <p className="text-text-secondary text-xs">Day streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{dailyStreakData.best}</p>
                <p className="text-text-secondary text-xs">Best streak</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs pt-2">
        {mode !== 'daily' && (
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-95
              rounded-lg font-semibold text-white transition-all"
          >
            Play Again
          </button>
        )}
        <button
          onClick={onLeaderboard}
          className="flex-1 py-2.5 bg-vault-surface hover:bg-vault-border active:scale-95
            rounded-lg font-semibold text-text-secondary transition-all border border-vault-border"
        >
          🏆 Leaderboard
        </button>
      </div>
    </div>
  )
}

function StatRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-lg
      bg-vault-surface border border-vault-border">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className={`font-semibold text-sm ${highlight ? 'text-violet-300' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}
