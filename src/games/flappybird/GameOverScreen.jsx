import { ACHIEVEMENTS, COLLECTIONS } from './constants.js'

export default function GameOverScreen({
  score, highScore, isNewHighScore,
  runSummary,
  newAchievements,
  newCollectionSets,
  onPlayAgain,
  onLeaderboard,
  onMenu,
}) {
  const { coinsThisRun = 0, maxStage = 0 } = runSummary || {}
  const stageNames = ['Tutorial','Easy','Normal','Hard','Expert','Master','Insane']

  return (
    <div className="flex flex-col items-center justify-start h-full bg-gradient-to-b from-slate-900 to-indigo-950 text-white overflow-y-auto px-5 py-6 gap-4">
      {/* Death icon */}
      <div className="text-6xl animate-bounce">💀</div>

      {/* Score */}
      <div className="text-center">
        <div className="text-6xl font-black leading-none">{score}</div>
        {isNewHighScore && (
          <div className="mt-1 text-yellow-400 font-bold text-sm animate-pulse">🏆 New Best!</div>
        )}
        <div className="text-white/50 text-sm mt-1">Best: {highScore}</div>
      </div>

      {/* Stats */}
      <div className="w-full max-w-xs grid grid-cols-2 gap-2 text-sm">
        <StatBadge icon="🪙" label="Coins" value={coinsThisRun} />
        <StatBadge icon="⚡" label="Stage" value={stageNames[maxStage] || 'Tutorial'} />
        <StatBadge icon="🎮" label="Score" value={score} />
        <StatBadge icon="🏆" label="Best" value={highScore} />
      </div>

      {/* New achievements */}
      {newAchievements?.length > 0 && (
        <div className="w-full max-w-xs">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Achievements Unlocked</p>
          <div className="space-y-1.5">
            {newAchievements.map(id => {
              const ach = ACHIEVEMENTS.find(a => a.id === id)
              if (!ach) return null
              return (
                <div key={id} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                  <span className="text-xl">{ach.icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-yellow-300">{ach.name}</div>
                    <div className="text-xs text-white/50">{ach.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New collection sets */}
      {newCollectionSets?.length > 0 && (
        <div className="w-full max-w-xs">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Sets Completed!</p>
          <div className="space-y-1.5">
            {newCollectionSets.map(set => (
              <div key={set.id} className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                <span className="text-xl">🎁</span>
                <div>
                  <div className="font-semibold text-sm text-purple-300">{set.name}</div>
                  <div className="text-xs text-white/50">{set.reward}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="w-full max-w-xs space-y-2 mt-auto pt-2">
        <button
          onClick={onPlayAgain}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 font-black text-lg tracking-wide transition-colors"
        >
          ▶ Play Again
        </button>
        <div className="flex gap-2">
          <button
            onClick={onLeaderboard}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-colors"
          >
            🏆 Scores
          </button>
          <button
            onClick={onMenu}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-colors"
          >
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )
}

function StatBadge({ icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center">
      <div className="text-lg leading-none">{icon}</div>
      <div className="text-white font-bold text-base mt-0.5">{value}</div>
      <div className="text-white/40 text-xs">{label}</div>
    </div>
  )
}
