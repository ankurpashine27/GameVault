import { Link } from 'react-router-dom'
import GameThumbnail from './GameThumbnail'

export default function GameCard({ game, isFavourite, onToggleFavourite }) {
  return (
    <div className="group relative flex-shrink-0 w-36 xs:w-44 sm:w-52 md:w-56 lg:w-64 cursor-pointer">
      {/* Inner card */}
      <div className="aspect-video rounded-xl overflow-hidden relative
        transition-all duration-200 ease-out ring-1 ring-white/5
        group-hover:scale-105 group-hover:shadow-glow-card group-hover:ring-white/20
        group-hover:z-20 z-10">

        {/* Gradient background (shown if thumbnail has no fill or as accent ring) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${game.color}`}/>

        {/* ── Unique game thumbnail ── */}
        <GameThumbnail gameId={game.id}/>

        {/* Vignette overlay — always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20
          pointer-events-none"/>

        {/* ── Default state: title bar ── */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 pt-5
          bg-gradient-to-t from-black/80 to-transparent
          group-hover:opacity-0 transition-opacity duration-200">
          <p className="text-sm font-heading font-semibold truncate text-text-primary drop-shadow">
            {game.title}
          </p>
        </div>

        {/* ── Hover overlay ── */}
        <div className="absolute inset-0 flex flex-col justify-end p-3
          bg-gradient-to-t from-vault-bg/95 via-vault-bg/80 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-200">

          {/* Rating + difficulty */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-yellow-400 font-medium drop-shadow">
              ★ {game.rating}
            </span>
            <span className="text-[11px] text-text-secondary bg-vault-elevated/80
              px-2 py-0.5 rounded-full border border-vault-border capitalize truncate ml-1">
              {game.difficulty}
            </span>
          </div>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap mb-2">
            {game.tags.slice(0, 2).map(tag => (
              <span key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded
                  bg-vault-elevated border border-vault-border text-text-muted capitalize leading-none">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-[11px] text-text-secondary leading-relaxed mb-3"
            style={{ display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {game.description}
          </p>

          {/* Action row */}
          <div className="flex gap-2">
            <Link
              to={`/game/${game.id}`}
              className="flex-1 text-center text-xs py-1.5 rounded-lg font-medium
                border border-accent-blue text-accent-blue
                hover:bg-accent-blue hover:text-white transition-colors duration-150">
              View Game
            </Link>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavourite(game.id) }}
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              className={`px-2.5 py-1.5 rounded-lg border text-sm transition-colors duration-150
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
