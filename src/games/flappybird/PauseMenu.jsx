import { getMusicTrackName, MUSIC_TRACK_COUNT } from './audio/musicGenerator.js'

export default function PauseMenu({
  settings, onSettingsChange,
  onResume, onRestart, onMenu, onLeaderboard, onAchievements,
}) {
  const { sfxVolume, musicVolume, musicTrack } = settings

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 w-72 shadow-2xl">
        <h2 className="text-xl font-black text-center text-white mb-4">⏸ Paused</h2>

        {/* Audio controls */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1">
              Music — {Math.round(musicVolume * 100)}%
            </label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={musicVolume}
              onChange={e => onSettingsChange({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-sky-400 h-2"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1">
              SFX — {Math.round(sfxVolume * 100)}%
            </label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={sfxVolume}
              onChange={e => onSettingsChange({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-sky-400 h-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 flex-shrink-0">Track</span>
            <button
              onClick={() => onSettingsChange({ musicTrack: (musicTrack - 1 + MUSIC_TRACK_COUNT) % MUSIC_TRACK_COUNT })}
              className="text-white/60 hover:text-white px-1"
            >◀</button>
            <span className="flex-1 text-center text-sm text-sky-300 font-semibold">{getMusicTrackName(musicTrack)}</span>
            <button
              onClick={() => onSettingsChange({ musicTrack: (musicTrack + 1) % MUSIC_TRACK_COUNT })}
              className="text-white/60 hover:text-white px-1"
            >▶</button>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-bold text-white transition-colors"
          >
            ▶ Resume
          </button>
          <div className="flex gap-2">
            <button
              onClick={onLeaderboard}
              className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white/80 transition-colors"
            >
              🏆 Scores
            </button>
            <button
              onClick={onAchievements}
              className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white/80 transition-colors"
            >
              🎖 Ach.
            </button>
          </div>
          <button
            onClick={onRestart}
            className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white/80 transition-colors"
          >
            🔄 Restart
          </button>
          <button
            onClick={onMenu}
            className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            🏠 Main Menu
          </button>
        </div>

        <p className="text-white/20 text-xs text-center mt-3">Esc to resume</p>
      </div>
    </div>
  )
}
