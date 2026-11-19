import { searchStructures } from '../data/aliases'
import { useMemo, useState } from 'react'
import { ALL } from '../data'
import { BODY_BY_SYMBOL, BODY_ELEMENTS, ROLE_INFO, type BodyRole } from '../data/bodyElements'
import { CATEGORY_COLORS, gridPos, PERIODIC, type ElementCategory } from '../data/periodic'
import { KINDS, SYSTEMS, type Kind, type Structure, type System } from '../data/types'
import { VITAMINS } from '../data/vitamins'
import { configuration } from '../lib/electrons'
import { ConfigText } from './Atom'

// ---------------- Periodic table ----------------
export function ElementsView({ onElement }: { onElement: (s: string) => void }) {
  const [mode, setMode] = useState<'body' | 'family'>('body')
  const [hover, setHover] = useState<string>('Fe')
  const he = PERIODIC.find((e) => e.symbol === hover)!
  const comp = [
    ['O', 65], ['C', 18], ['H', 10], ['N', 3], ['Ca', 1.5], ['P', 1], ['K', 0.35], ['S', 0.25], ['Na', 0.15], ['Cl', 0.15], ['Mg', 0.05],
  ] as const
  const rest = 100 - comp.reduce((a, [, v]) => a + v, 0)

  return (
    <div className="view elements-view">
      <section className="hero-band">
        <div>
          <h1>The periodic table of you</h1>
        </div>
        <div className="comp">
          <div className="lbl">Body composition by mass (70 kg adult)</div>
          <div className="comp-bar" role="img" aria-label="Oxygen 65%, carbon 18%, hydrogen 10%, nitrogen 3%, calcium 1.5%, phosphorus 1%, others about 1.5%">
            {comp.map(([s, v]) => (
              <button key={s} style={{ flexGrow: v, '--c': ROLE_INFO[BODY_BY_SYMBOL[s].role].color } as React.CSSProperties} onClick={() => onElement(s)} title={`${s} ${v}%`}>
                {v >= 1 && <span>{s} {v}%</span>}
              </button>
            ))}
            <span className="rest" style={{ flexGrow: rest }} title={`Trace elements ≈ ${rest.toFixed(1)}%`} />
          </div>
          <div className="comp-legend">K 0.35% · S 0.25% · Na 0.15% · Cl 0.15% · Mg 0.05% · all trace elements together &lt; 0.01%</div>
        </div>
      </section>

      <div className="pt-tools">
        <div className="seg small">
          <button className={mode === 'body' ? 'on' : ''} onClick={() => setMode('body')}>Color by role in body</button>
          <button className={mode === 'family' ? 'on' : ''} onClick={() => setMode('family')}>Color by chemical family</button>
        </div>
        <div className="legend">
          {mode === 'body'
            ? (Object.keys(ROLE_INFO) as BodyRole[]).map((r) => (
                <span key={r} style={{ '--c': ROLE_INFO[r].color } as React.CSSProperties}><i />{ROLE_INFO[r].label}</span>
              ))
            : (Object.keys(CATEGORY_COLORS) as ElementCategory[]).map((c) => (
                <span key={c} style={{ '--c': CATEGORY_COLORS[c] } as React.CSSProperties}><i />{c}</span>
              ))}
        </div>
      </div>

      <div className="pt-scroll">
        <div className="pt">
          {PERIODIC.map((e) => {
            const { row, col } = gridPos(e)
            const b = BODY_BY_SYMBOL[e.symbol]
            const color = mode === 'body' ? (b ? ROLE_INFO[b.role].color : '#3a3f6e') : CATEGORY_COLORS[e.category]
            const dim = mode === 'body' && !b
            return (
              <button
                key={e.z}
                className={`pt-cell${dim ? ' dim' : ''}${hover === e.symbol ? ' hov' : ''}`}
                style={{ gridRow: row > 7 ? row + 0 : row, gridColumn: col, '--el': color } as React.CSSProperties}
                onClick={() => onElement(e.symbol)}
                onMouseEnter={() => setHover(e.symbol)}
                onFocus={() => setHover(e.symbol)}
                aria-label={`${e.name}, ${e.z}`}
              >
                <span className="z">{e.z}</span>
                <span className="sym">{e.symbol}</span>
                <span className="nm">{e.name}</span>
              </button>
            )
          })}
          <div className="pt-gap" style={{ gridRow: 8, gridColumn: '1 / -1' }} />
          <div className="pt-info" style={{ gridRow: '1 / 4', gridColumn: '3 / 13' }}>
            <div className="pt-info-sym" style={{ '--el': BODY_BY_SYMBOL[hover] ? ROLE_INFO[BODY_BY_SYMBOL[hover].role].color : CATEGORY_COLORS[he.category] } as React.CSSProperties}>
              {he.symbol}
            </div>
            <div>
              <strong>{he.name}</strong> · Z = {he.z} · {he.mass} u
              <div className="pt-cfg"><ConfigText shells={configuration(he.z)} /></div>
              <small>{BODY_BY_SYMBOL[hover] ? `${BODY_BY_SYMBOL[hover].amount} in your body` : 'Not a meaningful part of the body'}</small>
            </div>
          </div>
        </div>
      </div>

      <section className="role-cards">
        {(Object.keys(ROLE_INFO) as BodyRole[]).map((r) => (
          <div key={r} className="role-card" style={{ '--c': ROLE_INFO[r].color } as React.CSSProperties}>
            <h3>{ROLE_INFO[r].label}</h3>
            <div className="chip-row">
              {BODY_ELEMENTS.filter((e) => e.role === r).map((e) => (
                <button key={e.symbol} className="sym-btn" onClick={() => onElement(e.symbol)}>
                  {e.symbol}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// ---------------- Vitamins ----------------
export function VitaminsView({ onVitamin }: { onVitamin: (id: string) => void }) {
  return (
    <div className="view">
      <section className="hero-band">
        <div>
          <h1>Vitamins</h1>
        </div>
      </section>
      <div className="vit-grid">
        {VITAMINS.map((v) => (
          <button key={v.id} className="vit-card" onClick={() => onVitamin(v.id)} style={{ '--c': v.color } as React.CSSProperties}>
            <span className="vit-id">{v.id}</span>
            <span className="vit-txt">
              <strong>{v.chem.split(/[(,]/)[0].trim()}</strong>
              <small>{v.solubility}-soluble · {v.formula}</small>
              <span className="vit-def">Deficiency: {v.disease.split(';')[0].split('—')[0]}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------- Index ----------------
export function IndexView({ selectedId, onSelect, extra = [] }: { selectedId: string | null; onSelect: (id: string) => void; extra?: Structure[] }) {
  const [pieces, setPieces] = useState(false)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<Kind | 'all'>('all')
  const [system, setSystem] = useState<System | 'all'>('all')
  const list = useMemo(() => {
    const pool = (pieces ? [...ALL, ...extra] : ALL).filter((s) => (kind === 'all' || s.kind === kind) && (system === 'all' || s.system === system))
    // Ranked search that also understands everyday names (kneecap, belly button, knuckles…)
    return q.trim() ? searchStructures(q, pool) : pool.sort((a, b) => a.name.localeCompare(b.name))
  }, [q, kind, system, pieces, extra])

  return (
    <div className="index">
      <label className="search">
        <span className="sr">Search the body</span>
        <input id="search" type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="filters">
        <select id="kind" value={kind} onChange={(e) => setKind(e.target.value as Kind | 'all')} aria-label="Type">
          <option value="all">All types</option>
          {(Object.keys(KINDS) as Kind[]).map((k) => (
            <option key={k} value={k}>{KINDS[k].plural}</option>
          ))}
        </select>
        <select id="system" value={system} onChange={(e) => setSystem(e.target.value as System | 'all')} aria-label="System">
          <option value="all">All systems</option>
          {(Object.keys(SYSTEMS) as System[]).map((s) => (
            <option key={s} value={s}>{SYSTEMS[s].label}</option>
          ))}
        </select>
      </div>
      <label className="check">
        <input id="pieces" type="checkbox" checked={pieces} onChange={(e) => setPieces(e.target.checked)} /> Also list every individual 3D model piece ({extra.length.toLocaleString()} more: branches of arteries, nerves, small muscles…)
      </label>
      <div className="index-count">{list.length.toLocaleString()} results</div>
      <ul className="index-list">
        {list.slice(0, 600).map((s) => (
          <li key={s.id}>
            <button className={selectedId === s.id ? 'on' : ''} onClick={() => onSelect(s.id)} style={{ '--c': SYSTEMS[s.system].color } as React.CSSProperties}>
              <i />
              <span className="n">{s.name}</span>
              <span className="k">{KINDS[s.kind].label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
