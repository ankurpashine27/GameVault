import { useState, useRef, useEffect } from 'react'

export default function TimerBar({ totalSeconds, onExpire }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())
  const rafRef   = useRef(null)
  const firedRef = useRef(false)

  useEffect(() => {
    startRef.current = Date.now()
    firedRef.current = false

    const tick = () => {
      const e = (Date.now() - startRef.current) / 1000
      if (e >= totalSeconds) {
        setElapsed(totalSeconds)
        if (!firedRef.current) {
          firedRef.current = true
          onExpire()
        }
        return
      }
      setElapsed(e)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [totalSeconds, onExpire])

  const remaining = Math.max(0, totalSeconds - elapsed)
  const pct       = (remaining / totalSeconds) * 100
  const urgent    = remaining < 20

  return (
    <div className="px-4 pb-2">
      <div className="flex justify-between text-xs mb-1">
        <span
          className={urgent
            ? `text-red-400 font-bold ${remaining < 10 ? 'nexus-timer-pulse' : ''}`
            : 'text-text-secondary'}
        >
          {Math.ceil(remaining)}s
        </span>
        <span className="text-text-secondary font-medium tracking-wide">Time Attack</span>
      </div>
      <div className="h-1.5 bg-vault-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-none ${urgent ? 'bg-red-500' : 'bg-violet-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
