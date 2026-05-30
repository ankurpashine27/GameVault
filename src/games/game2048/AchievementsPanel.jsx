/**
 * 2048 AchievementsPanel overlay.
 */

import { ACHIEVEMENTS } from './constants.js'

export default function AchievementsPanel({ unlockedIds = [], onClose }) {
  const unlocked = unlockedIds || []

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-white font-bold text-lg">Achievements</h2>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-xl px-2 transition-colors"
        >✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {ACHIEVEMENTS.map(ach => {
            const done = unlocked.includes(ach.id)
            return (
              <div
                key={ach.id}
                className={`rounded-xl p-3 flex items-start gap-3 transition-colors
                  ${done ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-white/5 border border-white/10 opacity-60'}`}
              >
                <span className="text-2xl mt-0.5">{done ? ach.icon : '🔒'}</span>
                <div>
                  <div className={`font-bold text-sm ${done ? 'text-amber-300' : 'text-white/50'}`}>
                    {ach.name}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">{ach.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-4 text-center text-white/40 text-xs">
        {unlocked.length} / {ACHIEVEMENTS.length} unlocked
      </div>
    </div>
  )
}
