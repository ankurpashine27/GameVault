import { todayStr } from './utils.js'
import { formatTime } from './utils.js'

export default function DailyScreen({
  dailyData = {},
  onPlay,
  onBack,
}) {
  const today = todayStr()
  const alreadyPlayed = dailyData.date === today
  const { score, streak } = dailyData

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/95 to-black/95 overflow-y-auto py-4">
      <div className="bg-gray-900/95 border border-white/15 rounded-2xl px-6 py-6 w-80 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-1">📅</div>
          <div className="text-white font-black text-xl tracking-wide">Daily Challenge</div>
          <div className="text-white/40 text-xs mt-1">{today}</div>
        </div>

        {/* Streak */}
        {(streak ?? 0) > 0 && (
          <div className="bg-orange-900/30 border border-orange-500/30 rounded-xl px-4 py-2 text-center">
            <div className="text-orange-300 font-bold text-sm">🔥 {streak}-Day Streak!</div>
          </div>
        )}

        {/* Already played */}
        {alreadyPlayed && score !== null ? (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3 text-center">
            <div className="text-green-300 text-xs mb-1">Today's Score</div>
            <div className="text-white font-black text-2xl">{score?.toLocaleString() ?? '—'}</div>
            <div className="text-green-300/60 text-xs mt-1">Come back tomorrow for a new challenge!</div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
            <div className="text-white/60 text-sm">A new challenge every day.</div>
            <div className="text-white/40 text-xs mt-1">Same seed for everyone — compare your score!</div>
          </div>
        )}

        {/* Rules */}
        <div className="text-white/40 text-[11px] leading-relaxed">
          • Marathon mode, fixed seed<br />
          • Starts at Level 1<br />
          • One attempt per day<br />
          • Scores compared on leaderboard
        </div>

        <div className="flex flex-col gap-2">
          {!alreadyPlayed && (
            <button
              onClick={onPlay}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              ▶ Play Today's Challenge
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}
