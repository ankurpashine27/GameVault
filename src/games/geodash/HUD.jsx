/**
 * Pulse Rush — in-game HUD (React overlay on the canvas).
 * Top: level name, difficulty, progress bar (+coins/checkpoints), attempt.
 * Bottom-left: checkpoint control (practice). Bottom-right: pause + music.
 * Controls sit away from the GameFrame's top-right pill (lesson from 2048).
 */
import { DIFFICULTIES, FORM_LABELS } from './constants.js'

export default function HUD({
  hud, level, infinite, musicOn, checkpointPositions = [], remainingCheckpoints,
  onPause, onToggleMusic, onCheckpoint,
}) {
  const diff = DIFFICULTIES[level.difficulty] || { label: level.difficulty, color: '#888' }
  const accent = level.accentColor
  const coinsHave = new Set(hud.coins)

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none text-white">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-3 pt-12 pb-2 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm truncate drop-shadow">{level.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: diff.color + '33', color: diff.color, border: `1px solid ${diff.color}66` }}>
              {diff.label}
            </span>
            {hud.practice && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                PRACTICE
              </span>
            )}
            {hud.mini && <span className="text-[10px] px-1.5 rounded bg-yellow-500/30 text-yellow-200">MINI</span>}
            <span className="text-[10px] text-white/60">{FORM_LABELS[hud.form]}</span>
          </div>

          {/* Progress bar */}
          {!infinite ? (
            <div className="relative h-2.5 bg-black/50 rounded-full overflow-hidden max-w-md">
              <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
                style={{ width: `${Math.round(hud.progress * 100)}%`, background: accent, boxShadow: `0 0 8px ${accent}` }} />
              {checkpointPositions.map((pos, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-0.5 bg-emerald-400"
                  style={{ left: `${pos * 100}%` }} />
              ))}
            </div>
          ) : (
            <div className="text-lg font-black tabular-nums" style={{ color: accent }}>
              {hud.infinite.toLocaleString()} <span className="text-xs text-white/50">score · ×{hud.speed}</span>
            </div>
          )}

          {/* Coins + percent */}
          <div className="flex items-center gap-2 mt-1">
            {!infinite && (
              <div className="flex gap-1">
                {[1, 2, 3].map(id => (
                  <span key={id} className={`w-3 h-3 rounded-full border ${coinsHave.has(id) ? 'bg-yellow-400 border-yellow-200' : 'bg-transparent border-white/30'}`} />
                ))}
              </div>
            )}
            {!infinite && <span className="text-[11px] text-white/60 tabular-nums">{Math.round(hud.progress * 100)}%</span>}
          </div>
        </div>

        {/* Attempt counter */}
        <div className="text-right flex-shrink-0">
          <div className="text-[10px] text-white/50 uppercase tracking-wider">Attempt</div>
          <div className="text-lg font-black tabular-nums">{hud.attempts}</div>
        </div>
      </div>

      {/* Bottom-left: checkpoint (practice) */}
      {hud.practice && (
        <div className="absolute bottom-3 left-3 pointer-events-auto flex items-center gap-2">
          <button onClick={onCheckpoint}
            className="px-3 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-sm font-bold backdrop-blur-sm">
            ⚑ Checkpoint
          </button>
          <span className="text-xs text-white/70">✓ ×{remainingCheckpoints}</span>
        </div>
      )}

      {/* Bottom-right: pause + music */}
      <div className="absolute bottom-3 right-3 pointer-events-auto flex gap-1.5">
        <button onClick={onToggleMusic} title="Toggle music"
          className="w-9 h-9 rounded-lg bg-black/55 hover:bg-black/80 backdrop-blur-sm text-sm">
          {musicOn ? '🎵' : '🔇'}
        </button>
        <button onClick={onPause} title="Pause (Esc)"
          className="w-9 h-9 rounded-lg bg-black/55 hover:bg-black/80 backdrop-blur-sm text-sm">⏸</button>
      </div>
    </div>
  )
}
