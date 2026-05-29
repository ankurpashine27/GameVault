export default function PauseMenu({
  settings,
  onSettingsChange,
  onResume,
  onRestart,
  onMenu,
  onLeaderboard,
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="bg-gray-900/95 border border-white/15 rounded-2xl px-6 py-6 w-72 flex flex-col gap-4 shadow-2xl">
        {/* Title */}
        <div className="text-center text-white font-black text-xl tracking-widest">⏸ PAUSED</div>

        {/* Volume controls */}
        <div className="flex flex-col gap-2">
          {[
            { key: 'sfxVolume', label: '🔊 SFX' },
            { key: 'musicVolume', label: '🎵 Music' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3">
              <span className="text-white/60 text-xs w-14">{label}</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={settings?.[key] ?? 0.5}
                onChange={e => onSettingsChange?.({ [key]: parseFloat(e.target.value) })}
                className="flex-1 accent-purple-400 h-1"
              />
            </label>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2">
          {[
            { key: 'ghostPiece', label: 'Ghost Piece' },
            { key: 'showGrid',   label: 'Show Grid' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-white/60 text-xs">{label}</span>
              <button
                onClick={() => onSettingsChange?.({ [key]: !settings?.[key] })}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  settings?.[key] ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                  style={{ left: settings?.[key] ? '50%' : '2px' }}
                />
              </button>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={onResume}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition-colors"
          >
            ▶ Resume
          </button>
          <button
            onClick={onRestart}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl transition-colors"
          >
            ↺ Restart
          </button>
          <button
            onClick={onLeaderboard}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm transition-colors"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={onMenu}
            className="w-full bg-white/10 hover:bg-white/20 text-white/70 py-2 rounded-xl text-sm transition-colors"
          >
            ⬅ Main Menu
          </button>
        </div>

        {/* Key hints */}
        <div className="text-white/25 text-[10px] text-center">
          Esc to resume
        </div>
      </div>
    </div>
  )
}
