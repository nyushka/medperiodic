import { ALL } from '../data'
import { BODY_ELEMENTS, ROLE_INFO } from '../data/bodyElements'
import { BY_SYMBOL } from '../data/periodic'
import { KINDS, type Structure } from '../data/types'
import { configuration, shorthand, subshellLabel } from './electrons'
import type { ItemType } from './progress'

// Flashcards built from the app's own anatomy and chemistry data, grouped into decks by body section,
// plus the spaced-repetition scheduler (a simplified SM-2, the algorithm Anki grew out of).

export interface Card {
  id: string // stable: progress is stored against it
  deck: string
  tag: string // small label above the prompt ("Name the muscle", "Nerve supply")
  front: string
  back: string
  detail?: string
  ref?: { type: ItemType; id: string }
  quiz?: string // cards sharing a quiz key have answers of the same kind, so they can be each other's distractors
}

export interface QuizItem {
  id: string
  question: string
  choices: string[]
  answer: number
  explanation?: string
  tag?: string
  ref?: Card['ref']
}

export interface CustomDeck {
  id: string
  title: string
  topic: string
  level?: string
  created: number
  source: 'ai' | 'manual'
  cards: { id: string; front: string; back: string; tag?: string }[]
  quiz: QuizItem[]
}

export interface DeckInfo {
  id: string
  label: string
  blurb: string
  color: string
  group: string
  custom?: CustomDeck
}

const SECTIONS: DeckInfo[] = [
  { id: 'brain', label: 'Brain & nerves', blurb: 'Brain regions, cranial nerves and the spinal cord', color: '#c99a1e', group: 'Head' },
  { id: 'senses', label: 'Eyes & ears', blurb: 'Eye, ear, the muscles that aim the eye, the ossicles', color: '#3a9fa3', group: 'Head' },
  { id: 'skull', label: 'Skull & face', blurb: 'Cranial and facial bones, muscles of expression', color: '#bfa77a', group: 'Head' },
  { id: 'jaw', label: 'Jaw, teeth & mouth', blurb: 'Mandible, maxilla, chewing muscles, teeth and tongue', color: '#d9b77a', group: 'Head' },
  { id: 'neck', label: 'Neck', blurb: 'Cervical spine, hyoid, thyroid, larynx and neck muscles', color: '#7f63c0', group: 'Trunk' },
  { id: 'chest', label: 'Chest', blurb: 'Heart, lungs, ribs and the muscles of breathing', color: '#b8283a', group: 'Trunk' },
  { id: 'abdomen', label: 'Abdomen', blurb: 'Stomach, liver, intestines, kidneys and abdominal wall', color: '#d47a3a', group: 'Trunk' },
  { id: 'pelvis', label: 'Pelvis', blurb: 'Pelvic bones, bladder, reproductive organs, pelvic floor', color: '#c35d8f', group: 'Trunk' },
  { id: 'spine', label: 'Back & spine', blurb: 'Vertebrae, spinal cord and the deep back muscles', color: '#a08a5c', group: 'Trunk' },
  { id: 'upper', label: 'Upper limbs', blurb: 'Shoulder, arm, forearm, wrist and hand', color: '#4f97c4', group: 'Limbs' },
  { id: 'lower', label: 'Lower limbs', blurb: 'Hip, thigh, leg, ankle and foot', color: '#3c9a6a', group: 'Limbs' },
  { id: 'blood', label: 'Blood & immunity', blurb: 'Blood components, vessels and immune organs', color: '#c4424a', group: 'Systems & cells' },
  { id: 'cells', label: 'Cells', blurb: 'Every major cell type: size, lifespan and job', color: '#5fb3c9', group: 'Systems & cells' },
  { id: 'skin', label: 'Skin, hair & nails', blurb: 'Layers of the skin, follicles, glands and receptors', color: '#c48a64', group: 'Systems & cells' },
  { id: 'tissues', label: 'Tissues', blurb: 'Cartilage, tendons, fat, connective tissue', color: '#8d96a5', group: 'Systems & cells' },
  { id: 'elements', label: 'Elements of the body', blurb: 'Electron configurations, roles and deficiencies', color: '#2e9466', group: 'Biochemistry' },
]
export const SECTION_BY_ID: Record<string, DeckInfo> = Object.fromEntries(SECTIONS.map((s) => [s.id, s]))
export const GROUPS = ['Head', 'Trunk', 'Limbs', 'Systems & cells', 'Biochemistry']

const JAW = new Set(['foramen-mental', 'foramen-mandibular', 'foramen-incisive', 'foramen-palatine', 'foramen-apical', 'joint-tmj', 'gums', 'lips', 'palate', 'uvula', 'inferior-alveolar', 'lingual-n', 'muscle-styloglossus', 'muscle-hyoglossus', 'muscle-palatoglossus', 'muscle-intrinsic-tongue', 'muscle-lev-veli', 'muscle-tensor-veli', 'muscle-uvulae', 'muscle-risorius', 'muscle-lev-anguli', 'muscle-dep-labii', 'bone-mandible', 'bone-maxilla', 'bone-palatine', 'teeth', 'enamel', 'dentin', 'tongue', 'salivary', 'muscle-masseter', 'muscle-temporalis', 'muscle-med-pterygoid', 'muscle-lat-pterygoid', 'muscle-genioglossus', 'muscle-buccinator', 'muscle-orb-oris', 'cell-odontoblast', 'cell-ameloblast', 'cell-taste-cell', 'cell-acinar'])
const SENSE_BONES = new Set(['bone-malleus', 'bone-incus', 'bone-stapes', 'bone-lacrimal'])

function sectionOf(s: Structure): string | null {
  if (JAW.has(s.id)) return 'jaw'
  if (s.kind === 'cell') return 'cells'
  if (s.kind === 'blood') return 'blood'
  if (s.kind === 'skin') return 'skin'
  switch (s.region) {
    case 'head':
      if (s.system === 'sensory' || SENSE_BONES.has(s.id) || s.facts?.some(([k, v]) => k === 'Group' && (v === 'Eye' || v === 'Middle ear'))) return 'senses'
      if (s.system === 'nervous' || s.system === 'endocrine') return 'brain'
      return 'skull'
    case 'neck':
      return 'neck'
    case 'chest':
      return 'chest'
    case 'abdomen':
      return 'abdomen'
    case 'pelvis':
      return 'pelvis'
    case 'back':
      return 'spine'
    case 'arm':
    case 'hand':
      return 'upper'
    case 'leg':
    case 'foot':
      return 'lower'
    default:
      if (s.kind === 'tissue') return 'tissues'
      if (s.kind === 'vessel' || s.system === 'lymphatic' || s.system === 'cardiovascular') return 'blood'
      if (s.system === 'nervous') return 'brain'
      return 'tissues'
  }
}

const GENERIC = new Set(['muscle', 'muscles', 'bone', 'bones', 'nerve', 'nerves', 'cell', 'cells', 'gland', 'major', 'minor', 'superior', 'inferior', 'anterior', 'posterior', 'lateral', 'medial', 'longus', 'brevis', 'artery', 'vein', 'tissue', 'layer', 'stratum', 'vertebra', 'common', 'internal', 'external', 'deep', 'superficial'])

/** Hide the structure's own name inside its description so the description can be a prompt. */
function cloze(text: string, name: string): string {
  const words = new Set<string>()
  const base = name.replace(/\(.*?\)/g, ' ').replace(/[—–-]/g, ' ')
  for (const w of base.split(/[\s,/]+/)) if (w.length >= 4 && !GENERIC.has(w.toLowerCase())) words.add(w)
  for (const m of name.matchAll(/\(([^)]+)\)/g)) for (const w of m[1].split(/[\s,/]+/)) if (w.length >= 4 && !GENERIC.has(w.toLowerCase())) words.add(w)
  let out = text
  for (const w of words) {
    const stem = w.replace(/(es|s|us|is|um|a|al|ic)$/i, '')
    const pat = new RegExp(`\\b${(stem.length >= 4 ? stem : w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*`, 'gi')
    out = out.replace(pat, '▁▁▁')
  }
  return out
}

const clean = (n: string) => n.replace(/\s*\((.*?)\)/, '').trim()
const short = (t: string, max = 160) => (t.length > max ? t.slice(0, t.lastIndexOf(' ', max)) + '…' : t)
const firstSentence = (t: string) => {
  const m = t.match(/^.+?[.!?](\s|$)/)
  return (m ? m[0] : t).trim()
}

function structureCards(s: Structure, deck: string): Card[] {
  const out: Card[] = []
  const kind = KINDS[s.kind].label.toLowerCase()
  const ref = { type: 'structure' as const, id: s.id }
  const fact = (k: string) => s.facts?.find(([x]) => x === k)?.[1]
  const prompt = cloze(s.desc, s.name)
  if (prompt.length > 30 && prompt !== s.desc && !prompt.includes(clean(s.name))) {
    out.push({ id: `name:${s.id}`, deck, tag: `Name the ${kind}`, front: short(prompt, 220), back: s.name, ref, quiz: `name:${s.kind}` })
  } else if (s.desc.length > 30 && !s.desc.toLowerCase().includes(clean(s.name).toLowerCase())) {
    out.push({ id: `name:${s.id}`, deck, tag: `Name the ${kind}`, front: short(s.desc, 220), back: s.name, ref, quiz: `name:${s.kind}` })
  }
  if (s.kind !== 'muscle') out.push({ id: `about:${s.id}`, deck, tag: `What is it?`, front: s.name, back: firstSentence(s.desc), detail: s.desc.length > firstSentence(s.desc).length + 4 ? s.desc : undefined, ref })
  if (s.kind === 'muscle') {
    const action = fact('Action')
    const nerve = fact('Nerve supply')
    const origin = fact('Origin')
    const insertion = fact('Insertion')
    if (action) out.push({ id: `action:${s.id}`, deck, tag: 'Action', front: `What does the ${clean(s.name)} do?`, back: action, ref, quiz: 'action' })
    if (nerve) out.push({ id: `nerve:${s.id}`, deck, tag: 'Nerve supply', front: `Which nerve supplies the ${clean(s.name)}?`, back: nerve, ref, quiz: 'nerve' })
    if (origin && insertion && action) out.push({ id: `idm:${s.id}`, deck, tag: 'Name the muscle', front: `Origin: ${origin}\nInsertion: ${insertion}\nAction: ${action}`, back: s.name, ref, quiz: 'name:muscle' })
    if (origin && insertion) out.push({ id: `attach:${s.id}`, deck, tag: 'Origin → insertion', front: `Where does the ${clean(s.name)} attach?`, back: `Origin: ${origin}\nInsertion: ${insertion}`, ref })
  }
  if (s.kind === 'foramen') {
    const passes = fact('Passes through')
    if (passes) out.push({ id: `passes:${s.id}`, deck, tag: 'What passes through', front: `What passes through the ${clean(s.name).toLowerCase()}?`, back: passes, ref, quiz: 'passes' })
  }
  if (s.kind === 'bone') {
    const type = fact('Bone type')
    if (type && s.count) out.push({ id: `bonetype:${s.id}`, deck, tag: 'Bone type', front: `What type of bone is the ${clean(s.name)}, and how many do you have?`, back: `${type} · ${s.count === 1 ? 'one (unpaired)' : `${s.count}`}`, ref, quiz: 'bonetype' })
  }
  if (s.kind === 'cell' || s.kind === 'blood') {
    const life = fact('Lifespan')
    const size = fact('Size')
    if (life) out.push({ id: `life:${s.id}`, deck, tag: 'Lifespan', front: `How long does a ${clean(s.name).toLowerCase()} live?`, back: life, ref, quiz: 'life' })
    if (size) out.push({ id: `size:${s.id}`, deck, tag: 'Size', front: `How big is a ${clean(s.name).toLowerCase()}?`, back: size, ref, quiz: 'size' })
  }
  // Which element does this job here? (the app's core idea: structure → element)
  for (const [sym, role] of Object.entries(s.el ?? {}).slice(0, 3)) {
    const e = BY_SYMBOL[sym]
    if (!e) continue
    const hidden = hideElement(role, e.name, sym)
    out.push({ id: `el:${s.id}:${sym}`, deck, tag: `Which element? · ${clean(s.name)}`, front: hidden, back: `${e.name} (${sym})`, detail: role, ref: { type: 'element', id: sym }, quiz: 'element' })
  }
  return out
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).split('').map((d) => SUP[+d]).join('')
const label = (s: { e: number } & Parameters<typeof subshellLabel>[0]) => `${subshellLabel(s)}${sup(s.e)}`
function configText(z: number): string {
  const sh = shorthand(z)
  return `${sh.core ? `[${sh.core}] ` : ''}${sh.rest.map(label).join(' ')}`
}
/** Hide an element's name and (two-letter) symbol in a sentence. Single letters are left alone: “O” would hit “of”. */
const hideElement = (text: string, name: string, sym: string) =>
  text.replace(new RegExp(`\\b${name}\\w*`, 'gi'), '▁▁▁').replace(sym.length > 1 ? new RegExp(`\\b${sym}\\b`, 'g') : /$^/, '▁▁▁')

function elementCards(): Card[] {
  const out: Card[] = []
  const deck = 'elements'
  for (const b of BODY_ELEMENTS) {
    const e = BY_SYMBOL[b.symbol]
    const ref = { type: 'element' as const, id: b.symbol }
    const toxic = b.role === 'toxic'
    out.push({ id: `sym:${b.symbol}`, deck, tag: 'Symbol & number', front: `Symbol and atomic number of ${e.name}?`, back: `${e.symbol} · Z = ${e.z}`, ref, quiz: 'sym' })
    out.push({ id: `cfg:${b.symbol}`, deck, tag: 'Electron configuration', front: `Electron configuration of ${e.name} (Z = ${e.z})?`, back: configText(e.z), detail: `Full: ${configuration(e.z).map(label).join(' ')}`, ref, quiz: 'config' })
    const hidden = hideElement(b.summary, e.name, e.symbol)
    out.push({ id: `elname:${b.symbol}`, deck, tag: `Name the element · ${ROLE_INFO[b.role].label}`, front: hidden, back: `${e.name} (${e.symbol})`, ref, quiz: 'element' })
    out.push({ id: `def:${b.symbol}`, deck, tag: toxic ? 'Health effects' : 'Deficiency', front: toxic ? `What does too much ${e.name.toLowerCase()} do to the body?` : `Signs of ${e.name.toLowerCase()} deficiency?`, back: (toxic ? b.excess : b.deficiency).slice(0, 3).join('\n'), ref })
    if (!toxic) {
      if (b.atRisk.length) out.push({ id: `risk:${b.symbol}`, deck, tag: 'Who runs low', front: `Who is most likely to run low on ${e.name.toLowerCase()}?`, back: b.atRisk.slice(0, 3).join('\n'), ref })
    }
  }
  return out
}


let built: Record<string, Card[]> | null = null
/** All built-in decks, keyed by section id. Built once, on first use. */
export function builtinDecks(): Record<string, Card[]> {
  if (built) return built
  const d: Record<string, Card[]> = Object.fromEntries(SECTIONS.map((s) => [s.id, []]))
  for (const s of ALL) {
    const sec = sectionOf(s)
    if (sec) d[sec].push(...structureCards(s, sec))
  }
  d.elements = elementCards()
  built = d
  return d
}

export const SECTIONS_LIST = SECTIONS

export function customCards(deck: CustomDeck): Card[] {
  return deck.cards.map((c) => ({ id: `c:${deck.id}:${c.id}`, deck: deck.id, tag: c.tag || deck.title, front: c.front, back: c.back }))
}

// ---------- Spaced repetition ----------

export interface CardState {
  due: number // ms
  ivl: number // days; 0 while still learning
  ease: number
  reps: number
  lapses: number
}
export type Grade = 0 | 1 | 2 | 3 // Again, Hard, Good, Easy
export const GRADES: { g: Grade; label: string; key: string }[] = [
  { g: 0, label: 'Again', key: '1' },
  { g: 1, label: 'Hard', key: '2' },
  { g: 2, label: 'Good', key: '3' },
  { g: 3, label: 'Easy', key: '4' },
]
const MIN = 60_000
const DAY = 86_400_000

export function schedule(prev: CardState | undefined, g: Grade, now = Date.now()): CardState {
  const s: CardState = prev ? { ...prev } : { due: now, ivl: 0, ease: 2.5, reps: 0, lapses: 0 }
  s.reps++
  if (s.ivl === 0) {
    // Learning steps
    if (g === 0) s.due = now + MIN
    else if (g === 1) s.due = now + 6 * MIN
    else {
      s.ivl = g === 3 ? 4 : 1
      s.due = now + s.ivl * DAY
    }
    return s
  }
  if (g === 0) {
    s.lapses++
    s.ease = Math.max(1.3, s.ease - 0.2)
    s.ivl = 0
    s.due = now + 10 * MIN
    return s
  }
  if (g === 1) {
    s.ease = Math.max(1.3, s.ease - 0.15)
    s.ivl = Math.max(1, s.ivl * 1.2)
  } else if (g === 2) s.ivl = s.ivl * s.ease
  else {
    s.ivl = s.ivl * s.ease * 1.3
    s.ease += 0.15
  }
  s.ivl = Math.min(3650, Math.round(s.ivl * 10) / 10)
  s.due = now + s.ivl * DAY
  return s
}

export function intervalLabel(prev: CardState | undefined, g: Grade): string {
  const ms = schedule(prev, g, 0).due
  if (ms < 60 * MIN) return `${Math.round(ms / MIN)} min`
  if (ms < DAY) return `${Math.round(ms / (60 * MIN))} h`
  const d = ms / DAY
  if (d < 30) return `${Math.round(d)} d`
  if (d < 365) return `${Math.round(d / 30)} mo`
  return `${(d / 365).toFixed(1)} y`
}

export interface DeckStats {
  total: number
  seen: number
  due: number
  fresh: number
  mature: number // interval of 21+ days
}
export function deckStats(cards: Card[], srs: Record<string, CardState>, now = Date.now()): DeckStats {
  let seen = 0
  let due = 0
  let mature = 0
  for (const c of cards) {
    const s = srs[c.id]
    if (!s) continue
    seen++
    if (s.due <= now) due++
    if (s.ivl >= 21) mature++
  }
  return { total: cards.length, seen, due, fresh: cards.length - seen, mature }
}

export const NEW_PER_SESSION = 15

/** Cards due now (oldest first), then up to `newLimit` unseen cards in deck order. */
export function buildQueue(cards: Card[], srs: Record<string, CardState>, newLimit = NEW_PER_SESSION, now = Date.now()): Card[] {
  const due = cards.filter((c) => srs[c.id] && srs[c.id].due <= now).sort((a, b) => srs[a.id].due - srs[b.id].due)
  const fresh = cards.filter((c) => !srs[c.id])
  return [...due, ...shuffle(fresh).slice(0, newLimit)]
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// ---------- Quizzes ----------

/** Multiple-choice questions made from a deck: distractors are answers of the same kind from the same deck. */
export function buildQuiz(cards: Card[], n = 10): QuizItem[] {
  const pool = cards.filter((c) => c.quiz)
  const byKey: Record<string, Card[]> = {}
  for (const c of pool) (byKey[c.quiz!] ??= []).push(c)
  const items: QuizItem[] = []
  for (const c of shuffle(pool)) {
    if (items.length >= n) break
    const same = byKey[c.quiz!].filter((o) => o.back !== c.back)
    const others = same.length >= 3 ? same : [...same, ...pool.filter((o) => o.back !== c.back && !same.includes(o))]
    const picks: string[] = []
    for (const o of shuffle(others)) {
      if (!picks.includes(o.back)) picks.push(o.back)
      if (picks.length === 3) break
    }
    if (picks.length < 2) continue
    const choices = shuffle([c.back, ...picks])
    items.push({ id: c.id, question: c.front, tag: c.tag, choices, answer: choices.indexOf(c.back), explanation: c.detail, ref: c.ref })
  }
  return items
}
