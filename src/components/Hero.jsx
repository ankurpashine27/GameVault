import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

/**
 * Hero — auto-rotating carousel through all games passed in.
 * Background gradient cross-fades; content fades up on each change.
 * Pauses on hover. Dot indicators + prev/next arrows.
 */
export default function Hero({ games = [], favourites = [], onToggleFavourite }) {
  const [idx, setIdx]   = useState(0)
  const timerRef        = useRef(null)

  const total = games.length

  /* Restart the 6-second interval. Called when user manually navigates. */
  const restartTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(
      () => setIdx(i => (i + 1) % total),
      6000
    )
  }, [total])

  useEffect(() => {
    restartTimer()
    return () => clearInterval(timerRef.current)
  }, [restartTimer])

  const goTo = useCallback((i) => { setIdx(i); restartTimer() }, [restartTimer])
  const prev = () => goTo((idx - 1 + total) % total)
  const next = () => goTo((idx + 1) % total)

  const game    = games[idx]
  const isFav   = game && favourites.includes(game.id)

  if (!game) return null

  return (
    <section
      className="relative min-h-[85vh] flex items-end pt-16 overflow-hidden select-none"
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={restartTimer}
    >
      {/* ── Background layers (stacked, cross-fade via opacity) ───────────── */}
      {games.map((g, i) => (
        <div key={g.id}
          className={`absolute inset-0 bg-gradient-to-br ${g.color} transition-opacity duration-1000`}
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}

      {/* Dark left-side overlay for text legibility */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(8,11,20,0.96) 30%, rgba(8,11,20,0.65) 60%, transparent 100%)' }}/>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #080B14 0%, transparent 100%)' }}/>

      {/* ── Animated content (key forces re-mount → CSS animation fires) ─── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        key={idx}
        className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-8 pb-24 w-full"
        style={{ animation: 'heroFadeUp 0.55s ease-out' }}
      >
        <div className="max-w-xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 text-xs uppercase
            tracking-[0.2em] text-accent-blue font-mono mb-5
            bg-accent-blue/10 border border-accent-blue/30 px-3 py-1 rounded-full">
            {game.featured ? '✦ Featured Game' : '⭐ Top Rated'}
          </span>

          {/* Title */}
          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-bold gradient-text mb-4 leading-none">
            {game.title}
          </h1>

          {/* Description */}
          <p className="text-text-secondary text-base sm:text-lg mb-6 max-w-md leading-relaxed">
            {game.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-sm">
            <span className="text-yellow-400 font-medium">★ {game.rating}</span>
            <span className="text-text-muted border-l border-vault-border pl-4">
              {game.difficulty}
            </span>
            <span className="text-text-muted border-l border-vault-border pl-4">
              {game.players} player{game.players !== '1' ? 's' : ''}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {game.tags.slice(0, 5).map(tag => (
              <span key={tag}
                className="text-xs px-3 py-1 rounded-full capitalize
                  bg-vault-elevated/80 border border-vault-border
                  text-text-secondary backdrop-blur-sm">
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
                transition-all duration-200 shadow-glow-blue hover:scale-105 active:scale-100">
              ▶ Play Now
            </Link>
            <button
              onClick={() => onToggleFavourite?.(game.id)}
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-lg
                font-heading font-semibold text-lg border-2
                transition-all duration-200 hover:scale-105 active:scale-100
                ${isFav
                  ? 'border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20'
                  : 'border-vault-border text-text-secondary hover:border-red-400 hover:text-red-400'
                }`}>
              {isFav ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ────────────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Previous game"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 rounded-full flex items-center justify-center
          bg-black/40 backdrop-blur-sm border border-white/15
          text-white/60 hover:text-white hover:bg-black/65 hover:border-white/30
          transition-all duration-150 text-2xl font-light leading-none">
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next game"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 rounded-full flex items-center justify-center
          bg-black/40 backdrop-blur-sm border border-white/15
          text-white/60 hover:text-white hover:bg-black/65 hover:border-white/30
          transition-all duration-150 text-2xl font-light leading-none">
        ›
      </button>

      {/* ── Dot indicators ───────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {games.map((g, i) => (
          <button
            key={g.id}
            onClick={() => goTo(i)}
            aria-label={`Go to ${g.title}`}
            className={`rounded-full transition-all duration-300
              ${i === idx
                ? 'w-6 h-2 bg-white'
                : 'w-2  h-2 bg-white/35 hover:bg-white/55'
              }`}
          />
        ))}
      </div>

      {/* ── Slide counter (top-right) ────────────────────────────────────── */}
      <div className="absolute top-[72px] right-5 z-20
        font-mono text-xs text-white/35 bg-black/25 px-2 py-0.5 rounded-full">
        {idx + 1}&thinsp;/&thinsp;{total}
      </div>
    </section>
  )
}
