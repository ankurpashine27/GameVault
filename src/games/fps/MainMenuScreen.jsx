/**
 * Grimhold — main menu: title, difficulty, name, settings, navigation.
 */
import { DIFFICULTIES } from './constants.js'

export default function MainMenuScreen({ settingsApi, onPlay, onEpisodes, onLeaderboard, onAchievements, onHowTo, onClose }) {
  const { settings, updateSettings, playerName, setPlayerName } = settingsApi
  return (
    <div className="absolute inset-0 overflow-y-auto flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(circle at 50% 30%, #2a0808, #0a0306 70%)' }}>
      <div className="w-full max-w-md text-center">
        <h1 className="font-heading text-5xl font-black tracking-widest mb-1"
          style={{ color: '#c0392b', textShadow: '0 0 18px rgba(180,0,0,0.6)' }}>GRIMHOLD</h1>
        <p className="text-red-200/60 text-sm mb-6 tracking-wide">Castle Dread · One hunter. Countless nightmares.</p>

        {/* Difficulty */}
        <div className="mb-4">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Difficulty</div>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.entries(DIFFICULTIES).map(([k, d]) => (
              <button key={k} onClick={() => updateSettings({ difficulty: k })}
                className={`py-2 rounded text-xs font-bold border ${settings.difficulty === k
                  ? 'bg-red-700/40 border-red-500 text-white' : 'bg-black/30 border-white/10 text-white/60 hover:text-white'}`}>
                {d.label}
              </button>
            ))}
          </div>
          {settings.difficulty === 'nightmare' && <p className="text-[11px] text-red-400 mt-1">Permadeath. One life. No mercy.</p>}
        </div>

        <div className="space-y-2">
          <button onClick={() => onPlay(settings.difficulty)}
            className="w-full py-3 rounded-lg font-black text-lg bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-900/40">
            ⚔ Begin the Hunt
          </button>
          <button onClick={onHowTo}
            className="w-full py-2 rounded-lg bg-black/40 border border-white/10 text-white/80 hover:text-white text-sm">
            ❔ How to Play · Tutorial
          </button>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={onEpisodes} className="py-2 rounded bg-black/40 border border-white/10 text-white/80 hover:text-white text-sm">Episodes</button>
            <button onClick={onLeaderboard} className="py-2 rounded bg-black/40 border border-white/10 text-white/80 hover:text-white text-sm">Records</button>
            <button onClick={onAchievements} className="py-2 rounded bg-black/40 border border-white/10 text-white/80 hover:text-white text-sm">Awards</button>
          </div>
        </div>

        {/* Settings */}
        <div className="mt-5 bg-black/30 rounded-lg p-3 text-left space-y-2 border border-white/10">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <span className="w-20">Hunter</span>
            <input value={playerName} onChange={e => setPlayerName(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-500" />
          </label>
          <Slider label="Music" value={settings.musicVol} onChange={v => updateSettings({ musicVol: v })} />
          <Slider label="SFX" value={settings.sfxVol} onChange={v => updateSettings({ sfxVol: v })} />
          <Slider label="Mouse" value={settings.sensitivity} min={0.2} max={2.5} onChange={v => updateSettings({ sensitivity: v })} />
        </div>

        <button onClick={onClose} className="mt-4 text-xs text-white/40 hover:text-white/80">← Leave Castle Dread</button>
      </div>
    </div>
  )
}

function Slider({ label, value, onChange, min = 0, max = 1 }) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/70">
      <span className="w-20">{label}</span>
      <input type="range" min={min} max={max} step="0.05" value={value} onChange={e => onChange(+e.target.value)} className="flex-1" />
      <span className="w-8 text-right text-white/40 text-xs">{Math.round((value / max) * 100)}</span>
    </label>
  )
}
