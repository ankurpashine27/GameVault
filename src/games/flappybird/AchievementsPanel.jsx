import { ACHIEVEMENTS } from './constants.js'

export default function AchievementsPanel({ unlockedIds, onClose }) {
  const unlocked = new Set(unlockedIds || [])
  const total    = ACHIEVEMENTS.length
  const done     = [...unlocked].length

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-slate-900/95 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h2 className="text-lg font-black">🎖 Achievements</h2>
          <p className="text-xs text-white/40">{done}/{total} unlocked</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlocked.has(ach.id)
          return (
            <div
              key={ach.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                isUnlocked
                  ? 'bg-yellow-500/10 border-yellow-500/25'
                  : 'bg-white/3 border-white/5 opacity-50'
              }`}
            >
              <span className={`text-2xl flex-shrink-0 ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                {isUnlocked ? ach.icon : '🔒'}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm truncate ${isUnlocked ? 'text-yellow-300' : 'text-white/50'}`}>
                  {ach.name}
                </div>
                <div className="text-xs text-white/40 truncate">{ach.desc}</div>
              </div>
              {isUnlocked && <span className="text-green-400 text-sm flex-shrink-0">✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
