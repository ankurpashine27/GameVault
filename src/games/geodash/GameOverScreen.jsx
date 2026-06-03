/**
 * Pulse Rush — death screen. Shows progress reached, personal best, attempt,
 * a random tip, and retry / level-select. Handles Infinite mode (score view).
 */
export default function GameOverScreen({ info, level, tip, isNewBest, onRetry, onLevelSelect }) {
  const infinite = info.infinite
  return (
    <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-vault-surface border border-red-500/30 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-2">💀</div>
        <h2 className="font-black text-3xl text-white mb-1">You Died.</h2>

        {infinite ? (
          <>
            <p className="text-white/70 text-sm mb-1">Score</p>
            <p className="text-4xl font-black mb-3" style={{ color: level.accentColor }}>{infinite.score.toLocaleString()}</p>
            <p className="text-white/60 text-sm mb-4">Survived {Math.floor(infinite.beats)} beats · max ×{infinite.maxSpeed}</p>
          </>
        ) : (
          <>
            <p className="text-white/70 text-sm mb-2">You reached <span className="font-black text-white text-lg">{info.percent}%</span></p>
            {isNewBest && <p className="text-emerald-400 font-bold text-sm mb-2">✨ New Best!</p>}
            <div className="flex justify-center gap-4 text-sm text-white/60 mb-4">
              <span>Best: {info.bestPercent}%</span>
              <span>Attempt {info.attempts}</span>
              <span>🪙 {info.coins.length}/3</span>
            </div>
          </>
        )}

        <p className="text-xs text-white/50 italic mb-5">Tip: {tip}</p>

        <div className="space-y-2">
          <button onClick={onRetry}
            className="w-full py-3 rounded-xl font-black text-black"
            style={{ background: level.accentColor }}>
            ↺ Retry
          </button>
          <button onClick={onLevelSelect} className="w-full py-2.5 rounded-xl bg-vault-elevated hover:bg-vault-border text-white font-semibold">
            ≡ Level Select
          </button>
        </div>
      </div>
    </div>
  )
}
