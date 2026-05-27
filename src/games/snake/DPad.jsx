export default function DPad({ onDirection }) {
  const btn = (dir, label, extraClass = '') => (
    <button
      onPointerDown={(e) => { e.preventDefault(); onDirection(dir) }}
      className={`flex items-center justify-center w-12 h-12 rounded-lg
        bg-vault-elevated border border-vault-border
        text-text-secondary hover:text-text-primary hover:bg-vault-muted
        active:bg-vault-border active:scale-95
        transition-all duration-100 select-none touch-none text-lg font-bold
        ${extraClass}`}
      aria-label={dir}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col items-center gap-1 py-3">
      <div>{btn('UP',    '↑')}</div>
      <div className="flex gap-1">
        {btn('LEFT',  '←')}
        <div className="w-12 h-12" /> {/* center spacer */}
        {btn('RIGHT', '→')}
      </div>
      <div>{btn('DOWN', '↓')}</div>
    </div>
  )
}
