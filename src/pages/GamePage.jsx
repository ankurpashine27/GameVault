import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import games from '@/data/games.json'
import GameFrame from '@/components/GameFrame'

const DIFF_COLORS = {
  easy:   { text: 'text-difficulty-easy',   border: 'border-difficulty-easy',   bg: 'bg-emerald-500/10' },
  medium: { text: 'text-difficulty-medium', border: 'border-difficulty-medium', bg: 'bg-amber-500/10'   },
  hard:   { text: 'text-difficulty-hard',   border: 'border-difficulty-hard',   bg: 'bg-red-500/10'     },
}

export default function GamePage({ favourites, onToggleFavourite, onPlay }) {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [frameOpen, setFrameOpen] = useState(false)

  const game = games.find(g => g.id === id)

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-6xl">🕹️</span>
        <h1 className="font-heading text-4xl font-bold text-text-primary">Game Not Found</h1>
        <p className="text-text-secondary">We couldn't find a game with id "{id}".</p>
        <Link to="/"
          className="mt-4 px-6 py-2.5 rounded-lg bg-accent-blue hover:bg-blue-500
            text-white font-heading font-semibold transition-colors duration-200">
          ← Back to Catalog
        </Link>
      </div>
    )
  }

  const isFavourite = favourites.includes(game.id)
  const diff        = DIFF_COLORS[game.difficulty] || { text: 'text-text-secondary', border: 'border-vault-border', bg: '' }
  const releaseDate = new Date(game.releaseDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const handlePlay = () => {
    setFrameOpen(true)
    onPlay?.(game.id)
  }

  return (
    <>
      <main className="pb-20">
        {/* ── Hero banner ─────────────────────────────────────────────── */}
        <section className={`relative h-[55vh] min-h-[380px] bg-gradient-to-br ${game.color} pt-16 overflow-hidden`}>
          {/* Overlays */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(8,11,20,0.9) 40%, rgba(8,11,20,0.5) 70%, transparent 100%)' }}/>
          <div className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: 'linear-gradient(to top, #080B14 0%, transparent 100%)' }}/>

          {/* ── Back button — pill with backdrop so it's always visible ── */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-[72px] left-5 sm:left-8 z-10
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
              bg-black/45 backdrop-blur-sm border border-white/20
              text-white/80 hover:text-white hover:bg-black/65 hover:border-white/40
              transition-all duration-150"
          >
            ← Back
          </button>

          {/* Game info */}
          <div className="relative z-10 h-full flex items-end pb-10 px-6 sm:px-10 max-w-screen-xl mx-auto">
            <div className="max-w-2xl">
              <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold gradient-text mb-3 leading-none">
                {game.title}
              </h1>
              <p className="text-text-secondary text-base sm:text-lg max-w-lg">
                {game.description}
              </p>
            </div>
          </div>
        </section>

        {/* ── Details ──────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
          <p className="text-text-secondary text-base leading-relaxed mb-10">
            {game.longDescription}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 p-5 sm:p-6
            rounded-xl bg-vault-surface border border-vault-border">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">Players</p>
              <p className="font-heading text-xl font-semibold text-text-primary">{game.players}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">Difficulty</p>
              <p className={`font-heading text-xl font-semibold capitalize ${diff.text}`}>{game.difficulty}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">Rating</p>
              <p className="font-heading text-xl font-semibold text-yellow-400">★ {game.rating}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">Added</p>
              <p className="font-heading text-xl font-semibold text-text-primary">{releaseDate}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            {game.tags.map(tag => (
              <span key={tag}
                className="text-sm px-4 py-1.5 rounded-full capitalize
                  bg-vault-elevated border border-vault-border text-text-secondary
                  hover:border-accent-blue hover:text-accent-blue transition-colors duration-150 cursor-default">
                {tag}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePlay}
              className="sm:w-auto px-10 py-4 rounded-lg font-heading font-semibold text-xl
                bg-accent-blue hover:bg-blue-500 text-white transition-all duration-200
                shadow-glow-sm hover:shadow-glow-blue hover:scale-105 active:scale-100">
              ▶ Play Now
            </button>
            <button
              onClick={() => onToggleFavourite(game.id)}
              className={`sm:w-auto px-8 py-4 rounded-lg font-heading font-semibold text-xl
                border-2 transition-all duration-200 hover:scale-105 active:scale-100
                ${isFavourite
                  ? 'border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20'
                  : 'border-vault-border text-text-secondary hover:border-red-400 hover:text-red-400'
                }`}>
              {isFavourite ? '♥ Saved' : '♡ Save Game'}
            </button>
          </div>
        </section>
      </main>

      {frameOpen && (
        <GameFrame
          gameId={game.id}
          gameTitle={game.title}
          onClose={() => setFrameOpen(false)}
        />
      )}
    </>
  )
}
