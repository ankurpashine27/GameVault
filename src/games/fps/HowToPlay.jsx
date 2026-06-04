/**
 * Grimhold — How to Play: controls + HUD/icon legend + enemy & pickup guide.
 */
export default function HowToPlay({ onClose, onTutorial }) {
  return (
    <div className="absolute inset-0 overflow-y-auto p-4" style={{ background: 'radial-gradient(circle at 50% 10%, #1a0510, #06030a 70%)' }}>
      <div className="max-w-2xl mx-auto text-white/85">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl font-black text-red-400">How to Play</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm">✕ Close</button>
        </div>

        <Section title="Controls">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <Row k="W A S D" v="Move / strafe" />
            <Row k="Mouse" v="Look / aim (click to lock)" />
            <Row k="Left-Click / Space" v="Fire" />
            <Row k="E" v="Open doors · push secret walls" />
            <Row k="1 – 8" v="Select weapon" />
            <Row k="R" v="Reload" />
            <Row k="Shift" v="Sprint (uses stamina)" />
            <Row k="Tab / Map" v="Toggle minimap" />
            <Row k="Esc" v="Pause" />
            <Row k="Arrow keys" v="Turn (if mouse-lock unavailable)" />
          </div>
        </Section>

        <Section title="The HUD">
          <Legend items={[
            ['🙂', 'Health face — your condition at a glance (grins when healthy, bloodied when hurt)'],
            ['HEALTH %', 'Hit points. 0 = death. No regen — find health pickups.'],
            ['▣', 'Armor — absorbs 50% of incoming damage while it lasts.'],
            ['24/60', 'Ammo in reserve for the current weapon (∞ = the Dagger).'],
            ['⚷', 'Keys you hold (red / blue / yellow). ✦ = rune key.'],
            ['●', 'Gold — spend it in the Armory between levels.'],
            ['♥ 3', 'Lives. Die with lives left and you respawn; 0 = game over.'],
            ['0/9 kills · 0/2 ◈', 'Kills and secrets found this level.'],
          ]} />
        </Section>

        <Section title="Doors, Keys & Secrets">
          <ul className="text-sm space-y-1 list-disc list-inside text-white/75">
            <li>Face a door and press <b>E</b> to open it.</li>
            <li><span className="text-red-400">Red</span> / <span className="text-sky-400">blue</span> / <span className="text-yellow-400">yellow</span> doors show a coloured badge and need the matching <b>key</b> — grab it first (it appears as ⚷ in your HUD), then press E at the door.</li>
            <li><b>Secret walls</b> look identical to normal walls — press <b>E</b> against suspicious dead-ends to reveal hidden rewards.</li>
            <li>The <span className="text-emerald-400">green</span> dot on the minimap is the level exit.</li>
          </ul>
        </Section>

        <Section title="Pickups">
          <Legend items={[
            ['✚ red', 'Health'],
            ['◆ blue', 'Armor'],
            ['▣ box', 'Ammo (matches a weapon)'],
            ['● gold / 💎 gem / 🧰 chest', 'Gold (chests & gems hide in secrets)'],
            ['glowing orb', 'Run upgrade — more damage, fire rate or capacity'],
            ['🛢 barrel', 'Explosive — shoot it to blast nearby enemies (mind the splash!)'],
          ]} />
        </Section>

        <Section title="Know your enemy">
          <Legend items={[
            ['Cultist', 'Patrols, fires from range. Drops ammo.'],
            ['Skeleton', 'Fast melee. Weak to explosives.'],
            ['Zombie', 'Slow but tough. Aim for the head (3× damage).'],
            ['Gargoyle / Imp', 'Fly and lob fireballs — keep moving.'],
            ['Dark Knight', 'Heavily armoured; charges. Hit it between charges.'],
            ['Wraith', 'Phases through walls. Strike when solid.'],
            ['Death Cultist', 'Heals other enemies — kill it first.'],
          ]} />
        </Section>

        <div className="flex gap-2 mt-6 mb-4">
          {onTutorial && <button onClick={onTutorial} className="flex-1 py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold">▶ Play the Tutorial</button>}
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-black/40 border border-white/10 text-white/80 hover:text-white">Back</button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5 bg-black/25 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm uppercase tracking-wider text-red-300/80 mb-2 font-bold">{title}</h3>
      {children}
    </div>
  )
}
function Row({ k, v }) {
  return <><span className="text-amber-300 font-mono">{k}</span><span className="text-white/70">{v}</span></>
}
function Legend({ items }) {
  return (
    <div className="space-y-1.5 text-sm">
      {items.map(([icon, desc], i) => (
        <div key={i} className="flex gap-3">
          <span className="text-white/90 font-bold min-w-[7rem] flex-shrink-0">{icon}</span>
          <span className="text-white/65">{desc}</span>
        </div>
      ))}
    </div>
  )
}
