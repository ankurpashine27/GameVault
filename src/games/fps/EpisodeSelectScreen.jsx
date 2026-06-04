/**
 * Grimhold — choose an episode (gated by progress) or Endless mode.
 */
import { EPISODES, episodeLevels } from './levels/index.js'

export default function EpisodeSelectScreen({ unlocked, onStartEpisode, onEndless, onBack }) {
  return (
    <div className="absolute inset-0 overflow-y-auto p-4" style={{ background: 'radial-gradient(circle at 50% 20%, #1a0510, #07030a 70%)' }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-4">← Menu</button>
        <h2 className="font-heading text-3xl font-black text-red-400 mb-4">Choose your descent</h2>

        <div className="space-y-3">
          {EPISODES.map((ep) => {
            const locked = ep.id > unlocked
            return (
              <button key={ep.id} disabled={locked} onClick={() => onStartEpisode(ep.id)}
                className={`w-full text-left rounded-xl p-4 border transition-colors ${locked
                  ? 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-950/60 to-black/40 border-red-800/40 hover:border-red-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-red-300/70 uppercase tracking-wider">Episode {ep.id}</div>
                    <div className="font-black text-xl text-white">{ep.name}</div>
                    <div className="text-sm text-white/50 mt-1">{episodeLevels(ep.id).map(l => l.name).join(' · ')}</div>
                  </div>
                  <div className="text-2xl">{locked ? '🔒' : '☠'}</div>
                </div>
              </button>
            )
          })}

          <button onClick={onEndless}
            className="w-full text-left rounded-xl p-4 border border-purple-700/50 bg-gradient-to-r from-purple-950/60 to-black/40 hover:border-purple-400 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-300/70 uppercase tracking-wider">Special</div>
                <div className="font-black text-xl text-white">∞ Endless Descent</div>
                <div className="text-sm text-white/50 mt-1">Procedural floors. Bosses every 5th. How deep can you go?</div>
              </div>
              <div className="text-2xl animate-pulse">∞</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
