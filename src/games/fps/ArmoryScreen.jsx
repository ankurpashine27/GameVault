/**
 * Grimhold — between-level armory. Buy/unlock weapons, upgrade owned weapons,
 * and buy consumables. Mutates the run; purchases are final.
 */
import { useReducer } from 'react'
import { WEAPONS, ARMORY_WEAPONS, UPGRADES, AMMO } from './data/weapons.js'
import { LIFE_COST, ARMOR_COST, AMMO_BUNDLE_COST } from './constants.js'

export default function ArmoryScreen({ run, onContinue }) {
  const [, force] = useReducer(x => x + 1, 0)
  const owned = run.ownedWeapons

  const buyWeapon = (id) => {
    const a = ARMORY_WEAPONS[id]
    if (!a || owned.has(id) || run.episode < a.fromEpisode || run.gold < a.price) return
    run.gold -= a.price; owned.add(id); force()
  }
  const buyUpgrade = (wid, track) => {
    const cur = run.upgrades[wid]?.[track] || 0
    if (cur >= 2) return
    const price = UPGRADES[track].prices[cur]
    if (run.gold < price) return
    run.gold -= price
    run.upgrades[wid] = { ...(run.upgrades[wid] || {}), [track]: cur + 1 }
    force()
  }
  const buy = (cost, fn) => { if (run.gold >= cost) { run.gold -= cost; fn(); force() } }

  return (
    <div className="absolute inset-0 overflow-y-auto p-4" style={{ background: 'radial-gradient(circle at 50% 20%, #1a0f05, #07050a 70%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-3xl font-black text-amber-400">Armory</h2>
          <div className="text-xl font-bold text-yellow-400">● {run.gold}</div>
        </div>

        {/* Weapons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          {Object.entries(ARMORY_WEAPONS).map(([id, a]) => {
            const has = owned.has(id), avail = run.episode >= a.fromEpisode
            return (
              <div key={id} className={`rounded-lg p-3 border ${has ? 'bg-emerald-900/20 border-emerald-600/40' : avail ? 'bg-black/40 border-white/10' : 'bg-black/60 border-white/5 opacity-60'}`}>
                <div className="font-bold text-white text-sm">{WEAPONS[id].name}</div>
                <div className="text-[11px] text-white/40 mb-2 capitalize">{WEAPONS[id].type}</div>
                {has ? <div className="text-emerald-400 text-xs font-bold">Owned</div>
                  : avail ? <button onClick={() => buyWeapon(id)} disabled={run.gold < a.price}
                    className="w-full py-1 rounded bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold">● {a.price}</button>
                    : <div className="text-white/40 text-xs">Episode {a.fromEpisode}+</div>}
              </div>
            )
          })}
        </div>

        {/* Upgrades */}
        <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Upgrades (owned weapons)</div>
        <div className="space-y-2 mb-5">
          {[...owned].filter(id => id !== 'dagger').map(id => (
            <div key={id} className="bg-black/30 rounded-lg p-2 border border-white/10">
              <div className="font-bold text-white text-sm mb-1">{WEAPONS[id].name}</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(UPGRADES).map(([track, u]) => {
                  const cur = run.upgrades[id]?.[track] || 0
                  const maxed = cur >= 2
                  return (
                    <button key={track} onClick={() => buyUpgrade(id, track)} disabled={maxed || run.gold < u.prices[cur]}
                      className="rounded bg-black/40 border border-white/10 hover:border-amber-500 disabled:opacity-40 p-1.5 text-left">
                      <div className="text-[10px] text-white/50">{u.label}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 text-xs">{'●'.repeat(cur)}{'○'.repeat(2 - cur)}</span>
                        <span className="text-[10px] text-white/60">{maxed ? 'MAX' : '● ' + u.prices[cur]}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Consumables */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Consumable label="+1 Life" cost={LIFE_COST} gold={run.gold} onBuy={() => buy(LIFE_COST, () => run.lives++)} />
          <Consumable label="Full Armor" cost={ARMOR_COST} gold={run.gold} onBuy={() => buy(ARMOR_COST, () => run.armor = 100)} />
          <Consumable label="Ammo Bundle" cost={AMMO_BUNDLE_COST} gold={run.gold} onBuy={() => buy(AMMO_BUNDLE_COST, () => { for (const k in AMMO) run.ammo[k] = Math.min(AMMO[k].max, (run.ammo[k] || 0) + Math.ceil(AMMO[k].max * 0.3)) })} />
        </div>

        <button onClick={onContinue} className="w-full py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-black text-lg">Continue →</button>
      </div>
    </div>
  )
}

function Consumable({ label, cost, gold, onBuy }) {
  return (
    <button onClick={onBuy} disabled={gold < cost}
      className="rounded-lg p-3 bg-black/40 border border-white/10 hover:border-amber-500 disabled:opacity-40 text-center">
      <div className="text-white text-sm font-bold">{label}</div>
      <div className="text-amber-300 text-xs mt-1">● {cost}</div>
    </button>
  )
}
