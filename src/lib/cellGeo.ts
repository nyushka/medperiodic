import * as THREE from 'three'
import type { CellShape } from '../data/types'

// Procedural 3D cell models. Sizes are normalised so every cell fits a unit-ish bounding sphere.

const rnd = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

function membrane(color: THREE.ColorRepresentation, opacity = 0.5) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.32,
    metalness: 0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
    sheen: 1,
    sheenColor: new THREE.Color('#ffffff'),
    sheenRoughness: 0.5,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}
const solid = (color: THREE.ColorRepresentation, rough = 0.45) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: 0.4, clearcoatRoughness: 0.4 })
const NUCLEUS = '#5b4492'
const NUCLEOLUS = '#2f2357'

/** Sphere with gentle organic wobble. */
function blob(radius: number, amp: number, seed: number, segs = 64) {
  const g = new THREE.SphereGeometry(radius, segs, Math.round(segs * 0.75))
  const p = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = Math.sin(v.x * 5 + seed) * Math.sin(v.y * 4.3 + seed * 1.7) * Math.sin(v.z * 4.7 + seed * 0.6)
    v.multiplyScalar(1 + amp * n)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

function nucleus(group: THREE.Group, r: number, pos = new THREE.Vector3(), scale = new THREE.Vector3(1, 1, 1)) {
  const n = new THREE.Mesh(blob(r, 0.06, 3), solid(NUCLEUS, 0.55))
  n.position.copy(pos)
  n.scale.copy(scale)
  group.add(n)
  const nl = new THREE.Mesh(new THREE.SphereGeometry(r * 0.32, 24, 16), solid(NUCLEOLUS, 0.6))
  nl.position.copy(pos).add(new THREE.Vector3(r * 0.25, r * 0.2, r * 0.3).multiply(scale))
  group.add(nl)
}

function mitochondria(group: THREE.Group, count: number, radius: number, seed: number, flatten = 1) {
  const r = rnd(seed)
  const mat = solid('#d9824a', 0.5)
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.11, 6, 12), mat)
    const dir = new THREE.Vector3(r() - 0.5, (r() - 0.5) * flatten, r() - 0.5).normalize()
    m.position.copy(dir.multiplyScalar(radius * (0.55 + r() * 0.3)))
    m.rotation.set(r() * 6, r() * 6, r() * 6)
    group.add(m)
  }
}

function branchTube(group: THREE.Group, start: THREE.Vector3, dir: THREE.Vector3, len: number, radius: number, depth: number, mat: THREE.Material, r: () => number) {
  const pts = [start.clone()]
  const d = dir.clone().normalize()
  let p = start.clone()
  for (let i = 0; i < 4; i++) {
    d.add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.5)).normalize()
    p = p.clone().add(d.clone().multiplyScalar(len / 4))
    pts.push(p)
  }
  group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, radius, 8, false), mat))
  if (depth > 0) for (let k = 0; k < 2; k++) branchTube(group, p, d.clone().add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5)), len * 0.6, radius * 0.65, depth - 1, mat, r)
}

/** Builds a cell model; `color` tints the cytoplasm and membrane. */
export function buildCell(shape: CellShape, colorHex: string): THREE.Group {
  const g = new THREE.Group()
  const color = new THREE.Color(colorHex)
  const r = rnd(7)
  switch (shape) {
    case 'disc': {
      // Biconcave red blood cell (Evans–Fung profile)
      const pts: THREE.Vector2[] = []
      const N = 40
      const h = (t: number) => 0.5 * Math.sqrt(Math.max(0, 1 - t * t)) * (0.207 + 2.003 * t * t - 1.123 * t ** 4)
      for (let i = 0; i <= N; i++) pts.push(new THREE.Vector2(Math.max(1e-3, i / N), h(i / N)))
      for (let i = N; i >= 0; i--) pts.push(new THREE.Vector2(Math.max(1e-3, i / N), -h(i / N)))
      const geo = new THREE.LatheGeometry(pts, 96)
      geo.computeVertexNormals()
      const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: '#b3222e', roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.2, sheen: 0.6, sheenColor: new THREE.Color('#ff8a8a') }))
      m.scale.setScalar(1)
      m.rotation.x = 0.9
      g.add(m)
      break
    }
    case 'fragment': {
      const mat = solid('#c98da0', 0.4)
      for (let i = 0; i < 4; i++) {
        const m = new THREE.Mesh(blob(0.32, 0.12, i + 2, 40), mat)
        m.scale.set(1, 0.45, 0.8)
        m.position.set((r() - 0.5) * 1.1, (r() - 0.5) * 0.8, (r() - 0.5) * 0.9)
        m.rotation.set(r() * 3, r() * 3, r() * 3)
        g.add(m)
        for (let k = 0; k < 5; k++) {
          const gr = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), solid('#7b3f78'))
          gr.position.copy(m.position).add(new THREE.Vector3((r() - 0.5) * 0.3, (r() - 0.5) * 0.1, (r() - 0.5) * 0.25))
          g.add(gr)
        }
      }
      break
    }
    case 'neuron': {
      const mat = solid(color.clone().lerp(new THREE.Color('#e8d9c8'), 0.4), 0.5)
      const soma = new THREE.Mesh(blob(0.32, 0.12, 5), mat)
      g.add(soma)
      nucleus(g, 0.14, new THREE.Vector3(0.02, 0.02, 0.12))
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + r()
        const dir = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.8 + 0.2, (r() - 0.5) * 0.6)
        branchTube(g, dir.clone().multiplyScalar(0.25), dir, 0.55, 0.045, 2, mat, r)
      }
      // axon with myelin sheaths
      const axon = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0.1, -0.9, 0.05), new THREE.Vector3(0.05, -1.6, -0.05), new THREE.Vector3(0.15, -2.2, 0)])
      g.add(new THREE.Mesh(new THREE.TubeGeometry(axon, 60, 0.035, 8), mat))
      const myelin = solid('#f2ead8', 0.35)
      for (let t = 0.22; t < 0.95; t += 0.16) {
        const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.18, 6, 16), myelin)
        cap.position.copy(axon.getPointAt(t))
        cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axon.getTangentAt(t))
        g.add(cap)
      }
      g.position.y = 0.6
      g.scale.setScalar(0.75)
      break
    }
    case 'spindle': {
      const m = new THREE.Mesh(blob(0.5, 0.04, 2), membrane(color, 0.55))
      m.scale.set(2.1, 0.55, 0.55)
      g.add(m)
      nucleus(g, 0.17, new THREE.Vector3(), new THREE.Vector3(1.8, 0.7, 0.7))
      mitochondria(g, 6, 0.5, 4, 0.3)
      g.children.slice(-6).forEach((c) => (c.position.x *= 1.8))
      break
    }
    case 'striated': {
      const c = document.createElement('canvas')
      c.width = 256
      c.height = 16
      const x = c.getContext('2d')!
      for (let i = 0; i < 32; i++) {
        x.fillStyle = i % 2 ? '#7c1d26' : '#c4505a'
        x.fillRect(i * 8, 0, i % 2 ? 3 : 5, 16)
      }
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.wrapS = THREE.RepeatWrapping
      tex.repeat.set(2, 1)
      const fiber = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 2.2, 12, 48), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.45, clearcoat: 0.6 }))
      fiber.rotation.z = Math.PI / 2
      g.add(fiber)
      for (let i = 0; i < 4; i++) {
        const n = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), solid(NUCLEUS))
        n.scale.set(2.2, 0.6, 0.8)
        n.position.set(-0.9 + i * 0.6, 0.28 * (i % 2 ? 1 : -0.6), 0.14)
        g.add(n)
      }
      break
    }
    case 'column':
    case 'cilia':
    case 'cube': {
      const tall = shape !== 'cube'
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, tall ? 0.9 : 0.25, 12, 40), membrane(color, 0.5))
      if (!tall) body.scale.set(1.3, 1, 1.3)
      g.add(body)
      nucleus(g, 0.2, new THREE.Vector3(0, tall ? -0.35 : 0, 0))
      mitochondria(g, 7, 0.42, 9)
      if (tall) {
        const mat = solid(color.clone().lerp(new THREE.Color('#ffffff'), 0.35), 0.4)
        const n = shape === 'cilia' ? 34 : 60
        for (let i = 0; i < n; i++) {
          const a = i * 2.39996
          const rr = 0.34 * Math.sqrt((i + 0.5) / n)
          const len = shape === 'cilia' ? 0.5 : 0.14
          const hair = new THREE.Mesh(new THREE.CylinderGeometry(shape === 'cilia' ? 0.012 : 0.018, 0.018, len, 6), mat)
          hair.position.set(Math.cos(a) * rr, 0.87 + len / 2, Math.sin(a) * rr)
          if (shape === 'cilia') hair.rotation.z = Math.sin(a) * 0.25
          g.add(hair)
        }
        g.position.y = -0.15
      }
      break
    }
    case 'sperm': {
      const head = new THREE.Mesh(blob(0.22, 0.03, 1), solid('#cfd6e6', 0.35))
      head.scale.set(1.5, 1, 0.55)
      head.position.x = -1.1
      g.add(head)
      const acro = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.4), membrane('#8fb7e0', 0.55))
      acro.scale.set(1.6, 1.05, 0.6)
      acro.rotation.z = Math.PI / 2
      acro.position.x = -1.17
      g.add(acro)
      const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.45, 16), solid('#d9824a'))
      mid.rotation.z = Math.PI / 2
      mid.position.x = -0.7
      g.add(mid)
      const pts = Array.from({ length: 14 }, (_, i) => new THREE.Vector3(-0.47 + i * 0.13, Math.sin(i * 0.8) * 0.12 * (i / 13), 0))
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.02, 8), solid('#cfd6e6', 0.4)))
      break
    }
    case 'egg': {
      g.add(new THREE.Mesh(blob(0.78, 0.02, 4), membrane('#f0d9c4', 0.55)))
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 48), membrane('#e8e2f0', 0.18)))
      nucleus(g, 0.2, new THREE.Vector3(0.25, 0.2, 0.3))
      const cor = solid('#c7a4b8', 0.5)
      for (let i = 0; i < 60; i++) {
        const y = 1 - (i / 59) * 2
        const rad = Math.sqrt(1 - y * y)
        const a = i * 2.39996
        const c = new THREE.Mesh(blob(0.09, 0.15, i, 16), cor)
        c.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad).multiplyScalar(1.0)
        g.add(c)
      }
      g.scale.setScalar(0.9)
      break
    }
    case 'star':
    case 'branch': {
      const mat = membrane(color, 0.75)
      const soma = new THREE.Mesh(blob(0.32, 0.12, 6), mat)
      g.add(soma)
      nucleus(g, 0.15)
      const n = shape === 'star' ? 9 : 5
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2
        const rad = Math.sqrt(1 - y * y)
        const a = i * 2.39996
        const dir = new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad)
        branchTube(g, dir.clone().multiplyScalar(0.25), dir, shape === 'star' ? 0.55 : 0.75, shape === 'star' ? 0.06 : 0.04, shape === 'star' ? 1 : 2, mat, r)
      }
      break
    }
    case 'flat': {
      const m = new THREE.Mesh(blob(0.9, 0.04, 8), membrane(color, 0.5))
      m.scale.set(1, 0.16, 0.8)
      g.add(m)
      nucleus(g, 0.2, new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(1.2, 0.55, 1))
      g.rotation.x = 0.45
      break
    }
    case 'fat': {
      g.add(new THREE.Mesh(blob(0.85, 0.02, 2), membrane(color, 0.35)))
      const lipid = new THREE.Mesh(new THREE.SphereGeometry(0.76, 64, 48), new THREE.MeshPhysicalMaterial({ color: '#f2d27a', roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85 }))
      lipid.position.x = -0.05
      g.add(lipid)
      const nu = new THREE.Mesh(blob(0.16, 0.05, 1), solid(NUCLEUS))
      nu.scale.set(0.5, 1, 1)
      nu.position.set(0.78, 0.1, 0)
      g.add(nu)
      break
    }
    case 'lobed': {
      g.add(new THREE.Mesh(blob(0.7, 0.06, 3), membrane(color, 0.45)))
      const mat = solid(NUCLEUS, 0.5)
      const lobes = [new THREE.Vector3(-0.28, 0.1, 0), new THREE.Vector3(-0.05, 0.25, 0.1), new THREE.Vector3(0.22, 0.12, -0.05), new THREE.Vector3(0.18, -0.18, 0.1)]
      lobes.forEach((p, i) => {
        const l = new THREE.Mesh(blob(0.15, 0.08, i), mat)
        l.position.copy(p)
        g.add(l)
        if (i) {
          const link = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(lobes[i - 1], p), 4, 0.03, 6), mat)
          g.add(link)
        }
      })
      for (let i = 0; i < 40; i++) {
        const gr = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), solid(color.clone().lerp(new THREE.Color('#ffffff'), 0.2)))
        gr.position.set(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.3 + r() * 0.3)
        g.add(gr)
      }
      break
    }
    default: {
      g.add(new THREE.Mesh(blob(0.75, 0.07, 1), membrane(color, 0.45)))
      nucleus(g, 0.38)
      mitochondria(g, 8, 0.75, 2)
    }
  }
  return g
}
