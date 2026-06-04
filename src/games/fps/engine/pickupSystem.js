/**
 * Grimhold — item pickup collection + effects.
 */
import { MAX_HEALTH, MAX_ARMOR } from '../constants.js'
import { getItem } from '../data/items.js'
import { AMMO } from '../data/weapons.js'

export function updatePickups(g) {
  const events = []
  const p = g.player
  for (const it of g.pickups) {
    if (it.taken) continue
    const dx = it.x - p.x, dy = it.y - p.y
    if (dx * dx + dy * dy < 0.36) {
      const ev = apply(g, it)
      if (ev) { it.taken = true; events.push(ev) }
    }
  }
  return events
}

function apply(g, it) {
  const def = getItem(it.type)
  if (!def) { return { sfx: 'gold' } }
  const p = g.player
  switch (def.kind) {
    case 'health':
      if (p.health >= MAX_HEALTH) return null
      p.health = Math.min(MAX_HEALTH, p.health + def.amount)
      return { sfx: 'health' }
    case 'armor':
      if (p.armor >= MAX_ARMOR) return null
      p.armor = Math.min(MAX_ARMOR, p.armor + def.amount)
      return { sfx: 'health' }
    case 'ammo': {
      const cap = AMMO[def.ammo]?.max ?? 99
      if ((g.ammo[def.ammo] ?? 0) >= cap) return null
      g.ammo[def.ammo] = Math.min(cap, (g.ammo[def.ammo] ?? 0) + def.amount)
      return { sfx: 'ammo' }
    }
    case 'gold':
      g.goldLevel += def.amount; g.gold += def.amount
      return { sfx: 'gold', gold: def.amount }
    case 'key':
      p.keys[def.color] = true
      return { sfx: 'key', key: def.color }
    case 'weapon':
      g.ownedWeapons.add(def.weapon)
      p.weapon = def.weapon
      return { sfx: 'weapon', weapon: def.weapon }
    case 'upgrade':
      g.temp[def.stat] = Math.min(2, (g.temp[def.stat] || 0) + 1)
      return { sfx: 'weapon', upgrade: def.stat }
    case 'buff':
      g.temp.bloodCurse = true
      g.buffTimers.bloodCurse = def.duration
      return { sfx: 'curse', buff: def.buff }
    default:
      return { sfx: 'gold' }
  }
}
