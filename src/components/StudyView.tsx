import { useMemo, useState } from 'react'
import { ALL, getStructure } from '../data'
import { BODY_ELEMENTS } from '../data/bodyElements'
import { BY_SYMBOL } from '../data/periodic'
import { SYSTEMS, type System } from '../data/types'
import { progress, streak, useProgress, useProgressUI } from '../lib/progress'
import { Avatar } from './Profile'

interface Props {
  onStructure: (id: string) => void
  onElement: (s: string) => void
}

const ago = (ms: number) => {
  const m = Math.round((Date.now() - ms) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.round(h / 24)} d ago`
}

function Ring({ value, total, label, color }: { value: number; total: number; label: string; color: string }) {
  const r = 34
  const c = 2 * Math.PI * r
  const f = total ? Math.min(1, value / total) : 0
  return (
    <div className="ring">
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r={r} className="ring-bg" />
        <circle cx="42" cy="42" r={r} className="ring-fg" style={{ stroke: color, strokeDasharray: `${c * f} ${c}` }} />
      </svg>
      <div className="ring-txt">
        <strong>{value}</strong>
        <small>of {total}</small>
      </div>
      <span className="ring-lbl">{label}</span>
    </div>
  )
}

export default function StudyView({ onStructure, onElement }: Props) {
  const p = useProgress()
  const { openSignIn } = useProgressUI()
  const [confirmReset, setConfirmReset] = useState(false)
  const seen = Object.entries(p.seen)
  const learned = Object.entries(p.learned)
  const has = (type: string) => seen.filter(([k]) => k.startsWith(type + ':')).length
  const structureIds = new Set(seen.filter(([k]) => k.startsWith('structure:')).map(([k]) => k.slice(10)))
  const bySystem = useMemo(() => {
    const out = (Object.keys(SYSTEMS) as System[]).map((sys) => {
      const all = ALL.filter((s) => s.system === sys)
      return { sys, total: all.length, done: all.filter((s) => structureIds.has(s.id)).length }
    })
    return out.filter((r) => r.total > 0).sort((a, b) => b.done / b.total - a.done / a.total)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.seen])
  const open = (key: string) => {
    const [type, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)]
    if (type === 'structure') onStructure(id)
    else onElement(id)
  }
  const name = (key: string) => {
    const [type, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)]
    if (type === 'structure') return { title: getStructure(id)?.name ?? id, sub: 'Anatomy' }
    return { title: `${BY_SYMBOL[id]?.name ?? id} (${id})`, sub: 'Element' }
  }
  const recent = [...seen].sort((a, b) => b[1] - a[1]).slice(0, 10)
  const days = streak(p.days)

  return (
    <div className="view study">
      <header className="study-head">
        <div className="study-who">
          <Avatar name={p.name} color={p.color} size={56} />
          <div>
            <h1>{progress.signedIn ? `Welcome back, ${p.name}` : 'Your study'}</h1>
            <p className="lede">
              {days > 0 ? `${days}-day streak · ` : ''}
              {seen.length} items explored · {learned.length} marked as learned
            </p>
          </div>
        </div>
        {!progress.signedIn && (
          <div className="study-cta">
            <p>Studying as a guest.</p>
            <button className="btn-primary" onClick={openSignIn}>Create profile</button>
          </div>
        )}
      </header>

      <section className="rings">
        <Ring value={has('structure')} total={ALL.length} label="Body structures" color="#e08c5e" />
        <Ring value={seen.filter(([k]) => k.startsWith('element:') && BODY_ELEMENTS.some((e) => `element:${e.symbol}` === k)).length} total={BODY_ELEMENTS.length} label="Body elements" color="#8db6ea" />
        <Ring value={learned.length} total={Math.max(learned.length, seen.length)} label="Learned of explored" color="#62c193" />
      </section>

      <div className="study-grid">
        <section className="block">
          <h3>Progress by body system</h3>
          <div className="sys-bars">
            {bySystem.map((r) => (
              <div key={r.sys} className="sys-bar">
                <span className="sys-bar-name"><i style={{ background: SYSTEMS[r.sys].color }} />{SYSTEMS[r.sys].label}</span>
                <span className="track"><span style={{ width: `${(r.done / r.total) * 100}%`, background: SYSTEMS[r.sys].color }} /></span>
                <span className="num">{r.done}/{r.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="block">
          <h3>Recently viewed</h3>
          {recent.length === 0 ? (
            <p className="note">Nothing yet.</p>
          ) : (
            <div className="link-list">
              {recent.map(([k, t]) => {
                const n = name(k)
                return (
                  <button key={k} className="link-row" onClick={() => open(k)}>
                    <span>
                      <strong>{n.title}</strong>
                      <small>{n.sub} · {ago(t)}{p.learned[k] ? ' · learned' : ''}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="block">
          <h3>Learned <span className="count">{learned.length}</span></h3>
          {learned.length === 0 ? (
            <p className="note">Nothing yet.</p>
          ) : (
            <div className="pill-row">
              {learned.sort((a, b) => b[1] - a[1]).map(([k]) => (
                <button key={k} className="pill" onClick={() => open(k)}>{name(k).title}</button>
              ))}
            </div>
          )}
        </section>

      </div>

      <footer className="study-foot">
        {!confirmReset ? (
          <button className="btn-ghost" onClick={() => setConfirmReset(true)}>Reset this profile’s progress</button>
        ) : (
          <span className="confirm">
            Erase all progress for {p.name}?
            <button className="btn-danger" onClick={() => { progress.resetActive(); setConfirmReset(false) }}>Erase</button>
            <button className="btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
          </span>
        )}
      </footer>
    </div>
  )
}
