import { DIFFICULTIES } from './constants.js'

export default function PauseMenu({
  settings, onSettingsChange,
  onResume, onRestart, onLeaderboard, onHowToPlay,
}) {
  const { difficulty, powerupsOn } = settings

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center
      bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xs mx-4 bg-[#112716] border border-[rgba(34,197,94,0.3)] rounded-2xl
        shadow-[0_0_40px_rgba(34,197,94,0.15)] overflow-hidden animate-scaleIn">

        <div className="px-5 py-4 border-b border-[rgba(34,197,94,0.2)]">
          <h2 className="font-heading text-2xl font-bold text-center text-green-100">Paused</h2>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Primary action */}
          <button
            onClick={onResume}
            className="w-full py-3 rounded-lg bg-green-700 hover:bg-green-600 text-white
              font-heading font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100
              shadow-[0_0_12px_rgba(34,197,94,0.3)]"
          >
            ▶ Resume
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onLeaderboard}
              className="py-2.5 rounded-lg border border-[rgba(34,197,94,0.2)] text-green-300/70 text-sm
                hover:border-green-500 hover:text-green-400 transition-colors duration-150 font-medium"
            >
              🏆 Scores
            </button>
            <button
              onClick={onHowToPlay}
              className="py-2.5 rounded-lg border border-[rgba(34,197,94,0.2)] text-green-300/70 text-sm
                hover:border-green-500 hover:text-green-400 transition-colors duration-150 font-medium"
            >
              ? Help
            </button>
            <button
              onClick={onRestart}
              className="py-2.5 rounded-lg border border-[rgba(34,197,94,0.2)] text-green-300/70 text-sm
                hover:border-red-500 hover:text-red-400 transition-colors duration-150 font-medium"
            >
              ↩ Restart
            </button>
          </div>

          {/* Quick settings */}
          <div className="border-t border-[rgba(34,197,94,0.2)] pt-3 mt-1">
            <p className="text-xs text-[#4a7a54] uppercase tracking-wider mb-3">Quick Settings</p>

            {/* Difficulty */}
            <div className="mb-3">
              <p className="text-xs text-green-300/60 mb-1.5">
                Difficulty <span className="text-[#4a7a54]">(next round)</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                  <button
                    key={key}
                    onClick={() => onSettingsChange({ difficulty: key })}
                    className={`py-1.5 px-2 rounded text-xs font-medium transition-colors duration-150
                      ${difficulty === key
                        ? 'bg-[#193d22] text-green-300 border border-[rgba(34,197,94,0.4)]'
                        : 'text-[#4a7a54] hover:text-green-300 hover:bg-[#0d1e10] border border-transparent'
                      }`}
                  >
                    {diff.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Power-ups toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-300/70">Power-ups</span>
              <button
                onClick={() => onSettingsChange({ powerupsOn: !powerupsOn })}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200
                  ${powerupsOn ? 'bg-green-600' : 'bg-[#193d22]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                  ${powerupsOn ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#4a7a54] pt-1">
            <kbd className="bg-[#0d1e10] border border-[rgba(34,197,94,0.2)] px-1.5 py-0.5 rounded font-mono text-[10px] text-green-300/60">
              Shift+Esc
            </kbd>
            {' '}to exit game
          </p>
        </div>
      </div>
    </div>
  )
}
