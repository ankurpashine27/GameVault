import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar({ favouriteCount, searchQuery, onSearchChange }) {
  const [scrolled, setScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleFavouritesClick = () => {
    navigate('/')
    setTimeout(() => {
      document.getElementById('favourites')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-vault-elevated/95 backdrop-blur-md shadow-lg shadow-black/30' : 'bg-transparent'}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <span className="text-2xl">🎮</span>
          <span className="font-heading text-xl font-bold gradient-text hidden xs:block tracking-wider">
            GameVault
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 flex justify-center">
          <div className={`relative transition-all duration-300
            ${searchFocused || searchQuery ? 'w-full max-w-sm sm:max-w-md' : 'w-40 sm:w-64 max-w-sm sm:max-w-md'}`}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search games…"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm
                bg-vault-surface border border-vault-border
                text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/40
                transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors text-sm leading-none">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Reviews tab */}
        <NavLink
          to="/reviews"
          title="Community reviews & feedback"
          className={({ isActive }) => `flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg
            text-sm font-medium transition-colors duration-200
            ${isActive
              ? 'text-white bg-vault-surface'
              : 'text-text-secondary hover:text-text-primary hover:bg-vault-surface'}`}>
          <span className="text-base leading-none">💬</span>
          <span className="hidden sm:block">Reviews</span>
        </NavLink>

        {/* Favourites button */}
        <button
          onClick={handleFavouritesClick}
          title="Jump to Favourites"
          className="relative flex-shrink-0 p-2 rounded-lg
            text-text-secondary hover:text-red-400 transition-colors duration-200
            hover:bg-vault-surface">
          <span className="text-xl leading-none">{favouriteCount > 0 ? '♥' : '♡'}</span>
          {favouriteCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
              rounded-full text-[10px] font-bold leading-[18px] text-center
              bg-accent-blue text-white">
              {favouriteCount > 99 ? '99+' : favouriteCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
