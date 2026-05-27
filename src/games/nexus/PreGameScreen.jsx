import { MODES, THEMES, THEME_LABELS } from './constants.js'
import DailyShareCard from './DailyShareCard.jsx'
import { dailyNumber } from './utils.js'

export default function PreGameScreen({
  playerName, onPlayerNameChange,
  mode, onModeChange,
  filterTheme, onFilterThemeChange,
  onPlay,
  onHowToPlay,
  onLeaderboard,
  dailyResult,       // null if not played today, otherwise { hintsUsed, correct }
  dailyStreakData,   // { current, best }
}) {
  const alreadyPlayedDaily = mode === 'daily' && dailyResult !== null

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* Title */}
      <div className="text-center space-y-1">
        <p className="text-4xl">🔮</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">NEXUS</h1>
        <p className="text-text-secondary text-sm">Guess the hidden category from 5 mystery clues</p>
      </div>

      {/* Player name */}
      <div className="space-y-1">
        <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
          Your Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={e => onPlayerNameChange(e.target.value)}
          maxLength={24}
          placeholder="Anonymous"
          className="w-full bg-vault-surface border border-vault-border rounded-lg px-4 py-2.5
            text-white placeholder-text-secondary focus:border-violet-400 focus:outline-none
            transition-colors"
        />
      </div>

      {/* Mode picker */}
      <div className="space-y-2">
        <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
          Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(MODES).map(m => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`py-2.5 px-2 rounded-lg text-xs font-semibold transition-all border text-center
                ${mode === m.id
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-vault-surface border-vault-border text-text-secondary hover:border-violet-500/50 hover:text-white'
                }`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <p className="text-text-secondary text-xs px-1">
          {MODES[mode]?.description}
        </p>
      </div>

      {/* Daily streak badge */}
      {mode === 'daily' && dailyStreakData && (
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="text-center">
            <p className="text-xl font-bold text-orange-400">🔥 {dailyStreakData.current}</p>
            <p className="text-text-secondary text-xs">Current streak</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{dailyStreakData.best}</p>
            <p className="text-text-secondary text-xs">Best streak</p>
          </div>
        </div>
      )}

      {/* Already played today */}
      {alreadyPlayedDaily && dailyResult && (
        <div className="space-y-2">
          <p className="text-center text-text-secondary text-sm">You've already played today!</p>
          <DailyShareCard
            hintsUsed={dailyResult.hintsUsed}
            correct={dailyResult.correct}
            dayNumber={dailyNumber()}
          />
        </div>
      )}

      {/* Category Filter: theme picker */}
      {mode === 'filter' && (
        <div className="space-y-2">
          <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
            Theme
          </label>
          <select
            value={filterTheme}
            onChange={e => onFilterThemeChange(e.target.value)}
            className="w-full bg-vault-surface border border-vault-border rounded-lg px-3 py-2.5
              text-white text-sm focus:outline-none focus:border-violet-400"
          >
            {THEMES.map(t => (
              <option key={t} value={t}>{THEME_LABELS[t]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Help / Leaderboard links */}
      <div className="flex gap-3">
        <button
          onClick={onHowToPlay}
          className="flex-1 py-2.5 bg-vault-surface border border-vault-border hover:border-violet-500/50
            rounded-lg text-text-secondary hover:text-white text-sm font-medium transition-all"
        >
          ? How to Play
        </button>
        <button
          onClick={onLeaderboard}
          className="flex-1 py-2.5 bg-vault-surface border border-vault-border hover:border-violet-500/50
            rounded-lg text-text-secondary hover:text-white text-sm font-medium transition-all"
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Play button */}
      {!alreadyPlayedDaily && (
        <button
          onClick={onPlay}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 active:scale-[0.98]
            rounded-xl font-bold text-white text-lg transition-all shadow-lg shadow-violet-900/40"
        >
          ▶ Play Nexus
        </button>
      )}

      {mode === 'daily' && alreadyPlayedDaily && (
        <p className="text-center text-text-secondary text-xs">
          Come back tomorrow for a new puzzle!
        </p>
      )}
    </div>
  )
}
