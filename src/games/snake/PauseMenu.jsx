import { DIFFICULTIES, GRID_SIZES } from './constants.js'

export default function PauseMenu({
  settings, onSettingsChange,
  onResume, onRestart, onLeaderboard, onHowToPlay,
}) {
  const { difficulty, powerupsOn } = settings

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center
      bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xs mx-4 bg-vault-elevated border border-vault-border rounded-2xl
        shadow-glow-card overflow-hidden animate-scaleIn">

        <div className="px-5 py-4 border-b border-vault-border">
          <h2 className="font-heading text-2xl font-bold text-center text-text-primary">Paused</h2>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Primary action */}
          <button
            onClick={onResume}
            className="w-full py-3 rounded-lg bg-accent-blue hover:bg-blue-500 text-white
              font-heading font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100"
          >
            ▶ Resume
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onLeaderboard}
              className="py-2.5 rounded-lg border border-vault-border text-text-secondary text-sm
                hover:border-accent-blue hover:text-accent-blue transition-colors duration-150 font-medium"
            >
              🏆 Scores
            </button>
            <button
              onClick={onHowToPlay}
              className="py-2.5 rounded-lg border border-vault-border text-text-secondary text-sm
                hover:border-accent-blue hover:text-accent-blue transition-colors duration-150 font-medium"
            >
              ? Help
            </button>
            <button
              onClick={onRestart}
              className="py-2.5 rounded-lg border border-vault-border text-text-secondary text-sm
                hover:border-red-500 hover:text-red-400 transition-colors duration-150 font-medium"
            >
              ↩ Restart
            </button>
          </div>

          {/* Quick settings */}
          <div className="border-t border-vault-border pt-3 mt-1">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Quick Settings</p>

            {/* Difficulty */}
            <div className="mb-3">
              <p className="text-xs text-text-secondary mb-1.5">Difficulty <span className="text-text-muted">(next round)</span></p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                  <button
                    key={key}
                    onClick={() => onSettingsChange({ difficulty: key })}
                    className={`py-1.5 px-2 rounded text-xs font-medium transition-colors duration-150
                      ${difficulty === key
                        ? 'bg-vault-muted text-text-primary border border-vault-border'
                        : 'text-text-muted hover:text-text-secondary hover:bg-vault-surface border border-transparent'
                      }`}
                  >
                    {diff.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Power-ups toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Power-ups</span>
              <button
                onClick={() => onSettingsChange({ powerupsOn: !powerupsOn })}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200
                  ${powerupsOn ? 'bg-accent-blue' : 'bg-vault-muted'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                  ${powerupsOn ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted pt-1">
            <kbd className="bg-vault-surface border border-vault-border px-1.5 py-0.5 rounded font-mono text-[10px]">
              Shift+Esc
            </kbd>
            {' '}to exit game
          </p>
        </div>
      </div>
    </div>
  )
}
