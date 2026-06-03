/**
 * Pulse Rush — icon customizer. Form tabs · icon grid (locked greyed) ·
 * colour/glow/trail/death controls · animated live preview · unlock progress.
 */
import { useState } from 'react'
import IconPreview from './IconPreview.jsx'
import { FORMS, FORM_LABELS, TRAIL_STYLES, DEATH_EFFECTS, TOTAL_ICONS } from './constants.js'
import { ICON_LIST } from './icons/iconDefinitions.js'

export default function IconCustomizer({ iconConfig, setFormIconConfig, unlockedIds, onClose }) {
  const [form, setForm] = useState('cube')
  const cfg = iconConfig[form] || {}
  const icons = ICON_LIST.filter(i => i.form === form)
  const set = (patch) => setFormIconConfig(form, patch)

  return (
    <div className="absolute inset-0 z-40 bg-vault-bg/97 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-black text-2xl text-white">🎨 Icon Kit</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm">✕ Close</button>
        </div>
        <div className="mb-4">
          <div className="text-xs text-text-secondary mb-1">{unlockedIds.size} / {TOTAL_ICONS} icons unlocked</div>
          <div className="h-1.5 bg-vault-surface rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent-blue to-fuchsia-500" style={{ width: `${(unlockedIds.size / TOTAL_ICONS) * 100}%` }} />
          </div>
        </div>

        {/* Form tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {FORMS.map(f => (
            <button key={f} onClick={() => setForm(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${form === f ? 'bg-accent-blue/20 border border-accent-blue text-white' : 'bg-vault-surface border border-vault-border text-text-secondary'}`}>
              {FORM_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_260px] gap-4">
          {/* Icon grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {icons.map(icon => {
              const locked = !unlockedIds.has(icon.id)
              const selected = cfg.icon === icon.variant
              return (
                <button key={icon.id} disabled={locked}
                  onClick={() => set({ icon: icon.variant })}
                  title={locked ? `Unlock: ${icon.unlock.label}` : icon.name}
                  className={`relative aspect-square rounded-xl flex items-center justify-center border
                    ${selected ? 'border-accent-blue bg-accent-blue/10' : 'border-vault-border bg-vault-surface'}
                    ${locked ? 'cursor-not-allowed' : 'hover:border-white/40'}`}>
                  <IconPreview form={form} variant={icon.variant} size={54}
                    primary={cfg.primary} secondary={cfg.secondary} glow={cfg.glow} glowColor={cfg.glowColor}
                    locked={locked} />
                  {locked && (
                    <span className="absolute bottom-1 left-1 right-1 text-[8px] text-white/60 bg-black/60 rounded px-1 truncate">
                      🔒 {icon.unlock.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="bg-vault-surface rounded-xl p-3 flex flex-col items-center">
              <IconPreview form={form} variant={cfg.icon || 0} size={96} animate
                primary={cfg.primary} secondary={cfg.secondary} glow={cfg.glow} glowColor={cfg.glowColor} trail={cfg.trail} />
              <span className="text-xs text-text-secondary mt-1">Live preview</span>
            </div>

            <ColorRow label="Primary" value={cfg.primary} onChange={v => set({ primary: v })} />
            <ColorRow label="Secondary" value={cfg.secondary} onChange={v => set({ secondary: v })} />

            <label className="flex items-center justify-between text-sm text-white/80">
              <span>Glow</span>
              <input type="checkbox" checked={!!cfg.glow} onChange={e => set({ glow: e.target.checked })} />
            </label>
            {cfg.glow && <ColorRow label="Glow color" value={cfg.glowColor} onChange={v => set({ glowColor: v })} />}

            <Select label="Trail" value={cfg.trail} options={TRAIL_STYLES} onChange={v => set({ trail: v })} />
            <Select label="Death" value={cfg.death} options={DEATH_EFFECTS} onChange={v => set({ death: v })} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between text-sm text-white/80">
      <span>{label}</span>
      <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)}
        className="w-10 h-7 rounded bg-transparent border border-vault-border cursor-pointer" />
    </label>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="flex items-center justify-between text-sm text-white/80">
      <span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="bg-vault-elevated border border-vault-border rounded-lg px-2 py-1 text-xs text-white capitalize">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
