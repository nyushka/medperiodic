import { createContext, useContext, useEffect, useState } from 'react'
import type { CardState, CustomDeck } from './flashcards'

// Study progress, kept per profile in this browser (localStorage). There is no server:
// a profile is a name on this device, so several people can share one computer.
// The shape is deliberately simple so a cloud backend can sync it later.

export type ItemType = 'structure' | 'element'
export interface Profile {
  id: string
  name: string
  color: string
  created: number
  seen: Record<string, number> // "type:id" -> last opened (ms)
  learned: Record<string, number> // "type:id" -> marked learned (ms)
  days: string[] // ISO dates with any study activity
  srs?: Record<string, CardState> // flashcard id -> spaced-repetition state
  decks?: CustomDeck[] // the person's own (AI-generated or hand-written) decks
  quiz?: Record<string, { best: number; last: number; total: number; at: number }> // deck id -> quiz scores
  reviews?: Record<string, number> // ISO date -> cards reviewed that day
}
interface Store {
  version: 1
  active: string
  profiles: Record<string, Profile>
}

const KEY = 'mp-progress-v1'
export const GUEST = 'guest'
export const PROFILE_COLORS = ['#e0646c', '#8db6ea', '#e08c5e', '#62c193', '#c98fe0', '#e0c25e', '#e07d82']

const blank = (id: string, name: string, color: string): Profile => ({ id, name, color, created: Date.now(), seen: {}, learned: {}, days: [] })

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as Store
      if (s.version === 1 && s.profiles?.[s.active]) return s
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return { version: 1, active: GUEST, profiles: { [GUEST]: blank(GUEST, 'Guest', '#7f8794') } }
}

let store = load()
const listeners = new Set<() => void>()
function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* private mode etc.: progress lasts for this visit only */
  }
  listeners.forEach((l) => l())
}

const today = () => new Date().toISOString().slice(0, 10)
export const itemKey = (type: ItemType, id: string) => `${type}:${id}`

export const progress = {
  get active(): Profile {
    return store.profiles[store.active]
  },
  get profiles(): Profile[] {
    return Object.values(store.profiles).filter((p) => p.id !== GUEST)
  },
  get signedIn() {
    return store.active !== GUEST
  },
  record(type: ItemType, id: string) {
    const p = store.profiles[store.active]
    p.seen[itemKey(type, id)] = Date.now()
    const d = today()
    if (p.days[p.days.length - 1] !== d) p.days = [...p.days.slice(-400), d]
    commit()
  },
  toggleLearned(type: ItemType, id: string) {
    const p = store.profiles[store.active]
    const k = itemKey(type, id)
    if (p.learned[k]) delete p.learned[k]
    else p.learned[k] = Date.now()
    p.learned = { ...p.learned }
    commit()
  },
  /** Save a flashcard review. */
  review(cardId: string, state: CardState) {
    const p = store.profiles[store.active]
    p.srs = { ...(p.srs ?? {}), [cardId]: state }
    const d = today()
    p.reviews = { ...(p.reviews ?? {}), [d]: (p.reviews?.[d] ?? 0) + 1 }
    if (p.days[p.days.length - 1] !== d) p.days = [...p.days.slice(-400), d]
    commit()
  },
  saveDeck(deck: CustomDeck) {
    const p = store.profiles[store.active]
    const rest = (p.decks ?? []).filter((d) => d.id !== deck.id)
    p.decks = [deck, ...rest]
    commit()
  },
  deleteDeck(id: string) {
    const p = store.profiles[store.active]
    p.decks = (p.decks ?? []).filter((d) => d.id !== id)
    if (p.srs) p.srs = Object.fromEntries(Object.entries(p.srs).filter(([k]) => !k.startsWith(`c:${id}:`)))
    commit()
  },
  recordQuiz(deckId: string, score: number, total: number) {
    const p = store.profiles[store.active]
    const prev = p.quiz?.[deckId]
    const pct = total ? score / total : 0
    p.quiz = { ...(p.quiz ?? {}), [deckId]: { best: Math.max(prev?.best ?? 0, pct), last: pct, total, at: Date.now() } }
    const d = today()
    if (p.days[p.days.length - 1] !== d) p.days = [...p.days.slice(-400), d]
    commit()
  },
  /** Create a profile; a guest's progress so far moves into the first profile created. */
  signUp(name: string, color: string) {
    const id = `p${Date.now().toString(36)}`
    const guest = store.profiles[GUEST]
    const p = blank(id, name.trim().slice(0, 40) || 'Student', color)
    if (!this.profiles.length) {
      p.seen = { ...guest.seen }
      p.learned = { ...guest.learned }
      p.days = [...guest.days]
      p.srs = { ...(guest.srs ?? {}) }
      p.decks = [...(guest.decks ?? [])]
      p.quiz = { ...(guest.quiz ?? {}) }
      p.reviews = { ...(guest.reviews ?? {}) }
      store.profiles[GUEST] = blank(GUEST, 'Guest', '#7f8794')
    }
    store.profiles[id] = p
    store.active = id
    commit()
  },
  switchTo(id: string) {
    if (store.profiles[id]) {
      store.active = id
      commit()
    }
  },
  signOut() {
    store.active = GUEST
    commit()
  },
  deleteProfile(id: string) {
    if (id === GUEST) return
    delete store.profiles[id]
    if (store.active === id) store.active = GUEST
    commit()
  },
  resetActive() {
    const p = store.profiles[store.active]
    store.profiles[store.active] = { ...blank(p.id, p.name, p.color), created: p.created }
    commit()
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

/** Consecutive days of study ending today or yesterday. */
export function streak(days: string[]): number {
  if (!days.length) return 0
  const set = new Set(days)
  const d = new Date()
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  let n = 0
  while (set.has(d.toISOString().slice(0, 10))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

/** Re-render on any progress change; returns the active profile. */
export function useProgress(): Profile {
  const [, setTick] = useState(0)
  useEffect(() => {
    const off = progress.subscribe(() => setTick((t) => t + 1))
    return () => {
      off()
    }
  }, [])
  return progress.active
}

export const ProgressUI = createContext<{ openSignIn: () => void }>({ openSignIn: () => {} })
export const useProgressUI = () => useContext(ProgressUI)
