import { useState } from 'react'
import { dailyEmoji } from './utils.js'

export default function DailyShareCard({ hintsUsed, correct, dayNumber }) {
  const [copied, setCopied] = useState(false)
  const emoji = dailyEmoji(hintsUsed, correct)

  const text = [
    `Nexus Daily #${dayNumber} ${emoji}`,
    correct
      ? `✅ Solved in ${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}!`
      : '❌ Didn\'t get it today',
    'Play at gamevault.app',
  ].join('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(text)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="text-center space-y-3">
      <div className="text-5xl">{emoji}</div>
      <pre className="text-sm text-text-secondary whitespace-pre-line font-mono
        bg-vault-surface rounded-lg px-4 py-3 border border-vault-border">
        {text}
      </pre>
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 active:scale-95 rounded-lg
          text-sm font-semibold text-white transition-all"
      >
        {copied ? '✓ Copied!' : '📋 Copy Result'}
      </button>
    </div>
  )
}
