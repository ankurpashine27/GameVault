/**
 * 2048 Leaderboard overlay.
 */

export default function Leaderboard({ allScores = [], personalBests = {}, playerName, onClose }) {
  const sorted = [...allScores].sort((a, b) => b.score - a.score).slice(0, 50)

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-white font-bold text-lg">🏆 Leaderboard</h2>
        <button onClick={onClose}
          className="text-white/60 hover:text-white text-xl px-2 transition-colors">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {sorted.length === 0 ? (
          <div className="text-white/40 text-center py-12">No scores yet. Play a game!</div>
        ) : (
          <div className="space-y-2 max-w-lg mx-auto">
            {sorted.map((entry, i) => (
              <div key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl
                  ${entry.name === playerName
                    ? 'bg-amber-500/20 border border-amber-500/40'
                    : 'bg-white/5 border border-white/10'}`}>
                <span className={`w-6 text-center font-black text-sm
                  ${i === 0 ? 'text-amber-300' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-white/40'}`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-white/90 font-medium text-sm truncate">{entry.name || 'Player'}</span>
                <span className="text-white font-bold">{(entry.score || 0).toLocaleString()}</span>
                {entry.date && (
                  <span className="text-white/30 text-xs">{entry.date}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
