/**
 * Grimhold — game over / death screen.
 */
export default function GameOverScreen({ result, onRetry, onMenu }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at 50% 40%, #1a0303, #000 70%)' }}>
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-3">💀</div>
        <h2 className="font-heading text-4xl font-black mb-2" style={{ color: '#c0392b', textShadow: '0 0 16px rgba(180,0,0,0.6)' }}>YOU DIED</h2>
        {result.endless
          ? <p className="text-white/60 mb-1">Fell on floor <span className="text-white font-bold">{result.floor}</span></p>
          : <p className="text-white/60 mb-1">The castle claims another hunter.</p>}
        <p className="text-white/50 text-sm mb-6">{result.kills} kills · ● {result.gold} gold {result.diffName === 'nightmare' && '· Nightmare'}</p>

        <div className="space-y-2">
          {!result.endless && result.diffName !== 'nightmare' && (
            <button onClick={onRetry} className="w-full py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-black">Retry Level</button>
          )}
          <button onClick={onMenu} className="w-full py-2.5 rounded-lg bg-black/40 border border-white/10 text-white/80 hover:text-white">Main Menu</button>
        </div>
      </div>
    </div>
  )
}
