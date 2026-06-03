/**
 * Modal for creating a new conversation (review / bug / discussion / showcase).
 */
import { useState, useEffect } from 'react'
import { TAGS, createReview, getAuthor, setAuthor, isBug } from '@/lib/reviewsStore'
import { TagChip } from './ReviewBits'

export default function NewReviewModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [author, setAuthorState] = useState(getAuthor())
  const [tags, setTags] = useState(['Discussion'])

  // Reset fields each time the modal opens.
  useEffect(() => {
    if (open) {
      setTitle(''); setBody(''); setTags(['Discussion']); setAuthorState(getAuthor())
    }
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const toggleTag = (t) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const submit = () => {
    if (!title.trim()) return
    setAuthor(author)
    const review = createReview({ title, body, author, tags })
    onCreated?.(review)
  }

  const willBeBug = isBug({ tags })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onMouseDown={onClose}>
      <div className="w-full max-w-lg bg-vault-surface border border-vault-border rounded-2xl shadow-2xl
        max-h-[90vh] overflow-y-auto" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-vault-border">
          <h2 className="font-heading text-lg font-bold text-text-primary">New conversation</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg leading-none">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Author */}
          <label className="block">
            <span className="text-xs text-text-muted uppercase tracking-wider">Posting as</span>
            <input value={author} onChange={e => setAuthorState(e.target.value)} placeholder="Your name"
              className="mt-1 w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm
                text-text-primary focus:outline-none focus:border-accent-blue" />
          </label>

          {/* Title */}
          <label className="block">
            <span className="text-xs text-text-muted uppercase tracking-wider">Title</span>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={140}
              placeholder="A short, clear summary…" autoFocus
              className="mt-1 w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm
                text-text-primary focus:outline-none focus:border-accent-blue" />
          </label>

          {/* Body */}
          <label className="block">
            <span className="text-xs text-text-muted uppercase tracking-wider">Details</span>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
              placeholder="Describe it. For bugs: what happened, what you expected, and how to reproduce."
              className="mt-1 w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm
                text-text-primary focus:outline-none focus:border-accent-blue resize-y" />
          </label>

          {/* Tags */}
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider">Tags</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGS.map(t => (
                <TagChip key={t} tag={t} active={tags.includes(t)} onClick={() => toggleTag(t)} size="md" />
              ))}
            </div>
            {willBeBug && (
              <p className="mt-2 text-xs text-text-muted">
                🐞 Tagged as a bug — it will get a ticket status starting at <span className="text-accent-blue font-semibold">Open</span>.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-vault-border">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-vault-elevated transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent-blue text-white
              hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition">
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
