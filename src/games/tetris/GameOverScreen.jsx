import { formatTime } from './utils.js'
import { GAME_MODES } from './constants.js'

export default function GameOverScreen({
  result = {},
  mode = 'marathon',
  bestScore = 0,
  isNewBest = false,
  newAchievements = [],
  onPlayAgain,
  onMenu,
  onLeaderboard,
}) {
  const { score = 0, lines = 0, level = 1, timeMs = 0 } = result
  const modeDef = GAME_MODES[mode] ?? GAME_MODES.marathon
  const isComplete = result.complete

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="bg-gray-900/95 border border-white/15 rounded-2xl px-6 py-6 w-80 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-1">{isComplete ? '🏆' : '💀'}</div>
          <div className="text-white font-black text-xl tracking-wide">
            {isComplete ? 'COMPLETE!' : 'GAME OVER'}
          </div>
          <div className="text-white/40 text-xs mt-0.5">{modeDef.icon} {modeDef.name}</div>
          {isNewBest && (
            <div className="mt-2 text-yellow-300 font-bold text-sm animate-pulse">
              ★ NEW BEST! ★
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10 grid grid-cols-2 gap-x-4 gap-y-1.5">
          <Stat label="Score" value={score.toLocaleString()} highlight />
          <Stat label="Best" value={bestScore.toLocaleString()} />
          <Stat label="Lines" value={lines} />
          <Stat label="Level" value={level} />
          {(mode === 'sprint' || mode === 'ultra' || mode === 'marathon') && (
            <Stat label="Time" value={formatTime(timeMs)} />
          )}
        </div>

        {/* New achievements */}
        {newAchievements.length > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl px-3 py-2">
            <div className="text-yellow-300 text-xs font-bold mb-1">🏅 New Achievements!</div>
            {newAchievements.map(ach => (
              <div key={ach.id} className="text-yellow-200/80 text-[11px]">
                {ach.icon} {ach.name}
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition-colors"
          >
            ▶ Play Again
          </button>
          <div className="flex gap-2">
            <button
              onClick={onLeaderboard}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm transition-colors"
            >
              🏆 Scores
            </button>
            <button
              onClick={onMenu}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm transition-colors"
            >
              ⬅ Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className="text-white/40 text-[10px]">{label}</div>
      <div className={`font-bold text-sm tabular-nums ${highlight ? 'text-yellow-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
