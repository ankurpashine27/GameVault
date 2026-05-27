import { SKINS } from './constants.js'

function MiniSnake({ skin }) {
  const segments = [skin.head, skin.body, skin.body, skin.body, skin.tail]
  return (
    <div className="flex items-center gap-0.5 justify-center py-1">
      {segments.map((color, i) => (
        <div
          key={i}
          style={{
            width: i === 0 ? 14 : 11,
            height: i === 0 ? 14 : 11,
            backgroundColor: color,
            borderRadius: i === 0 ? '4px 40% 40% 4px' : i === segments.length - 1 ? '40%' : '3px',
            boxShadow: i === 0 && skin.glow ? `0 0 6px ${skin.glow}` : undefined,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

export default function SkinSelector({ selectedSkin, onSelect }) {
  const skinList = Object.values(SKINS)

  return (
    <div className="grid grid-cols-4 gap-2">
      {skinList.map(skin => {
        const isSelected = skin.id === selectedSkin
        return (
          <button
            key={skin.id}
            onClick={() => onSelect(skin.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-150
              ${isSelected
                ? 'border-accent-blue bg-accent-blue/10 shadow-glow-sm'
                : 'border-vault-border bg-vault-surface hover:border-vault-muted hover:bg-vault-elevated'
              }`}
          >
            <MiniSnake skin={skin} />
            <span className={`text-xs font-medium ${isSelected ? 'text-accent-blue' : 'text-text-secondary'}`}>
              {skin.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
