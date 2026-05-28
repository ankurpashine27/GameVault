import { useState } from 'react'
import { LEADERBOARD_SHOWN } from './constants.js'

export default function Leaderboard({ allScores, personalBests, playerName, onClose }) {
  const [tab, setTab] = useState('all')

  const rows   = tab === 'all' ? (allScores || []) : (personalBests || [])
  const sorted = [...rows].sort((a, b) => b.score - a.score).slice(0, LEADERBOARD_SHOWN)

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-slate-900/95 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-black">🏆 Leaderboard</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {[['all','🌍 All-Time'], ['personal','👤 Personal']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === id ? 'bg-sky-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {sorted.length === 0 ? (
          <div className="text-center text-white/30 mt-12">
            <div className="text-4xl mb-2">📭</div>
            <p>No scores yet. Play a game!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sorted.map((entry, i) => {
              const isMe = entry.name === playerName
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isMe
                      ? 'bg-sky-500/15 border border-sky-500/30'
                      : 'bg-white/5 border border-white/5'
                  }`}
                >
                  <span className={`w-6 text-center font-black text-sm ${rankColor(i)}`}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                  </span>
                  <span className={`flex-1 font-semibold text-sm truncate ${isMe ? 'text-sky-300' : 'text-white/90'}`}>
                    {entry.name || 'Player'}
                  </span>
                  <span className="font-black text-white">{entry.score}</span>
                  <span className="text-white/30 text-xs w-16 text-right flex-shrink-0">{entry.date || ''}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function rankColor(i) {
  if (i === 0) return 'text-yellow-400'
  if (i === 1) return 'text-slate-300'
  if (i === 2) return 'text-amber-600'
  return 'text-white/40'
}
