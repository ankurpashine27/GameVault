import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import GamePage from '@/pages/GamePage'

export default function App() {
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gamevault_favourites')) || []
    } catch {
      return []
    }
  })

  const [searchQuery, setSearchQuery] = useState('')

  const toggleFavourite = (id) => {
    setFavourites(prev => {
      const next = prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
      localStorage.setItem('gamevault_favourites', JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-vault-bg text-text-primary">
      <Navbar
        favouriteCount={favourites.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              favourites={favourites}
              onToggleFavourite={toggleFavourite}
              searchQuery={searchQuery}
            />
          }
        />
        <Route
          path="/game/:id"
          element={
            <GamePage
              favourites={favourites}
              onToggleFavourite={toggleFavourite}
            />
          }
        />
      </Routes>
    </div>
  )
}
