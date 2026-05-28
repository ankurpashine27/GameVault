import { useState, useEffect, useRef } from 'react'
import { BIRD_SKINS, BACKGROUNDS } from './constants.js'
import { getMusicTrackName, MUSIC_TRACK_COUNT } from './audio/musicGenerator.js'
import { CANVAS_W, CANVAS_H } from './constants.js'
import { drawBird, generateBgLayers, drawBackground } from './engine/renderer.js'

export default function PreGameScreen({
  playerName, onNameChange,
  settings, onSettingsChange,
  highScore, totalGames,
  isSkinUnlocked,
  onPlay,
  onLeaderboard,
  onAchievements,
  onClose,
}) {
  const { selectedSkin, selectedBg, musicTrack, sfxVolume, musicVolume } = settings
  const [tab, setTab] = useState('bird')   // 'bird' | 'bg' | 'audio'
  const previewRef = useRef(null)
  const animRef    = useRef(null)
  const timeRef    = useRef(0)

  // Live skin preview
  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const layers = generateBgLayers(selectedBg)

    const animate = (ts) => {
      timeRef.current = ts / 1000
      ctx.clearRect(0, 0, 96, 96)
      // Mini bg
      const scale = 96 / CANVAS_W
      ctx.save()
      ctx.scale(scale, scale)
      drawBackground(ctx, selectedBg, layers, timeRef.current, 180)
      ctx.restore()
      // Bird
      const fakeBird = { x: 48, y: 48, vy: 0, angle: -5, flapTimer: ts * 0.003 }
      drawBird(ctx, fakeBird, selectedSkin, timeRef.current, false, false, false)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [selectedSkin, selectedBg])

  const canPlay = playerName.trim().length > 0

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-sky-900 to-indigo-950 text-white overflow-y-auto">
      {/* Header */}
      <div className="relative text-center pt-6 pb-2">
        {onClose && (
          <button
            onClick={onClose}
            title="Close game (Shift+Esc)"
            className="absolute left-3 top-6 flex items-center gap-1.5 text-white/50 hover:text-white
              transition-colors text-sm font-medium px-2 py-1 rounded-lg hover:bg-white/10"
          >
            ← Back
          </button>
        )}
        <div className="text-5xl mb-1">🐦</div>
        <h1 className="text-3xl font-black tracking-tight">Flappy Bird</h1>
        <p className="text-sky-300 text-sm mt-0.5">Best: <span className="font-bold text-white">{highScore}</span> · Games: <span className="font-bold text-white">{totalGames}</span></p>
      </div>

      {/* Player name */}
      <div className="px-5 mt-3">
        <label className="text-xs text-white/50 uppercase tracking-widest block mb-1">Your name</label>
        <input
          value={playerName}
          onChange={e => onNameChange(e.target.value)}
          maxLength={20}
          placeholder="Enter name…"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-sky-400 transition-colors text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 mt-4">
        {[['bird','🐦 Bird'], ['bg','🌄 Scene'], ['audio','🎵 Audio']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === id
                ? 'bg-sky-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-5 mt-3 min-h-0">
        {tab === 'bird' && (
          <div>
            {/* Preview */}
            <div className="flex justify-center mb-3">
              <canvas ref={previewRef} width={96} height={96} className="rounded-xl border-2 border-white/20" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {BIRD_SKINS.map(skin => {
                const unlocked = isSkinUnlocked(skin.id)
                const isSelected = selectedSkin === skin.id
                return (
                  <button
                    key={skin.id}
                    disabled={!unlocked}
                    onClick={() => unlocked && onSettingsChange({ selectedSkin: skin.id })}
                    className={`relative p-2 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-sky-500/30 border-sky-400 text-white'
                        : unlocked
                          ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                          : 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: skin.fill === 'rainbow' ? 'transparent' : skin.fill === 'galaxy' ? '#6366f1' : skin.fill,
                        background: skin.fill === 'rainbow' ? 'linear-gradient(135deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6)' : undefined }}
                    />
                    <div className="text-center leading-tight">{skin.name}</div>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                        <span className="text-lg">
                          {skin.score ? `${skin.score}` : '🔒'}
                        </span>
                      </div>
                    )}
                    {skin.score && !unlocked && (
                      <div className="absolute bottom-0.5 right-0.5 text-[10px] text-white/50">🏆{skin.score}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'bg' && (
          <div className="grid grid-cols-2 gap-2">
            {BACKGROUNDS.map(bg => {
              const unlocked = !bg.score || highScore >= bg.score
              const isSelected = selectedBg === bg.id
              return (
                <button
                  key={bg.id}
                  disabled={!unlocked}
                  onClick={() => unlocked && onSettingsChange({ selectedBg: bg.id })}
                  className={`relative p-3 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-sky-500/30 border-sky-400 text-white'
                      : unlocked
                        ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        : 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded mb-1"
                    style={{ background: `linear-gradient(135deg, ${bg.sky}, ${bg.ground})` }}
                  />
                  {bg.name}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-end justify-center rounded-lg pb-1">
                      <span className="text-[10px] text-white/40 bg-black/60 px-1 rounded">🏆 {bg.score}+</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {tab === 'audio' && (
          <div className="space-y-4">
            {/* Music track */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Music Track</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSettingsChange({ musicTrack: (musicTrack - 1 + MUSIC_TRACK_COUNT) % MUSIC_TRACK_COUNT })}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >◀</button>
                <div className="flex-1 text-center font-semibold text-sky-300">
                  ♫ {getMusicTrackName(musicTrack)}
                </div>
                <button
                  onClick={() => onSettingsChange({ musicTrack: (musicTrack + 1) % MUSIC_TRACK_COUNT })}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >▶</button>
              </div>
            </div>

            {/* Music volume */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                Music Volume — {Math.round(musicVolume * 100)}%
              </label>
              <input
                type="range" min={0} max={1} step={0.05}
                value={musicVolume}
                onChange={e => onSettingsChange({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-sky-400"
              />
            </div>

            {/* SFX volume */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                SFX Volume — {Math.round(sfxVolume * 100)}%
              </label>
              <input
                type="range" min={0} max={1} step={0.05}
                value={sfxVolume}
                onChange={e => onSettingsChange({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-sky-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="px-5 pb-5 pt-3 space-y-2 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={onLeaderboard}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={onAchievements}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors"
          >
            🎖 Achievements
          </button>
        </div>
        <button
          onClick={canPlay ? onPlay : undefined}
          disabled={!canPlay}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed font-black text-lg tracking-wide transition-colors shadow-lg"
        >
          ▶ Play
        </button>
      </div>
    </div>
  )
}
