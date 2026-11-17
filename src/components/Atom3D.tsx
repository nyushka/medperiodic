import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { configuration, orbitalBoxes, shellCounts, subshellLabel, type Subshell } from '../lib/electrons'
import { createStudio, type Studio } from '../lib/studio'

// Real (tesseral) spherical harmonics, evaluated on a unit direction. Ordered m = -l … +l.
const ORBITALS: { name: string; f: (x: number, y: number, z: number) => number }[][] = [
  [{ name: 's', f: () => 1 }],
  [
    { name: 'pᵧ', f: (_x, y) => y },
    { name: 'p_z', f: (_x, _y, z) => z },
    { name: 'pₓ', f: (x) => x },
  ],
  [
    { name: 'd_xy', f: (x, y) => x * y },
    { name: 'd_yz', f: (_x, y, z) => y * z },
    { name: 'd_z²', f: (_x, _y, z) => 3 * z * z - 1 },
    { name: 'd_xz', f: (x, _y, z) => x * z },
    { name: 'd_x²−y²', f: (x, y) => x * x - y * y },
  ],
  [
    { name: 'f_y(3x²−y²)', f: (x, y) => y * (3 * x * x - y * y) },
    { name: 'f_xyz', f: (x, y, z) => x * y * z },
    { name: 'f_yz²', f: (_x, y, z) => y * (5 * z * z - 1) },
    { name: 'f_z³', f: (_x, _y, z) => z * (5 * z * z - 3) },
    { name: 'f_xz²', f: (x, _y, z) => x * (5 * z * z - 1) },
    { name: 'f_z(x²−y²)', f: (x, y, z) => z * (x * x - y * y) },
    { name: 'f_x(x²−3y²)', f: (x, y) => x * (x * x - 3 * y * y) },
  ],
]

const POS = new THREE.Color('#e08a62')
const NEG = new THREE.Color('#6a9fd8')

/** Angular probability surface |Y(θ,φ)|, coloured by the sign of the wavefunction. In chemistry, z is "up". */
function orbitalMesh(f: (x: number, y: number, z: number) => number, occupancy: number) {
  const g = new THREE.SphereGeometry(1, 120, 80)
  const p = g.attributes.position
  const colors = new Float32Array(p.count * 3)
  const v = new THREE.Vector3()
  let max = 0
  const vals: number[] = []
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    // map three.js (y up) to chemistry axes (z up): chemistry (x, y, z) = three (x, -z, y)
    const val = f(v.x, -v.z, v.y)
    vals.push(val)
    max = Math.max(max, Math.abs(val))
  }
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const r = Math.abs(vals[i]) / (max || 1)
    p.setXYZ(i, v.x * r, v.y * r, v.z * r)
    const c = vals[i] >= 0 ? POS : NEG
    colors.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.3,
    clearcoat: 0.7,
    transparent: occupancy < 2,
    opacity: occupancy === 0 ? 0.16 : occupancy === 1 ? 0.62 : 0.95,
    depthWrite: occupancy === 2,
    side: THREE.DoubleSide,
  })
  return new THREE.Mesh(g, mat)
}

function axes(len: number) {
  const g = new THREE.Group()
  const mat = new THREE.LineBasicMaterial({ color: '#8b93a3', transparent: true, opacity: 0.45 })
  for (const d of [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)])
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([d.clone().multiplyScalar(-len), d.clone().multiplyScalar(len)]), mat))
  return g
}

function buildShells(z: number, neutrons: number, color: string, tick: (fn: (t: number) => void) => void) {
  const g = new THREE.Group()
  // Nucleus: protons and neutrons packed by a golden-spiral volume fill (not to scale).
  const A = Math.min(z + neutrons, 110)
  const pr = Math.round((A * z) / (z + neutrons))
  const R = 0.075 * Math.cbrt(A) * 1.25
  const pm = new THREE.MeshPhysicalMaterial({ color: '#cc5a4a', roughness: 0.35, clearcoat: 0.8 })
  const nm = new THREE.MeshPhysicalMaterial({ color: '#aeb6c2', roughness: 0.35, clearcoat: 0.8 })
  const sg = new THREE.SphereGeometry(0.075, 20, 14)
  for (let i = 0; i < A; i++) {
    const y = 1 - (2 * (i + 0.5)) / A
    const rad = Math.sqrt(1 - y * y)
    const a = i * 2.39996
    const m = new THREE.Mesh(sg, (i * pr) % A < pr ? pm : nm)
    m.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad).multiplyScalar(R * Math.cbrt((i + 0.5) / A))
    g.add(m)
  }
  const shells = shellCounts(z)
  const em = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color(color), emissiveIntensity: 0.9 })
  const eg = new THREE.SphereGeometry(0.045, 16, 12)
  shells.forEach((n, k) => {
    const r = R + 0.42 + k * 0.36
    const plane = new THREE.Group()
    plane.rotation.set(0.35 + k * 0.62, k * 0.9, 0.25 * k)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.004, 6, 160), new THREE.MeshBasicMaterial({ color: '#9aa4b5', transparent: true, opacity: 0.45 }))
    ring.rotation.x = Math.PI / 2
    plane.add(ring)
    const spin = new THREE.Group()
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const e = new THREE.Mesh(eg, em)
      e.position.set(Math.cos(a) * r, 0, Math.sin(a) * r)
      spin.add(e)
    }
    plane.add(spin)
    g.add(plane)
    const speed = 0.9 / (k + 1)
    tick((t) => (spin.rotation.y = t * speed * (k % 2 ? -1 : 1)))
  })
  return g
}

function valenceSubshell(z: number): Subshell {
  const cfg = configuration(z)
  return cfg[cfg.length - 1]
}

export default function Atom3D({ z, neutrons, color, name }: { z: number; neutrons: number; color: string; name: string }) {
  const host = useRef<HTMLDivElement>(null)
  const studio = useRef<Studio | null>(null)
  const [mode, setMode] = useState<'shells' | 'orbitals'>('shells')
  const [failed, setFailed] = useState(false)
  const sub = valenceSubshell(z)
  const boxes = orbitalBoxes(sub)
  const defs = ORBITALS[sub.l]

  useEffect(() => {
    if (!host.current) return
    try {
      studio.current = createStudio(host.current)
    } catch {
      setFailed(true)
    }
    return () => {
      studio.current?.dispose()
      studio.current = null
    }
  }, [])

  useEffect(() => {
    const s = studio.current
    if (!s) return
    // fresh tick list per model
    const ticks: ((t: number) => void)[] = []
    s.onTick((t) => ticks.forEach((fn) => fn(t)))
    const sub = valenceSubshell(z)
    const boxes = orbitalBoxes(sub)
    const defs = ORBITALS[sub.l]
    if (mode === 'shells') {
      s.setObject(buildShells(z, neutrons, color, (fn) => ticks.push(fn)))
    } else {
      const g = new THREE.Group()
      const n = defs.length
      const cols = n <= 3 ? n : n <= 5 ? 3 : 4
      defs.forEach((d, i) => {
        const m = orbitalMesh(d.f, boxes[i] ?? 0)
        const row = Math.floor(i / cols)
        const inRow = Math.min(cols, n - row * cols)
        m.position.set((i % cols - (inRow - 1) / 2) * 2.3, -row * 2.3, 0)
        m.add(axes(1.05))
        g.add(m)
      })
      if (n === 1) g.add(axes(1.4))
      s.setObject(g)
      s.camera.position.y += 0.4
    }
    return () => {
      ticks.length = 0
    }
  }, [mode, z, neutrons, color])

  if (failed) return null
  return (
    <figure className="atom3d">
      <div className="atom3d-stage" ref={host} role="img" aria-label={mode === 'shells' ? `3D shell model of ${name}` : `3D shapes of the ${subshellLabel(sub)} orbitals of ${name}`} />
      <div className="atom3d-bar">
        <div className="seg small">
          <button className={mode === 'shells' ? 'on' : ''} onClick={() => setMode('shells')}>Shell model</button>
          <button className={mode === 'orbitals' ? 'on' : ''} onClick={() => setMode('orbitals')}>{subshellLabel(sub)} orbital shapes</button>
        </div>
      </div>
      <figcaption>
        {mode === 'shells' ? (
          <>Protons (red) and neutrons (grey) in the nucleus; electrons orbit on {shellCounts(z).length} shells. Nucleus enlarged, not to scale.</>
        ) : (
          <>
            Angular shape of each {subshellLabel(sub)} orbital: warm and cool lobes have opposite wavefunction sign. Solid = 2 electrons, translucent = 1, faint = empty.
            <span className="orb-names">
              {defs.map((d, i) => (
                <span key={d.name}>
                  {d.name.replace(/_/g, '')} <b>{'↑↓'.slice(0, boxes[i] ?? 0) || '–'}</b>
                </span>
              ))}
            </span>
          </>
        )}
      </figcaption>
    </figure>
  )
}
