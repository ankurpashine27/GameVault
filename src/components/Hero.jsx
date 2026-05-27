import { Link } from 'react-router-dom'

const DIFF_COLORS = {
  easy:   'text-difficulty-easy border-difficulty-easy',
  medium: 'text-difficulty-medium border-difficulty-medium',
  hard:   'text-difficulty-hard border-difficulty-hard',
}

export default function Hero({ game, isFavourite, onToggleFavourite }) {
  if (!game) return null

  return (
    <section className={`relative min-h-[85vh] flex items-end pt-16 overflow-hidden bg-gradient-to-br ${game.color}`}>
      {/* Left-to-right content fade */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(8,11,20,0.95) 35%, rgba(8,11,20,0.6) 65%, transparent 100%)' }} />

      {/* Right edge atmospheric gradient */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, transparent 50%, rgba(8,11,20,0.4) 100%)' }} />

      {/* Bottom fade into page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-40"
        style={{ background: 'linear-gradient(to top, #080B14 0%, transparent 100%)' }} />

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-8 pb-16 w-full">
        <div className="max-w-xl">
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-accent-blue font-mono mb-4
            bg-accent-blue/10 border border-accent-blue/30 px-3 py-1 rounded-full">
            Featured Game
          </span>

          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-bold gradient-text mb-4 leading-none">
            {game.title}
          </h1>

          <p className="text-text-secondary text-base sm:text-lg mb-6 max-w-md leading-relaxed">
            {game.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-yellow-400 text-sm font-medium">★ {game.rating}</span>
            <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded border ${DIFF_COLORS[game.difficulty] || 'text-text-secondary border-vault-border'}`}>
              {game.difficulty}
            </span>
            <span className="text-text-muted text-sm">{game.players} player{game.players !== '1' ? 's' : ''}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {game.tags.map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full
                bg-vault-elevated/80 border border-vault-border text-text-secondary backdrop-blur-sm
                capitalize">
                {tag}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/game/${game.id}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg
                bg-accent-blue hover:bg-blue-500 text-white font-heading font-semibold text-lg
                transition-all duration-200 shadow-glow-blue hover:shadow-glow-blue hover:scale-105">
              ▶ Play Now
            </Link>

            <button
              onClick={() => onToggleFavourite(game.id)}
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-heading font-semibold text-lg
                border-2 transition-all duration-200 hover:scale-105
                ${isFavourite
                  ? 'border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20'
                  : 'border-vault-border text-text-secondary hover:border-red-400 hover:text-red-400'
                }`}>
              {isFavourite ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
