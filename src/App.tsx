import { useCallback, useEffect, useRef, useState } from 'react'
import BodyMap from './components/BodyMap'
import { ID_LAYER, type Layer } from './components/bodyShapes'
import ElementPanel from './components/ElementPanel'
import StructureDetail from './components/StructureDetail'
import VitaminPanel from './components/VitaminPanel'
import { ElementsView, IndexView, VitaminsView } from './components/Views'
import type { Region } from './data/types'

type View = 'body' | 'elements' | 'vitamins'
type DrawerItem = { type: 'element'; symbol: string } | { type: 'vitamin'; id: string }

const VIEWS: { id: View; label: string }[] = [
  { id: 'body', label: 'Body explorer' },
  { id: 'elements', label: 'Periodic table' },
  { id: 'vitamins', label: 'Vitamins' },
]

const readHash = (): View => {
  const h = location.hash.slice(1)
  return h === 'elements' || h === 'vitamins' ? h : 'body'
}

export default function App() {
  const [view, setView] = useState<View>(readHash)
  const [layer, setLayer] = useState<Layer>('organs')
  const [selectedId, setSelectedId] = useState<string | null>('heart')
  const [region, setRegion] = useState<Region | null>(null)
  const [stack, setStack] = useState<DrawerItem[]>([])
  const [side, setSide] = useState<'detail' | 'index'>('detail')
  const drawerRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const on = () => setView(readHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const go = (v: View) => {
    setView(v)
    try {
      history.replaceState(null, '', v === 'body' ? '#body' : `#${v}`)
    } catch {
      location.hash = v
    }
  }

  const select = useCallback((id: string) => {
    setSelectedId(id)
    setRegion(null)
    setSide('detail')
    const l = ID_LAYER[id]
    if (l) setLayer(l)
    setStack([])
    setView('body')
    requestAnimationFrame(() => detailRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
  }, [])

  const pickRegion = (r: Region) => {
    setRegion(r)
    setSelectedId(null)
    setSide('detail')
  }

  const push = (item: DrawerItem) => {
    setStack((s) => [...s, item])
    requestAnimationFrame(() => drawerRef.current?.scrollTo({ top: 0 }))
  }
  const openElement = (symbol: string) => push({ type: 'element', symbol })
  const openVitamin = (id: string) => push({ type: 'vitamin', id })
  const top = stack[stack.length - 1]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setStack((s) => s.slice(0, -1))
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg viewBox="0 0 40 40" aria-hidden="true" className="logo">
            <circle cx="20" cy="20" r="6" fill="#ff5d9e" />
            <ellipse cx="20" cy="20" rx="17" ry="7" fill="none" stroke="#6ad5ff" strokeWidth="2" />
            <ellipse cx="20" cy="20" rx="17" ry="7" fill="none" stroke="#ffd84d" strokeWidth="2" transform="rotate(60 20 20)" />
            <ellipse cx="20" cy="20" rx="17" ry="7" fill="none" stroke="#3ee08f" strokeWidth="2" transform="rotate(120 20 20)" />
          </svg>
          <div>
            <strong>Corpus Atlas</strong>
            <small>The human body, element by element</small>
          </div>
        </div>
        <nav className="tabs" aria-label="Sections">
          {VIEWS.map((v) => (
            <button key={v.id} className={view === v.id ? 'on' : ''} onClick={() => go(v.id)} aria-current={view === v.id ? 'page' : undefined}>
              {v.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {view === 'body' && (
          <div className="explorer">
            <BodyMap layer={layer} onLayer={setLayer} selectedId={selectedId} selectedRegion={region} onSelect={select} onRegion={pickRegion} />
            <div className="side">
              <div className="seg side-tabs">
                <button className={side === 'detail' ? 'on' : ''} onClick={() => setSide('detail')}>Details</button>
                <button className={side === 'index' ? 'on' : ''} onClick={() => setSide('index')}>Browse all parts</button>
              </div>
              <div className="side-scroll" ref={detailRef}>
                {side === 'detail' ? (
                  <StructureDetail id={selectedId} region={region} onSelect={select} onElement={openElement} />
                ) : (
                  <IndexView selectedId={selectedId} onSelect={select} />
                )}
              </div>
            </div>
          </div>
        )}
        {view === 'elements' && <ElementsView onElement={openElement} />}
        {view === 'vitamins' && <VitaminsView onVitamin={openVitamin} />}
      </main>

      <footer className="foot">
        Educational reference, not medical advice. Intake values follow the US National Academies and NIH Office of Dietary Supplements for adults 19–50. Talk to a clinician before starting supplements.
      </footer>

      {top && (
        <div className="drawer-wrap" onClick={() => setStack([])}>
          <aside className="drawer" ref={drawerRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={top.type === 'element' ? 'Element details' : 'Vitamin details'}>
            <div className="drawer-bar">
              {stack.length > 1 ? (
                <button onClick={() => setStack((s) => s.slice(0, -1))}>← Back</button>
              ) : (
                <span />
              )}
              <button onClick={() => setStack([])} aria-label="Close">Close ✕</button>
            </div>
            {top.type === 'element' ? (
              <ElementPanel key={top.symbol} symbol={top.symbol} onVitamin={openVitamin} onStructure={select} />
            ) : (
              <VitaminPanel key={top.id} id={top.id} onElement={openElement} />
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
