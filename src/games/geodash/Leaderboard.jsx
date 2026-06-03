/**
 * Pulse Rush — leaderboard. Tab 1: level completions. Tab 2: infinite records.
 */
import { useState } from 'react'

export default function Leaderboard({ data, playerName, onClose }) {
  const [tab, setTab] = useState('levels')
  const levels = [...(data.levels || [])].sort((a, b) => a.attempts - b.attempts).slice(0, 50)
  const infinite = (data.infinite || [])

  return (
    <div className="absolute inset-0 z-40 bg-vault-bg/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-2xl text-white">🏆 Leaderboard</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm">✕ Close</button>
        </div>

        <div className="flex gap-2 mb-4">
          <Tab active={tab === 'levels'} onClick={() => setTab('levels')}>Level Completions</Tab>
          <Tab active={tab === 'infinite'} onClick={() => setTab('infinite')}>Infinite Records</Tab>
        </div>

        {tab === 'levels' ? (
          <Table head={['Level', 'Player', 'Attempts', 'Coins', 'Date']}
            rows={levels.map(e => [e.levelName, e.playerName, e.attempts, `${e.coinsCollected || 0}/3`, e.date])}
            highlightCol={1} playerName={playerName}
            empty="No completions yet. Go clear a level!" />
        ) : (
          <Table head={['#', 'Player', 'Score', 'Beats', 'Date']}
            rows={infinite.map((e, i) => [i + 1, e.playerName, e.score.toLocaleString(), Math.floor(e.beatsReached), e.date])}
            highlightCol={1} playerName={playerName}
            empty="No infinite runs yet. Try Infinite mode!" />
        )}
      </div>
    </div>
  )
}

function Tab({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${active ? 'bg-accent-blue/20 text-white border border-accent-blue' : 'bg-vault-surface text-text-secondary border border-vault-border'}`}>
      {children}
    </button>
  )
}

function Table({ head, rows, empty, highlightCol, playerName }) {
  if (!rows.length) return <p className="text-text-secondary text-sm text-center py-10">{empty}</p>
  return (
    <div className="overflow-x-auto rounded-xl border border-vault-border">
      <table className="w-full text-sm">
        <thead className="bg-vault-surface">
          <tr>{head.map(h => <th key={h} className="text-left px-3 py-2 text-text-secondary font-semibold text-xs uppercase">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const mine = r[highlightCol] === playerName
            return (
              <tr key={i} className={mine ? 'bg-violet-500/10 border-l-2 border-violet-400' : 'odd:bg-white/[0.02]'}>
                {r.map((c, j) => <td key={j} className="px-3 py-2 text-white/85">{c}</td>)}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
