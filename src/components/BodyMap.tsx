import { useEffect, useRef, useState } from 'react'
import { BY_ID } from '../data'
import { REGIONS, type Region } from '../data/types'
import { HEAD, LAYER_SHAPES, LAYERS, REGION_SHAPES, SILHOUETTE, ZOOMS, type Layer, type Shape } from './bodyShapes'

type ZoomKey = keyof typeof ZOOMS

interface Props {
  layer: Layer
  onLayer: (l: Layer) => void
  selectedId: string | null
  selectedRegion: Region | null
  onSelect: (id: string) => void
  onRegion: (r: Region) => void
}

const MIRROR = 'matrix(-1 0 0 1 400 0)'

function useTweenedViewBox(target: [number, number, number, number]) {
  const [vb, setVb] = useState(target)
  const cur = useRef(target)
  useEffect(() => {
    const from = cur.current
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      cur.current = target
      setVb(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 520)
      const e = 1 - Math.pow(1 - k, 3)
      const next = from.map((v, i) => v + (target[i] - v) * e) as [number, number, number, number]
      cur.current = next
      setVb(next)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return vb
}

export default function BodyMap({ layer, onLayer, selectedId, selectedRegion, onSelect, onRegion }: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const [zoom, setZoom] = useState<ZoomKey>('full')
  const vb = useTweenedViewBox(ZOOMS[zoom])

  const shapes = layer === 'regions' ? [] : LAYER_SHAPES[layer]
  const regionOfSel = selectedId ? BY_ID[selectedId]?.region : selectedRegion

  const renderShape = (s: Shape, i: number, mirrored: boolean) => {
    const interactive = !!s.id && !s.deco
    const sel = interactive && s.id === selectedId
    const isStroke = !s.fill || s.fill === 'none'
    const common = {
      d: s.d,
      opacity: s.opacity,
      className: interactive ? `part${sel ? ' sel' : ''}${hover === s.id ? ' hov' : ''}` : 'deco',
    }
    const visible = (
      <path
        {...common}
        fill={s.fill ?? 'none'}
        stroke={sel ? '#ffffff' : s.stroke}
        strokeWidth={sel && !isStroke ? 1.4 : s.w}
        strokeDasharray={s.dash}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents={interactive ? undefined : 'none'}
      />
    )
    if (!interactive) return <g key={`${i}${mirrored ? 'm' : ''}`}>{visible}</g>
    const handlers = {
      onClick: () => onSelect(s.id!),
      onMouseEnter: () => setHover(s.id!),
      onMouseLeave: () => setHover((h) => (h === s.id ? null : h)),
      onFocus: () => setHover(s.id!),
      onBlur: () => setHover(null),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(s.id!)
        }
      },
    }
    return (
      <g key={`${i}${mirrored ? 'm' : ''}`} {...handlers} tabIndex={mirrored ? -1 : 0} role="button" aria-label={BY_ID[s.id!]?.name ?? s.id} className="hit">
        {isStroke && <path d={s.d} stroke="transparent" strokeWidth={Math.max(6, (s.w ?? 1) + 5)} fill="none" strokeLinecap="round" />}
        {visible}
      </g>
    )
  }

  const hoverName = hover ? (hover.startsWith('region:') ? REGIONS[hover.slice(7) as Region] : BY_ID[hover]?.name ?? hover) : null

  return (
    <div className="map">
      <div className="map-tools">
        <div className="seg" role="tablist" aria-label="Anatomy layer">
          {LAYERS.map((l) => (
            <button key={l.id} role="tab" aria-selected={layer === l.id} className={layer === l.id ? 'on' : ''} onClick={() => onLayer(l.id)} style={{ '--c': l.color } as React.CSSProperties}>
              <i />
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="map-stage">
        <div className="hud hud-tl" />
        <div className="hud hud-tr" />
        <div className="hud hud-bl" />
        <div className="hud hud-br" />
        <div className="map-hover" aria-live="polite">
          <span className="scan-tag">SCAN // {LAYERS.find((l) => l.id === layer)!.label.toUpperCase()}</span>
          {hoverName ?? <span className="hint">Tap any part to explore it</span>}
        </div>
        <svg viewBox={vb.join(' ')} className="body-svg" role="group" aria-label="Interactive human body">
          <defs>
            <radialGradient id="aura" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.16" />
              <stop offset="55%" stopColor="#ff2bd6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#14213a" />
              <stop offset="55%" stopColor="#0c1326" />
              <stop offset="100%" stopColor="#1a0f2e" />
            </linearGradient>
            <pattern id="mesh" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10,0 L0,0 0,10" fill="none" stroke="#00f0ff" strokeOpacity="0.13" strokeWidth="0.5" />
            </pattern>
            <pattern id="circuit" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0,20 H12 L18,14 H30 M30,14 V4 M18,14 V30 L24,36 H40" fill="none" stroke="#ff2bd6" strokeOpacity="0.16" strokeWidth="0.6" />
              <circle cx="30" cy="4" r="1.2" fill="#ff2bd6" fillOpacity="0.3" />
              <circle cx="12" cy="20" r="1" fill="#00f0ff" fillOpacity="0.35" />
            </pattern>
            <clipPath id="bodyClip">
              <path d={SILHOUETTE} />
              <path d={HEAD} />
            </clipPath>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
              <stop offset="85%" stopColor="#00f0ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#bffcff" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <ellipse cx="200" cy="420" rx="230" ry="470" fill="url(#aura)" />
          {zoom === 'full' && Array.from({ length: 19 }, (_, i) => (
            <g key={i} className="ruler">
              <line x1="36" x2={i % 2 ? 42 : 48} y1={20 + i * 47} y2={20 + i * 47} />
              {i % 2 === 0 && <text x="50" y={23 + i * 47}>{(i * 9.4).toFixed(0)}</text>}
            </g>
          ))}
          <path d={SILHOUETTE} fill="url(#skinGrad)" />
          <path d={HEAD} fill="url(#skinGrad)" />
          <g clipPath="url(#bodyClip)" pointerEvents="none">
            <rect x="0" y="0" width="400" height="900" fill="url(#mesh)" />
            <rect x="0" y="0" width="400" height="900" fill="url(#circuit)" />
            <rect className="scanbeam" x="0" y="-120" width="400" height="120" fill="url(#scanGrad)" />
          </g>
          <path d={SILHOUETTE} fill="none" className="outline" />
          <path d={HEAD} fill="none" className="outline" />

          {regionOfSel &&
            REGION_SHAPES.filter((r) => r.region === regionOfSel).map((r, i) => (
              <g key={i}>
                <path d={r.d} className="region-glow" />
                {r.mirror && <path d={r.d} transform={MIRROR} className="region-glow" />}
              </g>
            ))}

          {layer === 'regions' &&
            REGION_SHAPES.map((r, i) =>
              [false, ...(r.mirror ? [true] : [])].map((m) => (
                <path
                  key={`${i}${m}`}
                  d={r.d}
                  transform={m ? MIRROR : undefined}
                  className={`region${selectedRegion === r.region ? ' sel' : ''}${hover === 'region:' + r.region ? ' hov' : ''}`}
                  tabIndex={m ? -1 : 0}
                  role="button"
                  aria-label={REGIONS[r.region]}
                  onClick={() => onRegion(r.region)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onRegion(r.region)}
                  onMouseEnter={() => setHover('region:' + r.region)}
                  onMouseLeave={() => setHover(null)}
                />
              )),
            )}

          <g className={`layer layer-${layer}`} key={layer}>
            {shapes.map((s, i) => renderShape(s, i, false))}
            <g transform={MIRROR}>{shapes.map((s, i) => (s.mirror ? renderShape(s, i, true) : null))}</g>
          </g>
        </svg>
        <div className="zoom" aria-label="Zoom to region">
          {(Object.keys(ZOOMS) as ZoomKey[]).map((z) => (
            <button key={z} className={zoom === z ? 'on' : ''} onClick={() => setZoom(z)}>
              {z === 'full' ? 'Whole body' : REGIONS[z as Region].split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
