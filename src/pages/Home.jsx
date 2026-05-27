import { useMemo } from 'react'
import Hero from '@/components/Hero'
import CategoryRow from '@/components/CategoryRow'
import games from '@/data/games.json'

export default function Home({ favourites, onToggleFavourite, searchQuery }) {
  const featuredGame = useMemo(() => games.find(g => g.featured) || games[0], [])

  const popularGames = useMemo(() =>
    [...games].sort((a, b) => b.rating - a.rating).slice(0, 6), [])

  const recentGames = useMemo(() =>
    [...games].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).slice(0, 6), [])

  const favouriteGames = useMemo(() =>
    games.filter(g => favourites.includes(g.id)), [favourites])

  const tagRows = useMemo(() => {
    const allTags = [...new Set(games.flatMap(g => g.tags))].sort()
    return allTags
      .map(tag => ({ tag, games: games.filter(g => g.tags.includes(tag)) }))
      .filter(row => row.games.length >= 2)
  }, [])

  const rowProps = { favourites, onToggleFavourite, searchQuery }

  return (
    <main className="pb-16">
      {!searchQuery && (
        <Hero
          game={featuredGame}
          isFavourite={favourites.includes(featuredGame?.id)}
          onToggleFavourite={onToggleFavourite}
        />
      )}

      <div className={`${searchQuery ? 'pt-24' : 'mt-4'}`}>
        {searchQuery && (
          <p className="px-4 sm:px-8 mb-4 text-text-secondary text-sm">
            Showing results for <span className="text-text-primary font-medium">"{searchQuery}"</span>
          </p>
        )}

        <CategoryRow title="🔥 Popular" games={popularGames} {...rowProps} />
        <CategoryRow title="🕐 Recently Added" games={recentGames} {...rowProps} />

        {favouriteGames.length > 0 && (
          <CategoryRow
            id="favourites"
            title="❤️ Your Favourites"
            games={favouriteGames}
            {...rowProps}
          />
        )}

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
