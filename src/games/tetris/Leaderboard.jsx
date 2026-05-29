import { formatTime } from './utils.js'

export default function Leaderboard({ scores = [], mode = 'marathon', onClose }) {
  const isSprint = mode === 'sprint'

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="bg-gray-900/95 border border-white/15 rounded-2xl px-5 py-5 w-80 flex flex-col gap-3 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-white font-black text-lg">🏆 Leaderboard</div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white/80 text-xl leading-none transition-colors"
          >×</button>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-1">
          {scores.length === 0 ? (
            <div className="text-white/40 text-sm text-center py-6">No scores yet</div>
          ) : (
            scores.slice(0, 20).map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  i === 0 ? 'bg-yellow-500/15 border border-yellow-500/30' :
                  i === 1 ? 'bg-gray-500/15 border border-gray-500/30' :
                  i === 2 ? 'bg-orange-700/15 border border-orange-700/30' :
                  'bg-white/5 border border-white/5'
                }`}
              >
                <span className={`text-sm font-bold w-5 text-center ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/40'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>
                <span className="flex-1 text-white text-sm truncate">{entry.name ?? 'Player'}</span>
                <span className="text-white/80 text-sm font-mono tabular-nums">
                  {isSprint ? formatTime(entry.score) : entry.score?.toLocaleString()}
                </span>
                {entry.date && (
                  <span className="text-white/30 text-[10px]">{entry.date.slice(5)}</span>
                )}
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm transition-colors mt-1"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
