import { AVATAR_GROUPS } from './constants.js'

export default function AvatarSelector({ selectedAvatar, onSelect, disabledAvatars = [], playerColor }) {
  return (
    <div className="flex flex-col gap-3">
      {AVATAR_GROUPS.map(({ group, avatars }) => (
        <div key={group}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">{group}</p>
          <div className="flex gap-1.5 flex-wrap">
            {avatars.map(av => {
              const isSelected = av === selectedAvatar
              const isDisabled = disabledAvatars.includes(av)
              return (
                <button
                  key={av}
                  onClick={() => !isDisabled && onSelect(av)}
                  disabled={isDisabled}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center
                    transition-all duration-150 select-none
                    ${isDisabled
                      ? 'opacity-25 cursor-not-allowed bg-vault-elevated'
                      : isSelected
                        ? 'scale-110 shadow-lg border-2'
                        : 'bg-vault-elevated hover:bg-vault-muted border border-vault-border hover:scale-105 cursor-pointer'
                    }`}
                  style={isSelected ? {
                    borderColor: playerColor,
                    backgroundColor: playerColor + '22',
                    boxShadow: `0 0 10px ${playerColor}55`,
                  } : undefined}
                  title={isDisabled ? 'Already chosen by the other player' : av}
                >
                  {av}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
