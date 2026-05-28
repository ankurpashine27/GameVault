import { POWERUPS, STAGES } from './constants.js'
import { getMusicTrackName } from './audio/musicGenerator.js'

export default function HUD({
  score, highScore, activePowerup, powerupTimer,
  currentStage, musicTrack, musicVolume,
  onPause, onToggleMusic,
}) {
  const pu = activePowerup ? POWERUPS[activePowerup] : null
  const stageColors = [
    'text-green-400',   // Tutorial
    'text-green-300',   // Easy
    'text-yellow-300',  // Normal
    'text-orange-400',  // Hard
    'text-red-400',     // Expert
    'text-red-500',     // Master
    'text-purple-400',  // Insane
  ]
  const stageColor = stageColors[currentStage?.id ?? 0] || 'text-white'

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-2 pointer-events-none">
        {/* Score */}
        <div className="flex flex-col items-start">
          <span className="text-white font-black text-3xl leading-none drop-shadow-lg" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
            {score}
          </span>
          <span className="text-white/60 text-xs font-mono">Best {highScore}</span>
        </div>

        {/* Stage badge */}
        <div className={`px-2 py-0.5 rounded-full bg-black/40 text-xs font-bold ${stageColor} border border-current/30`}>
          {currentStage?.name || 'Tutorial'}
        </div>

        {/* Controls */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={onToggleMusic}
            className="w-8 h-8 rounded-full bg-black/40 text-white/70 hover:text-white flex items-center justify-center text-sm transition-colors"
            title={musicVolume > 0 ? 'Mute music' : 'Unmute music'}
          >
            {musicVolume > 0 ? '♫' : '♩'}
          </button>
          <button
            onClick={onPause}
            className="w-8 h-8 rounded-full bg-black/40 text-white/70 hover:text-white flex items-center justify-center text-sm transition-colors"
            title="Pause (Esc)"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* Power-up bar */}
      {pu && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5"
          style={{ top: 56 }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-lg"
            style={{ backgroundColor: pu.color + '33', border: `1.5px solid ${pu.color}`, color: pu.color }}
          >
            <span>{getPowerupIcon(activePowerup)}</span>
            <span>{pu.name}</span>
            <span className="font-mono opacity-80">{powerupTimer.toFixed(1)}s</span>
          </div>
          {/* Timer bar */}
          <div className="w-24 h-1 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-none"
              style={{
                width: `${(powerupTimer / (POWERUPS[activePowerup]?.duration || 1)) * 100}%`,
                backgroundColor: pu.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Music track label (subtle, bottom) */}
      {musicVolume > 0 && (
        <div className="absolute bottom-[84px] left-1/2 -translate-x-1/2 text-white/30 text-xs font-mono pointer-events-none">
          ♫ {getMusicTrackName(musicTrack)}
        </div>
      )}
    </div>
  )
}

function getPowerupIcon(type) {
  const icons = { shield: '🛡', slow_mo: '⏳', magnet: '🧲', shrink: '⬇', score_x2: '×2', ghost: '👻' }
  return icons[type] || '⚡'
}
