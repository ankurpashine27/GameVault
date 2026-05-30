/**
 * 2048 PauseMenu.
 */

export default function PauseMenu({
  settings, onSettingsChange,
  onResume, onRestart, onMenu,
  onLeaderboard, onAchievements,
}) {
  return (
    <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-900/95 border border-white/10 rounded-2xl p-6 w-full max-w-xs
        flex flex-col gap-3 shadow-2xl">

        <h2 className="text-white font-black text-2xl text-center mb-1">Paused</h2>

        <MenuBtn onClick={onResume} primary>▶ Resume</MenuBtn>
        <MenuBtn onClick={onRestart}>↺ Restart</MenuBtn>
        <MenuBtn onClick={onLeaderboard}>🏆 Leaderboard</MenuBtn>
        <MenuBtn onClick={onAchievements}>🎖 Achievements</MenuBtn>

        <hr className="border-white/10 my-1" />

        {/* Quick settings */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <label className="block text-xs text-white/50 mb-1">Music</label>
            <input type="range" min="0" max="1" step="0.05"
              value={settings.musicVolume}
              onChange={e => onSettingsChange({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-400" />
          </div>
          <div className="text-center">
            <label className="block text-xs text-white/50 mb-1">SFX</label>
            <input type="range" min="0" max="1" step="0.05"
              value={settings.sfxVolume}
              onChange={e => onSettingsChange({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-400" />
          </div>
        </div>

        <MenuBtn onClick={onMenu}>← Main Menu</MenuBtn>
      </div>
    </div>
  )
}

function MenuBtn({ onClick, children, primary }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-2.5 rounded-xl font-bold transition-colors text-sm
        ${primary
          ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg'
          : 'bg-white/10 hover:bg-white/20 text-white/80'}`}
    >{children}</button>
  )
}
