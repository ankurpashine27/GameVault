import { useEffect, useRef, useState } from 'react'
import { useFullscreen } from '@/hooks/useFullscreen'
import { gameRegistry } from '@/games/registry'

function ComingSoon({ gameTitle }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6 bg-vault-bg px-6">
      <div className="text-7xl animate-pulse-slow select-none">🎮</div>
      <div>
        <h2 className="font-heading text-4xl sm:text-5xl font-bold gradient-text mb-2">{gameTitle}</h2>
        <p className="text-text-secondary text-lg">This game is coming soon!</p>
      </div>
      <div className="max-w-sm bg-vault-surface border border-vault-border rounded-xl p-5 text-left">
        <p className="text-text-muted text-sm mb-3 font-medium uppercase tracking-wider">How to add this game</p>
        <ol className="space-y-2 text-sm text-text-secondary">
          <li><span className="text-accent-blue font-mono mr-2">1.</span>Add entry to <code className="font-mono text-accent-cyan bg-vault-elevated px-1.5 py-0.5 rounded text-xs">src/data/games.json</code></li>
          <li><span className="text-accent-blue font-mono mr-2">2.</span>Create component at <code className="font-mono text-accent-cyan bg-vault-elevated px-1.5 py-0.5 rounded text-xs">src/games/{'{id}'}/index.jsx</code></li>
          <li><span className="text-accent-blue font-mono mr-2">3.</span>Register in <code className="font-mono text-accent-cyan bg-vault-elevated px-1.5 py-0.5 rounded text-xs">src/games/registry.js</code></li>
        </ol>
      </div>
      <p className="text-text-muted text-sm">
        Press <kbd className="bg-vault-elevated border border-vault-border px-2 py-1 rounded font-mono text-text-secondary text-xs">Shift+Esc</kbd> to close
      </p>
    </div>
  )
}

export default function GameFrame({ gameId, gameTitle, onClose }) {
  const [barVisible, setBarVisible] = useState(true)
  const hideTimerRef = useRef(null)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  const showBar = () => {
    setBarVisible(true)
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setBarVisible(false), 2000)
  }

  // Initial show + cleanup
  useEffect(() => {
    showBar()
    return () => clearTimeout(hideTimerRef.current)
  }, [])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F11') {
        e.preventDefault()
        toggleFullscreen()
      }
      // Shift+Esc closes; plain Esc is reserved for games
      if (e.key === 'Escape' && e.shiftKey) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleFullscreen, onClose])

  const GameComponent = gameRegistry[gameId] || null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      onMouseMove={showBar}>

      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 z-10
        flex items-center justify-between px-4 py-3
        transition-all duration-300 ease-in-out
        ${barVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>

        <span className="font-heading text-base sm:text-lg font-semibold text-white truncate max-w-[50vw]">
          {gameTitle}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleFullscreen}
            title={`${isFullscreen ? 'Exit' : 'Enter'} Fullscreen (F11)`}
            className="text-white/70 hover:text-white transition-colors duration-150
              px-3 py-2 rounded-lg hover:bg-white/10 text-lg leading-none">
            {isFullscreen ? '⊡' : '⛶'}
          </button>
          <button
            onClick={onClose}
            title="Close (Shift+Esc)"
            className="text-white/70 hover:text-white transition-colors duration-150
              px-3 py-2 rounded-lg hover:bg-white/10 text-lg leading-none font-light">
            ✕
          </button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 w-full overflow-hidden">
        {GameComponent ? <GameComponent onClose={onClose} /> : <ComingSoon gameTitle={gameTitle} />}
      </div>
    </div>
  )
}
