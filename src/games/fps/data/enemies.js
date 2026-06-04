/**
 * Grimhold — enemy & boss definitions. Behaviours are interpreted by enemyAI.js.
 * kind: melee | ranged | flying  (flying ignores walls for movement)
 */
export const ENEMIES = {
  cultist: {
    name: 'Cultist Guard', kind: 'ranged', hp: 45, speed: 1.7, damage: 9,
    attackRange: 9, attackDelay: 1.2, sightRange: 11, gold: 25, ammoDrop: 'ball',
    sprite: 'cultist', scale: 1.0, proj: 'bullet', patrols: true,
  },
  skeleton: {
    name: 'Skeleton Warrior', kind: 'melee', hp: 35, speed: 2.6, damage: 12,
    attackRange: 1.4, attackDelay: 0.9, sightRange: 12, gold: 18,
    sprite: 'skeleton', scale: 1.0, explosiveWeak: 2,
  },
  zombie: {
    name: 'Zombie', kind: 'melee', hp: 110, speed: 0.9, damage: 22,
    attackRange: 1.3, attackDelay: 1.4, sightRange: 6, gold: 12,
    sprite: 'zombie', scale: 1.05, headshot: 3, social: true, dropHealth: 0.35,
  },
  gargoyle: {
    name: 'Gargoyle', kind: 'flying', hp: 50, speed: 2.4, damage: 11,
    attackRange: 8, attackDelay: 1.6, sightRange: 12, gold: 22, ammoDrop: 'mana',
    sprite: 'gargoyle', scale: 1.0, proj: 'fireball', keepDist: 4,
  },
  darkknight: {
    name: 'Dark Knight', kind: 'melee', hp: 160, speed: 1.3, damage: 30,
    attackRange: 1.6, attackDelay: 1.3, sightRange: 10, gold: 60,
    sprite: 'darkknight', scale: 1.1, charges: true, blockReduce: 0.5, dropUpgrade: 0.25,
  },
  wraith: {
    name: 'Wraith', kind: 'ranged', hp: 60, speed: 1.8, damage: 14,
    attackRange: 9, attackDelay: 1.5, sightRange: 12, gold: 30, ammoDrop: 'mana',
    sprite: 'wraith', scale: 1.0, proj: 'bolt', wallPhase: true,
  },
  imp: {
    name: 'Demon Imp', kind: 'ranged', hp: 22, speed: 3.0, damage: 8,
    attackRange: 8, attackDelay: 0.7, sightRange: 11, gold: 8,
    sprite: 'imp', scale: 0.8, proj: 'fireball', zigzag: true,
  },
  cultist_death: {
    name: 'Death Cultist', kind: 'ranged', hp: 55, speed: 1.6, damage: 8,
    attackRange: 10, attackDelay: 1.4, sightRange: 12, gold: 35, ammoDrop: 'flasks',
    sprite: 'deathcultist', scale: 1.05, proj: 'bolt', healer: true, keepDist: 6,
  },
}

export const BOSSES = {
  the_count: {
    name: 'The Count', kind: 'melee', hp: 800, speed: 1.8, damage: 26,
    attackRange: 1.8, attackDelay: 1.0, sightRange: 30, gold: 600,
    sprite: 'count', scale: 1.9, boss: true, music: 'boss',
    phases: 2, teleports: true, summon: { p1: 'cultist', p2: 'gargoyle', every: 18, count: 2 },
    dropKey: 'rune',
  },
  the_lich: {
    name: 'The Lich', kind: 'ranged', hp: 950, speed: 1.2, damage: 18,
    attackRange: 14, attackDelay: 1.1, sightRange: 30, gold: 800,
    sprite: 'lich', scale: 1.9, boss: true, music: 'boss', proj: 'bolt',
    phases: 2, flies: true, spread: { p1: 3, p2: 5 }, summon: { p1: 'skeleton', p2: 'wraith', every: 15, count: 3 },
    dropKey: 'rune',
  },
  demon_lord: {
    name: 'Demon Lord', kind: 'ranged', hp: 1500, speed: 1.4, damage: 34,
    attackRange: 16, attackDelay: 1.2, sightRange: 30, gold: 1200,
    sprite: 'demonlord', scale: 2.4, boss: true, music: 'boss', proj: 'bigfireball',
    phases: 3, stomp: true, spread: { p2: 7, p3: 7 }, summon: { p1: 'imp', p2: 'imp', every: 12, count: 2 },
    final: true,
  },
}

export const isBossType = (t) => !!BOSSES[t]
export const getEnemyDef = (t) => ENEMIES[t] || BOSSES[t] || null
