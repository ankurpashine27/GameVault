/**
 * Reviews board — list of community conversations with filtering + create.
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReviews, TAGS, isBug } from '@/lib/reviewsStore'
import { TagChip, StatusBadge, timeAgo } from '@/components/reviews/ReviewBits'
import NewReviewModal from '@/components/reviews/NewReviewModal'

export default function ReviewsPage() {
  const reviews = useReviews()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qNum = q.replace(/^#/, '')
    return reviews
      .filter(r => filter === 'All' || r.tags.includes(filter))
      .filter(r => !q
        || r.title.toLowerCase().includes(q)
        || r.body.toLowerCase().includes(q)
        || r.author.toLowerCase().includes(q)
        || String(r.ref) === qNum
        || r.id.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [reviews, filter, query])

  const counts = useMemo(() => {
    const c = { All: reviews.length }
    for (const t of TAGS) c[t] = reviews.filter(r => r.tags.includes(t)).length
    return c
  }, [reviews])

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 pt-20 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-text">Reviews</h1>
          <p className="text-text-secondary text-sm mt-1">
            Feedback, bug reports, feature ideas & showcases from the community.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold
            hover:brightness-110 transition shadow-lg shadow-accent-blue/20">
          ✚ New conversation
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterChip label={`All (${counts.All})`} active={filter === 'All'} onClick={() => setFilter('All')} />
        {TAGS.map(t => (
          <FilterChip key={t} label={`${t} (${counts[t]})`} active={filter === t} onClick={() => setFilter(t)} />
        ))}
        <div className="flex-1 min-w-[140px]" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title or #id…"
          className="bg-vault-surface border border-vault-border rounded-lg px-3 py-1.5 text-sm
            text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue w-44" />
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <div className="text-5xl mb-3">💬</div>
          <p>No conversations yet{filter !== 'All' ? ` tagged “${filter}”` : ''}.</p>
          <button onClick={() => setModalOpen(true)} className="mt-3 text-accent-blue hover:underline text-sm">
            Start the first one →
          </button>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {shown.map(r => {
            const comments = r.timeline.filter(t => t.type === 'comment').length
            return (
              <li key={r.id}>
                <button onClick={() => navigate(`/reviews/${r.id}`)}
                  className="w-full text-left bg-vault-surface hover:bg-vault-elevated border border-vault-border
                    hover:border-accent-blue/40 rounded-xl p-4 transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {isBug(r) && <StatusBadge status={r.status} />}
                        {r.tags.map(t => <TagChip key={t} tag={t} />)}
                      </div>
                      <h3 className="font-semibold text-text-primary group-hover:text-white truncate">
                        <span className="text-text-muted font-mono text-sm mr-1.5">#{r.ref}</span>{r.title}
                      </h3>
                      {r.body && <p className="text-text-secondary text-sm mt-1 line-clamp-2">{r.body}</p>}
                      <div className="text-xs text-text-muted mt-2">
                        by <span className="text-text-secondary">{r.author}</span> · {timeAgo(r.updatedAt)}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right text-text-muted">
                      <div className="text-sm font-semibold text-text-secondary">💬 {comments}</div>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <NewReviewModal open={modalOpen} onClose={() => setModalOpen(false)}
        onCreated={(r) => { setModalOpen(false); navigate(`/reviews/${r.id}`) }} />
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
        ${active ? 'bg-accent-blue/20 border-accent-blue text-white' : 'border-vault-border text-text-secondary hover:text-text-primary'}`}>
      {label}
    </button>
  )
}
