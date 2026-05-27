import { useState } from 'react'
import { MODES, SCORE_TABLE } from './constants.js'

const MODE_DETAILS = {
  classic: {
    rules: [
      'One puzzle is selected at random.',
      'The first hint is revealed. Guess the hidden category.',
      'A wrong guess reveals the next hint and deducts points from your max score.',
      'All 5 hints wrong = round over, answer revealed.',
    ],
  },
  streak: {
    rules: [
      'Puzzles chain one after another.',
      'A wrong or failed round ends your streak.',
      'Your score accumulates across all correct guesses.',
      'How long can you go?',
    ],
  },
  time_attack: {
    rules: [
      '10 puzzles, 2 minutes on the clock.',
      'Solve as many as you can before time runs out.',
      'Correct answers earn score + a time bonus for each second remaining.',
      'Results auto-advance after 1.5 seconds.',
    ],
  },
  reverse: {
    rules: [
      'All 5 hints are shown at once — the most obvious clue is last.',
      'You only get 2 wrong guesses before you fail.',
      'First correct guess: 500 pts. Second correct guess: 250 pts.',
    ],
  },
  filter: {
    rules: [
      'Choose a specific theme to practice.',
      'Only puzzles from that theme will appear.',
      'Scoring is the same as Classic mode.',
    ],
  },
  daily: {
    rules: [
      'One puzzle per day — the same for every player worldwide.',
      'Your result is saved. Come back tomorrow for a new puzzle.',
      'Share your result with the emoji card.',
      'Build your daily streak by playing every day!',
    ],
  },
}

const TABS = Object.values(MODES).map(m => m.name)

export default function HowToPlay({ onClose }) {
  const [tab, setTab] = useState(0)
  const modeId = Object.keys(MODES)[tab]
  const modeData = MODE_DETAILS[modeId]
  const modeInfo = MODES[modeId]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      backdrop-blur-sm bg-black/70 p-4">
      <div className="bg-vault-surface border border-vault-border rounded-2xl
        w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">? How to Play</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Core mechanic */}
        <div className="px-5 pb-4 flex-shrink-0">
          <div className="bg-vault-bg rounded-xl p-4 border border-vault-border space-y-2">
            <p className="text-white text-sm font-semibold">The Core Mechanic</p>
            <p className="text-text-secondary text-sm">
              5 hint words point to a hidden <span className="text-violet-300 font-medium">category</span>.
              They're ordered from hardest to easiest — so Hint 1 is the hardest clue
              and Hint 5 is the most obvious.
            </p>
            {/* Mock hint cards */}
            <div className="space-y-1 pt-1">
              {['Hint 1', 'Hint 2', 'Hint 3', 'Hint 4', 'Hint 5'].map((h, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                  ${i < 2 ? 'bg-violet-900/20 border border-violet-500/30' : 'bg-vault-surface border border-vault-border'}`}>
                  <span className="text-text-secondary font-mono w-10">{h}</span>
                  {i < 2
                    ? <span className="text-white font-medium">{i === 0 ? 'Ocelot' : 'Snow Leopard'}</span>
                    : <span className="text-text-secondary italic">— hidden —</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scoring */}
        <div className="px-5 pb-4 flex-shrink-0">
          <div className="bg-vault-bg rounded-xl p-4 border border-vault-border">
            <p className="text-white text-sm font-semibold mb-2">Scoring</p>
            <div className="grid grid-cols-5 gap-1">
              {SCORE_TABLE.map((pts, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-text-secondary">Hint {i + 1}</p>
                  <p className={`font-bold text-sm ${i === 0 ? 'text-green-400' : i === 4 ? 'text-red-400' : 'text-violet-300'}`}>
                    {pts}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-vault-border overflow-x-auto flex-shrink-0">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex-shrink-0 px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap
                ${tab === i
                  ? 'text-violet-300 border-b-2 border-violet-400'
                  : 'text-text-secondary hover:text-white'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Mode rules */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <p className="text-white font-semibold">{modeInfo.name}</p>
          <p className="text-text-secondary text-sm">{modeInfo.description}</p>
          <ul className="space-y-2">
            {modeData.rules.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>

          {/* Daily streak note */}
          {modeId === 'daily' && (
            <div className="bg-violet-900/20 border border-violet-500/20 rounded-lg p-3 mt-2">
              <p className="text-violet-300 text-xs font-semibold mb-1">Daily Streak</p>
              <p className="text-text-secondary text-xs">
                Play on consecutive days to grow your streak. Missing a day resets it to 0.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
