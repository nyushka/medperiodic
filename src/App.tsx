import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ElementPanel from './components/ElementPanel'
import StructureDetail from './components/StructureDetail'
import VitaminPanel from './components/VitaminPanel'
import { ElementsView, IndexView, VitaminsView } from './components/Views'
import { getStructure, SYNTH } from './data'
import type { Structure } from './data/types'
import type { ModelIndex } from './lib/model'
import { matchStructure, synthStructure, type PartMeta } from './lib/meshMatch'

const Viewer3D = lazy(() => import('./components/Viewer3D'))

type View = 'body' | 'elements' | 'vitamins'
type DrawerItem = { type: 'element'; symbol: string } | { type: 'vitamin'; id: string }

const VIEWS: { id: View; label: string }[] = [
  { id: 'body', label: 'Anatomy 3D' },
  { id: 'elements', label: 'Periodic table' },
  { id: 'vitamins', label: 'Vitamins' },
]

const readHash = (): View => {
  const h = location.hash.slice(1)
  return h === 'elements' || h === 'vitamins' ? h : 'body'
}

export default function App() {
  const [view, setView] = useState<View>(readHash)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [piece, setPiece] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string[]>([])
  const [focusKey, setFocusKey] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [stack, setStack] = useState<DrawerItem[]>([])
  const [side, setSide] = useState<'detail' | 'index'>('detail')
  const [extra, setExtra] = useState<Structure[]>([])
  const byStruct = useRef<Map<string, string[]>>(new Map())
  const metaById = useRef<Map<string, PartMeta>>(new Map())
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
      history.replaceState(null, '', `#${v}`)
    } catch {
      location.hash = v
    }
  }

  const onIndex = useCallback((index: ModelIndex, map: Map<string, string[]>) => {
    byStruct.current = map
    const synth: Structure[] = []
    for (const p of index.parts) {
      metaById.current.set(p.id, p)
      if (!matchStructure(p.n)) {
        const s = synthStructure(p)
        SYNTH[s.id] = s
        synth.push(s)
      }
    }
    setExtra(synth)
  }, [])

  /** Select a structure from the panels: highlight and fly to its 3D pieces. */
  const select = useCallback((id: string) => {
    setSelectedId(id)
    setPiece(null)
    setSide('detail')
    setStack([])
    setView('body')
    const ids = id.startsWith('mesh-') ? [id.slice(5)] : byStruct.current.get(id) ?? []
    setHighlight(ids)
    if (ids.length) setFocusKey((k) => k + 1)
    requestAnimationFrame(() => detailRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
  }, [])

  /** Select from the 3D model: map the clicked piece to its structure. */
  const pick = useCallback((m: PartMeta | null) => {
    if (!m) {
      setHighlight([])
      return
    }
    const sid = matchStructure(m.n)
    if (sid) {
      setSelectedId(sid)
      setHighlight(byStruct.current.get(sid) ?? [m.id])
    } else {
      setSelectedId(`mesh-${m.id}`)
      setHighlight([m.id])
    }
    setPiece(m.n.charAt(0).toUpperCase() + m.n.slice(1))
    setSide('detail')
    requestAnimationFrame(() => detailRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
  }, [])

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

  const callout = useMemo(() => getStructure(selectedId)?.name.replace(/\s*\(.*?\)/, '').replace(/ —.*$/, '') ?? null, [selectedId])

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => {
            setSelectedId(null)
            setPiece(null)
            setHighlight([])
            setStack([])
            setSide('detail')
            go('body')
            setResetKey((k) => k + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          aria-label="MedPeriodic: reset to the standard body view"
          title="Reset to the standard body view"
        >
          <svg viewBox="0 0 40 40" aria-hidden="true" className="logo">
            <circle cx="20" cy="20" r="4.2" fill="currentColor" />
            <ellipse cx="20" cy="20" rx="16" ry="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <ellipse cx="20" cy="20" rx="16" ry="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" transform="rotate(60 20 20)" opacity="0.55" />
          </svg>
          <div>
            <strong>MedPeriodic</strong>
            <small>Anatomy and the elements</small>
          </div>
        </button>
        <nav className="tabs" aria-label="Sections">
          {VIEWS.map((v) => (
            <button key={v.id} className={view === v.id ? 'on' : ''} onClick={() => go(v.id)} aria-current={view === v.id ? 'page' : undefined}>
              {v.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <div className="explorer" hidden={view !== 'body'}>
          <Suspense fallback={<div className="viewer viewer-fallback">Starting 3D engine…</div>}>
            <Viewer3D highlight={highlight} focusKey={focusKey} resetKey={resetKey} calloutLabel={callout} onPick={pick} onIndex={onIndex} />
          </Suspense>
          <div className="side">
            <div className="seg side-tabs">
              <button className={side === 'detail' ? 'on' : ''} onClick={() => setSide('detail')}>Details</button>
              <button className={side === 'index' ? 'on' : ''} onClick={() => setSide('index')}>Browse all parts</button>
            </div>
            <div className="side-scroll" ref={detailRef}>
              {side === 'detail' ? (
                <StructureDetail id={selectedId} region={null} piece={piece} pieceCount={highlight.length} onSelect={select} onElement={openElement} />
              ) : (
                <IndexView selectedId={selectedId} onSelect={select} extra={extra} />
              )}
            </div>
          </div>
        </div>
        {view === 'elements' && <ElementsView onElement={openElement} />}
        {view === 'vitamins' && <VitaminsView onVitamin={openVitamin} />}
      </main>

      <footer className="foot">
        MedPeriodic is an educational reference, not medical advice. Intake values follow the US National Academies and NIH Office of Dietary Supplements for adults 19–50. 3D anatomy from BodyParts3D © DBCLS (CC BY 4.0).
      </footer>

      {top && (
        <div className="drawer-wrap" onClick={() => setStack([])}>
          <aside className="drawer" ref={drawerRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={top.type === 'element' ? 'Element details' : 'Vitamin details'}>
            <div className="drawer-bar">
              {stack.length > 1 ? <button onClick={() => setStack((s) => s.slice(0, -1))}>← Back</button> : <span />}
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
