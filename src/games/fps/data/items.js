/**
 * Grimhold — pickup definitions. Maps entity `type` → pickup behaviour.
 */
export const ITEMS = {
  // Health / armor
  health_small:  { kind: 'health', amount: 15, sprite: 'health_small' },
  health_large:  { kind: 'health', amount: 40, sprite: 'health_large' },
  armor_shard:   { kind: 'armor',  amount: 25, sprite: 'armor' },
  armor_full:    { kind: 'armor',  amount: 75, sprite: 'armor' },
  // Ammo
  ammo_balls:    { kind: 'ammo', ammo: 'ball',   amount: 12, sprite: 'ammo_ball' },
  ammo_shells:   { kind: 'ammo', ammo: 'shells', amount: 6,  sprite: 'ammo_shell' },
  ammo_bolts:    { kind: 'ammo', ammo: 'bolts',  amount: 5,  sprite: 'ammo_bolt' },
  ammo_flasks:   { kind: 'ammo', ammo: 'flasks', amount: 3,  sprite: 'ammo_flask' },
  ammo_cannon:   { kind: 'ammo', ammo: 'cannon', amount: 2,  sprite: 'ammo_cannon' },
  mana_crystal:  { kind: 'ammo', ammo: 'mana',   amount: 25, sprite: 'mana' },
  // Gold
  gold_pile:     { kind: 'gold', amount: 50,  sprite: 'gold' },
  gold_gem:      { kind: 'gold', amount: 150, sprite: 'gem' },
  treasure:      { kind: 'gold', amount: 400, sprite: 'chest' },
  // Keys
  key_red:       { kind: 'key', color: 'R', sprite: 'key_red' },
  key_blue:      { kind: 'key', color: 'B', sprite: 'key_blue' },
  key_yellow:    { kind: 'key', color: 'Y', sprite: 'key_yellow' },
  rune_key:      { kind: 'key', color: 'rune', sprite: 'key_rune' },
  // Weapons (as pickups)
  blunderbuss:   { kind: 'weapon', weapon: 'blunderbuss', sprite: 'w_blunderbuss' },
  crossbow:      { kind: 'weapon', weapon: 'crossbow', sprite: 'w_crossbow' },
  musket:        { kind: 'weapon', weapon: 'musket', sprite: 'w_musket' },
  flask:         { kind: 'weapon', weapon: 'flask', sprite: 'w_flask' },
  staff:         { kind: 'weapon', weapon: 'staff', sprite: 'w_staff' },
  cannon:        { kind: 'weapon', weapon: 'cannon', sprite: 'w_cannon' },
  // Temp/run upgrades
  sharpening:    { kind: 'upgrade', stat: 'damageTier', sprite: 'up_dmg' },
  powder:        { kind: 'upgrade', stat: 'firerateTier', sprite: 'up_fr' },
  bandolier:     { kind: 'upgrade', stat: 'capacityTier', sprite: 'up_cap' },
  blood_curse:   { kind: 'buff', buff: 'bloodCurse', duration: 30, sprite: 'curse' },
  // Decorations / hazards
  torch_deco:    { kind: 'deco', sprite: 'torch', anim: true, light: true },
  skull_deco:    { kind: 'deco', sprite: 'skull' },
  barrel:        { kind: 'barrel', hp: 1, sprite: 'barrel' },
  pillar:        { kind: 'deco', sprite: 'pillar', solid: true },
}

export const getItem = (type) => ITEMS[type] || null
