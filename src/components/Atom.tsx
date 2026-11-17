import { orbitalBoxes, shellCounts, shorthand, configuration, subshellLabel, SHELL_NAMES, type Subshell } from '../lib/electrons'

export function ConfigText({ shells, className }: { shells: Subshell[]; className?: string }) {
  return (
    <span className={`cfg ${className ?? ''}`}>
      {shells.map((s, i) => (
        <span key={i} className={`sub l${s.l}`}>
          {subshellLabel(s)}
          <sup>{s.e}</sup>
        </span>
      ))}
    </span>
  )
}

export function Configs({ z }: { z: number }) {
  const full = configuration(z)
  const short = shorthand(z)
  return (
    <div className="configs">
      <div>
        <div className="lbl">Full electron configuration</div>
        <ConfigText shells={full} />
      </div>
      <div>
        <div className="lbl">Noble-gas shorthand</div>
        <span className="cfg">
          {short.core && <span className="core">[{short.core}]</span>}
          <ConfigText shells={short.rest} />
        </span>
      </div>
    </div>
  )
}

/** Animated Bohr model: electrons orbit on each shell at a different speed. */
export function Bohr({ z, color, protons, neutrons, symbol }: { z: number; color: string; protons: number; neutrons: number; symbol: string }) {
  const shells = shellCounts(z)
  const size = 300
  const c = size / 2
  const inner = 34
  const gap = (c - inner - 10) / Math.max(shells.length, 1)
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="bohr" role="img" aria-label={`Bohr model of ${symbol}: shells ${shells.join(', ')}`}>
      <defs>
        <radialGradient id={`nuc-${symbol}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="35%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      {shells.map((n, i) => {
        const r = inner + gap * (i + 1)
        const dur = 6 + i * 4
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity={0.28} strokeWidth={1} strokeDasharray={i % 2 ? '2 3' : undefined} />
            <text x={c + r * 0.707 + 4} y={c - r * 0.707 - 2} className="shell-lbl" fill={color}>
              {SHELL_NAMES[i]} {n}
            </text>
            <g className="orbit" style={{ animationDuration: `${dur}s`, animationDirection: i % 2 ? 'reverse' : 'normal', transformOrigin: `${c}px ${c}px` }}>
              {Array.from({ length: n }, (_, k) => {
                const a = (k / n) * Math.PI * 2
                return <circle key={k} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={n > 18 ? 2.6 : 3.6} className="electron" />
              })}
            </g>
          </g>
        )
      })}
      <circle cx={c} cy={c} r={inner - 6} fill={`url(#nuc-${symbol})`} />
      <text x={c} y={c - 2} textAnchor="middle" className="nuc-sym">
        {symbol}
      </text>
      <text x={c} y={c + 13} textAnchor="middle" className="nuc-sub">
        {protons}p⁺ {neutrons}n⁰
      </text>
    </svg>
  )
}

/** Orbital box diagram with Hund's rule arrows. */
export function Orbitals({ z, valenceOnly }: { z: number; valenceOnly?: boolean }) {
  const shells = valenceOnly ? shorthand(z).rest : configuration(z)
  return (
    <div className="orbitals">
      {shells.map((s, i) => (
        <div key={i} className={`orb l${s.l}`}>
          <div className="boxes">
            {orbitalBoxes(s).map((b, k) => (
              <span key={k} className="box">
                {b >= 1 && <span className="up">↑</span>}
                {b === 2 && <span className="dn">↓</span>}
              </span>
            ))}
          </div>
          <div className="orb-lbl">{subshellLabel(s)}</div>
        </div>
      ))}
    </div>
  )
}
