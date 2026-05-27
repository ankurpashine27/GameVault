import { useState, useMemo } from 'react'
import { GRID_SIZES, DIFFICULTIES, LEADERBOARD_MAX_SHOWN } from './constants.js'
import { formatDate } from './utils.js'

export default function Leaderboard({ entries, playerName, onClose }) {
  const [filterGrid, setFilterGrid] = useState('all')
  const [filterDiff, setFilterDiff] = useState('all')

  const filtered = useMemo(() => {
    return entries
      .filter(e => filterGrid === 'all' || String(e.gridSize) === filterGrid)
      .filter(e => filterDiff === 'all' || e.difficulty === filterDiff)
      .slice(0, LEADERBOARD_MAX_SHOWN)
  }, [entries, filterGrid, filterDiff])

  const diffColors = {
    casual: 'text-difficulty-easy', classic: 'text-difficulty-medium',
    hardcore: 'text-difficulty-hard', insane: 'text-text-primary',
  }

  const selectClass = `text-sm bg-[#0d1e10] border border-[rgba(34,197,94,0.2)] text-green-100
    rounded px-2 py-1 focus:outline-none focus:border-green-500`

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#060e08] animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4
        border-b border-[rgba(34,197,94,0.25)] flex-shrink-0 bg-[#0d1e10]">
        <h2 className="font-heading text-2xl font-bold snake-gradient-text">Leaderboard</h2>
        <button
          onClick={onClose}
          className="text-[#4a7a54] hover:text-green-300 transition-colors text-xl
            px-2 py-1 rounded hover:bg-[#193d22]"
        >
          ✕
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 px-5 py-3 border-b border-[rgba(34,197,94,0.2)] flex-shrink-0 bg-[#060e08]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4a7a54] uppercase tracking-wider">Grid</span>
          <select value={filterGrid} onChange={e => setFilterGrid(e.target.value)} className={selectClass}>
            <option value="all">All</option>
            {GRID_SIZES.map(g => (
              <option key={g.id} value={String(g.id)}>{g.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4a7a54] uppercase tracking-wider">Difficulty</span>
          <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} className={selectClass}>
            <option value="all">All</option>
            {Object.entries(DIFFICULTIES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <span className="text-4xl">🏆</span>
            <p className="text-green-300/60">No scores yet. Play a round to get on the board!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[rgba(34,197,94,0.2)]">
                {['#', 'Name', 'Score', 'Grid', 'Difficulty', 'Date'].map(h => (
                  <th key={h} className="pb-2 pr-3 text-xs text-[#4a7a54] uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const isMe = entry.name === playerName
                const gridLabel = GRID_SIZES.find(g => g.id === entry.gridSize)?.label || entry.gridSize
                return (
                  <tr
                    key={i}
                    className={`border-b transition-colors
                      ${isMe
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-[rgba(34,197,94,0.1)] hover:bg-[#0d1e10]'
                      }`}
                  >
                    <td className="py-2 pr-3 font-mono text-[#4a7a54]">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </td>
                    <td className={`py-2 pr-3 font-medium ${isMe ? 'text-green-400' : 'text-green-100'}`}>
                      {entry.name}
                      {isMe && <span className="ml-1 text-xs text-green-400/60">(you)</span>}
                    </td>
                    <td className="py-2 pr-3 font-heading font-bold text-green-100">{entry.score}</td>
                    <td className="py-2 pr-3 text-green-300/70">{gridLabel}</td>
                    <td className={`py-2 pr-3 capitalize font-medium ${diffColors[entry.difficulty] || 'text-green-300/70'}`}>
                      {DIFFICULTIES[entry.difficulty]?.name || entry.difficulty}
                    </td>
                    <td className="py-2 text-[#4a7a54] text-xs">{formatDate(entry.date)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
