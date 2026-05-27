import { useRef, useState, useEffect } from 'react'
import GameCard from './GameCard'

export default function CategoryRow({ id, title, games, favourites, onToggleFavourite, searchQuery }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const visibleGames = searchQuery
    ? games.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : games

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [visibleGames])

  if (searchQuery && visibleGames.length === 0) return null

  const scrollBy = (dir) => {
    // Scroll ~3 card widths
    const cardWidth = scrollRef.current?.firstElementChild?.offsetWidth || 220
    scrollRef.current?.scrollBy({ left: dir * (cardWidth + 12) * 3, behavior: 'smooth' })
  }

  return (
    <section id={id} className="relative mb-2 py-3">
      <h2 className="font-heading text-lg sm:text-xl font-semibold mb-3 px-4 sm:px-8 text-text-primary tracking-wide">
        {title}
      </h2>

      <div className="relative group/row">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-0 bottom-0 z-10 w-10 sm:w-14
              hidden md:flex items-center justify-center
              bg-gradient-to-r from-vault-bg/90 to-transparent
              text-white/80 hover:text-white transition-colors duration-150
              opacity-0 group-hover/row:opacity-100 transition-opacity">
            <span className="text-2xl leading-none select-none">‹</span>
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide category-scroll px-4 sm:px-8 pb-3">
          {visibleGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              isFavourite={favourites.includes(game.id)}
              onToggleFavourite={onToggleFavourite}
            />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-0 bottom-0 z-10 w-10 sm:w-14
              hidden md:flex items-center justify-center
              bg-gradient-to-l from-vault-bg/90 to-transparent
              text-white/80 hover:text-white transition-colors duration-150
              opacity-0 group-hover/row:opacity-100 transition-opacity">
            <span className="text-2xl leading-none select-none">›</span>
          </button>
        )}
      </div>
    </section>
  )
}
