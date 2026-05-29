import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import GamePage from "@/pages/GamePage";
import { Analytics } from "@vercel/analytics/react";

const LS_FAVS   = "gamevault_favourites";
const LS_PLAYS  = "gamevault_playcounts";

export default function App() {
  /* ── Favourites ──────────────────────────────────────────────────────── */
  const [favourites, setFavourites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_FAVS)) || [] }
    catch { return [] }
  });

  const toggleFavourite = useCallback((id) => {
    setFavourites(prev => {
      const next = prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id];
      localStorage.setItem(LS_FAVS, JSON.stringify(next));
      return next;
    });
  }, []);

  /* ── Play count tracking (for "Most Played" section) ────────────────── */
  const [playCounts, setPlayCounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PLAYS)) || {} }
    catch { return {} }
  });

  /** Call this whenever a user opens a game's GameFrame. */
  const incrementPlayCount = useCallback((id) => {
    setPlayCounts(prev => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      localStorage.setItem(LS_PLAYS, JSON.stringify(next));
      return next;
    });
  }, []);

  /* ── Search ──────────────────────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-vault-bg text-text-primary flex flex-col">
      <Navbar
        favouriteCount={favourites.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main content grows to push footer down */}
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                favourites={favourites}
                onToggleFavourite={toggleFavourite}
                searchQuery={searchQuery}
                playCounts={playCounts}
              />
            }
          />
          <Route
            path="/game/:id"
            element={
              <GamePage
                favourites={favourites}
                onToggleFavourite={toggleFavourite}
                onPlay={incrementPlayCount}
              />
            }
          />
        </Routes>
      </div>

      <Footer />
      <Analytics />
    </div>
  );
}
