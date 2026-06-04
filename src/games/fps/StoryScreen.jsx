/**
 * Grimhold — atmospheric story panel with typed-out text.
 */
import { useState, useEffect } from 'react'

export default function StoryScreen({ title, text, onContinue, buttonLabel = 'Continue' }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const id = setInterval(() => {
      i++; setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [text])

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: '#05030a' }}>
      <div className="max-w-lg w-full border-2 rounded-xl p-8 text-center"
        style={{ borderColor: '#6a1020', boxShadow: '0 0 40px rgba(120,0,20,0.3) inset', background: 'linear-gradient(180deg,#120308,#0a0206)' }}>
        <div className="text-red-500 text-3xl mb-4">✦</div>
        <h2 className="font-heading text-2xl font-black text-red-300 mb-5 tracking-wide">{title}</h2>
        <p className="text-white/80 leading-relaxed whitespace-pre-wrap min-h-[7rem] text-sm" onClick={() => setShown(text)}>{shown}<span className="animate-pulse">▌</span></p>
        <button onClick={onContinue} className="mt-6 px-6 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold">{buttonLabel}</button>
      </div>
    </div>
  )
}
