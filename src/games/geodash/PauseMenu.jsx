/**
 * Pulse Rush — pause menu overlay. Resume, retry, practice toggle, settings,
 * customizer, leaderboard, achievements, level select.
 */
import { MAX_BUFFER_FRAMES } from './constants.js'

export default function PauseMenu({
  settings, updateSettings, practice, setPractice,
  onResume, onRetry, onCustomizer, onLeaderboard, onAchievements, onLevelSelect,
}) {
  return (
    <div className="absolute inset-0 z-30 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-vault-surface border border-vault-border rounded-2xl p-5">
        <h2 className="font-black text-2xl text-white text-center mb-4">Paused</h2>

        <div className="space-y-2">
          <button onClick={onResume} className="w-full py-3 rounded-xl bg-accent-blue hover:brightness-110 text-white font-bold">Resume</button>
          <button onClick={onRetry} className="w-full py-2.5 rounded-xl bg-vault-elevated hover:bg-vault-border text-white font-semibold">↺ Retry</button>

          <button onClick={() => setPractice(!practice)}
            className={`w-full py-2.5 rounded-xl font-semibold border ${practice ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200' : 'bg-vault-elevated border-transparent text-white/80'}`}>
            🏁 Practice {practice ? 'ON' : 'OFF'} <span className="text-xs text-white/40">(next attempt)</span>
          </button>
        </div>

        {/* Settings */}
        <div className="mt-4 space-y-3 bg-black/20 rounded-xl p-3">
          <Slider label="Music" value={settings.musicVolume} onChange={v => updateSettings({ musicVolume: v })} />
          <Slider label="SFX" value={settings.sfxVolume} onChange={v => updateSettings({ sfxVolume: v })} />
          <label className="flex items-center justify-between text-sm text-white/80">
            <span>Show hitbox</span>
            <input type="checkbox" checked={!!settings.showHitbox} onChange={e => updateSettings({ showHitbox: e.target.checked })} />
          </label>
          <label className="block text-sm text-white/80">
            <div className="flex justify-between"><span>Input buffer</span><span className="text-white/50">{settings.inputBufferFrames} frames</span></div>
            <input type="range" min="1" max={MAX_BUFFER_FRAMES} step="1" value={settings.inputBufferFrames}
              onChange={e => updateSettings({ inputBufferFrames: +e.target.value })} className="w-full" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={onCustomizer} className="py-2 rounded-lg bg-vault-elevated hover:bg-vault-border text-white text-sm">🎨 Icons</button>
          <button onClick={onLeaderboard} className="py-2 rounded-lg bg-vault-elevated hover:bg-vault-border text-white text-sm">🏆 Scores</button>
          <button onClick={onAchievements} className="py-2 rounded-lg bg-vault-elevated hover:bg-vault-border text-white text-sm">🏅 Awards</button>
          <button onClick={onLevelSelect} className="py-2 rounded-lg bg-vault-elevated hover:bg-vault-border text-white text-sm">≡ Levels</button>
        </div>

        <p className="text-center text-[11px] text-white/40 mt-4">Shift+Esc to exit game</p>
      </div>
    </div>
  )
}

function Slider({ label, value, onChange }) {
  return (
    <label className="block text-sm text-white/80">
      <div className="flex justify-between"><span>{label}</span><span className="text-white/50">{Math.round(value * 100)}%</span></div>
      <input type="range" min="0" max="1" step="0.05" value={value}
        onChange={e => onChange(+e.target.value)} className="w-full" />
    </label>
  )
}
