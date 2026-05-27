import { useState, useRef, useEffect } from 'react'
import { isTouchDevice } from './utils.js'

export default function GuessInput({ onSubmit, disabled, shakeInput }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  // Auto-focus on desktop only
  useEffect(() => {
    if (!disabled && !isTouchDevice()) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <div className={shakeInput ? 'nexus-shake' : ''}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Type your guess…"
          disabled={disabled}
          className="flex-1 bg-vault-surface border border-vault-border rounded-lg px-4 py-2.5
            text-white placeholder-text-secondary focus:border-violet-400 focus:outline-none
            transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40
            disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors
            active:scale-95"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
