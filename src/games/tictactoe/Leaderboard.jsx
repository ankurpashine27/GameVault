import { useState, useMemo } from 'react'
import { BOARD_MODES, AI_DIFFICULTIES, P1_COLOR, P2_COLOR } from './constants.js'
import { formatDate } from './utils.js'

// ─── Match History Tab ────────────────────────────────────────────────────────
function MatchHistory({ history, p1Name }) {
  const [filterMode, setFilterMode] = useState('all')
  const [filterOutcome, setFilterOutcome] = useState('all')

  const filtered = useMemo(() => {
    return history
      .filter(e => filterMode === 'all' || e.boardMode === filterMode)
      .filter(e => {
        if (filterOutcome === 'all') return true
        if (filterOutcome === 'win')  return e.winner === 'X'
        if (filterOutcome === 'loss') return e.winner === 'O'
        if (filterOutcome === 'draw') return e.winner === 'draw'
        return true
      })
  }, [history, filterMode, filterOutcome])

  const selectCls = `text-sm bg-vault-elevated border border-vault-border text-text-primary
    rounded px-2 py-1 focus:outline-none focus:border-accent-blue`

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted uppercase tracking-wider">Board</span>
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className={selectCls}>
            <option value="all">All</option>
            {Object.values(BOARD_MODES).map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted uppercase tracking-wider">Outcome</span>
          <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)} className={selectCls}>
            <option value="all">All</option>
            <option value="win">Win (P1)</option>
            <option value="loss">Loss (P1)</option>
            <option value="draw">Draw</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-3xl">🎮</span>
            <p className="text-text-muted text-sm">No matches found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-vault-border">
                {['Players', 'Board', 'Outcome', 'Score', 'Date'].map(h => (
                  <th key={h} className="pb-2 pr-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const outcome = e.winner === 'draw' ? 'Draw'
                  : e.winner === 'X' ? 'P1 Win'
                  : 'P2 Win'
                const outcomeColor = e.winner === 'X' ? P1_COLOR
                  : e.winner === 'O' ? P2_COLOR
                  : '#94A3B8'
                const modeLabel = BOARD_MODES[e.boardMode]?.label || e.boardMode
                return (
                  <tr key={i} className="border-b border-vault-border/50 hover:bg-vault-elevated/50 transition-colors">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span>{e.p1Avatar}</span>
                        <span className="text-text-secondary text-xs">vs</span>
                        <span>{e.p2Avatar}</span>
                        {e.vsAI && (
                          <span className="text-[10px] bg-accent-violet/20 text-accent-violet px-1 rounded">AI</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-text-secondary text-xs">{modeLabel}</td>
                    <td className="py-2 pr-3">
                      <span className="text-xs font-medium" style={{ color: outcomeColor }}>
                        {outcome}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-text-secondary text-xs">
                      {e.p1Score ?? '-'} – {e.p2Score ?? '-'}
                    </td>
                    <td className="py-2 text-text-muted text-xs">{formatDate(e.date)}</td>
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

// ─── Player Stats Tab ─────────────────────────────────────────────────────────
function PlayerStats({ history, p1Name, p2Name }) {
  const stats = useMemo(() => {
    const p1 = { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, vsAIWins: 0, vsAIGames: 0 }
    let streak = 0

    history.forEach(e => {
      if (e.winner === 'draw') { p1.draws++; streak = 0 }
      else if (e.winner === 'X') {
        p1.wins++
        streak++
        if (streak > p1.bestStreak) p1.bestStreak = streak
        if (e.vsAI) p1.vsAIWins++
      } else {
        p1.losses++
        streak = 0
      }
      if (e.vsAI) p1.vsAIGames++
    })
    p1.streak = streak

    const total = p1.wins + p1.losses + p1.draws
    p1.total = total
    p1.winRate = total > 0 ? Math.round((p1.wins / total) * 100) : 0

    return p1
  }, [history])

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <span className="text-3xl">📊</span>
        <p className="text-text-muted text-sm">Play some matches to see your stats!</p>
      </div>
    )
  }

  const rows = [
    ['Total Games',   stats.total],
    ['Wins (P1)',     stats.wins,    P1_COLOR],
    ['Losses (P1)',   stats.losses,  P2_COLOR],
    ['Draws',         stats.draws],
    ['Win Rate',      `${stats.winRate}%`,  stats.winRate >= 50 ? P1_COLOR : P2_COLOR],
    ['Current Streak', stats.streak > 0 ? `${stats.streak}W` : '–'],
    ['Best Streak',   stats.bestStreak > 0 ? `${stats.bestStreak}W` : '–'],
    ['vs AI Wins',    `${stats.vsAIWins} / ${stats.vsAIGames}`],
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {rows.map(([label, val, color]) => (
          <div
            key={label}
            className="bg-vault-elevated border border-vault-border rounded-xl p-3"
          >
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
            <p
              className="text-xl font-heading font-bold text-text-primary"
              style={color ? { color } : undefined}
            >
              {String(val)}
            </p>
          </div>
        ))}
      </div>

      {/* Win-rate bar */}
      <div className="bg-vault-elevated border border-vault-border rounded-xl p-3">
        <div className="flex justify-between text-xs text-text-muted mb-2">
          <span style={{ color: P1_COLOR }}>P1 Wins {stats.wins}</span>
          <span>Draws {stats.draws}</span>
          <span style={{ color: P2_COLOR }}>P2 Wins {stats.losses}</span>
        </div>
        <div className="h-2 bg-vault-muted rounded-full overflow-hidden flex">
          <div style={{ width: `${stats.total > 0 ? (stats.wins / stats.total) * 100 : 0}%`, backgroundColor: P1_COLOR }} />
          <div style={{ width: `${stats.total > 0 ? (stats.draws / stats.total) * 100 : 0}%`, backgroundColor: '#4A5568' }} />
          <div style={{ width: `${stats.total > 0 ? (stats.losses / stats.total) * 100 : 0}%`, backgroundColor: P2_COLOR }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Leaderboard Panel ───────────────────────────────────────────────────
export default function Leaderboard({ history, p1Name, p2Name, onClose }) {
  const [tab, setTab] = useState('history')

  const tabCls = (id) =>
    `px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 ${
      tab === id
        ? 'border-accent-blue text-text-primary'
        : 'border-transparent text-text-muted hover:text-text-secondary'
    }`

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-vault-bg animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4
        border-b border-vault-border flex-shrink-0 bg-vault-surface">
        <h2 className="font-heading text-2xl font-bold gradient-text">Leaderboard</h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors text-xl
            px-2 py-1 rounded hover:bg-vault-elevated"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-vault-border bg-vault-surface flex-shrink-0">
        <button className={tabCls('history')} onClick={() => setTab('history')}>
          Match History
        </button>
        <button className={tabCls('stats')} onClick={() => setTab('stats')}>
          Player Stats
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {tab === 'history'
          ? <MatchHistory history={history} p1Name={p1Name} />
          : <PlayerStats history={history} p1Name={p1Name} p2Name={p2Name} />
        }
      </div>
    </div>
  )
}
