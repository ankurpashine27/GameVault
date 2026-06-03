/**
 * GameVault — Reviews / community board store.
 *
 * A tiny localStorage-backed store for "conversations" (reviews, bug reports,
 * discussions, showcases). Data persists across page reloads and dev-server
 * restarts because it lives in the browser's localStorage.
 *
 * Each conversation has tags. The ticket status workflow (Open → … → Closed)
 * only applies to conversations tagged "Bug" — for Discussion/Showcase/etc.
 * `status` stays null and no status UI is shown.
 *
 * Mutations are immutable (new array + object refs) so React re-renders.
 */
import { useEffect, useReducer } from 'react'

const KEY = 'gamevault_reviews'
const AUTHOR_KEY = 'gamevault_review_author'

// ─── Tags ───────────────────────────────────────────────────────────────────
export const TAGS = ['Bug', 'Feature Request', 'Discussion', 'Showcase', 'Question', 'Feedback']
export const TAG_META = {
  'Bug':             { color: '#f85149', emoji: '🐞' },
  'Feature Request': { color: '#a371f7', emoji: '✨' },
  'Discussion':      { color: '#58a6ff', emoji: '💬' },
  'Showcase':        { color: '#3fb950', emoji: '🏆' },
  'Question':        { color: '#d29922', emoji: '❓' },
  'Feedback':        { color: '#39d0ff', emoji: '📝' },
}

// ─── Bug ticket statuses (only used when a conversation is tagged "Bug") ─────
export const STATUSES = ['Open', 'Testing', 'Working on', 'Ready', 'Deployed', 'Closed']
export const STATUS_META = {
  'Open':       { color: '#58a6ff', dot: '●' },
  'Testing':    { color: '#d29922', dot: '●' },
  'Working on': { color: '#a371f7', dot: '●' },
  'Ready':      { color: '#3fb950', dot: '●' },
  'Deployed':   { color: '#2ea043', dot: '●' },
  'Closed':     { color: '#8b949e', dot: '●' },
}

export const isBug = (review) => !!review?.tags?.includes('Bug')
export const isClosed = (review) => isBug(review) && review?.status === 'Closed'

const maxRef = (arr) => arr.reduce((m, r) => Math.max(m, r.ref || 0), 0)

// ─── Internals ───────────────────────────────────────────────────────────────
const listeners = new Set()
let cache = null

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* quota */ }
}
function emit() { for (const fn of listeners) fn() }

function load() {
  if (cache) return cache
  try { cache = JSON.parse(localStorage.getItem(KEY)) } catch { cache = null }
  if (!Array.isArray(cache)) { cache = seed(); persist() }
  // Migration: ensure every conversation has a sequential reference number.
  if (cache.some(r => !r.ref)) {
    let mx = maxRef(cache)
    cache.filter(r => !r.ref).sort((a, b) => a.createdAt - b.createdAt).forEach(r => { r.ref = ++mx })
    persist()
  }
  return cache
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }

export function getReviews() { return load() }
export function getReview(id) { return load().find(r => r.id === id) || null }

export function getAuthor() { return localStorage.getItem(AUTHOR_KEY) || 'Anonymous' }
export function setAuthor(name) { localStorage.setItem(AUTHOR_KEY, (name || 'Anonymous').slice(0, 24)) }

export function createReview({ title, body, author, tags }) {
  const now = Date.now()
  const safeTags = (tags && tags.length ? tags : ['Discussion']).filter(t => TAGS.includes(t))
  const review = {
    id: uid(),
    ref: maxRef(load()) + 1,
    title: title.trim().slice(0, 140),
    body: (body || '').trim(),
    author: (author || 'Anonymous').slice(0, 24),
    tags: safeTags,
    status: safeTags.includes('Bug') ? 'Open' : null,
    createdAt: now,
    updatedAt: now,
    timeline: [],
  }
  cache = [review, ...load()]
  persist(); emit()
  return review
}

/** Add a comment. Blocked on closed bugs (returns false). */
export function addComment(id, { author, body }) {
  if (!body || !body.trim()) return false
  const target = getReview(id)
  if (!target || isClosed(target)) return false
  const now = Date.now()
  const item = { id: uid(), type: 'comment', author: (author || 'Anonymous').slice(0, 24), body: body.trim(), createdAt: now }
  cache = load().map(r => r.id === id ? { ...r, timeline: [...r.timeline, item], updatedAt: now } : r)
  persist(); emit()
  return true
}

/** Edit an existing comment; stamps editedAt. */
export function editComment(reviewId, itemId, newBody) {
  if (!newBody || !newBody.trim()) return
  const now = Date.now()
  cache = load().map(r => r.id !== reviewId ? r : {
    ...r,
    timeline: r.timeline.map(it =>
      (it.id === itemId && it.type === 'comment')
        ? { ...it, body: newBody.trim(), editedAt: now } : it),
  })
  persist(); emit()
}

/** Edit the original post's body; stamps editedAt. */
export function editReviewBody(id, newBody) {
  const now = Date.now()
  cache = load().map(r => r.id !== id ? r : { ...r, body: (newBody || '').trim(), editedAt: now, updatedAt: now })
  persist(); emit()
}

/** Delete a conversation entirely. */
export function deleteReview(id) {
  cache = load().filter(r => r.id !== id)
  persist(); emit()
}

export function setStatus(id, status, author) {
  if (!STATUSES.includes(status)) return
  const now = Date.now()
  cache = load().map(r => {
    if (r.id !== id || !isBug(r) || r.status === status) return r
    const ev = { id: uid(), type: 'status', author: (author || 'Anonymous').slice(0, 24), from: r.status, to: status, createdAt: now }
    return { ...r, status, timeline: [...r.timeline, ev], updatedAt: now }
  })
  persist(); emit()
}

export function setTags(id, tags) {
  const safe = (tags || []).filter(t => TAGS.includes(t))
  cache = load().map(r => {
    if (r.id !== id) return r
    const nowBug = safe.includes('Bug')
    return { ...r, tags: safe.length ? safe : ['Discussion'], status: nowBug ? (r.status || 'Open') : null, updatedAt: Date.now() }
  })
  persist(); emit()
}

// ─── React hooks ─────────────────────────────────────────────────────────────
export function useReviews() {
  const [, force] = useReducer(x => x + 1, 0)
  useEffect(() => subscribe(force), [])
  return getReviews()
}
export function useReview(id) {
  const [, force] = useReducer(x => x + 1, 0)
  useEffect(() => subscribe(force), [])
  return getReview(id)
}

// ─── Seed (first visit only) ─────────────────────────────────────────────────
function seed() {
  const day = 86400000
  const now = Date.now()
  return [
    {
      id: uid(), ref: 1, title: 'Welcome to GameVault Reviews 👋',
      body: 'This is the community board. Share feedback, report bugs, request features, or show off your high scores.\n\nBug reports get a ticket status (Open → Testing → Working on → Ready → Deployed → Closed). Other tags are just for discussion.\n\nTip: reference another conversation by its number, like #2.',
      author: 'GameVault Team', tags: ['Discussion'], status: null,
      createdAt: now - day * 3, updatedAt: now - day * 3, timeline: [],
    },
    {
      id: uid(), ref: 2, title: 'Pulse Rush — coins felt impossible to grab',
      body: 'On a few levels the secret coins were floating too high to reach with a normal jump. Anyone else?',
      author: 'neonRunner', tags: ['Bug'], status: 'Deployed',
      createdAt: now - day * 2, updatedAt: now - day,
      timeline: [
        { id: uid(), type: 'comment', author: 'pixelPilot', body: 'Yeah, the high ones during cube sections were unreachable.', createdAt: now - day * 2 + 3600000 },
        { id: uid(), type: 'status', author: 'GameVault Team', from: 'Open', to: 'Working on', createdAt: now - day * 2 + 7200000 },
        { id: uid(), type: 'status', author: 'GameVault Team', from: 'Working on', to: 'Deployed', createdAt: now - day },
      ],
    },
    {
      id: uid(), ref: 3, title: 'Hit 4096 on 2048 — proof attached (in my heart)',
      body: 'Took me 40 minutes but I finally cracked 4096. The new themes are gorgeous.',
      author: 'tileWizard', tags: ['Showcase'], status: null,
      createdAt: now - day, updatedAt: now - day, timeline: [],
    },
  ]
}
