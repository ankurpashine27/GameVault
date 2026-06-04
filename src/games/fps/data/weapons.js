/**
 * Grimhold — weapon definitions, ammo config, and armory pricing.
 * type: melee | hitscan | projectile | explosive
 */
export const AMMO = {
  ball:   { name: 'Ball', max: 60, start: 24 },
  shells: { name: 'Shells', max: 40, start: 8 },
  bolts:  { name: 'Bolts', max: 30, start: 6 },
  flasks: { name: 'Flasks', max: 15, start: 0 },
  mana:   { name: 'Mana', max: 100, start: 100, regen: 6 },
  cannon: { name: 'Cannonballs', max: 10, start: 0 },
}

export const WEAPONS = {
  dagger:     { slot: 1, name: 'Dagger',          type: 'melee',      ammo: null,    damage: 34,  fireDelay: 0.32, range: 1.7 },
  flintlock:  { slot: 2, name: 'Flintlock Pistol', type: 'hitscan',   ammo: 'ball',  damage: 22,  fireDelay: 0.55, clip: 1, reload: 0.85, range: 34, spread: 0.018 },
  blunderbuss:{ slot: 3, name: 'Blunderbuss',     type: 'hitscan',    ammo: 'shells', damage: 11, pellets: 6, fireDelay: 0.85, clip: 2, reload: 1.35, range: 12, spread: 0.17 },
  crossbow:   { slot: 4, name: 'Crossbow',        type: 'projectile', ammo: 'bolts', damage: 62,  fireDelay: 0.95, clip: 1, reload: 0.95, projSpeed: 9, range: 40 },
  musket:     { slot: 5, name: 'Musket',          type: 'hitscan',    ammo: 'ball',  damage: 56,  fireDelay: 0.5,  clip: 1, reload: 1.55, range: 40, spread: 0.008 },
  flask:      { slot: 6, name: 'Alchemist Flask', type: 'explosive',  ammo: 'flasks', damage: 70, splash: 2.2, fireDelay: 0.95, clip: 1, reload: 0.95, projSpeed: 5.5, arc: true },
  staff:      { slot: 7, name: 'Hellfire Staff',  type: 'projectile', ammo: 'mana',  damage: 30,  cost: 8, fireDelay: 0.33, projSpeed: 8, range: 40 },
  cannon:     { slot: 8, name: 'Cursed Cannon',   type: 'hitscan',    ammo: 'cannon', damage: 145, fireDelay: 1.7, clip: 1, reload: 2.1, range: 40, spread: 0.02 },
}

export const WEAPON_ORDER = ['dagger', 'flintlock', 'blunderbuss', 'crossbow', 'musket', 'flask', 'staff', 'cannon']
export const STARTING_WEAPONS = ['dagger', 'flintlock']

/** Armory: purchase price + the episode from which it becomes buyable. */
export const ARMORY_WEAPONS = {
  blunderbuss: { price: 400,  fromEpisode: 1 },
  crossbow:    { price: 650,  fromEpisode: 1 },
  musket:      { price: 900,  fromEpisode: 2 },
  flask:       { price: 1100, fromEpisode: 2 },
  staff:       { price: 1400, fromEpisode: 3 },
  cannon:      { price: 2600, fromEpisode: 3 },
}

/** Upgrade tracks: 2 tiers each. Multipliers applied to base stat. */
export const UPGRADES = {
  damage:   { label: 'Damage',    mult: [1.25, 1.5],  prices: [300, 600] },
  firerate: { label: 'Fire Rate', mult: [0.8, 0.6],   prices: [300, 600] }, // fireDelay × mult
  capacity: { label: 'Capacity',  mult: [1.5, 2.0],   prices: [250, 500] }, // clip/ammo max × mult
}

/** Resolve a weapon's effective stats given run upgrades + temp buffs. */
export function effectiveWeapon(id, upgrades = {}, temp = {}) {
  const base = WEAPONS[id]
  if (!base) return null
  const u = upgrades[id] || {}
  const dmgTier = (u.damage || 0) + (temp.damageTier || 0)
  const frTier = (u.firerate || 0) + (temp.firerateTier || 0)
  const capTier = (u.capacity || 0) + (temp.capacityTier || 0)
  const w = { ...base, id }
  if (dmgTier > 0) w.damage = Math.round(base.damage * UPGRADES.damage.mult[Math.min(dmgTier, 2) - 1])
  if (frTier > 0) w.fireDelay = base.fireDelay * UPGRADES.firerate.mult[Math.min(frTier, 2) - 1]
  if (base.clip && capTier > 0) w.clip = Math.round(base.clip * UPGRADES.capacity.mult[Math.min(capTier, 2) - 1])
  if (temp.bloodCurse) w.damage = Math.round(w.damage * 2)
  return w
}
