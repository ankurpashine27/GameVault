/**
 * Grimhold — achievement definitions. Evaluated against persistent stats/run flags.
 */
export const ACHIEVEMENTS = [
  { id: 'first_blood',    name: 'First Blood',      desc: 'Kill your first enemy.', cat: 'Campaign' },
  { id: 'ep1',            name: 'The Outer Walls',  desc: 'Complete Episode 1.', cat: 'Campaign' },
  { id: 'ep2',            name: 'The Catacombs',    desc: 'Complete Episode 2.', cat: 'Campaign' },
  { id: 'full_campaign',  name: 'Full Campaign',    desc: 'Complete all 3 episodes.', cat: 'Campaign' },
  { id: 'pacifist',       name: 'Pacifist Run',     desc: 'Complete a level without firing a ranged weapon.', cat: 'Campaign' },
  { id: 'speedrun',       name: 'Speed Run',        desc: 'Complete any level under par time.', cat: 'Campaign' },
  { id: 'secret_finder',  name: 'Secret Finder',    desc: 'Find your first secret.', cat: 'Exploration' },
  { id: 'secret_master',  name: 'Secret Master',    desc: 'Find all secrets in one level.', cat: 'Exploration' },
  { id: 'treasure',       name: 'Treasure Hunter',  desc: 'Collect 5000 total gold.', cat: 'Exploration' },
  { id: 'headhunter',     name: 'Headhunter',       desc: 'Kill 100 enemies total.', cat: 'Combat' },
  { id: 'exterminator',   name: 'Exterminator',     desc: 'Complete a level with 100% kills.', cat: 'Combat' },
  { id: 'boss_slayer',    name: 'Boss Slayer',      desc: 'Defeat any boss.', cat: 'Combat' },
  { id: 'demon_slayer',   name: 'Demon Slayer',     desc: 'Defeat the Demon Lord.', cat: 'Combat' },
  { id: 'armed',          name: 'Armed to the Teeth', desc: 'Own all 8 weapons in one run.', cat: 'Weapons' },
  { id: 'powder_keg',     name: 'Powder Keg',       desc: 'Kill 3 enemies with one barrel.', cat: 'Weapons' },
  { id: 'nightmare_ep',   name: 'Nightmare Survivor', desc: 'Complete any episode on Nightmare.', cat: 'Difficulty' },
  { id: 'endless_10',     name: 'Endless Novice',   desc: 'Reach floor 10 in Endless.', cat: 'Endless' },
  { id: 'endless_25',     name: 'Endless Master',   desc: 'Reach floor 25 in Endless.', cat: 'Endless' },
]
