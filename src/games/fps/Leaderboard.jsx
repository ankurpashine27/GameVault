/**
 * Grimhold — leaderboard (campaign records + endless scores).
 */
import { useState } from 'react'

export default function Leaderboard({ data, onClose }) {
  const [tab, setTab] = useState('endless')
  const campaign = [...(data.campaign || [])].sort((a, b) => a.time - b.time).slice(0, 30)
  const endless = data.endless || []
  return (
    <div className="absolute inset-0 overflow-y-auto p-4" style={{ background: '#07050a' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl font-black text-red-400">Records</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm">✕ Close</button>
        </div>
        <div className="flex gap-2 mb-4">
          <Tab active={tab === 'endless'} onClick={() => setTab('endless')}>Endless</Tab>
          <Tab active={tab === 'campaign'} onClick={() => setTab('campaign')}>Campaign</Tab>
        </div>
        {tab === 'endless' ? (
          <Table head={['#', 'Hunter', 'Score', 'Floor', 'Diff', 'Date']}
            rows={endless.map((e, i) => [i + 1, e.playerName, e.score?.toLocaleString(), e.floor, e.diff, e.date])}
            empty="No endless runs yet." />
        ) : (
          <Table head={['Episode', 'Hunter', 'Time', 'Gold', 'Diff', 'Date']}
            rows={campaign.map(e => [e.episode, e.playerName, e.time + 's', e.gold, e.diff, e.date])}
            empty="No campaign records yet." />
        )}
      </div>
    </div>
  )
}
function Tab({ active, onClick, children }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded text-sm font-semibold ${active ? 'bg-red-700/40 border border-red-500 text-white' : 'bg-black/30 border border-white/10 text-white/60'}`}>{children}</button>
}
function Table({ head, rows, empty }) {
  if (!rows.length) return <p className="text-white/40 text-center py-12">{empty}</p>
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-black/40"><tr>{head.map(h => <th key={h} className="text-left px-3 py-2 text-white/50 text-xs uppercase">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="odd:bg-white/[0.02]">{r.map((c, j) => <td key={j} className="px-3 py-2 text-white/80">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}
