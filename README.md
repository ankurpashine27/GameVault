# GameVault 🎮

A Netflix-style browser game catalog built with React + Vite + Tailwind CSS. The catalog shell is built and ready; individual games are added as separate modules.

---

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

```bash
npm run build    # Production build → dist/
npm run preview  # Preview the production build
```

---

## Folder Structure

```
src/
├── data/
│   └── games.json            # Central catalog — add all games here
├── components/
│   ├── Navbar.jsx             # Fixed top bar with search + favourites
│   ├── Hero.jsx               # Featured game banner (home page)
│   ├── CategoryRow.jsx        # Horizontal scrollable row
│   ├── GameCard.jsx           # Card with hover overlay
│   └── GameFrame.jsx          # Fullscreen wrapper for every game
├── pages/
│   ├── Home.jsx               # Catalog homepage
│   └── GamePage.jsx           # Individual game detail + launch
├── games/
│   ├── registry.js            # id → component map (add games here)
│   └── <id>/index.jsx         # Each game's component (added later)
├── hooks/
│   └── useFullscreen.js       # Reusable Fullscreen API hook
└── App.jsx
```

---

## How to Add a New Game

**Step 1** — Add an entry to `src/data/games.json`:

```json
{
  "id": "your-game-id",
  "title": "Your Game",
  "description": "Short description (shown on cards and hero).",
  "longDescription": "Full description shown on the game detail page.",
  "thumbnail": null,
  "color": "from-indigo-600 to-purple-900",
  "tags": ["arcade", "single-player"],
  "players": "1",
  "difficulty": "medium",
  "releaseDate": "2025-01-01",
  "rating": 4.0,
  "featured": false
}
```

**Step 2** — Create the game component at `src/games/your-game-id/index.jsx`:

```jsx
import { useRef, useEffect } from 'react'

export default function YourGame() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    // Set up your game loop here
    let raf
    const loop = () => {
      // draw frame
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    // IMPORTANT: always clean up
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
```

**Step 3** — Register it in `src/games/registry.js`:

```js
import YourGame from './your-game-id/index.jsx'

export const gameRegistry = {
  // existing entries...
  'your-game-id': YourGame,
}
```

That's it. The game detail page, GameFrame, and category rows all update automatically.

---

## How the Category System Works

The home page builds rows from `games.json` at runtime — no hardcoded lists:

| Row | Logic |
|---|---|
| 🔥 Popular | All games sorted by `rating` descending, top 6 |
| 🕐 Recently Added | All games sorted by `releaseDate` descending, top 6 |
| ❤️ Your Favourites | Games the user has favourited (localStorage), only shown if ≥1 |
| Dynamic tag rows | One row per unique tag, alphabetical order, only if ≥2 games have that tag |

**Adding a new tag** to a game in `games.json` automatically creates a new category row the next time the app loads — no code changes needed. A tag row only appears if at least 2 games share it.

Current tags: `arcade`, `casual`, `classic`, `multiplayer`, `puzzle`, `single-player`, `strategy`

---

## GameFrame Controls

| Key | Action |
|---|---|
| `F11` | Toggle browser fullscreen |
| `Shift+Esc` | Close the game and return to the game page |
| Plain `Esc` | **Nothing** — reserved for in-game pause menus |
| `✕` button | Close the game frame |
| `⛶` button | Toggle fullscreen |

The top bar auto-hides after 2 seconds of inactivity and reappears on mouse movement.

---

## Favourites

Favourites are stored in `localStorage` under the key `gamevault_favourites` (JSON array of game id strings). They persist across page refreshes and browser sessions. Toggle from any game card or the game detail page.

---

## Deployment (Static Hosting)

The app uses client-side routing. When deploying, configure your host to redirect all 404s to `index.html`:

**Netlify** — create `public/_redirects`:
```
/*  /index.html  200
```

**Vercel** — create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
