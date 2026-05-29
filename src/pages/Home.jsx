import { useMemo } from 'react'
import Hero from '@/components/Hero'
import CategoryRow from '@/components/CategoryRow'
import games from '@/data/games.json'

export default function Home({ favourites, onToggleFavourite, searchQuery, playCounts = {} }) {
  /* ── Hero carousel: featured first, then fill with top-rated ─────────── */
  const heroGames = useMemo(() => {
    const featured    = games.filter(g => g.featured)
    const notFeatured = games.filter(g => !g.featured).sort((a, b) => b.rating - a.rating)
    return [...featured, ...notFeatured]
  }, [])

  /* ── Popular: sort by actual play count, fall back to rating ─────────── */
  const popularGames = useMemo(() => {
    return [...games]
      .sort((a, b) => {
        const pa = playCounts[a.id] ?? 0
        const pb = playCounts[b.id] ?? 0
        if (pb !== pa) return pb - pa       // more plays first
        return b.rating - a.rating          // tie-break by rating
      })
      .slice(0, 6)
  }, [playCounts])

  /* ── Recently Added: newest release date first ───────────────────────── */
  const recentGames = useMemo(() =>
    [...games]
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .slice(0, 6),
  [])

  /* ── Favourites ──────────────────────────────────────────────────────── */
  const favouriteGames = useMemo(
    () => games.filter(g => favourites.includes(g.id)),
    [favourites]
  )

  /* ── Tag-based rows (only tags shared by ≥2 games) ─────────────────── */
  const tagRows = useMemo(() => {
    const allTags = [...new Set(games.flatMap(g => g.tags))].sort()
    return allTags
      .map(tag => ({ tag, games: games.filter(g => g.tags.includes(tag)) }))
      .filter(row => row.games.length >= 2)
  }, [])

  /* ── Derive popular section label ────────────────────────────────────── */
  const hasPlayData   = Object.keys(playCounts).length > 0
  const popularTitle  = hasPlayData ? '🔥 Most Played' : '🔥 Popular'
  const recentTitle   = '🕐 Recently Added'

  const rowProps = { favourites, onToggleFavourite, searchQuery }

  return (
    <main className="pb-16">
      {/* ── Hero carousel (hidden when searching) ── */}
      {!searchQuery && (
        <Hero
          games={heroGames}
          favourites={favourites}
          onToggleFavourite={onToggleFavourite}
        />
      )}

      <div className={searchQuery ? 'pt-24' : 'mt-2'}>
        {searchQuery && (
          <p className="px-4 sm:px-8 mb-4 text-text-secondary text-sm">
            Showing results for{' '}
            <span className="text-text-primary font-medium">"{searchQuery}"</span>
          </p>
        )}

        {/* Popular / Most Played */}
        <CategoryRow title={popularTitle} games={popularGames} {...rowProps} />

        {/* Recently Added */}
        <CategoryRow title={recentTitle} games={recentGames} {...rowProps} />

        {/* Your Favourites */}
        {favouriteGames.length > 0 && (
          <CategoryRow
            title="❤️ Your Favourites"
            games={favouriteGames}
            {...rowProps}
          />
        )}

        {/* Tag-based rows */}
        {tagRows.map(({ tag, games: tagGames }) => (
          <CategoryRow
            key={tag}
            title={tag.charAt(0).toUpperCase() + tag.slice(1)}
            games={tagGames}
            {...rowProps}
          />
        ))}
      </div>
    </main>
  )
}
