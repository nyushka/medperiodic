import { BODY_BY_SYMBOL, ROLE_INFO } from '../data/bodyElements'
import { BY_SYMBOL, CATEGORY_COLORS } from '../data/periodic'
import { VITAMIN_BY_ID, VITAMINS } from '../data/vitamins'
import { structuresForElement } from '../data'
import { KIND_ELEMENTS, KINDS, SYSTEMS, type Kind } from '../data/types'
import { BLOCK_OF, SHELL_NAMES, shellCounts, unpairedElectrons, valenceElectrons } from '../lib/electrons'
import { Bohr, Configs, Orbitals } from './Atom'
import { Fig, HowToReadConfig, HowToReadIntake } from './Learn'

interface Props {
  symbol: string
  onVitamin: (id: string) => void
  onStructure: (id: string) => void
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

export function elementColor(symbol: string): string {
  const b = BODY_BY_SYMBOL[symbol]
  return b ? ROLE_INFO[b.role].color : CATEGORY_COLORS[BY_SYMBOL[symbol].category]
}

export default function ElementPanel({ symbol, onVitamin, onStructure }: Props) {
  const e = BY_SYMBOL[symbol]
  const b = BODY_BY_SYMBOL[symbol]
  const color = elementColor(symbol)
  const neutrons = Math.round(e.mass) - e.z
  const unpaired = unpairedElectrons(e.z)
  const where = structuresForElement(symbol)
  const kinds = (Object.keys(KIND_ELEMENTS) as Kind[]).filter((k) => KIND_ELEMENTS[k][symbol])
  const vitaminsContaining = VITAMINS.filter((v) => v.elements.includes(symbol))

  return (
    <article className="el-panel" style={{ '--el': color } as React.CSSProperties}>
      <header className="el-head">
        <div className="el-tile big">
          <span className="z">{e.z}</span>
          <span className="sym">{e.symbol}</span>
          <span className="nm">{e.name}</span>
          <span className="ms">{e.mass}</span>
        </div>
        <div className="el-head-txt">
          <div className="chips">
            {b && (
              <span className="chip" style={{ '--c': ROLE_INFO[b.role].color } as React.CSSProperties}>
                {ROLE_INFO[b.role].label}
              </span>
            )}
            <span className="chip ghost" style={{ '--c': CATEGORY_COLORS[e.category] } as React.CSSProperties}>
              {e.category}
            </span>
          </div>
          <h2>{e.name}</h2>
          {b ? <p className="lede">{b.summary}</p> : <p className="lede">{e.name} is not present in the human body in meaningful amounts and has no known biological role. Its electron structure is shown below.</p>}
        </div>
      </header>

      <section className="atom-sec">
        <figure className="bohr-fig">
          <Bohr z={e.z} color={color} protons={e.z} neutrons={neutrons} symbol={e.symbol} />
          <Fig n="1">Bohr model of {e.name}. Electrons per shell: {shellCounts(e.z).map((c, i) => `${SHELL_NAMES[i]} ${c}`).join(' · ')}</Fig>
        </figure>
        <div className="atom-info">
          <Configs z={e.z} />
          <div className="lbl">Orbital diagram (valence, Hund’s rule)</div>
          <Orbitals z={e.z} valenceOnly />
          <Fig n="2">Valence orbital boxes. ↑ and ↓ are electrons with opposite spin.</Fig>
          <HowToReadConfig />
          <dl className="props">
            <div><dt>Atomic number</dt><dd>{e.z}</dd></div>
            <div><dt>Atomic mass</dt><dd>{e.mass} u</dd></div>
            <div><dt>Protons / neutrons*</dt><dd>{e.z} / {neutrons}</dd></div>
            <div><dt>Group / period</dt><dd>{e.group ?? 'f-block'} / {e.period}</dd></div>
            <div><dt>Block</dt><dd>{BLOCK_OF(e.z)}-block</dd></div>
            <div><dt>Valence electrons</dt><dd>{valenceElectrons(e.z, e.group)}</dd></div>
            <div><dt>Unpaired electrons</dt><dd>{unpaired} ({unpaired ? 'paramagnetic' : 'diamagnetic'} atom)</dd></div>
            {b && (
              <>
                <div><dt>Electronegativity</dt><dd>{b.electronegativity} (Pauling)</dd></div>
                <div><dt>Oxidation states</dt><dd>{b.oxidation}</dd></div>
                <div><dt>State at 20 °C</dt><dd>{b.state}</dd></div>
                <div><dt>Density</dt><dd>{b.density}</dd></div>
                <div><dt>Melting point</dt><dd>{b.melt}</dd></div>
                <div className="wide"><dt>Discovered</dt><dd>{b.discovered}</dd></div>
              </>
            )}
          </dl>
          <p className="fine">*Neutrons shown for the most common isotope, estimated from the rounded atomic mass.</p>
        </div>
      </section>

      {b && (
        <>
          <HowToReadIntake />
          <section className="stat-row">
            <div className="stat"><span className="v">{b.amount}</span><span className="k">in a 70 kg adult</span></div>
            <div className="stat"><span className="v">{b.percent}</span><span className="k">of body mass</span></div>
            <div className="stat"><span className="v small">{b.rda}</span><span className="k">daily need</span></div>
            {b.ul && <div className="stat warn"><span className="v small">{b.ul}</span><span className="k">upper limit</span></div>}
          </section>

          <div className="grid2">
            <section className="card">
              <h3>What it does in your body</h3>
              <List items={b.functions} />
            </section>
            <section className="card">
              <h3>Where it’s concentrated</h3>
              <List items={b.where} />
            </section>
            <section className="card tone-def">
              <h3>Deficiency: signs & symptoms</h3>
              <List items={b.deficiency} tone="def" />
            </section>
            <section className="card tone-risk">
              <h3>Who usually runs low</h3>
              <List items={b.atRisk} tone="risk" />
            </section>
            <section className="card tone-ex">
              <h3>Too much: toxicity</h3>
              <List items={b.excess} tone="ex" />
            </section>
            <section className="card tone-boost">
              <h3>{b.role === 'toxic' ? 'How to reduce exposure' : 'How to increase your intake'}</h3>
              <List items={b.boost} tone="boost" />
              {b.blockers && (
                <>
                  <h4>What blocks absorption</h4>
                  <List items={b.blockers} tone="def" />
                </>
              )}
            </section>
          </div>

          <section className="card">
            <h3>{b.role === 'toxic' ? 'Sources of exposure' : 'Best food sources'}</h3>
            <div className="foods">
              {b.sources.map(([f, amt], i) => (
                <div key={i} className="food">
                  <span className="f">{f}</span>
                  <span className="a">{amt}</span>
                </div>
              ))}
            </div>
          </section>

          {(b.vitamins.length > 0 || vitaminsContaining.length > 0) && (
            <section className="card">
              <h3>Vitamin connections</h3>
              <div className="vit-links">
                {b.vitamins.map(([id, why]) => (
                  <button key={id} className="vit-link" onClick={() => onVitamin(id)} style={{ '--c': VITAMIN_BY_ID[id].color } as React.CSSProperties}>
                    <span className="vb">{id}</span>
                    <span>
                      <strong>{VITAMIN_BY_ID[id].name}</strong>
                      <small>{why}</small>
                    </span>
                  </button>
                ))}
              </div>
              {vitaminsContaining.length > 0 && (
                <p className="fine">
                  {e.name} atoms are part of the molecule of: {vitaminsContaining.map((v) => v.name).join(', ')}.
                </p>
              )}
            </section>
          )}

          <section className="card">
            <h3>Found in these body parts</h3>
            {kinds.length > 0 && (
              <p className="fine">
                Present in every {kinds.map((k) => KINDS[k].label.toLowerCase()).join(', ')} by default. Specific roles:
              </p>
            )}
            <div className="where-list">
              {where.map(([s, role]) => (
                <button key={s.id} className="where" onClick={() => onStructure(s.id)} style={{ '--c': SYSTEMS[s.system].color } as React.CSSProperties}>
                  <strong>{s.name}</strong>
                  <small>{role}</small>
                </button>
              ))}
              {where.length === 0 && <p className="fine">No organ-specific notes. It is spread through tissues generally.</p>}
            </div>
          </section>

          <section className="card facts">
            <h3>Did you know?</h3>
            <List items={b.facts} />
          </section>
        </>
      )}
    </article>
  )
}
