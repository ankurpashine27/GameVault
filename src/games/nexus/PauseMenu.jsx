export default function PauseMenu({ onResume, onQuit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      backdrop-blur-sm bg-black/60">
      <div className="nexus-pop bg-vault-surface border border-vault-border rounded-2xl
        p-8 w-80 text-center shadow-2xl space-y-4">
        <h2 className="text-2xl font-bold text-white">Paused</h2>
        <p className="text-text-secondary text-sm">Game is paused</p>

        <div className="space-y-3 pt-2">
          <button
            onClick={onResume}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-95
              rounded-lg font-semibold text-white transition-all"
          >
            ▶ Resume
          </button>
          <button
            onClick={onQuit}
            className="w-full py-2.5 bg-vault-surface hover:bg-vault-border active:scale-95
              rounded-lg font-semibold text-text-secondary transition-all
              border border-vault-border"
          >
            Quit to Menu
          </button>
        </div>

        <p className="text-text-secondary text-xs pt-1">
          Press <kbd className="px-1.5 py-0.5 bg-vault-bg rounded text-xs font-mono">Esc</kbd> to resume
        </p>
      </div>
    </div>
  )
}
