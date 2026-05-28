import { COLLECTIONS } from './constants.js'

export default function CollectionPanel({ collectedItems, onClose }) {
  const collected = collectedItems || {}

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-slate-900/95 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-black">💎 Collections</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {COLLECTIONS.map(set => {
          const itemsDone = set.items.filter(i => collected[i.id]).length
          const setDone   = itemsDone === set.items.length
          const pct       = (itemsDone / set.items.length) * 100

          return (
            <div
              key={set.id}
              className={`rounded-xl border p-3 ${
                setDone
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Set header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={`font-bold text-sm ${setDone ? 'text-purple-300' : 'text-white/80'}`}>
                    {setDone ? '🎁 ' : ''}{set.name}
                  </span>
                  <span className="text-white/40 text-xs ml-2">{itemsDone}/{set.items.length}</span>
                </div>
                {setDone && (
                  <span className="text-xs text-purple-400 font-semibold">Complete!</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${setDone ? 'bg-purple-400' : 'bg-sky-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Items grid */}
              <div className="grid grid-cols-6 gap-1.5">
                {set.items.map(item => {
                  const got = !!collected[item.id]
                  return (
                    <div
                      key={item.id}
                      title={item.name}
                      className={`aspect-square rounded-lg flex items-center justify-center border transition-all ${
                        got
                          ? 'border-current/40 shadow-sm'
                          : 'border-white/10 bg-white/5'
                      }`}
                      style={got ? { backgroundColor: item.color + '22', borderColor: item.color + '66' } : {}}
                    >
                      {got ? (
                        <div
                          className="w-3 h-3 rounded-sm rotate-45"
                          style={{ backgroundColor: item.color }}
                        />
                      ) : (
                        <div className="w-3 h-3 rounded-sm bg-white/10" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Reward hint */}
              {!setDone && (
                <p className="text-white/30 text-xs mt-2">{set.reward}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
