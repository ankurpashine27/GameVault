/**
 * Pulse Rush — level complete celebration + stats.
 */
import { DIFFICULTIES } from './constants.js'

export default function LevelCompleteScreen({ level, info, isNewBest, nextLevel, onNext, onRetry, onLevelSelect }) {
  const diff = DIFFICULTIES[level.difficulty]
  return (
    <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-vault-surface border border-yellow-500/40 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className="font-black text-3xl text-white mb-1">Complete!</h2>
        <p className="text-white/70 text-sm mb-4">{level.name} · {level.songName}</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <Box label="Reward" value={`${diff?.demon ? '👹' : '★'} ${level.stars}`} />
          <Box label="Attempts" value={info.attempts} />
          <Box label="Coins" value={`${info.coins.length}/3`} />
        </div>

        {isNewBest && <p className="text-emerald-400 font-bold text-sm mb-3">✨ First clear — stars earned!</p>}

        <div className="space-y-2">
          {nextLevel && (
            <button onClick={onNext} className="w-full py-3 rounded-xl font-black text-black" style={{ background: level.accentColor }}>
              Next: {nextLevel.name} →
            </button>
          )}
          <button onClick={onRetry} className="w-full py-2.5 rounded-xl bg-vault-elevated hover:bg-vault-border text-white font-semibold">↺ Play Again</button>
          <button onClick={onLevelSelect} className="w-full py-2.5 rounded-xl bg-vault-elevated hover:bg-vault-border text-white font-semibold">≡ Level Select</button>
        </div>
      </div>
    </div>
  )
}

function Box({ label, value }) {
  return (
    <div className="bg-black/30 rounded-lg py-2">
      <div className="text-[9px] text-white/45 uppercase tracking-wider">{label}</div>
      <div className="text-base font-black text-white">{value}</div>
    </div>
  )
}
