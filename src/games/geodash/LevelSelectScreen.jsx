/**
 * Pulse Rush — level select. Browse all 20 levels + Infinite mode, filter by
 * tier, sort, edit player name, and reach the icon kit / leaderboard /
 * achievements.
 */
import { useState, useMemo } from 'react'
import { DIFFICULTIES } from './constants.js'

const TIER_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'auto', label: 'Auto' },
  { key: 'easy', label: 'Easy' },
  { key: 'normal', label: 'Normal' },
  { key: 'hard', label: 'Hard' },
  { key: 'harder', label: 'Harder' },
  { key: 'insane', label: 'Insane' },
  { key: 'demon', label: 'Demon' },
]

export default function LevelSelectScreen({
  levels, progress, currency, playerName, setPlayerName, infiniteBest,
  onPlayLevel, onInfinite, onOpenCustomizer, onOpenLeaderboard, onOpenAchievements, onClose,
}) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('difficulty')

  const shown = useMemo(() => {
    let arr = levels.filter(l => {
      if (filter === 'all') return true
      if (filter === 'demon') return DIFFICULTIES[l.difficulty]?.demon
      return l.difficulty === filter
    })
    arr = [...arr].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'stars') return b.stars - a.stars
      if (sort === 'completion') return (progress[b.id]?.completed ? 1 : 0) - (progress[a.id]?.completed ? 1 : 0)
      return (DIFFICULTIES[a.difficulty]?.tier || 0) - (DIFFICULTIES[b.difficulty]?.tier || 0)
    })
    return arr
  }, [levels, filter, sort, progress])

  return (
    <div className="absolute inset-0 bg-vault-bg overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="font-heading text-3xl font-black tracking-tight"
              style={{ background: 'linear-gradient(90deg,#39d0ff,#b06bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PULSE RUSH
            </h1>
            <p className="text-text-secondary text-xs">Run · jump · fly · flip to the beat.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm font-bold">★ {currency.stars}</span>
            <span className="text-purple-300 text-sm font-bold">👹 {currency.demonStars}</span>
            <span className="text-amber-300 text-sm font-bold">🪙 {currency.coins}</span>
          </div>
        </div>

        {/* Player name + actions */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <label className="text-xs text-text-secondary">Player</label>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)}
            className="bg-vault-surface border border-vault-border rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent-blue focus:outline-none w-40" />
          <div className="flex-1" />
          <button onClick={onOpenCustomizer} className="px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border hover:border-accent-blue text-sm text-white">🎨 Icons</button>
          <button onClick={onOpenLeaderboard} className="px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border hover:border-accent-blue text-sm text-white">🏆 Leaderboard</button>
          <button onClick={onOpenAchievements} className="px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border hover:border-accent-blue text-sm text-white">🏅 Achievements</button>
        </div>

        {/* Filters / sort */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TIER_FILTERS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`text-xs px-2.5 py-1 rounded-full border ${filter === t.key ? 'bg-accent-blue/20 border-accent-blue text-white' : 'border-vault-border text-text-secondary hover:text-white'}`}>
              {t.label}
            </button>
          ))}
          <div className="flex-1" />
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-vault-surface border border-vault-border rounded-lg px-2 py-1 text-xs text-white">
            <option value="difficulty">Sort: Difficulty</option>
            <option value="name">Sort: Name</option>
            <option value="stars">Sort: Stars</option>
            <option value="completion">Sort: Completion</option>
          </select>
        </div>

        {/* Infinite card */}
        <button onClick={onInfinite}
          className="w-full mb-4 rounded-2xl p-4 flex items-center justify-between
            bg-gradient-to-r from-indigo-900/60 to-fuchsia-900/50 border border-fuchsia-500/40
            hover:border-fuchsia-400 transition-colors group">
          <div className="flex items-center gap-3">
            <span className="text-4xl group-hover:scale-110 transition-transform animate-pulse">∞</span>
            <div className="text-left">
              <div className="font-black text-white text-lg">Infinite Run</div>
              <div className="text-xs text-fuchsia-200/80">Endless procedural chaos. How far can you go?</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/50 uppercase">Best</div>
            <div className="font-black text-white tabular-nums">{(infiniteBest?.score || 0).toLocaleString()}</div>
          </div>
        </button>

        {/* Level grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shown.map(level => {
            const pr = progress[level.id] || {}
            const diff = DIFFICULTIES[level.difficulty]
            const coins = pr.coinsCollected || []
            return (
              <button key={level.id} onClick={() => onPlayLevel(level)}
                className="relative text-left rounded-xl p-3 border border-vault-border hover:border-white/40
                  transition-colors overflow-hidden group"
                style={{ background: `linear-gradient(135deg, ${level.bgColor}, ${level.groundColor})` }}>
                {diff?.demon && (
                  <span className="absolute top-0 right-0 text-[9px] font-black px-2 py-0.5 rounded-bl-lg bg-purple-700 text-white">DEMON</span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: diff.color + '33', color: diff.color, border: `1px solid ${diff.color}66` }}>
                    {diff.label}
                  </span>
                  {pr.completed && <span className="text-emerald-400 text-sm">✓</span>}
                </div>
                <div className="font-black text-white text-base mb-0.5 drop-shadow">{level.name}</div>
                <div className="text-[11px] text-white/70 mb-2">{level.songName} · {level.bpm} BPM</div>
                <div className="flex items-center justify-between">
                  <div className="text-yellow-300 text-xs font-bold">
                    {diff?.demon ? '👹' : '★'} {level.stars}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(id => (
                      <span key={id} className={`w-2.5 h-2.5 rounded-full ${coins.includes(id) ? 'bg-yellow-400' : 'bg-black/40 border border-white/20'}`} />
                    ))}
                  </div>
                </div>
                {pr.normalAttempts > 0 && (
                  <div className="text-[10px] text-white/50 mt-1">Best: {pr.normalAttempts} attempts</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Close */}
      <button onClick={onClose}
        className="fixed top-2 left-3 z-20 text-xs text-white/60 hover:text-white bg-black/40 rounded-lg px-2 py-1">
        ← Exit
      </button>
    </div>
  )
}
