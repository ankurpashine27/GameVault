/**
 * 2048 BackgroundSelector — inline component for selecting background.
 */

import { BACKGROUNDS } from './constants.js'

export default function BackgroundSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white/70 mb-1">Background</label>
      <div className="flex flex-wrap gap-2">
        {BACKGROUNDS.map(bg => (
          <button
            key={bg.id}
            onClick={() => onChange(bg.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${value === bg.id
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            {bg.name}
          </button>
        ))}
      </div>
    </div>
  )
}
