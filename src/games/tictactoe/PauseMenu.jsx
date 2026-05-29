import { BOARD_MODES, AI_DIFFICULTIES, BACKGROUNDS, MUSIC_TRACKS } from './constants.js'

export default function PauseMenu({
  settings,
  onSettingsChange,
  onResume,
  onRestart,
  onLeaderboard,
}) {
  const {
    vsAI, aiDifficulty, powerupsOn,
    background, musicTrack, musicVol, sfxVol,
  } = settings

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center
      bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xs mx-4 bg-vault-elevated border border-vault-border rounded-2xl
        shadow-glow-blue overflow-hidden animate-scaleIn">

        <div className="px-5 py-4 border-b border-vault-border">
          <h2 className="font-heading text-2xl font-bold text-center text-text-primary">Paused</h2>
        </div>

        <div className="p-4 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">

          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-accent-blue hover:bg-blue-500 text-white
              font-heading font-bold text-lg transition-all duration-200
              hover:scale-[1.02] active:scale-100 shadow-glow-blue"
          >
            ▶ Resume
          </button>

          {/* Secondary row */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onLeaderboard}
              className="py-2.5 rounded-xl border border-vault-border text-text-muted text-sm
                hover:border-accent-blue hover:text-text-primary transition-colors duration-150 font-medium">
              🏆 Scores
            </button>
            <button onClick={onRestart}
              className="py-2.5 rounded-xl border border-vault-border text-text-muted text-sm
                hover:border-vault-muted hover:text-text-primary transition-colors duration-150 font-medium">
              ↩ New Game
            </button>
          </div>

          {/* Leave Game — exits the current round back to the game's setup screen */}
          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl border border-red-900/60 text-red-400/70
              hover:border-red-500 hover:text-red-400 hover:bg-red-500/10
              transition-all duration-150 text-sm font-medium"
          >
            ✕ Leave Game
          </button>

          {/* ── Background ── */}
          <div className="border-t border-vault-border pt-3 mt-1">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2.5">Background</p>
            <div className="flex gap-2 flex-wrap">
              {Object.values(BACKGROUNDS).map(bg => (
                <button
                  key={bg.id}
                  onClick={() => onSettingsChange({ background: bg.id })}
                  title={bg.label}
                  className="relative w-8 h-8 rounded-lg border-2 transition-all duration-150 overflow-hidden"
                  style={{
                    backgroundColor: bg.bg,
                    borderColor:     background === bg.id ? bg.glow : 'rgba(30,45,69,0.7)',
                    boxShadow:       background === bg.id ? `0 0 8px ${bg.glow}66` : 'none',
                    transform:       background === bg.id ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center opacity-50">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <line x1="6"  y1="1" x2="6"  y2="17" stroke={bg.grid} strokeWidth="1"/>
                      <line x1="12" y1="1" x2="12" y2="17" stroke={bg.grid} strokeWidth="1"/>
                      <line x1="1"  y1="6" x2="17" y2="6"  stroke={bg.grid} strokeWidth="1"/>
                      <line x1="1"  y1="12" x2="17" y2="12" stroke={bg.grid} strokeWidth="1"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Music Track ── */}
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Music</p>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.values(MUSIC_TRACKS).map(t => (
                <button
                  key={t.id}
                  onClick={() => onSettingsChange({ musicTrack: t.id })}
                  className={`py-1.5 px-1 rounded-lg text-xs font-medium transition-colors duration-150 text-center
                    ${musicTrack === t.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-text-muted hover:text-text-secondary hover:bg-vault-surface border border-transparent'
                    }`}
                >
                  <div>{t.icon}</div>
                  <div className="text-[9px] mt-0.5">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Volumes ── */}
          <div className="space-y-2.5 bg-vault-surface/60 rounded-xl p-3 border border-vault-border/60">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-secondary w-14 flex-shrink-0">Music</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={musicVol ?? 0.35}
                onChange={e => onSettingsChange({ musicVol: parseFloat(e.target.value) })}
                className="flex-1 accent-purple-500 h-1 cursor-pointer"
              />
              <span className="text-[10px] text-text-muted w-7 text-right">
                {Math.round((musicVol ?? 0.35) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-secondary w-14 flex-shrink-0">Effects</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={sfxVol ?? 1}
                onChange={e => onSettingsChange({ sfxVol: parseFloat(e.target.value) })}
                className="flex-1 accent-blue-500 h-1 cursor-pointer"
              />
              <span className="text-[10px] text-text-muted w-7 text-right">
                {Math.round((sfxVol ?? 1) * 100)}%
              </span>
            </div>
          </div>

          {/* ── AI Difficulty ── */}
          {vsAI && (
            <div className="border-t border-vault-border pt-3">
              <p className="text-xs text-text-secondary mb-1.5">
                AI Difficulty <span className="text-text-muted">(next game)</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(AI_DIFFICULTIES).map(d => (
                  <button key={d.id}
                    onClick={() => onSettingsChange({ aiDifficulty: d.id })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors duration-150
                      ${aiDifficulty === d.id
                        ? 'bg-accent-blue/15 text-text-primary border border-accent-blue/40'
                        : 'text-text-muted hover:text-text-secondary hover:bg-vault-surface border border-transparent'
                      }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Power-ups toggle ── */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              Power-ups <span className="text-text-muted">(next game)</span>
            </span>
            <button
              onClick={() => onSettingsChange({ powerupsOn: !powerupsOn })}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200
                ${powerupsOn ? 'bg-accent-blue' : 'bg-vault-muted'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                transition-transform duration-200
                ${powerupsOn ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <p className="text-center text-xs text-text-muted pt-1">
            <kbd className="bg-vault-surface border border-vault-border px-1.5 py-0.5 rounded
              font-mono text-[10px] text-text-muted">
              Shift+Esc
            </kbd>
            {' '}to exit game
          </p>
        </div>
      </div>
    </div>
  )
}
