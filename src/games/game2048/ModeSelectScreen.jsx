/**
 * 2048 ModeSelectScreen — mode selection with personal bests.
 */

import { GAME_MODES } from './constants.js'

export default function ModeSelectScreen({
  onSelectMode, onClose, getPersonalBests,
  dailyDone, dailyStreak,
}) {
  const pbs = getPersonalBests()

  const modes = Object.values(GAME_MODES)

  return (
    <div className="absolute inset-0 z-20 bg-gradient-to-br from-amber-900/90 to-yellow-900/90
      backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg mb-6">
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors px-3 py-1.5
            bg-white/10 rounded-lg text-sm"
        >← Back</button>
        <h1 className="text-3xl font-black text-amber-300">2048</h1>
        <div className="w-16" />
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {modes.map(mode => {
          const pb = pbs[`${mode.id}_4`]
          const isDaily = mode.id === 'daily'

          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="group bg-white/10 hover:bg-white/20 border border-white/20
                hover:border-amber-400/50 rounded-2xl p-4 text-left transition-all
                hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{mode.icon}</span>
                <span className="font-bold text-white text-lg">{mode.name}</span>
                {isDaily && dailyDone && (
                  <span className="ml-auto text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full">
                    ✓ Done
                  </span>
                )}
                {isDaily && dailyStreak > 1 && (
                  <span className="text-xs text-orange-300">🔥{dailyStreak}</span>
                )}
              </div>
              <p className="text-white/60 text-xs leading-relaxed">{mode.description}</p>
              {pb && (
                <div className="mt-2 text-xs text-amber-300/70">
                  Best: {pb.score?.toLocaleString()} pts
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
