/**
 * Grimhold — pause menu (plain Esc). Resume relocks the pointer.
 */
export default function PauseMenu({ settings, updateSettings, onResume, onRestart, onMenu }) {
  return (
    <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-vault-surface border border-red-900/40 rounded-2xl p-5 text-center">
        <h2 className="font-heading text-2xl font-black text-red-300 mb-4">Paused</h2>
        <div className="space-y-2">
          <button onClick={onResume} className="w-full py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold">Resume (click to lock)</button>
          <button onClick={onRestart} className="w-full py-2.5 rounded-lg bg-vault-elevated hover:bg-vault-border text-white">Restart Level</button>
          <button onClick={onMenu} className="w-full py-2.5 rounded-lg bg-vault-elevated hover:bg-vault-border text-white">Main Menu</button>
        </div>
        <div className="mt-4 space-y-2 text-left bg-black/20 rounded-lg p-3">
          <Slider label="Music" value={settings.musicVol} onChange={v => updateSettings({ musicVol: v })} />
          <Slider label="SFX" value={settings.sfxVol} onChange={v => updateSettings({ sfxVol: v })} />
          <Slider label="Mouse" value={settings.sensitivity} max={2.5} onChange={v => updateSettings({ sensitivity: v })} />
        </div>
        <p className="text-[11px] text-white/40 mt-3">Shift+Esc exits the game · Tab = map · E = interact</p>
      </div>
    </div>
  )
}
function Slider({ label, value, onChange, max = 1 }) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/70">
      <span className="w-16">{label}</span>
      <input type="range" min="0" max={max} step="0.05" value={value} onChange={e => onChange(+e.target.value)} className="flex-1" />
    </label>
  )
}
