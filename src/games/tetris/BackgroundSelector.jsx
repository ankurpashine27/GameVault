import { BG_IDS, BG_LABELS } from './constants.js'

const BG_COLORS = {
  classic_dark:  'from-gray-900 to-gray-950',
  deep_space:    'from-blue-950 to-indigo-950',
  neon_city:     'from-fuchsia-950 to-purple-950',
  aurora:        'from-emerald-950 to-cyan-950',
  underwater:    'from-blue-900 to-cyan-950',
  lava_cave:     'from-red-950 to-orange-950',
  matrix:        'from-green-950 to-black',
  forest_night:  'from-green-950 to-gray-950',
}

export default function BackgroundSelector({ selected, onSelect, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="bg-gray-900/95 border border-white/15 rounded-2xl px-5 py-5 w-80 flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-white font-black text-lg">🌌 Backgrounds</div>
          <button onClick={onClose} className="text-white/50 hover:text-white/80 text-xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {BG_IDS.map(id => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                selected === id
                  ? 'border-purple-400 bg-purple-900/30'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex-shrink-0 bg-gradient-to-br ${BG_COLORS[id] ?? 'from-gray-800 to-gray-900'}`} />
              <span className="text-white text-[11px] leading-tight text-left">{BG_LABELS[id]}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-sm transition-colors mt-1"
        >
          ✓ Done
        </button>
      </div>
    </div>
  )
}
