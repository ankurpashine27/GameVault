import { Link } from 'react-router-dom'

const DIFF_COLORS = {
  easy:   'text-difficulty-easy',
  medium: 'text-difficulty-medium',
  hard:   'text-difficulty-hard',
}

export default function GameCard({ game, isFavourite, onToggleFavourite }) {
  return (
    <div className="group relative flex-shrink-0 w-36 xs:w-44 sm:w-52 md:w-56 lg:w-64 cursor-pointer">
      {/* Scaled inner card */}
      <div className="aspect-video rounded-lg overflow-hidden relative
        transition-all duration-200 ease-out
        group-hover:scale-105 group-hover:shadow-glow-card group-hover:z-20 z-10">

        {/* Gradient background placeholder */}
        <div className={`absolute inset-0 bg-gradient-to-br ${game.color}`} />

        {/* Subtle inner vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Game icon placeholder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-0 transition-opacity duration-200">
          <span className="text-5xl select-none">🎮</span>
        </div>

        {/* Always-visible title bar */}
        <div className="absolute bottom-0 left-0 right-0 p-2
          bg-gradient-to-t from-vault-bg/90 to-transparent
          group-hover:opacity-0 transition-opacity duration-200">
          <p className="text-sm font-heading font-semibold truncate text-text-primary">
            {game.title}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3
          bg-gradient-to-t from-vault-bg via-vault-bg/75 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-200">

          {/* Rating + difficulty */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-yellow-400 font-medium">★ {game.rating}</span>
            <span className={`text-xs font-medium capitalize ${DIFF_COLORS[game.difficulty] || 'text-text-secondary'}`}>
              {game.difficulty}
            </span>
          </div>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap mb-2">
            {game.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded
                bg-vault-elevated border border-vault-border text-text-secondary leading-none">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-[11px] text-text-secondary leading-relaxed mb-3"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {game.description}
          </p>

          {/* Action row */}
          <div className="flex gap-2">
            <Link
              to={`/game/${game.id}`}
              className="flex-1 text-center text-xs py-1.5 rounded
                border border-accent-blue text-accent-blue
                hover:bg-accent-blue hover:text-white transition-colors duration-150 font-medium">
              View Game
            </Link>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavourite(game.id) }}
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              className={`px-2 py-1.5 rounded border transition-colors duration-150 text-sm
                ${isFavourite
                  ? 'border-red-500 text-red-400 bg-red-500/10'
                  : 'border-vault-border text-text-secondary hover:border-red-400 hover:text-red-400'
                }`}>
              {isFavourite ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
