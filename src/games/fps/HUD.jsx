/**
 * Grimhold — HUD overlay (React). DOOM-style bottom status bar with a
 * programmatic health-face portrait, plus the boss health bar.
 */
import { useRef, useEffect } from 'react'

function HealthFace({ health }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 44, 44)
    const f = Math.max(0, Math.min(1, health / 100))
    // head
    ctx.fillStyle = '#c89a6a'; ctx.fillRect(8, 6, 28, 32)
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(8, 4, 28, 6) // hair
    // eyes
    ctx.fillStyle = f <= 0 ? '#444' : '#fff'; ctx.fillRect(13, 16, 7, 6); ctx.fillRect(24, 16, 7, 6)
    ctx.fillStyle = '#000'
    const ex = f < 0.3 ? 1 : 0
    ctx.fillRect(15 + ex, 18, 3, 3); ctx.fillRect(26 - ex, 18, 3, 3)
    // mouth by state
    ctx.fillStyle = '#5a1010'
    if (f <= 0) { ctx.fillRect(14, 28, 16, 6) }       // dead grimace
    else if (f > 0.75) { ctx.fillRect(14, 28, 16, 4); ctx.fillStyle = '#fff'; ctx.fillRect(15, 28, 14, 2) } // grin
    else if (f > 0.5) { ctx.fillRect(15, 30, 14, 2) } // neutral
    else if (f > 0.25) { ctx.fillRect(15, 31, 14, 3) } // hurt
    else { ctx.fillRect(16, 30, 12, 5) }              // desperate
    // blood at low health
    if (f <= 0.5 && f > 0) { ctx.fillStyle = 'rgba(160,0,0,0.6)'; ctx.fillRect(10, 8, 4, 14); if (f <= 0.25) ctx.fillRect(30, 10, 4, 18) }
  }, [health])
  return <canvas ref={ref} width={44} height={44} className="block" style={{ imageRendering: 'pixelated' }} />
}

export default function HUD({ hud, onMinimap }) {
  if (!hud) return null
  return (
    <div className="absolute inset-0 pointer-events-none select-none text-white font-mono">
      {/* Boss bar */}
      {hud.boss && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[60%] max-w-md">
          <div className="text-center text-xs font-bold text-red-300 mb-1 drop-shadow tracking-widest uppercase">{hud.boss.name}</div>
          <div className="h-3 bg-black/70 border border-red-900 rounded">
            <div className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-l" style={{ width: `${Math.max(0, (hud.boss.hp / hud.boss.max) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-stretch gap-px"
        style={{ background: 'linear-gradient(180deg,#16161c,#0a0a0e)', borderTop: '2px solid #2a2a32' }}>
        {/* Face + health */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="bg-black/40 rounded p-0.5 border border-white/10"><HealthFace health={hud.health} /></div>
          <div className="leading-none">
            <div className="text-[9px] text-white/40 uppercase">Health</div>
            <div className="text-2xl font-black text-red-500 tabular-nums">{hud.health}%</div>
            <div className="text-[10px] text-sky-300">▣ {hud.armor}</div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Keys */}
        <div className="flex items-center gap-1 px-1">
          {hud.keys?.R && <span title="Red key" className="text-red-500 text-lg leading-none">⚷</span>}
          {hud.keys?.B && <span title="Blue key" className="text-sky-400 text-lg leading-none">⚷</span>}
          {hud.keys?.Y && <span title="Yellow key" className="text-yellow-400 text-lg leading-none">⚷</span>}
          {hud.keys?.rune && <span title="Rune key" className="text-purple-400 text-lg leading-none">✦</span>}
        </div>

        {/* Weapon + ammo */}
        <div className="flex items-center gap-4 px-3 py-2">
          <div className="text-right leading-none">
            <div className="text-[9px] text-white/40 uppercase">{hud.weaponName}</div>
            <div className="text-2xl font-black text-amber-300 tabular-nums">
              {hud.ammo == null ? '∞' : hud.ammo}{hud.ammoMax != null && hud.ammo != null ? <span className="text-sm text-white/40">/{hud.ammoMax}</span> : null}
            </div>
          </div>
          <div className="text-right leading-none">
            <div className="text-[9px] text-white/40 uppercase">Gold</div>
            <div className="text-lg font-bold text-yellow-400">● {hud.gold}</div>
          </div>
        </div>

        {/* Far right: level + lives + minimap btn */}
        <div className="flex items-center gap-3 px-3 py-2 border-l border-white/10">
          <div className="text-right leading-none">
            <div className="text-[9px] text-white/40 uppercase">{hud.name}</div>
            <div className="text-xs text-white/70">♥ {hud.lives} · {hud.kills}/{hud.totalEnemies} kills · {hud.secretsFound}/{hud.totalSecrets} ◈</div>
          </div>
          <button onClick={onMinimap} className="pointer-events-auto text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Map</button>
        </div>
      </div>

      {/* stamina sliver */}
      <div className="absolute bottom-16 left-3 w-24 h-1 bg-black/50 rounded">
        <div className="h-full bg-emerald-500/70 rounded" style={{ width: `${hud.stamina}%` }} />
      </div>
    </div>
  )
}
