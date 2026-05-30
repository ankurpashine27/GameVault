/**
 * 2048 PreGameScreen — per-mode settings before starting.
 */

import { useState } from 'react'
import { GRID_SIZES, TARGET_OPTIONS, COLOR_PALETTES, BACKGROUNDS, TILE_THEMES, GAME_MODES } from './constants.js'
import { PATTERNS } from './engine/obstaclePatterns.js'
import ThemeSelector from './ThemeSelector.jsx'
import BackgroundSelector from './BackgroundSelector.jsx'

export default function PreGameScreen({
  mode, settings, onSettingsChange, playerName, onNameChange,
  onBack, onPlay, getPersonalBests,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const pbs = getPersonalBests()
  const pb = pbs[`${mode}_${settings.gridSize}`]
  const modeInfo = GAME_MODES[mode]

  const gridSizes = Object.entries(GRID_SIZES)
  const patterns  = PATTERNS[settings.gridSize] || []
  const maxRerolls = 3

  return (
    <div className="absolute inset-0 z-20 bg-gradient-to-br from-amber-900/95 to-yellow-900/95
      backdrop-blur-sm overflow-y-auto flex flex-col">

      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button onClick={onBack}
          className="text-white/60 hover:text-white transition-colors px-3 py-1.5 bg-white/10 rounded-lg text-sm">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{modeInfo?.icon}</span>
          <h2 className="text-white font-bold text-lg">{modeInfo?.name}</h2>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">

        {/* Personal best */}
        {pb && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-2 text-center">
            <span className="text-amber-300 text-sm">Personal best: </span>
            <span className="text-white font-bold">{pb.score?.toLocaleString()}</span>
          </div>
        )}

        {/* Player name */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-1">Player Name</label>
          <input
            type="text"
            value={playerName}
            onChange={e => onNameChange(e.target.value)}
            maxLength={24}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2
              text-white placeholder-white/30 focus:outline-none focus:border-amber-400 text-sm"
            placeholder="Your name..."
          />
        </div>

        {/* Grid size */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-1">Grid Size</label>
          <div className="flex flex-wrap gap-2">
            {gridSizes.map(([id, gs]) => (
              <button key={id} onClick={() => onSettingsChange({ gridSize: parseInt(id) })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${settings.gridSize === parseInt(id)
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                {gs.cols}×{gs.cols} {gs.name}
              </button>
            ))}
          </div>
        </div>

        {/* Target tile */}
        {mode !== 'sandbox' && mode !== 'time_attack' && (
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">Target Tile</label>
            <div className="flex flex-wrap gap-2">
              {TARGET_OPTIONS.map(val => (
                <button key={val} onClick={() => onSettingsChange({ targetTile: val })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${settings.targetTile === val
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                  {val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Attack duration */}
        {mode === 'time_attack' && (
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">
              Time Limit: {settings.timeAttackDuration}s
            </label>
            <input type="range" min="30" max="300" step="30"
              value={settings.timeAttackDuration}
              onChange={e => onSettingsChange({ timeAttackDuration: parseInt(e.target.value) })}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>30s</span><span>5 min</span>
            </div>
          </div>
        )}

        {/* Limited Moves difficulty */}
        {mode === 'limited_moves' && (
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => onSettingsChange({ limitedMovesDiff: d })}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                    ${settings.limitedMovesDiff === d
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Obstacle pattern */}
        {mode === 'obstacle' && patterns.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">Obstacle Pattern</label>
            <div className="flex items-center gap-3">
              <select
                value={settings.obstaclePatternIndex || 0}
                onChange={e => onSettingsChange({ obstaclePatternIndex: parseInt(e.target.value) })}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm
                  focus:outline-none focus:border-amber-400"
              >
                {patterns.map((p, i) => (
                  <option key={i} value={i} className="bg-gray-900">{p.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const rolls = (settings.obstacleRerolls || 0)
                  if (rolls >= maxRerolls) return
                  const next = ((settings.obstaclePatternIndex || 0) + 1) % patterns.length
                  onSettingsChange({ obstaclePatternIndex: next, obstacleRerolls: rolls + 1 })
                }}
                disabled={(settings.obstacleRerolls || 0) >= maxRerolls}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-sm rounded-lg transition-colors"
              >
                🔀 Re-roll ({maxRerolls - (settings.obstacleRerolls || 0)} left)
              </button>
            </div>
          </div>
        )}

        {/* Advanced settings toggle */}
        <button onClick={() => setShowAdvanced(v => !v)}
          className="text-white/50 hover:text-white text-sm transition-colors underline-offset-2 underline">
          {showAdvanced ? '▲ Hide' : '▼ Show'} advanced settings
        </button>

        {showAdvanced && (
          <div className="space-y-4">
            <ThemeSelector value={settings.theme} onChange={t => onSettingsChange({ theme: t })} />

            {/* Color palette */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Color Palette</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(COLOR_PALETTES).map(([id, pal]) => (
                  <button key={id} onClick={() => onSettingsChange({ palette: id })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${settings.palette === id
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                    {pal.name}
                  </button>
                ))}
              </div>
            </div>

            <BackgroundSelector value={settings.background} onChange={b => onSettingsChange({ background: b })} />

            {/* Unlimited undos */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Unlimited Undos</span>
              <button
                onClick={() => onSettingsChange({ unlimitedUndos: !settings.unlimitedUndos })}
                className={`w-12 h-6 rounded-full transition-colors relative
                  ${settings.unlimitedUndos ? 'bg-amber-500' : 'bg-white/20'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                  ${settings.unlimitedUndos ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Animation speed */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Animation Speed</label>
              <div className="flex gap-2">
                {['slow', 'normal', 'fast', 'off'].map(s => (
                  <button key={s} onClick={() => onSettingsChange({ animSpeed: s })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors
                      ${settings.animSpeed === s
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Music / SFX */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Music Vol: {Math.round(settings.musicVolume * 100)}%</label>
                <input type="range" min="0" max="1" step="0.05"
                  value={settings.musicVolume}
                  onChange={e => onSettingsChange({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">SFX Vol: {Math.round(settings.sfxVolume * 100)}%</label>
                <input type="range" min="0" max="1" step="0.05"
                  value={settings.sfxVolume}
                  onChange={e => onSettingsChange({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400" />
              </div>
            </div>

            {/* Music track */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-1">Music Track</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'calm',   label: '🎵 Calm'   },
                  { id: 'ambient',label: '🌙 Ambient' },
                  { id: 'upbeat', label: '⚡ Upbeat'  },
                  { id: 'lofi',   label: '📻 Lo-fi'   },
                ].map(t => (
                  <button key={t.id} onClick={() => onSettingsChange({ musicTrackId: t.id })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors
                      ${settings.musicTrackId === t.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Play button */}
      <div className="p-4 border-t border-white/10">
        <button onClick={onPlay}
          className="w-full max-w-lg mx-auto block bg-amber-500 hover:bg-amber-400
            text-white font-black text-xl py-4 rounded-2xl transition-colors
            shadow-lg shadow-amber-500/30 active:scale-[0.98]">
          Play
        </button>
      </div>
    </div>
  )
}
