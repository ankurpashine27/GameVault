import HintCard from './HintCard.jsx'
import WrongGuessTag from './WrongGuessTag.jsx'
import GuessInput from './GuessInput.jsx'
import TimerBar from './TimerBar.jsx'
import { MODES, THEME_LABELS } from './constants.js'

export default function GameScreen({
  puzzle,
  revealedCount,
  wrongGuesses,
  roundStatus,
  hintsUsed,
  roundScore,
  shakeInput,
  mode,
  sessionScore,
  streakCount,
  timeAttackIdx,
  totalTimeAttackPuzzles,
  onSubmitGuess,
  onPause,
  onMute,
  muted,
  onTimerExpire,
}) {
  if (!puzzle) return null

  const isOver     = roundStatus === 'correct' || roundStatus === 'failed'
  const modeInfo   = MODES[mode]

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* ── Timer Bar (Time Attack only) ──────────────────────────── */}
      {mode === 'time_attack' && !isOver && (
        <TimerBar totalSeconds={120} onExpire={onTimerExpire} />
      )}

      {/* ── HUD ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-vault-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/30
            text-violet-300 text-xs font-semibold">
            {modeInfo?.name ?? mode}
          </span>
          {mode === 'time_attack' && (
            <span className="text-text-secondary text-xs">
              {timeAttackIdx + 1}/{totalTimeAttackPuzzles}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {mode === 'streak' && (
            <span className="text-orange-400 text-sm font-bold">🔥 {streakCount}</span>
          )}
          {(mode === 'classic' || mode === 'filter' || mode === 'time_attack') && (
            <span className="text-violet-300 text-sm font-bold">{sessionScore} pts</span>
          )}
          <button
            onClick={onMute}
            className="text-text-secondary hover:text-white transition-colors text-lg leading-none"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={onPause}
            className="text-text-secondary hover:text-white transition-colors text-lg leading-none"
            title="Pause (Esc)"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Mystery / Answer card */}
        <div
          className={`flex items-center justify-center rounded-xl px-5 py-4 border transition-all
            ${roundStatus === 'correct'
              ? 'bg-green-900/30 border-green-500/50'
              : roundStatus === 'failed'
                ? 'bg-red-900/30 border-red-500/50'
                : 'bg-violet-900/10 border-violet-500/20'
            }`}
        >
          {roundStatus === 'correct' ? (
            <p className="text-green-300 font-bold text-xl nexus-pop text-center">
              ✓ {puzzle.category}
            </p>
          ) : roundStatus === 'failed' ? (
            <p className="text-red-300 font-bold text-xl text-center">
              ✗ {puzzle.category}
            </p>
          ) : (
            <p className="text-text-secondary font-mono tracking-widest text-lg">? ? ?</p>
          )}
        </div>

        {/* Theme badge (filter mode) */}
        {mode === 'filter' && (
          <p className="text-xs text-text-secondary text-center">
            Theme: <span className="text-violet-300 font-medium">{THEME_LABELS[puzzle.theme]}</span>
          </p>
        )}

        {/* Hint cards */}
        <div className="space-y-2">
          {puzzle.hints.map((hint, i) => (
            <HintCard
              key={i}
              index={i}
              text={hint}
              revealed={i < revealedCount}
              animateIn={i === revealedCount - 1}
            />
          ))}
        </div>

        {/* Wrong guesses */}
        {wrongGuesses.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {wrongGuesses.map((g, i) => (
              <WrongGuessTag key={i} text={g} />
            ))}
          </div>
        )}
      </div>

      {/* ── Guess input (pinned to bottom) ───────────────────────── */}
      <div className="flex-shrink-0 border-t border-vault-border p-4">
        <GuessInput
          onSubmit={(text) => onSubmitGuess(text, wrongGuesses, revealedCount, puzzle)}
          disabled={isOver}
          shakeInput={shakeInput}
        />
        {!isOver && (
          <p className="text-center text-xs text-text-secondary mt-2">
            {revealedCount < 5
              ? `Wrong answer reveals next hint (${revealedCount}/5 shown)`
              : 'All hints revealed — last chance!'}
          </p>
        )}
      </div>
    </div>
  )
}
