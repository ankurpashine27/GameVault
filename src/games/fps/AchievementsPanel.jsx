/**
 * Grimhold — achievements panel.
 */
import { ACHIEVEMENTS } from './data/achievements.js'

export default function AchievementsPanel({ unlocked, onClose }) {
  const has = (id) => unlocked && unlocked[id]
  const cats = [...new Set(ACHIEVEMENTS.map(a => a.cat))]
  const count = ACHIEVEMENTS.filter(a => has(a.id)).length
  return (
    <div className="absolute inset-0 overflow-y-auto p-4" style={{ background: '#07050a' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading text-2xl font-black text-red-400">Awards</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm">✕ Close</button>
        </div>
        <p className="text-white/40 text-sm mb-4">{count} / {ACHIEVEMENTS.length} unlocked</p>
        {cats.map(cat => (
          <div key={cat} className="mb-4">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2">{cat}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACHIEVEMENTS.filter(a => a.cat === cat).map(a => (
                <div key={a.id} className={`rounded-lg p-3 border flex items-start gap-3 ${has(a.id) ? 'bg-red-900/15 border-red-700/40' : 'bg-black/30 border-white/10 opacity-60'}`}>
                  <span className="text-xl">{has(a.id) ? '🏅' : '🔒'}</span>
                  <div><div className="font-bold text-white text-sm">{a.name}</div><div className="text-xs text-white/50">{a.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
