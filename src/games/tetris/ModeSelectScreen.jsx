import { GAME_MODES } from './constants.js'

export default function ModeSelectScreen({ onSelectMode, onSettings, onLeaderboard, onClose }) {
  const modes = Object.values(GAME_MODES)

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/95 to-black/95 overflow-y-auto py-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl font-black text-white tracking-widest drop-shadow-lg" style={{ textShadow: '0 0 20px #a855f7' }}>
          TETRIS
        </div>
        <div className="text-purple-300 text-sm mt-1 tracking-wider">CHOOSE YOUR MODE</div>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col gap-3 w-full max-w-xs px-4">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className="group flex items-center gap-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-purple-400/50 rounded-xl px-4 py-3 text-left transition-all active:scale-95"
          >
            <span className="text-2xl">{mode.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm">{mode.name}</div>
              <div className="text-white/50 text-[11px] leading-snug mt-0.5">{mode.description}</div>
            </div>
            <span className="text-white/30 group-hover:text-white/60 text-lg">›</span>
          </button>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onLeaderboard}
          className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg border border-white/15 transition-colors"
        >
          🏆 Scores
        </button>
        <button
          onClick={onSettings}
          className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg border border-white/15 transition-colors"
        >
          ⚙️ Settings
        </button>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg border border-white/15 transition-colors"
        >
          ✕ Exit
        </button>
      </div>

      {/* Controls hint */}
      <div className="mt-4 text-white/25 text-[10px] text-center">
        ← → Move &nbsp;·&nbsp; ↑ / Z Rotate &nbsp;·&nbsp; ↓ Soft Drop &nbsp;·&nbsp; Space Hard Drop &nbsp;·&nbsp; C Hold
      </div>
    </div>
  )
}
