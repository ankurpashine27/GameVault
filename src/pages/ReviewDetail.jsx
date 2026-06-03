/**
 * Reviews — single conversation view. Shows the original post, an interleaved
 * timeline of comments + status changes, a comment composer, and (for Bug
 * conversations only) the ticket status workflow + tag editor.
 *
 * - Comments can't be added to a Closed bug (composer is locked).
 * - The conversation can be deleted entirely.
 * - Each conversation has a reference number (#N) you can search / link by.
 * - Comments (and the original post) can be edited; edits show "Edited on …".
 */
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useReview, addComment, editComment, editReviewBody, deleteReview,
  setStatus, setTags, getAuthor, setAuthor, isBug, isClosed, STATUSES, TAGS,
} from '@/lib/reviewsStore'
import { TagChip, StatusBadge, RichText, timeAgo } from '@/components/reviews/ReviewBits'

const fmtDateTime = (ts) => new Date(ts).toLocaleString([], {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
})

export default function ReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const review = useReview(id)
  const [author, setAuthorState] = useState(getAuthor())
  const [body, setBody] = useState('')
  const [editTags, setEditTags] = useState(false)

  if (!review) {
    return (
      <div className="max-w-screen-md mx-auto px-4 pt-24 pb-16 text-center">
        <p className="text-text-secondary">This conversation doesn’t exist or was removed.</p>
        <Link to="/reviews" className="text-accent-blue hover:underline text-sm mt-3 inline-block">← Back to Reviews</Link>
      </div>
    )
  }

  const bug = isBug(review)
  const closed = isClosed(review)

  const post = () => {
    if (!body.trim()) return
    setAuthor(author)
    if (addComment(review.id, { author, body })) setBody('')
  }
  const changeStatus = (s) => { setAuthor(author); setStatus(review.id, s, author) }
  const toggleTag = (t) => {
    const next = review.tags.includes(t) ? review.tags.filter(x => x !== t) : [...review.tags, t]
    setTags(review.id, next)
  }
  const remove = () => {
    if (window.confirm(`Delete conversation #${review.ref} “${review.title}”? This can’t be undone.`)) {
      deleteReview(review.id)
      navigate('/reviews')
    }
  }
  const copyRef = () => { navigator.clipboard?.writeText(`#${review.ref}`).catch(() => {}) }

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-6 pt-20 pb-16">
      <div className="flex items-center justify-between">
        <Link to="/reviews" className="text-text-muted hover:text-text-primary text-sm">← Reviews</Link>
        <button onClick={remove}
          className="text-xs px-3 py-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600/80
            border border-red-500/30 hover:border-red-600 transition-colors">
          🗑 Delete
        </button>
      </div>

      {/* Header */}
      <div className="mt-3 mb-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <button onClick={copyRef} title="Copy reference"
            className="font-mono text-sm text-text-muted hover:text-accent-blue">#{review.ref}</button>
          {bug && <StatusBadge status={review.status} size="md" />}
          {review.tags.map(t => <TagChip key={t} tag={t} size="md" />)}
          <button onClick={() => setEditTags(v => !v)}
            className="text-xs text-text-muted hover:text-text-primary ml-1">
            {editTags ? 'done' : '✎ edit tags'}
          </button>
        </div>

        {editTags && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-lg bg-vault-surface border border-vault-border">
            {TAGS.map(t => (
              <TagChip key={t} tag={t} active={review.tags.includes(t)} onClick={() => toggleTag(t)} size="md" />
            ))}
          </div>
        )}

        <h1 className="font-heading text-2xl font-bold text-text-primary">{review.title}</h1>
        <div className="text-xs text-text-muted mt-1">
          opened by <span className="text-text-secondary">{review.author}</span> · {timeAgo(review.createdAt)}
        </div>
      </div>

      {/* Bug status workflow */}
      {bug && (
        <div className="mb-5 p-3 rounded-xl bg-vault-surface border border-vault-border">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Ticket status</div>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map(s => (
              <button key={s} onClick={() => changeStatus(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition
                  ${review.status === s ? '' : 'opacity-60 hover:opacity-100'}`}
                style={review.status === s
                  ? { color: '#fff', background: '#388bfd', borderColor: 'transparent' }
                  : { color: '#8b949e', background: 'transparent', borderColor: '#30363d' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Original post */}
      <Post author={review.author} createdAt={review.createdAt} body={review.body}
        editedAt={review.editedAt} onEdit={(t) => editReviewBody(review.id, t)} op />

      {/* Timeline */}
      <div className="mt-2 space-y-2">
        {[...review.timeline].sort((a, b) => a.createdAt - b.createdAt).map(item =>
          item.type === 'status' ? (
            <div key={item.id} className="flex items-center gap-2 text-xs text-text-muted py-1.5 px-2">
              <span className="text-base">🔄</span>
              <span>
                <span className="text-text-secondary font-medium">{item.author}</span> changed status
                {item.from ? <> from <StatusBadge status={item.from} /></> : null} to <StatusBadge status={item.to} />
                <span className="ml-1">· {timeAgo(item.createdAt)}</span>
              </span>
            </div>
          ) : (
            <Post key={item.id} author={item.author} createdAt={item.createdAt} body={item.body}
              editedAt={item.editedAt} onEdit={(t) => editComment(review.id, item.id, t)} />
          )
        )}
      </div>

      {/* Composer — locked when the bug is Closed */}
      {closed ? (
        <div className="mt-6 p-4 rounded-xl bg-vault-surface border border-vault-border text-center text-sm text-text-muted">
          🔒 This bug is <span className="text-text-secondary font-semibold">Closed</span> — commenting is locked.
          Set a status above (e.g. <span className="text-accent-blue">Open</span>) to reopen the discussion.
        </div>
      ) : (
        <div className="mt-6 p-4 rounded-xl bg-vault-surface border border-vault-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-muted">Posting as</span>
            <input value={author} onChange={e => setAuthorState(e.target.value)}
              className="bg-vault-bg border border-vault-border rounded px-2 py-1 text-xs text-text-primary
                focus:outline-none focus:border-accent-blue w-36" />
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
            placeholder="Add a comment…  (reference another with #id)"
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') post() }}
            className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm
              text-text-primary focus:outline-none focus:border-accent-blue resize-y" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[11px] text-text-muted">⌘/Ctrl + Enter to post</span>
            <button onClick={post} disabled={!body.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent-blue text-white
                hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition">
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Post({ author, createdAt, body, editedAt, onEdit, op }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(body || '')
  const initial = (author || '?').charAt(0).toUpperCase()

  const save = () => { onEdit?.(draft); setEditing(false) }
  const startEdit = () => { setDraft(body || ''); setEditing(true) }

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${op ? 'bg-vault-surface border-accent-blue/30' : 'bg-vault-surface/60 border-vault-border'}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{ background: colorFor(author) }}>
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-text-primary">{author}</span>
          {op && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue font-bold">OP</span>}
          <span className="text-xs text-text-muted">{timeAgo(createdAt)}</span>
          {onEdit && !editing && (
            <button onClick={startEdit} className="text-xs text-text-muted hover:text-accent-blue ml-auto">✎ edit</button>
          )}
        </div>

        {editing ? (
          <div>
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} autoFocus
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm
                text-text-primary focus:outline-none focus:border-accent-blue resize-y" />
            <div className="flex gap-2 mt-2">
              <button onClick={save}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-blue text-white hover:brightness-110">Save</button>
              <button onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-vault-elevated">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {body
              ? <RichText text={body} className="text-sm text-text-secondary" />
              : <p className="text-sm text-text-muted italic">(no description)</p>}
            {editedAt && (
              <div className="text-[11px] text-text-muted italic mt-1.5">Edited on {fmtDateTime(editedAt)}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function colorFor(name) {
  let h = 0
  for (const c of (name || 'x')) h = (h * 31 + c.charCodeAt(0)) % 360
  return `hsl(${h} 55% 45%)`
}
