export default function HintCard({ index, text, revealed, animateIn }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors
        ${revealed
          ? 'border-violet-500/40 bg-violet-900/20'
          : 'border-vault-border bg-vault-surface/50'
        }`}
    >
      <span className="text-xs font-mono text-text-secondary w-14 flex-shrink-0">
        Hint {index + 1}
      </span>
      {revealed ? (
        <span className={`font-semibold text-white ${animateIn ? 'nexus-slide-in' : ''}`}>
          {text}
        </span>
      ) : (
        <span className="text-text-secondary italic text-sm">— hidden —</span>
      )}
    </div>
  )
}
