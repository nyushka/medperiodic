import type { CellShape } from '../data/types'

/** Stylized microscope-view illustration of a cell type. */
export default function CellArt({ shape, color }: { shape: CellShape; color: string }) {
  const nuc = '#2b1d5c'
  const mem = { fill: color, fillOpacity: 0.28, stroke: color, strokeWidth: 2 }
  const body = (() => {
    switch (shape) {
      case 'disc':
        return (
          <>
            <ellipse cx="60" cy="60" rx="42" ry="42" fill="#ff3b5c" stroke="#b3123a" strokeWidth="2" />
            <ellipse cx="60" cy="60" rx="20" ry="20" fill="#c81d43" opacity="0.8" />
            <ellipse cx="48" cy="44" rx="10" ry="6" fill="#fff" opacity="0.25" />
          </>
        )
      case 'lobed':
        return (
          <>
            <circle cx="60" cy="60" r="44" {...mem} />
            {[[44, 50], [60, 44], [74, 54], [64, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill={nuc} />)}
            {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={30 + ((i * 37) % 60)} cy={30 + ((i * 53) % 60)} r="1.6" fill={color} />)}
          </>
        )
      case 'neuron':
        return (
          <>
            {[0, 50, 110, 170, 230, 300].map((a, i) => {
              const r = (a * Math.PI) / 180
              return <path key={i} d={`M60,60 Q${60 + 26 * Math.cos(r + 0.3)},${60 + 26 * Math.sin(r + 0.3)} ${60 + 44 * Math.cos(r)},${60 + 44 * Math.sin(r)}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
            })}
            <path d="M60,60 L112,92" stroke={color} strokeWidth="4" strokeLinecap="round" />
            {[78, 90, 102].map((x, i) => <rect key={i} x={x - 4} y={70 + i * 7} width="9" height="5" rx="2.5" fill="#fff" opacity="0.7" transform={`rotate(32 ${x} ${72 + i * 7})`} />)}
            <circle cx="60" cy="60" r="16" {...mem} fillOpacity={0.6} />
            <circle cx="60" cy="60" r="7" fill={nuc} />
          </>
        )
      case 'spindle':
        return (
          <>
            <path d="M8,60 C30,38 90,38 112,60 C90,82 30,82 8,60 Z" {...mem} />
            <ellipse cx="60" cy="60" rx="16" ry="6" fill={nuc} />
          </>
        )
      case 'striated':
        return (
          <>
            <rect x="8" y="34" width="104" height="52" rx="14" {...mem} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={16 + i * 8} y1="38" x2={16 + i * 8} y2="82" stroke={color} strokeWidth={i % 2 ? 1.5 : 3} opacity="0.8" />)}
            {[28, 62, 94].map((x, i) => <ellipse key={i} cx={x} cy={i % 2 ? 80 : 40} rx="8" ry="3.5" fill={nuc} />)}
          </>
        )
      case 'column':
        return (
          <>
            <rect x="34" y="12" width="52" height="96" rx="10" {...mem} />
            <ellipse cx="60" cy="80" rx="13" ry="16" fill={nuc} />
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={38 + i * 5.5} y1="12" x2={38 + i * 5.5} y2="4" stroke={color} strokeWidth="1.6" />)}
          </>
        )
      case 'cilia':
        return (
          <>
            <rect x="30" y="26" width="60" height="80" rx="10" {...mem} />
            <ellipse cx="60" cy="76" rx="14" ry="15" fill={nuc} />
            {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${34 + i * 5.8},26 q4,-10 0,-20`} stroke={color} strokeWidth="1.8" fill="none" className="wave" style={{ animationDelay: `${i * 0.08}s` }} />)}
          </>
        )
      case 'sperm':
        return (
          <>
            <path d="M44,60 C60,50 70,72 84,60 C96,50 104,70 116,60" stroke={color} strokeWidth="2.4" fill="none" className="tail" />
            <rect x="30" y="56" width="16" height="8" rx="4" fill={color} opacity="0.85" />
            <ellipse cx="20" cy="60" rx="14" ry="10" {...mem} fillOpacity={0.6} />
            <ellipse cx="18" cy="60" rx="9" ry="7" fill={nuc} />
          </>
        )
      case 'egg':
        return (
          <>
            <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="6" opacity="0.4" />
            <circle cx="60" cy="60" r="44" {...mem} />
            <circle cx="70" cy="52" r="12" fill={nuc} />
            {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={60 + 54 * Math.cos(i / 2.2)} cy={60 + 54 * Math.sin(i / 2.2)} r="3.5" fill={color} opacity="0.6" />)}
          </>
        )
      case 'fragment':
        return (
          <>
            {[[40, 50], [74, 44], [58, 76], [84, 78]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="14" ry="9" transform={`rotate(${i * 40} ${x} ${y})`} {...mem} fillOpacity={0.55} />
            ))}
          </>
        )
      case 'star':
        return (
          <>
            <path d="M60,14 L68,44 L100,30 L80,58 L108,72 L74,74 L80,106 L60,82 L40,106 L46,74 L12,72 L40,58 L20,30 L52,44 Z" {...mem} strokeLinejoin="round" />
            <circle cx="60" cy="62" r="12" fill={nuc} />
          </>
        )
      case 'branch':
        return (
          <>
            {[-60, -20, 20, 60, 160, 200].map((a, i) => {
              const r = (a * Math.PI) / 180
              return <path key={i} d={`M60,60 L${60 + 46 * Math.cos(r)},${60 + 46 * Math.sin(r)}`} stroke={color} strokeWidth="5" strokeLinecap="round" />
            })}
            <circle cx="60" cy="60" r="18" {...mem} fillOpacity={0.6} />
            <circle cx="60" cy="60" r="8" fill={nuc} />
          </>
        )
      case 'flat':
        return (
          <>
            <path d="M6,64 C24,52 96,52 114,64 C96,72 24,72 6,64 Z" {...mem} />
            <ellipse cx="60" cy="62" rx="14" ry="5" fill={nuc} />
          </>
        )
      case 'cube':
        return (
          <>
            <rect x="22" y="22" width="76" height="76" rx="12" {...mem} />
            <circle cx="60" cy="60" r="16" fill={nuc} />
            <circle cx="60" cy="60" r="5" fill={color} opacity="0.7" />
          </>
        )
      case 'fat':
        return (
          <>
            <circle cx="60" cy="60" r="48" {...mem} />
            <circle cx="58" cy="58" r="40" fill="#ffe7a3" opacity="0.85" />
            <ellipse cx="100" cy="66" rx="5" ry="10" fill={nuc} />
          </>
        )
      default:
        return (
          <>
            <circle cx="60" cy="60" r="42" {...mem} />
            <circle cx="60" cy="60" r="18" fill={nuc} />
            {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={34 + i * 12} cy={i % 2 ? 36 : 86} rx="5" ry="2.5" fill={color} opacity="0.75" />)}
          </>
        )
    }
  })()
  return (
    <svg viewBox="0 0 120 120" className="cell-art" role="img" aria-label={`Illustration: ${shape} cell`}>
      <circle cx="60" cy="60" r="58" fill="#2b2f37" stroke="#3a3f48" />
      <g className="cell-float">{body}</g>
    </svg>
  )
}
