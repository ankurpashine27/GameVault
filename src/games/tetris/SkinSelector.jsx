import { SKIN_IDS, SKIN_LABELS } from './constants.js'
import { getPieceGrid } from './engine/tetrominoes.js'

const SKIN_PREVIEW_COLOR = {
  classic:    '#00f0f0',
  neon:       '#00ffff',
  crystal:    '#88eeff',
  retro:      '#00c8c8',
  metallic:   '#aabbcc',
  pastel:     '#aaeeff',
  monochrome: '#dddddd',
  wireframe:  '#00f0f0',
}

export default function SkinSelector({ selected, onSelect, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="bg-gray-900/95 border border-white/15 rounded-2xl px-5 py-5 w-80 flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-white font-black text-lg">🎨 Block Skins</div>
          <button onClick={onClose} className="text-white/50 hover:text-white/80 text-xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SKIN_IDS.map(id => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                selected === id
                  ? 'border-purple-400 bg-purple-900/30'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div
                className="w-5 h-5 rounded-sm flex-shrink-0"
                style={{
                  background: SKIN_PREVIEW_COLOR[id],
                  border: id === 'wireframe' ? `2px solid ${SKIN_PREVIEW_COLOR[id]}` : undefined,
                  backgroundColor: id === 'wireframe' ? 'transparent' : SKIN_PREVIEW_COLOR[id],
                  opacity: id === 'crystal' ? 0.75 : 1,
                }}
              />
              <span className="text-white text-xs">{SKIN_LABELS[id]}</span>
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
