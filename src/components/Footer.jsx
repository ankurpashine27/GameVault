export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-12 border-t border-vault-border">
      {/* Subtle gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5) 50%, transparent)' }}/>

      <div className="bg-vault-surface/60 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8 py-10">

          {/* Top row: brand + links */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-8">
            {/* Brand */}
            <div className="flex flex-col items-center sm:items-start gap-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎮</span>
                <span className="font-heading font-bold text-xl text-text-primary tracking-tight">
                  GameVault
                </span>
              </div>
              <p className="text-text-muted text-sm max-w-xs text-center sm:text-left">
                A curated collection of browser games — play anything, anywhere, instantly.
              </p>
            </div>

            {/* Quick links */}
            <div className="flex gap-10 text-sm">
              <div className="flex flex-col gap-2">
                <p className="text-text-muted uppercase tracking-wider text-xs font-medium mb-1">Games</p>
                <a href="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</a>
                <a href="/game/snake" className="text-text-secondary hover:text-text-primary transition-colors">Snake</a>
                <a href="/game/tetris" className="text-text-secondary hover:text-text-primary transition-colors">Tetris</a>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-text-muted uppercase tracking-wider text-xs font-medium mb-1">More</p>
                <a href="/game/flappybird" className="text-text-secondary hover:text-text-primary transition-colors">Flappy Bird</a>
                <a href="/game/nexus" className="text-text-secondary hover:text-text-primary transition-colors">Nexus</a>
                <a href="/reviews" className="text-text-secondary hover:text-text-primary transition-colors">Reviews</a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-vault-border pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Copyright */}
              <p className="text-text-muted text-xs">
                © {currentYear} GameVault. All games built for entertainment purposes.
              </p>

              {/* AI attribution badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full
                bg-vault-elevated border border-vault-border text-xs">
                <span className="text-text-muted">Designed by</span>
                <span className="text-text-secondary font-semibold">Ankur Pashine</span>
                <span className="text-vault-border mx-1">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-text-muted">Generated with</span>
                  <span className="font-semibold"
                    style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7,#06b6d4)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Claude AI
                  </span>
                  <span className="text-accent-violet">✦</span>
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
