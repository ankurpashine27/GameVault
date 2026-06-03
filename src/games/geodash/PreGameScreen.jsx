/**
 * Pulse Rush — pre-game level info + Practice toggle + start.
 */
import { DIFFICULTIES } from './constants.js'

export default function PreGameScreen({ level, progress, practice, setPractice, onStart, onBack, onOpenCustomizer }) {
  const diff = DIFFICULTIES[level.difficulty]
  const pr = progress[level.id] || { bestPercent: 0, normalAttempts: 0, coinsCollected: [] }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${level.bgColor}, ${level.groundColor})` }}>
      <div className="w-full max-w-md bg-black/55 backdrop-blur-md rounded-2xl border border-white/15 p-6">
        <button onClick={onBack} className="text-xs text-white/60 hover:text-white mb-3">← Levels</button>

        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-black text-2xl text-white">{level.name}</h2>
          {diff?.demon && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-700 text-white">DEMON</span>}
        </div>
        <div className="text-sm text-white/70 mb-4">{level.songName} · {level.bpm} BPM</div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <Stat label="Difficulty" value={diff?.label} color={diff?.color} />
          <Stat label="Reward" value={`${diff?.demon ? '👹' : '★'} ${level.stars}`} />
          <Stat label="Best" value={`${pr.bestPercent || 0}%`} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/60">Secret coins</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(id => (
              <span key={id} className={`w-4 h-4 rounded-full ${(pr.coinsCollected || []).includes(id) ? 'bg-yellow-400' : 'bg-black/40 border border-white/25'}`} />
            ))}
          </div>
        </div>

        {/* Practice toggle */}
        <button onClick={() => setPractice(!practice)}
          className={`w-full mb-4 px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-between
            ${practice ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200' : 'bg-vault-surface/60 border-white/15 text-white/80'}`}>
          <span>🏁 Practice Mode {practice ? 'ON' : 'OFF'}</span>
          <span className="text-xs font-normal text-white/50">Place checkpoints with P</span>
        </button>

        <button onClick={onStart}
          className="w-full py-3.5 rounded-xl font-black text-lg text-black transition-transform hover:scale-[1.02]"
          style={{ background: level.accentColor, boxShadow: `0 0 24px ${level.accentColor}66` }}>
          ▶ {practice ? 'Practice' : 'Play'}
        </button>

        <div className="mt-4 flex items-center justify-between text-[11px] text-white/45">
          <span>Space / ↑ / Click / Tap to act · Esc to pause</span>
          <button onClick={onOpenCustomizer} className="hover:text-white">🎨 Icons</button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-black/30 rounded-lg py-2">
      <div className="text-[9px] text-white/45 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold" style={{ color: color || '#fff' }}>{value}</div>
    </div>
  )
}
