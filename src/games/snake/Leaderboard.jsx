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

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-vault-bg/98 backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-vault-border flex-shrink-0">
        <h2 className="font-heading text-2xl font-bold gradient-text">Leaderboard</h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors text-xl px-2 py-1 rounded hover:bg-vault-elevated"
        >
          ✕
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 px-5 py-3 border-b border-vault-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted uppercase tracking-wider">Grid</span>
          <select
            value={filterGrid}
            onChange={e => setFilterGrid(e.target.value)}
            className="text-sm bg-vault-elevated border border-vault-border text-text-primary rounded px-2 py-1
              focus:outline-none focus:border-accent-blue"
          >
            <option value="all">All</option>
            {GRID_SIZES.map(g => (
              <option key={g.id} value={String(g.id)}>{g.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted uppercase tracking-wider">Difficulty</span>
          <select
            value={filterDiff}
            onChange={e => setFilterDiff(e.target.value)}
            className="text-sm bg-vault-elevated border border-vault-border text-text-primary rounded px-2 py-1
              focus:outline-none focus:border-accent-blue"
          >
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
            <p className="text-text-secondary">No scores yet. Play a round to get on the board!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-vault-border">
                {['#', 'Name', 'Score', 'Grid', 'Difficulty', 'Date'].map(h => (
                  <th key={h} className="pb-2 pr-3 text-xs text-text-muted uppercase tracking-wider font-medium">
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
                        ? 'border-accent-blue/30 bg-accent-blue/5'
                        : 'border-vault-border/50 hover:bg-vault-surface'
                      }`}
                  >
                    <td className="py-2 pr-3 font-mono text-text-muted">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </td>
                    <td className={`py-2 pr-3 font-medium ${isMe ? 'text-accent-blue' : 'text-text-primary'}`}>
                      {entry.name}
                      {isMe && <span className="ml-1 text-xs text-accent-blue/70">(you)</span>}
                    </td>
                    <td className="py-2 pr-3 font-heading font-bold text-text-primary">{entry.score}</td>
                    <td className="py-2 pr-3 text-text-secondary">{gridLabel}</td>
                    <td className={`py-2 pr-3 capitalize font-medium ${diffColors[entry.difficulty] || 'text-text-secondary'}`}>
                      {DIFFICULTIES[entry.difficulty]?.name || entry.difficulty}
                    </td>
                    <td className="py-2 text-text-muted text-xs">{formatDate(entry.date)}</td>
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
