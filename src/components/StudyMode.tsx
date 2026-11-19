import { useEffect, useMemo, useRef, useState } from 'react'
import { apiKey, generateWithClaude, generateWithKey, getSample, LEVELS, type AiError } from '../lib/ai'
import {
  buildQueue,
  buildQuiz,
  builtinDecks,
  customCards,
  deckStats,
  GRADES,
  GROUPS,
  intervalLabel,
  schedule,
  SECTIONS_LIST,
  shuffle,
  type Card,
  type CustomDeck,
  type DeckInfo,
  type Grade,
  type QuizItem,
} from '../lib/flashcards'
import { progress, streak, useProgress } from '../lib/progress'
import StudyView from './StudyView'

export type StudyTab = 'decks' | 'custom' | 'progress'

interface Props {
  tab: StudyTab
  onTab: (t: StudyTab) => void
  onStructure: (id: string) => void
  onElement: (s: string) => void
}

type Screen =
  | { mode: 'home' }
  | { mode: 'review'; title: string; color: string; cards: Card[] }
  | { mode: 'quiz'; title: string; color: string; deckId: string; items: QuizItem[] }
  | { mode: 'browse'; title: string; color: string; cards: Card[]; deck?: CustomDeck }

const CUSTOM_COLOR = '#ad2831'

function customInfo(d: CustomDeck): DeckInfo {
  return { id: d.id, label: d.title, blurb: `${d.source === 'ai' ? 'AI deck' : 'Your deck'} · ${d.topic}${d.level ? ` · ${d.level}` : ''}`, color: CUSTOM_COLOR, group: 'Custom', custom: d }
}

export default function StudyMode({ tab, onTab, onStructure, onElement }: Props) {
  const p = useProgress()
  const srs = p.srs ?? {}
  const decks = builtinDecks()
  const [screen, setScreen] = useState<Screen>({ mode: 'home' })
  const custom = p.decks ?? []
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    document.body.classList.toggle('study-focus', screen.mode === 'review' || screen.mode === 'quiz')
    return () => document.body.classList.remove('study-focus')
  }, [screen.mode])

  const cardsOf = (info: DeckInfo): Card[] => (info.custom ? customCards(info.custom) : decks[info.id])
  const allDue = useMemo(() => {
    const all = [...Object.values(decks).flat(), ...custom.flatMap(customCards)]
    const now = Date.now()
    return all.filter((c) => srs[c.id] && srs[c.id].due <= now)
  }, [decks, custom, srs])

  const study = (info: DeckInfo) => {
    const q = buildQueue(cardsOf(info), srs)
    if (q.length) setScreen({ mode: 'review', title: info.label, color: info.color, cards: q })
  }
  const quiz = (info: DeckInfo) => {
    const items = info.custom?.quiz.length ? shuffle(info.custom.quiz).slice(0, 15) : buildQuiz(cardsOf(info), 10)
    if (items.length) setScreen({ mode: 'quiz', title: info.label, color: info.color, deckId: info.id, items })
  }
  const browse = (info: DeckInfo) => setScreen({ mode: 'browse', title: info.label, color: info.color, cards: cardsOf(info), deck: info.custom })
  const openRef = (c: { ref?: Card['ref'] }) => {
    if (!c.ref) return
    if (c.ref.type === 'structure') onStructure(c.ref.id)
    else onElement(c.ref.id)
  }

  if (screen.mode === 'review')
    return <Review key={screen.title} title={screen.title} color={screen.color} cards={screen.cards} onDone={() => setScreen({ mode: 'home' })} onOpen={openRef} />
  if (screen.mode === 'quiz')
    return <Quiz title={screen.title} color={screen.color} items={screen.items} deckId={screen.deckId} onDone={() => setScreen({ mode: 'home' })} onOpen={openRef} />
  if (screen.mode === 'browse') {
    // Custom decks are read live so cards added by hand appear at once
    const live = screen.deck ? custom.find((d) => d.id === screen.deck!.id) : undefined
    return <Browse {...screen} deck={live} cards={live ? customCards(live) : screen.cards} onBack={() => setScreen({ mode: 'home' })} onOpen={openRef} />
  }

  const reviewedToday = p.reviews?.[today] ?? 0
  return (
    <section className="view study-mode">
      <header className="sm-head">
        <div>
          <h1>Flashcards &amp; quizzes</h1>
        </div>
        <p className="sm-stats">
          <strong>{allDue.length}</strong> due now · <strong>{reviewedToday}</strong> reviewed today · <strong>{streak(p.days)}</strong>-day streak
        </p>
      </header>

      <div className="sm-bar">
        <nav className="seg" role="tablist" aria-label="Study sections">
          {([['decks', 'Body decks'], ['custom', 'Custom & AI decks'], ['progress', 'My progress']] as [StudyTab, string][]).map(([t, l]) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => onTab(t)}>{l}</button>
          ))}
        </nav>
        {allDue.length > 0 && tab !== 'progress' && (
          <button className="btn-primary" onClick={() => setScreen({ mode: 'review', title: 'Everything due', color: '#ad2831', cards: allDue.sort((a, b) => srs[a.id].due - srs[b.id].due) })}>
            Review all {allDue.length} due
          </button>
        )}
      </div>

      {tab === 'decks' &&
        GROUPS.map((g) => (
          <div key={g} className="sm-group">
            <h2 className="sm-group-h">{g}</h2>
            <div className="deck-grid">
              {SECTIONS_LIST.filter((s) => s.group === g).map((info) => (
                <DeckTile key={info.id} info={info} cards={decks[info.id]} srs={srs} best={p.quiz?.[info.id]?.best} onStudy={() => study(info)} onQuiz={() => quiz(info)} onBrowse={() => browse(info)} />
              ))}
            </div>
          </div>
        ))}

      {tab === 'custom' && (
        <>
          <Generator />
          {custom.length > 0 && (
            <div className="sm-group">
              <h2 className="sm-group-h">Your decks</h2>
              <div className="deck-grid">
                {custom.map((d) => {
                  const info = customInfo(d)
                  return (
                    <DeckTile key={d.id} info={info} cards={customCards(d)} srs={srs} best={p.quiz?.[d.id]?.best} onStudy={() => study(info)} onQuiz={() => quiz(info)} onBrowse={() => browse(info)} canQuiz={d.quiz.length > 0 || d.cards.length >= 4} />
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'progress' && <StudyView onStructure={onStructure} onElement={onElement} />}
    </section>
  )
}

function DeckTile({ info, cards, srs, best, onStudy, onQuiz, onBrowse, canQuiz = true }: { info: DeckInfo; cards: Card[]; srs: Record<string, import('../lib/flashcards').CardState>; best?: number; onStudy: () => void; onQuiz: () => void; onBrowse: () => void; canQuiz?: boolean }) {
  const st = deckStats(cards, srs)
  const pct = st.total ? st.seen / st.total : 0
  return (
    <article className="deck" style={{ '--c': info.color } as React.CSSProperties}>
      <div className="deck-top">
        <h3>{info.label}</h3>
        {st.due > 0 && <span className="due-badge" title="Cards due for review">{st.due} due</span>}
      </div>
      <div className="deck-meter" aria-label={`${st.seen} of ${st.total} cards studied`}>
        <span style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="deck-nums">
        <span>{st.total.toLocaleString()} cards</span>
        <span>{st.seen} studied</span>
        {st.mature > 0 && <span>{st.mature} mastered</span>}
        {best !== undefined && <span>quiz best {Math.round(best * 100)}%</span>}
      </p>
      <div className="deck-actions">
        <button className="btn-primary sm" onClick={onStudy}>{st.due ? 'Review' : st.seen ? 'Study more' : 'Start'}</button>
        <button className="btn-ghost" onClick={onQuiz} disabled={!canQuiz}>Quiz</button>
        <button className="btn-ghost" onClick={onBrowse}>Browse</button>
      </div>
    </article>
  )
}

function Multiline({ text }: { text: string }) {
  const lines = text.split('\n')
  return lines.length > 1 ? (
    <ul className="card-lines">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  ) : (
    <>{text}</>
  )
}

function Review({ title, color, cards, onDone, onOpen }: { title: string; color: string; cards: Card[]; onDone: () => void; onOpen: (c: Card) => void }) {
  const p = useProgress()
  const srs = p.srs ?? {}
  const [queue, setQueue] = useState(cards)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState<Record<Grade, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 })
  const total = useRef(cards.length)
  const card = queue[0]

  const grade = (g: Grade) => {
    if (!card || !flipped) return
    const next = schedule(srs[card.id], g)
    progress.review(card.id, next)
    setDone((d) => ({ ...d, [g]: d[g] + 1 }))
    setFlipped(false)
    setQueue((q) => {
      const rest = q.slice(1)
      // Still learning: see it again later in this session
      if (next.ivl === 0) {
        const at = Math.min(rest.length, g === 0 ? 3 : 6)
        total.current++
        return [...rest.slice(0, at), card, ...rest.slice(at)]
      }
      return rest
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea')) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped(true)
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade((Number(e.key) - 1) as Grade)
      else if (e.key === 'Escape') onDone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const reviewed = done[0] + done[1] + done[2] + done[3]
  if (!card)
    return (
      <section className="view study-run" style={{ '--c': color } as React.CSSProperties}>
        <div className="run-done">
          <p className="eyebrow">{title}</p>
          <h2>Session complete</h2>
          <p className="lede">{reviewed} reviewed</p>
          <div className="done-grid">
            {GRADES.map(({ g, label }) => (
              <div key={g} className={`g${g}`}><strong>{done[g]}</strong><span>{label}</span></div>
            ))}
          </div>
          <button className="btn-primary" onClick={onDone}>Back to decks</button>
        </div>
      </section>
    )

  return (
    <section className="view study-run" style={{ '--c': color } as React.CSSProperties}>
      <div className="run-bar">
        <button className="btn-ghost" onClick={onDone}>← Decks</button>
        <span className="run-title">{title}</span>
        <span className="run-count">{queue.length} left</span>
      </div>
      <div className="run-meter"><span style={{ width: `${(reviewed / Math.max(total.current, 1)) * 100}%` }} /></div>
      <div className={`flashcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(true)} role="button" tabIndex={0} aria-label={flipped ? 'Answer shown' : 'Show answer'}>
        <div className="fc-inner">
          <div className="fc-face fc-front">
            <p className="fc-tag">{card.tag}</p>
            <div className="fc-text"><Multiline text={card.front} /></div>
          </div>
          <div className="fc-face fc-back">
            <p className="fc-tag">{card.tag}</p>
            <div className="fc-q"><Multiline text={card.front} /></div>
            <div className="fc-text answer"><Multiline text={card.back} /></div>
            {card.detail && <p className="fc-detail">{card.detail}</p>}
            {card.ref && (
              <button
                className="fc-link"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen(card)
                }}
              >
                {card.ref.type === 'structure' ? 'Open in 3D →' : 'Open element →'}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="grade-row" aria-hidden={!flipped}>
        {flipped ? (
          GRADES.map(({ g, label }) => (
            <button key={g} className={`grade g${g}`} onClick={() => grade(g)}>
              <strong>{label}</strong>
              <small>{intervalLabel(srs[card.id], g)}</small>
            </button>
          ))
        ) : (
          <button className="btn-primary show-btn" onClick={() => setFlipped(true)}>Show answer</button>
        )}
      </div>
    </section>
  )
}

function Quiz({ title, color, items, deckId, onDone, onOpen }: { title: string; color: string; items: QuizItem[]; deckId: string; onDone: () => void; onOpen: (c: QuizItem) => void }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const item = items[i]

  const choose = (k: number) => {
    if (picked !== null || !item) return
    setPicked(k)
    if (k === item.answer) setScore((s) => s + 1)
  }
  const next = () => {
    if (picked === null) return
    if (i + 1 >= items.length) {
      progress.recordQuiz(deckId, score, items.length)
      setFinished(true)
    } else {
      setI(i + 1)
      setPicked(null)
    }
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return
      const n = Number(e.key)
      if (n >= 1 && n <= (item?.choices.length ?? 0)) choose(n - 1)
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'Escape') onDone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (finished) {
    return (
      <section className="view study-run" style={{ '--c': color } as React.CSSProperties}>
        <div className="run-done">
          <p className="eyebrow">{title} · quiz</p>
          <h2>{score} / {items.length}</h2>
          <div className="deck-actions">
            <button className="btn-primary" onClick={onDone}>Back to decks</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="view study-run" style={{ '--c': color } as React.CSSProperties}>
      <div className="run-bar">
        <button className="btn-ghost" onClick={onDone}>← Decks</button>
        <span className="run-title">{title} · quiz</span>
        <span className="run-count">{i + 1} / {items.length} · {score} right</span>
      </div>
      <div className="run-meter"><span style={{ width: `${(i / items.length) * 100}%` }} /></div>
      <div className="quiz-card">
        {item.tag && <p className="fc-tag">{item.tag}</p>}
        <div className="fc-text"><Multiline text={item.question} /></div>
        <ol className="choices">
          {item.choices.map((c, k) => {
            const state = picked === null ? '' : k === item.answer ? ' right' : k === picked ? ' wrong' : ' dim'
            return (
              <li key={k}>
                <button className={`choice${state}`} onClick={() => choose(k)} disabled={picked !== null}>
                  <span className="ck">{k + 1}</span>
                  <span className="ct"><Multiline text={c} /></span>
                </button>
              </li>
            )
          })}
        </ol>
        {picked !== null && (
          <div className={`quiz-feedback ${picked === item.answer ? 'ok' : 'no'}`}>
            <strong>{picked === item.answer ? 'Correct.' : 'Not quite.'}</strong>
            {item.explanation && <span> {item.explanation}</span>}
            <div className="qf-actions">
              {item.ref && <button className="fc-link" onClick={() => onOpen(item)}>Look it up →</button>}
              <button className="btn-primary" onClick={next}>{i + 1 >= items.length ? 'See score' : 'Next question'}</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Browse({ title, color, cards, deck, onBack, onOpen }: { title: string; color: string; cards: Card[]; deck?: CustomDeck; onBack: () => void; onOpen: (c: Card) => void }) {
  const [q, setQ] = useState('')
  const [confirm, setConfirm] = useState(false)
  const t = q.trim().toLowerCase()
  const list = t ? cards.filter((c) => `${c.front} ${c.back} ${c.tag}`.toLowerCase().includes(t)) : cards
  return (
    <section className="view study-browse" style={{ '--c': color } as React.CSSProperties}>
      <div className="run-bar">
        <button className="btn-ghost" onClick={onBack}>← Decks</button>
        <span className="run-title">{title}</span>
        <span className="run-count">{cards.length} cards</span>
      </div>
      {deck && <DeckEditor deck={deck} />}
      <label className="search">
        <span className="sr">Search this deck</span>
        <input type="search" placeholder="Search this deck…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <ol className="card-list">
        {list.slice(0, 400).map((c) => (
          <li key={c.id}>
            <p className="fc-tag">{c.tag}</p>
            <div className="cl-front"><Multiline text={c.front} /></div>
            <div className="cl-back"><Multiline text={c.back} /></div>
            {c.ref && <button className="fc-link" onClick={() => onOpen(c)}>Open →</button>}
          </li>
        ))}
      </ol>
      {list.length > 400 && <p className="note">Showing the first 400 of {list.length}. Search to narrow the list.</p>}
      {deck && (
        <div className="study-foot">
          {confirm ? (
            <>
              <span>Delete “{deck.title}” and its review history?</span>
              <span>
                <button className="btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>{' '}
                <button
                  className="btn-danger"
                  onClick={() => {
                    progress.deleteDeck(deck.id)
                    onBack()
                  }}
                >
                  Delete deck
                </button>
              </span>
            </>
          ) : (
            <button className="btn-ghost" onClick={() => setConfirm(true)}>Delete this deck</button>
          )}
        </div>
      )}
    </section>
  )
}

/** Add cards by hand to a custom deck, Anki style. */
function DeckEditor({ deck }: { deck: CustomDeck }) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    const id = `m${Date.now().toString(36)}`
    progress.saveDeck({ ...deck, cards: [...deck.cards, { id, front: front.trim(), back: back.trim() }] })
    setFront('')
    setBack('')
  }
  return (
    <form className="card-editor" onSubmit={add}>
      <label>
        <span>Front</span>
        <textarea rows={2} value={front} onChange={(e) => setFront(e.target.value)} placeholder="Question or term" />
      </label>
      <label>
        <span>Back</span>
        <textarea rows={2} value={back} onChange={(e) => setBack(e.target.value)} placeholder="Answer" />
      </label>
      <button className="btn-primary" disabled={!front.trim() || !back.trim()}>Add card</button>
    </form>
  )
}

function Generator() {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(20)
  const [level, setLevel] = useState<string>(LEVELS[1])
  const [mode, setMode] = useState<'checking' | 'claude' | 'key' | 'none'>('checking')
  const [key, setKey] = useState(apiKey.get())
  const [keyDraft, setKeyDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [got, setGot] = useState(0)
  const [err, setErr] = useState('')
  const [made, setMade] = useState<string | null>(null)
  const ctl = useRef<AbortController | null>(null)

  useEffect(() => {
    let live = true
    getSample().then((s) => {
      if (live) setMode(s ? 'claude' : apiKey.get() ? 'key' : 'none')
    })
    return () => {
      live = false
      ctl.current?.abort()
    }
  }, [])

  const run = async () => {
    const t = topic.trim()
    if (!t || busy) return
    ctl.current = new AbortController()
    setBusy(true)
    setErr('')
    setGot(0)
    setMade(null)
    const req = { topic: t, count, quizCount: Math.max(5, Math.round(count / 2)), level }
    try {
      const deck = mode === 'claude' ? await generateWithClaude(req, ctl.current.signal, setGot) : await generateWithKey(req, key, ctl.current.signal, setGot)
      progress.saveDeck(deck)
      setMade(deck.title)
      setTopic('')
    } catch (e) {
      const a = e as AiError
      if (a.code !== 'cancelled') setErr(a.message || 'Something went wrong.')
      if (a.hide) setMode(apiKey.get() ? 'key' : 'none')
      if (a.code === 'bad_key') {
        apiKey.set('')
        setKey('')
        setMode('none')
      }
    } finally {
      setBusy(false)
    }
  }

  const blank = () => {
    const t = topic.trim() || 'My deck'
    progress.saveDeck({ id: `d${Date.now().toString(36)}`, title: t, topic: t, created: Date.now(), source: 'manual', cards: [], quiz: [] })
    setMade(t)
    setTopic('')
  }

  const ready = mode === 'claude' || mode === 'key'
  return (
    <div className="gen">
      <div className="gen-main">
        <h2>New deck</h2>
        {mode === 'claude' && <p className="note">Uses your Claude account.</p>}
        <form
          className="gen-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (ready) run()
            else blank()
          }}
        >
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={200} placeholder="Topic" aria-label="Topic" disabled={busy} />
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="Number of cards" disabled={busy}>
            {[10, 20, 30, 40].map((n) => (
              <option key={n} value={n}>{n} cards</option>
            ))}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level" disabled={busy}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          {busy ? (
            <button type="button" className="btn-ghost" onClick={() => ctl.current?.abort()}>Stop</button>
          ) : ready ? (
            <button className="btn-primary" disabled={!topic.trim()}>Generate with AI</button>
          ) : (
            <button className="btn-primary">Create empty deck</button>
          )}
        </form>
        {busy && (
          <p className="gen-status" role="status">
            <i className="spin" /> {got ? `${got} cards…` : 'Generating…'}
          </p>
        )}
        {err && <p className="gen-err" role="alert">{err}</p>}
        {made && <p className="gen-ok" role="status">“{made}” created.</p>}
        {ready && !busy && (
          <p className="note small">
            <button className="linklike" onClick={blank}>Empty deck</button>
            {mode === 'key' && (
              <>
                {' '}·{' '}
                <button
                  className="linklike"
                  onClick={() => {
                    apiKey.set('')
                    setKey('')
                    setMode('none')
                  }}
                >
                  Remove API key
                </button>
              </>
            )}
          </p>
        )}
      </div>
      {mode === 'none' && (
        <form
          className="gen-key"
          onSubmit={(e) => {
            e.preventDefault()
            const v = keyDraft.trim()
            if (!v) return
            apiKey.set(v)
            setKey(v)
            setKeyDraft('')
            setMode('key')
          }}
        >
          <h3>AI decks</h3>
          <p className="note">Paste an Anthropic API key. It stays in this browser.</p>
          <input type="password" autoComplete="off" value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder="sk-ant-…" aria-label="Anthropic API key" />
          <button className="btn-ghost" disabled={!keyDraft.trim()}>Save key</button>
        </form>
      )}
    </div>
  )
}
