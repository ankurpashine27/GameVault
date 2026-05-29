import { useState } from 'react'
import { GAME_MODES, SKIN_IDS, SKIN_LABELS, BG_IDS, BG_LABELS } from './constants.js'

export default function PreGameScreen({
  mode = 'marathon',
  settings,
  onSettingsChange,
  bestScore = 0,
  startLevel = 1,
  onStartLevelChange,
  onPlay,
  onBack,
}) {
  const [localLevel, setLocalLevel] = useState(startLevel)

  const modeDef = GAME_MODES[mode] ?? GAME_MODES.marathon

  function handleLevel(n) {
    const clamped = Math.max(1, Math.min(15, n))
    setLocalLevel(clamped)
    onStartLevelChange?.(clamped)
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/95 to-black/95 overflow-y-auto py-4">
      {/* Mode title */}
      <div className="text-center mb-4">
        <div className="text-4xl font-black text-white">
          {modeDef.icon} {modeDef.name}
        </div>
        <div className="text-white/50 text-xs mt-1">{modeDef.description}</div>
        {bestScore > 0 && (
          <div className="text-yellow-300 text-sm mt-1">
            Best: {typeof bestScore === 'number' && bestScore < 9999999
              ? bestScore.toLocaleString()
              : '—'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs px-4">
        {/* Start level (marathon/blitz only) */}
        {(mode === 'marathon' || mode === 'blitz') && (
          <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <div className="text-white/60 text-xs mb-2">Start Level</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleLevel(localLevel - 1)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >−</button>
              <span className="text-white font-bold text-xl flex-1 text-center">{localLevel}</span>
              <button
                onClick={() => handleLevel(localLevel + 1)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >+</button>
            </div>
          </div>
        )}

        {/* Rotation system */}
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <div className="text-white/60 text-xs mb-2">Rotation System</div>
          <div className="flex gap-2">
            {['modern', 'classic'].map(sys => (
              <button
                key={sys}
                onClick={() => onSettingsChange?.({ rotationSystem: sys })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  settings.rotationSystem === sys
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {sys === 'modern' ? 'Modern (SRS)' : 'Classic (NES)'}
              </button>
            ))}
          </div>
        </div>

        {/* Skin selector */}
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <div className="text-white/60 text-xs mb-2">Block Skin</div>
          <div className="grid grid-cols-4 gap-1">
            {SKIN_IDS.map(id => (
              <button
                key={id}
                onClick={() => onSettingsChange?.({ skin: id })}
                className={`py-1 rounded-lg text-[10px] transition-colors ${
                  settings.skin === id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {SKIN_LABELS[id]}
              </button>
            ))}
          </div>
        </div>

        {/* Background selector */}
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <div className="text-white/60 text-xs mb-2">Background</div>
          <div className="grid grid-cols-2 gap-1">
            {BG_IDS.map(id => (
              <button
                key={id}
                onClick={() => onSettingsChange?.({ background: id })}
                className={`py-1 rounded-lg text-[10px] transition-colors ${
                  settings.background === id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {BG_LABELS[id]}
              </button>
            ))}
          </div>
        </div>

        {/* Options toggles */}
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10 flex flex-col gap-2">
          {[
            { key: 'ghostPiece', label: 'Ghost Piece' },
            { key: 'showGrid',   label: 'Show Grid' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-white/70 text-xs">{label}</span>
              <button
                onClick={() => onSettingsChange?.({ [key]: !settings[key] })}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  settings[key] ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                  style={{ left: settings[key] ? '50%' : '2px' }}
                />
              </button>
            </label>
          ))}
        </div>

        {/* Volume */}
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10 flex flex-col gap-2">
          {[
            { key: 'sfxVolume', label: '🔊 SFX' },
            { key: 'musicVolume', label: '🎵 Music' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3">
              <span className="text-white/70 text-[11px] w-16">{label}</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={settings[key] ?? 0.5}
                onChange={e => onSettingsChange?.({ [key]: parseFloat(e.target.value) })}
                className="flex-1 accent-purple-400 h-1"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/15 text-sm transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => onPlay(localLevel)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-purple-900/50"
        >
          Play ▶
        </button>
      </div>
    </div>
  )
}
