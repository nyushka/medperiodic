import { lazy, Suspense, useState } from 'react'
import { BODY_BY_SYMBOL, ROLE_INFO } from '../data/bodyElements'
import { BY_SYMBOL, CATEGORY_COLORS } from '../data/periodic'
import { structuresForElement } from '../data'
import { SYSTEMS } from '../data/types'
import { BLOCK_OF, SHELL_NAMES, shellCounts, unpairedElectrons, valenceElectrons } from '../lib/electrons'
import { Bohr, Configs, Orbitals } from './Atom'
import { LearnedButton } from './Profile'

const Atom3D = lazy(() => import('./Atom3D'))

interface Props {
  symbol: string
  onStructure: (id: string) => void
}

export function List({ items, tone, max }: { items: string[]; tone?: string; max?: number }) {
  const [all, setAll] = useState(false)
  const shown = max && !all ? items.slice(0, max) : items
  return (
    <>
      <ul className={`blist ${tone ?? ''}`}>
        {shown.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      {max && items.length > max && (
        <button className="more" onClick={() => setAll(!all)}>
          {all ? 'Show less' : `Show ${items.length - max} more`}
        </button>
      )}
    </>
  )
}

export function elementColor(symbol: string): string {
  const b = BODY_BY_SYMBOL[symbol]
  return b ? ROLE_INFO[b.role].color : CATEGORY_COLORS[BY_SYMBOL[symbol].category]
}

type Tab = 'overview' | 'atom' | 'health' | 'links'

export default function ElementPanel({ symbol, onStructure }: Props) {
  const e = BY_SYMBOL[symbol]
  const b = BODY_BY_SYMBOL[symbol]
  const [tab, setTab] = useState<Tab>(b ? 'overview' : 'atom')
  const color = elementColor(symbol)
  const neutrons = Math.round(e.mass) - e.z
  const unpaired = unpairedElectrons(e.z)
  const where = structuresForElement(symbol)
  const toxic = b?.role === 'toxic'

  const tabs: [Tab, string][] = b
    ? [['overview', 'Overview'], ['atom', 'Atom'], ['health', 'Clinical'], ['links', 'In the body']]
    : [['atom', 'Atom']]

  return (
    <article className="el-panel" style={{ '--el': color } as React.CSSProperties}>
      <header className="el-head">
        <div className="el-tile big">
          <span className="z">{e.z}</span>
          <span className="sym">{e.symbol}</span>
          <span className="ms">{e.mass}</span>
        </div>
        <div className="el-head-txt">
          <p className="eyebrow">
            {b ? ROLE_INFO[b.role].label : 'Not used by the body'} · <span className="cap">{e.category}</span>
          </p>
          <h2>{e.name}</h2>
          <p className="lede">{b ? b.summary : `${e.name} is not present in the body in meaningful amounts and has no known biological role.`}</p>
          <div className="head-actions">
            <LearnedButton type="element" id={e.symbol} />
          </div>
        </div>
      </header>

      {b && (
        <dl className="keyfigs">
          <div><dt>In your body</dt><dd>{b.amount}</dd></div>
          <div><dt>Body mass</dt><dd>{b.percent}</dd></div>
        </dl>
      )}

      {tabs.length > 1 && (
        <nav className="tabbar" role="tablist" aria-label={`${e.name} sections`}>
          {tabs.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      )}

      {tab === 'overview' && b && (
        <div className="tabpane">
          <section className="block">
            <h3>What it does</h3>
            <List items={b.functions} max={4} />
          </section>
          <section className="block">
            <h3>Where it’s concentrated</h3>
            <List items={b.where} />
          </section>
          <section className="block quiet">
            <h3>Did you know?</h3>
            <List items={b.facts} />
          </section>
        </div>
      )}

      {tab === 'atom' && (
        <div className="tabpane">
          <section className="atom-sec">
            <Suspense
              fallback={
                <figure className="bohr-fig">
                  <Bohr z={e.z} color={color} protons={e.z} neutrons={neutrons} symbol={e.symbol} />
                </figure>
              }
            >
              <Atom3D z={e.z} neutrons={neutrons} color={color} name={e.name} />
            </Suspense>
            <div className="atom-info">
              <Configs z={e.z} />
              <p className="note">Electrons per shell: {shellCounts(e.z).map((c, i) => `${SHELL_NAMES[i]} ${c}`).join(' · ')}</p>
              <div>
                <div className="lbl">Valence orbitals</div>
                <Orbitals z={e.z} valenceOnly />
              </div>
            </div>
          </section>
          <dl className="props">
            <div><dt>Atomic number</dt><dd>{e.z}</dd></div>
            <div><dt>Atomic mass</dt><dd>{e.mass} u</dd></div>
            <div><dt>Protons / neutrons</dt><dd>{e.z} / {neutrons}</dd></div>
            <div><dt>Group / period</dt><dd>{e.group ?? 'f-block'} / {e.period}</dd></div>
            <div><dt>Block</dt><dd>{BLOCK_OF(e.z)}</dd></div>
            <div><dt>Valence electrons</dt><dd>{valenceElectrons(e.z, e.group)}</dd></div>
            <div><dt>Unpaired electrons</dt><dd>{unpaired} · {unpaired ? 'paramagnetic' : 'diamagnetic'}</dd></div>
            {b && (
              <>
                <div><dt>Electronegativity</dt><dd>{b.electronegativity}</dd></div>
                <div><dt>Oxidation states</dt><dd>{b.oxidation}</dd></div>
                <div><dt>At 20 °C</dt><dd>{b.state}</dd></div>
                <div><dt>Density</dt><dd>{b.density}</dd></div>
                <div><dt>Melting point</dt><dd>{b.melt}</dd></div>
                <div className="wide"><dt>Discovered</dt><dd>{b.discovered}</dd></div>
              </>
            )}
          </dl>
        </div>
      )}

      {tab === 'health' && b && (
        <div className="tabpane">
          <section className="block">
            <h3><i className="dot def" />{toxic ? 'Effects on health' : 'Signs of deficiency'}</h3>
            <List items={toxic ? b.excess : b.deficiency} tone="def" max={5} />
          </section>
          <section className="block">
            <h3><i className="dot risk" />{toxic ? 'Who is most exposed' : 'Who usually runs low'}</h3>
            <List items={b.atRisk} tone="risk" max={4} />
          </section>
          {!toxic && (
            <section className="block">
              <h3><i className="dot ex" />Too much</h3>
              <List items={b.excess} tone="ex" max={3} />
            </section>
          )}
        </div>
      )}

      {tab === 'links' && b && (
        <div className="tabpane">
          <section className="block">
            <h3>Where it works in the body</h3>
            <div className="link-list">
              {where.map(([s, role]) => (
                <button key={s.id} className="link-row" onClick={() => onStructure(s.id)}>
                  <span className="sw" style={{ background: SYSTEMS[s.system].color }} />
                  <span>
                    <strong>{s.name}</strong>
                    <small>{role}</small>
                  </span>
                </button>
              ))}
              {where.length === 0 && <p className="note">Spread through tissues generally, with no organ-specific role.</p>}
            </div>
          </section>
        </div>
      )}
    </article>
  )
}
