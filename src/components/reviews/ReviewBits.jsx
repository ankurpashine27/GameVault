/**
 * Small presentational helpers shared across the Reviews pages.
 */
import { Link } from 'react-router-dom'
import { TAG_META, STATUS_META, getReviews } from '@/lib/reviewsStore'

/** Render text, turning "#N" references into links to that conversation. */
export function RichText({ text, className = '' }) {
  if (!text) return null
  const byRef = new Map(getReviews().map(r => [r.ref, r.id]))
  const parts = []
  const re = /#(\d+)/g
  let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const ref = parseInt(m[1], 10)
    const id = byRef.get(ref)
    parts.push(id
      ? <Link key={m.index} to={`/reviews/${id}`} className="text-accent-blue hover:underline font-semibold">#{ref}</Link>
      : `#${ref}`)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <span className={`whitespace-pre-wrap break-words ${className}`}>{parts}</span>
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30); if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

export function TagChip({ tag, active, onClick, size = 'sm' }) {
  const meta = TAG_META[tag] || { color: '#8b949e', emoji: '🏷️' }
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${pad}
        transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        color: meta.color,
        background: active === false ? 'transparent' : `${meta.color}22`,
        border: `1px solid ${active === false ? '#30363d' : meta.color + '66'}`,
        ...(active === false ? { color: '#8b949e' } : {}),
      }}>
      <span aria-hidden>{meta.emoji}</span>{tag}
    </Comp>
  )
}

export function StatusBadge({ status, size = 'sm' }) {
  if (!status) return null
  const meta = STATUS_META[status] || { color: '#8b949e' }
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${pad}`}
      style={{ color: meta.color, background: `${meta.color}1f`, border: `1px solid ${meta.color}66` }}>
      <span className="text-[8px] leading-none" style={{ color: meta.color }}>●</span>
      {status}
    </span>
  )
}
