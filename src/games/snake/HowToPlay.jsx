import { POWER_UP_TYPES, DIFFICULTIES } from './constants.js'

const DIFFICULTY_COLORS = {
  casual:   '#22c55e',
  classic:  '#f59e0b',
  hardcore: '#ef4444',
  insane:   '#a855f7',
}

const DIFFICULTY_EXTRAS = {
  casual:   'Walls wrap around',
  classic:  'Lethal walls',
  hardcore: 'Lethal walls + static obstacles',
  insane:   'Lethal walls + obstacles that move every 3 s',
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a7a54] mb-2.5">
        {title}
      </p>
      {children}
    </div>
  )
}

function KeyChip({ children }) {
  return (
    <kbd className="inline-block bg-[#0d1e10] border border-[rgba(34,197,94,0.3)]
      px-1.5 py-0.5 rounded font-mono text-[11px] text-green-300/70 leading-none">
      {children}
    </kbd>
  )
}

export default function HowToPlay({ onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#060e08] animate-fadeIn overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
        border-b border-[rgba(34,197,94,0.25)] flex-shrink-0 bg-[#0d1e10]">
        <h2 className="font-heading text-lg font-bold snake-gradient-text">How to Play</h2>
        <button
          onClick={onClose}
          className="text-[#4a7a54] hover:text-green-300 transition-colors
            w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#193d22] text-lg"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-6">

          {/* Goal */}
          <Section title="The Goal">
            <p className="text-sm text-green-300/70 leading-relaxed">
              Guide your snake to eat food and grow as long as possible.
              Don't hit walls (in most difficulties) or your own body — or it's game over.
              Grab power-ups for big advantages and bonus points.
            </p>
          </Section>

          {/* Controls */}
          <Section title="Controls">
            <div className="flex flex-col gap-2">
              {[
                { keys: ['↑', '↓', '←', '→'], label: 'Steer the snake' },
                { keys: ['W', 'A', 'S', 'D'],  label: 'Also steers (WASD)' },
                { keys: ['Esc'],               label: 'Pause / Resume' },
                { keys: ['Shift', 'Esc'],       label: 'Exit to catalog' },
              ].map(({ keys, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-32 flex-shrink-0">
                    {keys.map(k => <KeyChip key={k}>{k}</KeyChip>)}
                  </div>
                  <span className="text-sm text-green-300/70">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-32 flex-shrink-0">
                  <span className="text-xs text-[#4a7a54] italic">Swipe</span>
                </div>
                <span className="text-sm text-green-300/70">Steer on touch screens</span>
              </div>
            </div>
          </Section>

          {/* Power-ups */}
          <Section title="Power-Ups">
            <p className="text-xs text-[#4a7a54] mb-3">
              Power-ups appear on the board between 10–20 s apart. Eat them before they disappear!
            </p>
            <div className="flex flex-col gap-2">
              {Object.values(POWER_UP_TYPES).map(pu => (
                <div
                  key={pu.id}
                  className="flex items-start gap-3 p-3 rounded-xl border"
                  style={{
                    borderColor: pu.color + '33',
                    backgroundColor: pu.color + '0d',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center
                      text-lg flex-shrink-0 font-bold"
                    style={{ backgroundColor: pu.color + '22', color: pu.color }}
                  >
                    {pu.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-sm font-semibold font-heading"
                        style={{ color: pu.color }}
                      >
                        {pu.label}
                      </span>
                      {pu.points > 0 && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: pu.color + '22', color: pu.color }}
                        >
                          +{pu.points} pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4a7a54] leading-relaxed">
                      {pu.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Difficulties */}
          <Section title="Difficulty Modes">
            <div className="flex flex-col gap-2">
              {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                <div key={key} className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: DIFFICULTY_COLORS[key] }}
                  />
                  <div>
                    <span
                      className="text-sm font-semibold font-heading"
                      style={{ color: DIFFICULTY_COLORS[key] }}
                    >
                      {diff.name}
                    </span>
                    <span className="text-xs text-[#4a7a54] ml-2">×{diff.multiplier} score</span>
                    <p className="text-xs text-[#4a7a54] mt-0.5">{DIFFICULTY_EXTRAS[key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Scoring */}
          <Section title="Scoring">
            <div className="flex flex-col gap-1.5 text-sm">
              {[
                ['Regular food',    '+10 pts × difficulty multiplier'],
                ['⭐ Bonus Food',    '+50 pts × multiplier'],
                ['⚡ Speed Boost',  '+30 pts × multiplier on pickup'],
                ['💊 Shrink Pill',  '+20 pts × multiplier on pickup'],
                ['×2 Score active', 'All pts doubled for 8 s'],
              ].map(([item, desc]) => (
                <div key={item} className="flex justify-between gap-4">
                  <span className="text-green-300/70">{item}</span>
                  <span className="text-[#4a7a54] text-right text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Tips */}
          <Section title="Pro Tips">
            <ul className="flex flex-col gap-1.5 text-sm text-green-300/70">
              {[
                'Activate ×2 Score right before a cluster of food for a big points burst.',
                'Eat a Shrink Pill when cornered — it buys you 3 extra squares of space.',
                'The Shield only absorbs ONE hit; after that, it\'s gone.',
                'On Insane, obstacles shift every 3 s — plan your path ahead.',
                'Larger grids mean more room to manoeuvre and higher possible scores.',
              ].map(tip => (
                <li key={tip} className="flex gap-2 items-start leading-relaxed">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">›</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Section>

          <div className="pb-2" />
        </div>
      </div>
    </div>
  )
}
