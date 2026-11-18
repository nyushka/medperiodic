import { ALL, BY_ID, getStructure, related } from '../data'
import { BODY_BY_SYMBOL, type BodyRole } from '../data/bodyElements'
import { BY_SYMBOL } from '../data/periodic'
import { elementsOf, KINDS, REGIONS, SYSTEMS, type Region } from '../data/types'
import { lazy, Suspense } from 'react'
import CellArt from './CellArt'

const Cell3D = lazy(() => import('./Cell3D'))
const CellThumb = lazy(() => import('./Cell3D').then((m) => ({ default: m.CellThumb })))
import { elementColor } from './ElementPanel'
import { KeyTerms } from './Learn'
import { LearnedButton } from './Profile'

interface Props {
  id: string | null
  region: Region | null
  piece?: string | null
  pieceCount?: number
  onSelect: (id: string) => void
  onElement: (s: string) => void
}

const ROLE_ORDER: BodyRole[] = ['bulk', 'major', 'trace', 'ultratrace', 'toxic']

export default function StructureDetail({ id, region, piece, pieceCount, onSelect, onElement }: Props) {
  if (!id && region) return <RegionPanel region={region} onSelect={onSelect} />
  const s = getStructure(id)
  if (!s) return <Welcome onSelect={onSelect} />

  const sys = SYSTEMS[s.system]
  const els = elementsOf(s)
    .filter(([sym]) => BY_SYMBOL[sym])
    .sort(([a], [b]) => {
      const ra = ROLE_ORDER.indexOf(BODY_BY_SYMBOL[a]?.role ?? 'ultratrace')
      const rb = ROLE_ORDER.indexOf(BODY_BY_SYMBOL[b]?.role ?? 'ultratrace')
      return ra - rb || BY_SYMBOL[a].z - BY_SYMBOL[b].z
    })
  const specific = new Set(Object.keys(s.el ?? {}))
  const rel = related(s.id)
  const cells = rel.filter((r) => r.kind === 'cell' || (r.kind === 'blood' && r.shape))
  const parts = rel.filter((r) => !cells.includes(r))
  const neighbours = ALL.filter((x) => x.region === s.region && x.kind === s.kind && x.id !== s.id).slice(0, 14)

  const key = els.filter(([sym]) => specific.has(sym))
  const keyRows = (key.length ? key : els.filter(([sym]) => ['major', 'trace'].includes(BODY_BY_SYMBOL[sym]?.role ?? ''))).slice(0, 6)
  const keySet = new Set(keyRows.map(([sym]) => sym))
  const rest = els.filter(([sym]) => !keySet.has(sym))
  const relatedAll = [...parts, ...neighbours.filter((n) => !parts.includes(n))]

  return (
    <article className="detail" style={{ '--sys': sys.color } as React.CSSProperties}>
      <header className="detail-head">
        <div className="detail-top">
          <div>
            <p className="eyebrow">
              <i className="sw" style={{ background: sys.color }} />
              {sys.label} · {KINDS[s.kind].label} · {REGIONS[s.region]}
              {s.count && s.count > 1 ? ` · ×${s.count.toLocaleString()}` : ''}
            </p>
            <h2>{s.name}</h2>
          </div>
        </div>
        {s.shape && (
          <Suspense fallback={<CellArt shape={s.shape} color={sys.color} />}>
            <Cell3D key={s.id} shape={s.shape} color={sys.color} label={s.name} />
          </Suspense>
        )}
        <p className="lede">{s.desc}</p>
        <div className="head-actions">
          <LearnedButton type="structure" id={s.id} />
        </div>
        {piece && piece.toLowerCase() !== s.name.toLowerCase() && (
          <p className="piece-line">
            Selected piece: {piece}
            {pieceCount && pieceCount > 1 ? ` · ${pieceCount} pieces highlighted` : ''}
          </p>
        )}
      </header>

      {s.facts && (
        <dl className="props">
          {s.facts.map(([k, v]) => (
            <div key={k} className={v.length > 34 ? 'wide' : ''}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <section className="block">
        <h3>Key elements here</h3>
        <div className="el-rows">
          {keyRows.map(([sym, role]) => (
            <button key={sym} className="el-row" onClick={() => onElement(sym)} style={{ '--el': elementColor(sym) } as React.CSSProperties}>
              <span className="mini-tile">
                <span className="sym">{sym}</span>
              </span>
              <span className="el-row-txt">
                <strong>{BY_SYMBOL[sym].name}</strong>
                <small>{role}</small>
              </span>
            </button>
          ))}
        </div>
        {rest.length > 0 && (
          <>
            <p className="sub-lbl">Also present</p>
            <div className="sym-strip">
              {rest.map(([sym, role]) => (
                <button key={sym} className="sym-chip" title={`${BY_SYMBOL[sym].name}: ${role}`} onClick={() => onElement(sym)} style={{ '--el': elementColor(sym) } as React.CSSProperties}>
                  {sym}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {cells.length > 0 && (
        <section className="block">
          <h3>Cells that make it up</h3>
          <div className="cell-grid">
            {cells.map((c) => (
              <button key={c.id} className="cell-btn" onClick={() => onSelect(c.id)}>
                <Suspense fallback={<span className="cell-thumb ph" />}>
                  <CellThumb shape={c.shape ?? 'round'} color={SYSTEMS[c.system].color} alt="" />
                </Suspense>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {relatedAll.length > 0 && (
        <details className="fold">
          <summary>Related structures <span className="count">{relatedAll.length}</span></summary>
          <div className="pill-row">
            {relatedAll.map((p) => (
              <button key={p.id} className="pill" onClick={() => onSelect(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </details>
      )}

      <KeyTerms kind={s.kind} />
    </article>
  )
}

function RegionPanel({ region, onSelect }: { region: Region; onSelect: (id: string) => void }) {
  const items = ALL.filter((s) => s.region === region)
  const groups = Object.entries(
    items.reduce<Record<string, typeof items>>((acc, s) => {
      ;(acc[s.kind] ??= []).push(s)
      return acc
    }, {}),
  )
  return (
    <article className="detail">
      <header className="detail-head">
        <div className="chips"><span className="chip">Body region</span></div>
        <h2>{REGIONS[region]}</h2>
        <p className="lede">{items.length} structures catalogued in this region. Pick one to see its elements, cells and connections.</p>
      </header>
      {groups.map(([kind, list]) => (
        <section className="card" key={kind}>
          <h3>
            {KINDS[kind as keyof typeof KINDS].plural} <span className="count">{list.length}</span>
          </h3>
          <div className="pill-row">
            {list.map((p) => (
              <button key={p.id} className="pill" onClick={() => onSelect(p.id)} style={{ '--c': SYSTEMS[p.system].color } as React.CSSProperties}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      ))}
    </article>
  )
}

function Welcome({ onSelect }: { onSelect: (id: string) => void }) {
  const picks = ['bone-femur', 'heart', 'cell-rbc', 'thyroid', 'hair-follicle', 'cell-neuron', 'muscle-diaphragm', 'teeth', 'liver'].filter((i) => BY_ID[i])
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>Pick any part of the body</h2>
        <p className="lede">Rotate the 3D body, pick a body system, then tap any structure: all 2,237 pieces are selectable. Use the hand and foot views to reach individual carpals and phalanges.</p>
      </header>
      <section className="card">
        <h3>Good places to start</h3>
        <div className="pill-row">
          {picks.map((p) => (
            <button key={p} className="pill" onClick={() => onSelect(p)} style={{ '--c': SYSTEMS[BY_ID[p].system].color } as React.CSSProperties}>
              {BY_ID[p].name}
            </button>
          ))}
        </div>
      </section>
    </article>
  )
}
