/**
 * 2048 ThemeSelector — inline component for selecting tile theme.
 */

import { TILE_THEMES } from './constants.js'

export default function ThemeSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white/70 mb-1">Tile Theme</label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(TILE_THEMES).map(([id, theme]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${value === id
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  )
}
