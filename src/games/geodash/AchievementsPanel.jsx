/**
 * Pulse Rush — achievements panel. All achievements grouped by category with
 * lock/unlock state.
 */
import { ACHIEVEMENTS } from './achievements.js'

export default function AchievementsPanel({ unlocked, onClose }) {
  const has = (id) => unlocked && (unlocked[id] || unlocked.has?.(id))
  const cats = [...new Set(ACHIEVEMENTS.map(a => a.cat))]
  const count = ACHIEVEMENTS.filter(a => has(a.id)).length

  return (
    <div className="absolute inset-0 z-40 bg-vault-bg/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-black text-2xl text-white">🏅 Achievements</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm">✕ Close</button>
        </div>
        <p className="text-text-secondary text-sm mb-5">{count} / {ACHIEVEMENTS.length} unlocked</p>

        {cats.map(cat => (
          <div key={cat} className="mb-5">
            <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">{cat}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACHIEVEMENTS.filter(a => a.cat === cat).map(a => {
                const got = has(a.id)
                return (
                  <div key={a.id}
                    className={`rounded-xl p-3 border flex items-start gap-3 ${got ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-vault-surface border-vault-border opacity-60'}`}>
                    <span className="text-2xl">{got ? '🏅' : '🔒'}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{a.name}</div>
                      <div className="text-xs text-text-secondary">{a.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
