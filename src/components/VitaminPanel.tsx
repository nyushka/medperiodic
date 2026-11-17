import { VITAMIN_BY_ID } from '../data/vitamins'
import { BY_SYMBOL } from '../data/periodic'
import { elementColor } from './ElementPanel'

interface Props {
  id: string
  onElement: (s: string) => void
}

function List({ items, tone }: { items: string[]; tone?: string }) {
  return (
    <ul className={`blist ${tone ?? ''}`}>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

export function ElementChip({ symbol, onClick, note }: { symbol: string; onClick: () => void; note?: string }) {
  const e = BY_SYMBOL[symbol]
  return (
    <button className="el-chip" onClick={onClick} style={{ '--el': elementColor(symbol) } as React.CSSProperties} title={note ?? e.name}>
      <span className="z">{e.z}</span>
      <span className="sym">{e.symbol}</span>
      <span className="nm">{e.name}</span>
    </button>
  )
}

export default function VitaminPanel({ id, onElement }: Props) {
  const v = VITAMIN_BY_ID[id]
  return (
    <article className="vit-panel" style={{ '--el': v.color } as React.CSSProperties}>
      <header className="el-head">
        <div className="vit-badge">
          <span>{v.id}</span>
          <small>{v.solubility}-soluble</small>
        </div>
        <div className="el-head-txt">
          <h2>{v.name}</h2>
          <div className="chem">{v.chem}</div>
          <div className="formula">{v.formula}</div>
          <p className="lede">{v.summary}</p>
        </div>
      </header>

      <section className="card">
        <h3>Elements in its molecule</h3>
        <div className="chip-row">
          {v.elements.map((s) => (
            <ElementChip key={s} symbol={s} onClick={() => onElement(s)} />
          ))}
        </div>
      </section>

      <section className="stat-row">
        <div className="stat"><span className="v small">{v.rda}</span><span className="k">daily need (adults)</span></div>
        {v.ul && <div className="stat warn"><span className="v small">{v.ul}</span><span className="k">upper limit</span></div>}
        <div className="stat def"><span className="v small">{v.disease}</span><span className="k">deficiency disease</span></div>
      </section>

      <div className="grid2">
        <section className="card"><h3>What it does</h3><List items={v.functions} /></section>
        <section className="card tone-def"><h3>Deficiency signs</h3><List items={v.deficiency} tone="def" /></section>
        <section className="card tone-risk"><h3>Who usually runs low</h3><List items={v.atRisk} tone="risk" /></section>
        <section className="card tone-ex"><h3>Too much</h3><List items={v.excess} tone="ex" /></section>
      </div>

      <section className="card">
        <h3>Best food sources</h3>
        <div className="foods">
          {v.sources.map(([f, a], i) => (
            <div key={i} className="food"><span className="f">{f}</span><span className="a">{a}</span></div>
          ))}
        </div>
      </section>

      <section className="card tone-boost">
        <h3>How to get more</h3>
        <List items={v.boost} tone="boost" />
      </section>

      <section className="card">
        <h3>Mineral partners</h3>
        <div className="where-list">
          {v.minerals.map(([s, why]) => (
            <button key={s} className="where el" onClick={() => onElement(s)} style={{ '--c': elementColor(s) } as React.CSSProperties}>
              <strong>
                <span className="mini-sym">{s}</span> {BY_SYMBOL[s].name}
              </strong>
              <small>{why}</small>
            </button>
          ))}
        </div>
      </section>
    </article>
  )
}
