import { ALL, BY_ID, related } from '../data'
import { BODY_BY_SYMBOL, ROLE_INFO, type BodyRole } from '../data/bodyElements'
import { BY_SYMBOL } from '../data/periodic'
import { elementsOf, KINDS, REGIONS, SYSTEMS, type Region } from '../data/types'
import CellArt from './CellArt'
import { elementColor } from './ElementPanel'
import { KeyTerms } from './Learn'

interface Props {
  id: string | null
  region: Region | null
  onSelect: (id: string) => void
  onElement: (s: string) => void
}

const ROLE_ORDER: BodyRole[] = ['bulk', 'major', 'trace', 'ultratrace', 'toxic']

export default function StructureDetail({ id, region, onSelect, onElement }: Props) {
  if (!id && region) return <RegionPanel region={region} onSelect={onSelect} />
  const s = id ? BY_ID[id] : null
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

  return (
    <article className="detail" style={{ '--sys': sys.color } as React.CSSProperties}>
      <header className="detail-head">
        <div className="detail-top">
          <div>
            <div className="chips">
              <span className="chip" style={{ '--c': sys.color } as React.CSSProperties}>{sys.label}</span>
              <span className="chip ghost">{KINDS[s.kind].label}</span>
              <span className="chip ghost">{REGIONS[s.region]}</span>
              {s.count && s.count > 1 && <span className="chip ghost">× {s.count.toLocaleString()}</span>}
            </div>
            <h2>{s.name}</h2>
          </div>
          {s.shape && <CellArt shape={s.shape} color={sys.color} />}
        </div>
        <p className="lede">{s.desc}</p>
      </header>

      {s.facts && (
        <dl className="facts-grid">
          {s.facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <KeyTerms kind={s.kind} />

      <section className="card">
        <h3>
          Elements found here <span className="count">{els.length}</span>
        </h3>
        <p className="fine">Tap an element for its electron configuration, deficiency signs and how to get more. Highlighted rows have a role specific to this structure.</p>
        <div className="el-rows">
          {els.map(([sym, role]) => {
            const be = BODY_BY_SYMBOL[sym]
            return (
              <button key={sym} className={`el-row${specific.has(sym) ? ' spec' : ''}`} onClick={() => onElement(sym)} style={{ '--el': elementColor(sym) } as React.CSSProperties}>
                <span className="mini-tile">
                  <span className="z">{BY_SYMBOL[sym].z}</span>
                  <span className="sym">{sym}</span>
                </span>
                <span className="el-row-txt">
                  <strong>
                    {BY_SYMBOL[sym].name}
                    {be && <em>{ROLE_INFO[be.role].label}</em>}
                  </strong>
                  <small>{role}</small>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {cells.length > 0 && (
        <section className="card">
          <h3>Cells that make it up</h3>
          <div className="cell-grid">
            {cells.map((c) => (
              <button key={c.id} className="cell-btn" onClick={() => onSelect(c.id)}>
                <CellArt shape={c.shape ?? 'round'} color={SYSTEMS[c.system].color} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {parts.length > 0 && (
        <section className="card">
          <h3>Connected structures</h3>
          <div className="pill-row">
            {parts.map((p) => (
              <button key={p.id} className="pill" onClick={() => onSelect(p.id)} style={{ '--c': SYSTEMS[p.system].color } as React.CSSProperties}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {neighbours.length > 0 && (
        <section className="card">
          <h3>More {KINDS[s.kind].plural.toLowerCase()} in the {REGIONS[s.region].toLowerCase()}</h3>
          <div className="pill-row">
            {neighbours.map((p) => (
              <button key={p.id} className="pill" onClick={() => onSelect(p.id)} style={{ '--c': SYSTEMS[p.system].color } as React.CSSProperties}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      )}
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
  const picks = ['bone-femur', 'organ-heart', 'heart', 'cell-rbc', 'thyroid', 'hair-follicle', 'cell-neuron', 'muscle-diaphragm', 'teeth', 'liver'].filter((i) => BY_ID[i])
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>Pick any part of the body</h2>
        <p className="lede">Switch layers to see the skeleton, muscles, organs, blood vessels or nerves, then tap a structure. Zoom into the hand or foot to reach individual carpals and phalanges.</p>
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
