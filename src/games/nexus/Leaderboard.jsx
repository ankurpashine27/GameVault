import { useState } from 'react'
import { MODES } from './constants.js'
import { formatDate } from './utils.js'

const TABS = ['High Scores', 'Streak Records', 'Daily History']

export default function Leaderboard({ settings, playerName, onClose }) {
  const [tab,        setTab]        = useState(0)
  const [modeFilter, setModeFilter] = useState('all')

  const scores     = settings.getLeaderboard(modeFilter === 'all' ? null : modeFilter)
  const streaks    = settings.getStreakRecords()
  const history    = settings.getDailyHistory()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      backdrop-blur-sm bg-black/70 p-4">
      <div className="bg-vault-surface border border-vault-border rounded-2xl
        w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">🏆 Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-vault-border flex-shrink-0">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors
                ${tab === i
                  ? 'text-violet-300 border-b-2 border-violet-400'
                  : 'text-text-secondary hover:text-white'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {/* ── Tab 0: High Scores ── */}
          {tab === 0 && (
            <>
              {/* Mode filter */}
              <select
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value)}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2
                  text-white text-sm focus:outline-none focus:border-violet-400 mb-3"
              >
                <option value="all">All Modes</option>
                {Object.values(MODES).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              {scores.length === 0 ? (
                <EmptyState message="No scores yet. Play a game to get on the board!" />
              ) : (
                scores.map((entry, i) => (
                  <LeaderRow
                    key={i}
                    rank={i + 1}
                    isMe={entry.name === playerName}
                  >
                    <span className="flex-1 truncate">{entry.name}</span>
                    <span className="text-xs text-text-secondary px-2">{MODES[entry.mode]?.name ?? entry.mode}</span>
                    <span className="text-violet-300 font-bold w-20 text-right">{entry.score} pts</span>
                    <span className="text-text-secondary text-xs w-24 text-right">{formatDate(entry.date)}</span>
                  </LeaderRow>
                ))
              )}
            </>
          )}

          {/* ── Tab 1: Streak Records ── */}
          {tab === 1 && (
            streaks.length === 0 ? (
              <EmptyState message="No streak records yet. Play Streak mode!" />
            ) : (
              streaks.map((entry, i) => (
                <LeaderRow key={i} rank={i + 1} isMe={entry.name === playerName}>
                  <span className="flex-1 truncate">{entry.name}</span>
                  <span className="text-orange-400 font-bold">🔥 {entry.streak}</span>
                  <span className="text-text-secondary text-xs w-24 text-right">{formatDate(entry.date)}</span>
                </LeaderRow>
              ))
            )
          )}

          {/* ── Tab 2: Daily History ── */}
          {tab === 2 && (
            history.length === 0 ? (
              <EmptyState message="No daily results yet. Play Daily mode!" />
            ) : (
              [...history].reverse().map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg
                    bg-vault-bg border border-vault-border text-sm"
                >
                  <span className="text-text-secondary text-xs w-24">{formatDate(entry.date)}</span>
                  <span>{entry.correct ? '✅' : '❌'}</span>
                  <span className="text-text-secondary text-xs">
                    {entry.correct ? `${entry.hintsUsed} hint${entry.hintsUsed !== 1 ? 's' : ''}` : '—'}
                  </span>
                  <span className="text-text-secondary text-xs">Day #{entry.dayNumber}</span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  )
}

function LeaderRow({ rank, isMe, children }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors
        ${isMe
          ? 'bg-violet-500/10 border border-violet-400/30 border-l-2'
          : 'bg-vault-bg border border-vault-border'
        }`}
    >
      <span className="text-text-secondary text-xs w-6 text-center font-mono">{rank}</span>
      {children}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 text-text-secondary text-sm">
      <p className="text-3xl mb-3">📊</p>
      <p>{message}</p>
    </div>
  )
}
