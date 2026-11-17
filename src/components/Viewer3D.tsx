import { useEffect, useRef, useState } from 'react'
import { BY_ID } from '../data'
import { loadChunk, loadIndex, type ModelIndex } from '../lib/model'
import { matchStructure, type LayerId, type PartMeta } from '../lib/meshMatch'
import { AnatomyScene, type ViewPreset } from '../lib/scene'

export const LAYER_INFO: { id: LayerId; label: string; color: string }[] = [
  { id: 'muscles', label: 'Muscles', color: '#d2443c' },
  { id: 'skeleton', label: 'Skeleton', color: '#e7dabf' },
  { id: 'organs', label: 'Organs', color: '#e8947c' },
  { id: 'nervous', label: 'Brain & nerves', color: '#f2c94c' },
  { id: 'arteries', label: 'Arteries', color: '#ff3346' },
  { id: 'veins', label: 'Veins', color: '#4a6dff' },
  { id: 'skin', label: 'Skin', color: '#d8a183' },
]

type LayerState = Record<LayerId, { visible: boolean; opacity: number }>
const ALL_OFF = (): LayerState => Object.fromEntries(LAYER_INFO.map((l) => [l.id, { visible: false, opacity: 1 }])) as LayerState

const PRESETS: { id: string; label: string; set: Partial<Record<LayerId, number>> }[] = [
  { id: 'muscles', label: 'Muscles', set: { muscles: 1, skeleton: 1 } },
  { id: 'skeleton', label: 'Skeleton', set: { skeleton: 1 } },
  { id: 'organs', label: 'Organs', set: { organs: 1, skeleton: 0.35 } },
  { id: 'circ', label: 'Circulation', set: { arteries: 1, veins: 1, organs: 0.25, skeleton: 0.3 } },
  { id: 'nerves', label: 'Nervous', set: { nervous: 1, skeleton: 0.3 } },
  { id: 'all', label: 'Layered', set: { skin: 0.5, muscles: 0.35, skeleton: 1, organs: 1, nervous: 1, arteries: 1, veins: 1 } },
]

const VIEWS: { id: ViewPreset; label: string }[] = [
  { id: 'front', label: 'Anterior' },
  { id: 'back', label: 'Posterior' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'head', label: 'Head' },
  { id: 'torso', label: 'Torso' },
  { id: 'arm', label: 'Arm' },
  { id: 'hand', label: 'Hand' },
  { id: 'leg', label: 'Leg' },
  { id: 'foot', label: 'Foot' },
]

// Textbook callouts: [structure id, side of the body it labels (R = patient's right)]
const LABELS: Record<string, [string, 'R' | 'L'][]> = {
  muscles: [['muscle-temporalis', 'R'], ['muscle-scm', 'R'], ['muscle-deltoid', 'R'], ['muscle-biceps', 'R'], ['muscle-brachioradialis', 'R'], ['muscle-tfl', 'R'], ['muscle-sartorius', 'R'], ['muscle-rectus-femoris', 'R'], ['muscle-tib-ant', 'R'], ['muscle-trapezius', 'L'], ['muscle-pec-major', 'L'], ['muscle-serratus', 'L'], ['muscle-rectus-abd', 'L'], ['muscle-ext-oblique', 'L'], ['muscle-fcr', 'L'], ['muscle-vastus-lat', 'L'], ['muscle-vastus-med', 'L'], ['muscle-gastrocnemius', 'L']],
  skeleton: [['bone-frontal', 'R'], ['bone-clavicle', 'R'], ['bone-humerus', 'R'], ['bone-radius', 'R'], ['bone-hip', 'R'], ['bone-femur', 'R'], ['bone-tibia', 'R'], ['bone-mandible', 'L'], ['bone-sternum', 'L'], ['bone-rib6', 'L'], ['bone-ulna', 'L'], ['bone-patella', 'L'], ['bone-fibula', 'L'], ['bone-calcaneus', 'L']],
  organs: [['trachea', 'R'], ['lungs', 'R'], ['liver', 'R'], ['gallbladder', 'R'], ['large-intestine', 'R'], ['kidney', 'R'], ['heart', 'L'], ['stomach', 'L'], ['spleen', 'L'], ['pancreas', 'L'], ['small-intestine', 'L'], ['bladder', 'L']],
  nervous: [['cerebrum', 'R'], ['cerebellum', 'L'], ['brainstem', 'L'], ['spinal-cord', 'R']],
  arteries: [['carotid', 'R'], ['aorta', 'L'], ['brachial', 'R'], ['femoral-a', 'L']],
  veins: [['jugular', 'L'], ['ivc', 'R'], ['saphenous', 'R']],
}

interface Props {
  highlight: string[]
  focusKey: number
  calloutLabel: string | null
  onPick: (meta: PartMeta | null) => void
  onIndex: (index: ModelIndex, byStruct: Map<string, string[]>) => void
}

export default function Viewer3D({ highlight, focusKey, calloutLabel, onPick, onIndex }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<AnatomyScene | null>(null)
  const [layers, setLayers] = useState<LayerState>(() => ({ ...ALL_OFF(), muscles: { visible: true, opacity: 1 }, skeleton: { visible: true, opacity: 1 } }))
  const [progress, setProgress] = useState({ loaded: 0, total: 1, chunks: 0, of: 0, error: '' })
  const [loadedLayers, setLoadedLayers] = useState<Set<LayerId>>(new Set())
  const [counts, setCounts] = useState<Partial<Record<LayerId, number>>>({})
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null)
  const [explode, setExplode] = useState(0)
  const [labelsOn, setLabelsOn] = useState(true)
  const [isolated, setIsolated] = useState(false)
  const [panelOpen, setPanelOpen] = useState(() => typeof window === 'undefined' || window.innerWidth > 700)
  const panelOpenRef = useRef(panelOpen)
  panelOpenRef.current = panelOpen
  const panelEl = useRef<HTMLElement>(null)
  const toolsRef = useRef(0)
  toolsRef.current = highlight.length ? 4 : 1
  const [preset, setPreset] = useState('muscles')
  const byStructRef = useRef<Map<string, string[]>>(new Map())
  const metaRef = useRef<Map<string, PartMeta>>(new Map())
  const labelEls = useRef<(SVGGElement | null)[]>([])
  const labelDefs = useRef<{ text: string; ids: string[]; selected?: boolean }[]>([])
  const [labelVersion, setLabelVersion] = useState(0)
  const cbRef = useRef({ onPick, onIndex })
  cbRef.current = { onPick, onIndex }

  // ---------- boot ----------
  useEffect(() => {
    if (!host.current) return
    let cancelled = false
    let scene: AnatomyScene
    try {
      scene = new AnatomyScene(host.current, {
        onHover: (m, x, y) => setHover(m ? { name: m.n, x, y } : null),
        onPick: (m) => cbRef.current.onPick(m),
        onFrame: () => layoutLabels(),
      })
    } catch {
      setProgress((p) => ({ ...p, error: 'WebGL is not available in this browser, so the 3D model can’t be shown. The anatomy index and element data still work.' }))
      return
    }
    sceneRef.current = scene
    ;(async () => {
      try {
        const index = await loadIndex()
        if (cancelled) return
        const byStruct = new Map<string, string[]>()
        for (const p of index.parts) {
          metaRef.current.set(p.id, p)
          const sid = matchStructure(p.n)
          if (sid) byStruct.set(sid, [...(byStruct.get(sid) ?? []), p.id])
        }
        byStructRef.current = byStruct
        cbRef.current.onIndex(index, byStruct)
        const c: Partial<Record<LayerId, number>> = {}
        for (const p of index.parts) c[p.l] = (c[p.l] ?? 0) + 1
        setCounts(c)
        const total = index.chunks.reduce((a, ch) => a + ch.gz, 0)
        setProgress({ loaded: 0, total, chunks: 0, of: index.chunks.length, error: '' })
        const order: LayerId[] = ['skeleton', 'muscles', 'organs', 'nervous', 'arteries', 'veins', 'skin']
        const seq = index.chunks.map((ch, i) => ({ ch, i })).sort((a, b) => order.indexOf(a.ch.layer) - order.indexOf(b.ch.layer))
        let loaded = 0
        const left: Partial<Record<LayerId, number>> = {}
        for (const ch of index.chunks) left[ch.layer] = (left[ch.layer] ?? 0) + 1
        for (const { ch, i } of seq) {
          const geoms = await loadChunk(index, i, (n) => {
            loaded += n
            setProgress((p) => ({ ...p, loaded }))
          })
          if (cancelled) return
          scene.addParts(index.parts.filter((p) => p.c === i), geoms)
          setProgress((p) => ({ ...p, chunks: p.chunks + 1 }))
          left[ch.layer] = (left[ch.layer] ?? 1) - 1
          if (!left[ch.layer]) setLoadedLayers((s) => new Set(s).add(ch.layer))
        }
      } catch (e) {
        setProgress((p) => ({ ...p, error: e instanceof Error ? e.message : 'The 3D model failed to load.' }))
      }
    })()
    return () => {
      cancelled = true
      scene.dispose()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- sync state into the scene ----------
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    for (const l of LAYER_INFO) s.setLayer(l.id, layers[l.id].visible, layers[l.id].opacity)
  }, [layers, loadedLayers])

  useEffect(() => {
    sceneRef.current?.setHighlight(highlight)
  }, [highlight, loadedLayers])

  useEffect(() => {
    if (!focusKey || !highlight.length) return
    // Make sure the chosen structure can be seen: show its layer and fade the layers that cover it.
    const selLayers = new Set(highlight.map((id) => metaRef.current.get(id)?.l).filter(Boolean) as LayerId[])
    const cover: LayerId[] = ['skin', 'muscles', 'skeleton']
    const depth = (l: LayerId) => (l === 'skin' ? 0 : l === 'muscles' ? 1 : l === 'skeleton' ? 2 : 3)
    const deepest = Math.max(...[...selLayers].map(depth))
    setLayers((L) => {
      const next = { ...L }
      for (const l of selLayers) next[l] = { visible: true, opacity: Math.max(L[l].opacity, 0.9) }
      for (const l of cover) if (depth(l) < deepest && next[l].visible && next[l].opacity > 0.3) next[l] = { ...next[l], opacity: l === 'skeleton' ? 0.35 : 0.18 }
      return next
    })
    setPreset('')
    sceneRef.current?.focus(highlight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  useEffect(() => {
    sceneRef.current?.setExplode(explode)
  }, [explode, loadedLayers])

  // ---------- textbook labels ----------
  useEffect(() => {
    const defs: { text: string; ids: string[]; selected?: boolean }[] = []
    if (labelsOn) {
      const top: string[] = layers.muscles.visible && layers.muscles.opacity > 0.6 ? ['muscles'] : (['skeleton', 'organs', 'nervous', 'arteries', 'veins'] as LayerId[]).filter((l) => layers[l].visible && layers[l].opacity > 0.5)
      for (const layer of top)
        for (const [sid, side] of LABELS[layer] ?? []) {
          const all = byStructRef.current.get(sid) ?? []
          const sided = all.filter((id) => {
            const b = metaRef.current.get(id)!.b
            const cx = (b[0] + b[3]) / 2
            return side === 'R' ? cx < -0.005 : cx > 0.005
          })
          const ids = sided.length ? sided : all
          if (ids.length && BY_ID[sid] && shortName(BY_ID[sid].name) !== calloutLabel) defs.push({ text: shortName(BY_ID[sid].name), ids })
        }
    }
    if (calloutLabel && highlight.length) defs.push({ text: calloutLabel, ids: highlight, selected: true })
    labelDefs.current = defs
    setLabelVersion((v) => v + 1)
  }, [labelsOn, layers, calloutLabel, highlight, loadedLayers])

  useEffect(() => {
    sceneRef.current?.invalidate()
  }, [labelVersion, panelOpen])

  function layoutLabels() {
    const s = sceneRef.current
    const el = host.current
    if (!s || !el) return
    const W = el.clientWidth
    const H = el.clientHeight
    const narrow = W < 560
    const items = labelDefs.current
      .map((d, i) => ({ d, i, a: s.anchorFor(d.ids) }))
      .filter((x) => x.a && x.a.x > 0 && x.a.x < W && x.a.y > 0 && x.a.y < H)
    const panelW = panelOpenRef.current ? (narrow ? 190 : 236) : 0
    const toolsBottom = 56 + toolsRef.current * 34
    const place = (list: typeof items, left: boolean) => {
      list.sort((p, q) => p.a!.y - q.a!.y)
      let lastY = left ? 60 : toolsBottom
      for (const it of list) {
        const y = Math.max(it.a!.y, lastY + (narrow ? 18 : 22))
        lastY = y
        const g = labelEls.current[it.i]
        if (!g) continue
        const lx = left ? Math.max(narrow ? 8 : 16, y < (panelEl.current ? panelEl.current.offsetTop + panelEl.current.offsetHeight + 12 : 0) ? panelW : 0) : W - (narrow ? 8 : 16)
        g.style.display = ''
        const line = g.querySelector('path')!
        const text = g.querySelector('text')!
        const knee = left ? Math.min(lx + (narrow ? 70 : 120), it.a!.x - 8) : Math.max(lx - (narrow ? 70 : 120), it.a!.x + 8)
        line.setAttribute('d', `M${lx + (left ? 2 : -2)},${y} L${knee},${y} L${it.a!.x},${it.a!.y}`)
        text.setAttribute('x', String(lx))
        text.setAttribute('y', String(y - 4))
        text.setAttribute('text-anchor', left ? 'start' : 'end')
        const dot = g.querySelector('circle')!
        dot.setAttribute('cx', String(it.a!.x))
        dot.setAttribute('cy', String(it.a!.y))
      }
    }
    const shown = new Set(items.map((x) => x.i))
    labelEls.current.forEach((g, i) => {
      if (g && !shown.has(i)) g.style.display = 'none'
    })
    const sel = items.filter((x) => x.d.selected)
    const rest = items.filter((x) => !x.d.selected)
    place([...rest.filter((x) => x.a!.x < W / 2), ...sel.filter((x) => x.a!.x < W / 2)], true)
    place([...rest.filter((x) => x.a!.x >= W / 2), ...sel.filter((x) => x.a!.x >= W / 2)], false)
  }

  // ---------- controls ----------
  const setLayer = (id: LayerId, patch: Partial<{ visible: boolean; opacity: number }>) => {
    setPreset('')
    setLayers((L) => ({ ...L, [id]: { ...L[id], ...patch } }))
  }
  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setPreset(p.id)
    const next = ALL_OFF()
    for (const [k, v] of Object.entries(p.set) as [LayerId, number][]) next[k] = { visible: true, opacity: v }
    setLayers(next)
  }

  const pct = Math.min(100, Math.round((progress.loaded / progress.total) * 100))
  const loading = progress.of === 0 || progress.chunks < progress.of

  return (
    <div className="viewer">
      <div className="viewer-top">
        <div className="seg presets" role="group" aria-label="Quick study views">
          {PRESETS.map((p) => (
            <button key={p.id} className={preset === p.id ? 'on' : ''} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="viewer-stage">
        <div className="gl-host" ref={host} />
        <svg className="labels" key={labelVersion} aria-hidden="true">
          {labelDefs.current.map((d, i) => (
            <g key={i} ref={(el) => void (labelEls.current[i] = el)} className={d.selected ? 'callout sel' : 'callout'} style={{ display: 'none' }}>
              <path />
              <circle r={d.selected ? 4 : 2.6} />
              <text>{d.text}</text>
            </g>
          ))}
        </svg>
        <div className="hud hud-tl" />
        <div className="hud hud-tr" />
        <div className="hud hud-bl" />
        <div className="hud hud-br" />

        <div className="scan-readout">
          <span className="scan-tag">BP3D // ADULT MALE<span className="wide-only"> REFERENCE</span> · {progress.of ? `${(2331218).toLocaleString()} TRIS` : 'INITIALISING'}</span>
          <span className="hint">Drag to rotate · scroll or pinch to zoom · right-drag to pan · tap a structure</span>
        </div>

        {hover && (
          <div className="tip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
            {hover.name}
          </div>
        )}

        {(loading || progress.error) && (
          <div className="loader" role="status">
            {progress.error ? (
              <p>{progress.error}</p>
            ) : (
              <>
                <div className="loader-txt">
                  Loading anatomy · {(progress.loaded / 1e6).toFixed(1)} / {(progress.total / 1e6).toFixed(1)} MB · {progress.chunks}/{progress.of || '…'} packs
                </div>
                <div className="bar"><i style={{ width: `${pct}%` }} /></div>
              </>
            )}
          </div>
        )}

        <aside ref={panelEl} className={`systems ${panelOpen ? '' : 'closed'}`} aria-label="Body systems">
          <button className="systems-toggle" onClick={() => setPanelOpen((o) => !o)} aria-expanded={panelOpen}>
            {panelOpen ? 'Body systems ◂' : 'Systems ▸'}
          </button>
          {panelOpen && (
            <div className="systems-list">
              {LAYER_INFO.map((l) => (
                <div key={l.id} className={`sys-row ${layers[l.id].visible ? 'on' : ''}`} style={{ '--c': l.color } as React.CSSProperties}>
                  <label className="sys-name">
                    <input id={`layer-${l.id}`} type="checkbox" checked={layers[l.id].visible} onChange={(e) => setLayer(l.id, { visible: e.target.checked })} />
                    <i />
                    <span>{l.label}</span>
                    <small>{loadedLayers.has(l.id) ? counts[l.id] ?? '' : '…'}</small>
                  </label>
                  <input
                    id={`opacity-${l.id}`}
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={layers[l.id].opacity}
                    aria-label={`${l.label} opacity`}
                    onChange={(e) => setLayer(l.id, { opacity: +e.target.value, visible: true })}
                  />
                </div>
              ))}
              <div className="sys-row tools">
                <label className="sys-name">
                  <span>Exploded view</span>
                  <small>{Math.round(explode * 100)}%</small>
                </label>
                <input id="explode" type="range" min={0} max={1} step={0.02} value={explode} onChange={(e) => setExplode(+e.target.value)} aria-label="Exploded view" />
              </div>
              <label className="check">
                <input id="labels" type="checkbox" checked={labelsOn} onChange={(e) => setLabelsOn(e.target.checked)} /> Textbook labels
              </label>
            </div>
          )}
        </aside>

        <div className="sel-tools">
          {highlight.length > 0 && (
            <>
              <button onClick={() => sceneRef.current?.focus(highlight)}>Focus</button>
              <button
                onClick={() => {
                  const s = sceneRef.current
                  if (!s) return
                  if (isolated) s.showAll()
                  else s.isolate(highlight)
                  setIsolated(!isolated)
                }}
              >
                {isolated ? 'Exit isolate' : 'Isolate'}
              </button>
              <button onClick={() => sceneRef.current?.hide(highlight)}>Hide</button>
            </>
          )}
          <button
            onClick={() => {
              sceneRef.current?.showAll()
              setIsolated(false)
            }}
          >
            Show all
          </button>
        </div>
      </div>
      <div className="views" role="group" aria-label="Camera views">
        {VIEWS.map((v) => (
          <button key={v.id} onClick={() => sceneRef.current?.view(v.id)}>
            {v.label}
          </button>
        ))}
      </div>
      <p className="credit">
        3D anatomy: BodyParts3D © The Database Center for Life Science, CC BY 4.0, via Human Atlas (@dagno/anatomy-model) and open-anatomy-3d (lungs, liver). Repacked and recolored by MedPeriodic.
      </p>
    </div>
  )
}

function shortName(n: string) {
  return n.replace(/\s*\(.*?\)\s*/g, ' ').replace(/ —.*$/, '').trim()
}
