import { useState } from 'react'
import { VITAMIN_BY_ID } from '../data/vitamins'
import { BY_SYMBOL } from '../data/periodic'
import { elementColor, List } from './ElementPanel'

interface Props {
  id: string
  onElement: (s: string) => void
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

type Tab = 'overview' | 'health' | 'food'

export default function VitaminPanel({ id, onElement }: Props) {
  const v = VITAMIN_BY_ID[id]
  const [tab, setTab] = useState<Tab>('overview')
  return (
    <article className="vit-panel" style={{ '--el': v.color } as React.CSSProperties}>
      <header className="el-head">
        <div className="vit-badge">
          <span>{v.id}</span>
        </div>
        <div className="el-head-txt">
          <p className="eyebrow">
            {v.solubility === 'fat' ? 'Fat-soluble' : 'Water-soluble'} vitamin · <span className="mono">{v.formula}</span>
          </p>
          <h2>{v.name}</h2>
          <p className="chem">{v.chem}</p>
          <p className="lede">{v.summary}</p>
        </div>
      </header>

      <dl className="keyfigs">
        <div className="wide"><dt>Daily need</dt><dd>{v.rda}</dd></div>
        {v.ul && <div><dt>Upper limit</dt><dd>{v.ul}</dd></div>}
        <div className="wide"><dt>Deficiency disease</dt><dd>{v.disease}</dd></div>
      </dl>

      <nav className="tabbar" role="tablist" aria-label={`${v.name} sections`}>
        {([['overview', 'Overview'], ['health', 'Health'], ['food', 'Food & minerals']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="tabpane">
          <section className="block">
            <h3>What it does</h3>
            <List items={v.functions} />
          </section>
          <section className="block">
            <h3>Elements in the molecule</h3>
            <div className="chip-row">
              {v.elements.map((s) => (
                <ElementChip key={s} symbol={s} onClick={() => onElement(s)} />
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === 'health' && (
        <div className="tabpane">
          <section className="block">
            <h3><i className="dot def" />Signs of deficiency</h3>
            <List items={v.deficiency} tone="def" />
          </section>
          <section className="block">
            <h3><i className="dot risk" />Who usually runs low</h3>
            <List items={v.atRisk} tone="risk" max={4} />
          </section>
          <section className="block">
            <h3><i className="dot ex" />Too much</h3>
            <List items={v.excess} tone="ex" />
          </section>
        </div>
      )}

      {tab === 'food' && (
        <div className="tabpane">
          <section className="block">
            <h3>Best food sources</h3>
            <table className="foods">
              <tbody>
                {v.sources.map(([f, a], i) => (
                  <tr key={i}>
                    <td>{f}</td>
                    <td>{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="block">
            <h3><i className="dot boost" />How to get more</h3>
            <List items={v.boost} tone="boost" />
          </section>
          <section className="block">
            <h3>Mineral partners</h3>
            <div className="link-list">
              {v.minerals.map(([s, why]) => (
                <button key={s} className="link-row" onClick={() => onElement(s)}>
                  <span className="vb sym" style={{ '--c': elementColor(s) } as React.CSSProperties}>{s}</span>
                  <span>
                    <strong>{BY_SYMBOL[s].name}</strong>
                    <small>{why}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </article>
  )
}
