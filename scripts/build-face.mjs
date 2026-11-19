// Adds the face to the 3D model: muscles of facial expression and chewing (missing from the source
// BodyParts3D meshes) and markers for the foramina you can see on the skull.
//
// Each muscle is a sheet laid onto the model's own skull: points along the muscle are projected onto the
// bone surface with ray casts, smoothed, then given thickness. Re-running replaces what an earlier run added.
//
// Usage: node scripts/build-face.mjs
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import * as THREE from 'three'
import { MeshBVH } from 'three-mesh-bvh'

const DIR = new URL('../public/model/', import.meta.url).pathname
const index = JSON.parse(readFileSync(join(DIR, 'parts.json'), 'utf8'))
const GEN = 'GEN-'

// ---- drop anything an earlier run added ----
const genChunks = new Set(index.chunks.map((c, i) => (c.file.startsWith('face-') ? i : -1)).filter((i) => i >= 0))
for (const i of genChunks) if (existsSync(join(DIR, index.chunks[i].file))) rmSync(join(DIR, index.chunks[i].file))
index.parts = index.parts.filter((p) => !p.id.startsWith(GEN))
index.chunks = index.chunks.filter((_, i) => !genChunks.has(i))

// ---- decode the skull from the skeleton chunks ----
function decodeChunk(ci) {
  const c = index.chunks[ci]
  const buf = gunzipSync(readFileSync(join(DIR, c.file)))
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const out = []
  for (const p of index.parts) {
    if (p.c !== ci) continue
    const [x0, y0, z0, x1, y1, z1] = p.b
    if ((y0 + y1) / 2 < 1.44) continue
    if (/vertebra|atlas|axis|hyoid|cartilage|costal/i.test(p.n)) continue
    const q = new Uint16Array(ab, p.o, p.v * 3)
    const pos = new Float32Array(p.v * 3)
    for (let i = 0; i < p.v; i++) {
      pos[i * 3] = x0 + (q[i * 3] * (x1 - x0)) / 65535
      pos[i * 3 + 1] = y0 + (q[i * 3 + 1] * (y1 - y0)) / 65535
      pos[i * 3 + 2] = z0 + (q[i * 3 + 2] * (z1 - z0)) / 65535
    }
    const posBytes = (p.v * 6 + 3) & ~3
    const nrmBytes = (p.v * 3 + 3) & ~3
    const idx = p.w ? new Uint32Array(ab, p.o + posBytes + nrmBytes, p.i) : new Uint16Array(ab, p.o + posBytes + nrmBytes, p.i)
    out.push({ pos, idx: Uint32Array.from(idx) })
  }
  return out
}
const skullParts = index.chunks.flatMap((c, i) => (c.layer === 'skeleton' ? decodeChunk(i) : []))
const merged = (() => {
  const nPos = skullParts.reduce((s, p) => s + p.pos.length, 0)
  const nIdx = skullParts.reduce((s, p) => s + p.idx.length, 0)
  const pos = new Float32Array(nPos)
  const idx = new Uint32Array(nIdx)
  let po = 0
  let io = 0
  for (const p of skullParts) {
    pos.set(p.pos, po)
    for (let i = 0; i < p.idx.length; i++) idx[io + i] = p.idx[i] + po / 3
    po += p.pos.length
    io += p.idx.length
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(new THREE.BufferAttribute(idx, 1))
  return g
})()
const bvh = new MeshBVH(merged)
console.log('skull triangles', merged.index.count / 3)

const V = (x, y, z) => new THREE.Vector3(x, y, z)
const C = V(0, 1.6, -0.02) // head centre: rays aim at it
const ray = new THREE.Ray()
/** Nearest bone surface point along the line from `g` toward the head centre (or along `dir`). */
function project(g, dir, reach = 0.026) {
  const n = dir ? dir.clone().normalize() : g.clone().sub(C).normalize()
  ray.origin.copy(g).addScaledVector(n, reach)
  ray.direction.copy(n).negate()
  const hit = bvh.raycastFirst(ray, THREE.DoubleSide)
  if (!hit || hit.distance > reach * 2) return null
  return { p: hit.point.clone(), n: hit.face.normal.clone() }
}

// ---- muscle sheets ----
const parts = []
function finish(name, top, bottom, nu, nv, wrapU) {
  // vertices: top grid then bottom grid; quads with optional wrap in u; sides close the slab
  const pos = []
  for (const grid of [top, bottom]) for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) pos.push(grid[i][j].x, grid[i][j].y, grid[i][j].z)
  const T = (i, j) => i * nv + j
  const B = (i, j) => nu * nv + i * nv + j
  const idx = []
  const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d)
  const iu = wrapU ? nu : nu - 1
  for (let i = 0; i < iu; i++) {
    const i2 = (i + 1) % nu
    for (let j = 0; j < nv - 1; j++) {
      quad(T(i, j), T(i2, j), T(i2, j + 1), T(i, j + 1))
      quad(B(i, j), B(i, j + 1), B(i2, j + 1), B(i2, j))
    }
    quad(T(i, 0), B(i, 0), B(i2, 0), T(i2, 0))
    quad(T(i, nv - 1), T(i2, nv - 1), B(i2, nv - 1), B(i, nv - 1))
  }
  if (!wrapU)
    for (const i of [0, nu - 1])
      for (let j = 0; j < nv - 1; j++) {
        if (i === 0) quad(T(0, j), T(0, j + 1), B(0, j + 1), B(0, j))
        else quad(T(i, j), B(i, j), B(i, j + 1), T(i, j + 1))
      }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  // Make the top face point away from the head; flip winding if construction mirrored it
  g.computeVertexNormals()
  let dot = 0
  const P = g.attributes.position
  const N = g.attributes.normal
  for (let k = 0; k < nu * nv; k += 7) dot += V(N.getX(k), N.getY(k), N.getZ(k)).dot(V(P.getX(k), P.getY(k), P.getZ(k)).sub(C))
  if (dot < 0) {
    const a = g.index.array
    for (let k = 0; k < a.length; k += 3) [a[k + 1], a[k + 2]] = [a[k + 2], a[k + 1]]
    g.index.needsUpdate = true
    g.computeVertexNormals()
  }
  parts.push({ name, layer: 'muscles', system: 'muscular', geo: g })
}

function smoothGrid(grid, nu, nv, wrapU, iters = 3) {
  for (let it = 0; it < iters; it++) {
    const next = grid.map((r) => r.map((p) => p.clone()))
    for (let i = 0; i < nu; i++)
      for (let j = 1; j < nv - 1; j++) {
        if (!wrapU && (i === 0 || i === nu - 1)) continue
        const a = grid[(i - 1 + nu) % nu][j]
        const b = grid[(i + 1) % nu][j]
        next[i][j] = grid[i][j].clone().multiplyScalar(0.4).add(a.clone().add(b).add(grid[i][j - 1]).add(grid[i][j + 1]).multiplyScalar(0.15))
      }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) grid[i][j].copy(next[i][j])
  }
}

/** Build the base surface from a guide grid: project onto bone, fall back to the guide where there is none. */
function surface(guide, nu, nv, wrapU, lift, reach = 0.026) {
  const base = []
  const nrm = []
  for (let i = 0; i < nu; i++) {
    base.push([])
    nrm.push([])
    for (let j = 0; j < nv; j++) {
      const g = guide[i][j]
      const radial = g.clone().sub(C).normalize()
      const hit = project(g, null, reach)
      base[i].push(hit ? hit.p : g.clone())
      nrm[i].push(radial)
    }
  }
  smoothGrid(base, nu, nv, wrapU, 4)
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) base[i][j].addScaledVector(nrm[i][j], lift)
  return { base, nrm }
}

/** A strap or fan muscle along a spine of control points with a width at each one. */
function strap(name, pts, widths, thick, { lift = 0.0006, nu = 36, nv = 12, reach = 0.026 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const wAt = (u) => {
    const s = u * (widths.length - 1)
    const k = Math.min(widths.length - 2, Math.floor(s))
    return widths[k] + (widths[k + 1] - widths[k]) * (s - k)
  }
  const guide = []
  for (let i = 0; i < nu; i++) {
    const u = i / (nu - 1)
    const p = curve.getPointAt(u)
    const tan = curve.getTangentAt(u)
    const radial = p.clone().sub(C).normalize()
    const side = new THREE.Vector3().crossVectors(tan, radial).normalize()
    guide.push([])
    for (let j = 0; j < nv; j++) {
      const v = (j / (nv - 1)) * 2 - 1
      guide[i].push(p.clone().addScaledVector(side, (v * wAt(u)) / 2))
    }
  }
  const { base, nrm } = surface(guide, nu, nv, false, lift, reach)
  const top = []
  const bottom = []
  for (let i = 0; i < nu; i++) {
    const u = i / (nu - 1)
    top.push([])
    bottom.push([])
    for (let j = 0; j < nv; j++) {
      const v = (j / (nv - 1)) * 2 - 1
      const belly = Math.pow(Math.sin(Math.PI * (0.06 + 0.88 * u)), 0.6) * Math.pow(1 - v * v, 0.55)
      top[i].push(base[i][j].clone().addScaledVector(nrm[i][j], 0.0004 + thick * belly))
      bottom[i].push(base[i][j].clone())
    }
  }
  finish(name, top, bottom, nu, nv, false)
}

/** A sphincter ring (orbicularis oris / oculi) in a plane facing `normal`. */
function ring(name, center, normal, outer, inner, thick, { lift = 0.0006, nu = 72, nv = 9, bulge = 0, onBone = true, wrap = 0 } = {}) {
  const n = normal.clone().normalize()
  const e1 = new THREE.Vector3().crossVectors(V(0, 1, 0), n).normalize()
  const e2 = new THREE.Vector3().crossVectors(n, e1).normalize()
  const guide = []
  for (let i = 0; i < nu; i++) {
    const a = (i / nu) * Math.PI * 2
    guide.push([])
    for (let j = 0; j < nv; j++) {
      const v = j / (nv - 1)
      const rx = inner[0] + (outer[0] - inner[0]) * v
      const ry = inner[1] + (outer[1] - inner[1]) * v
      const r2 = (Math.cos(a) * rx) ** 2 + (Math.sin(a) * ry) ** 2
      guide[i].push(center.clone().addScaledVector(e1, Math.cos(a) * rx).addScaledVector(e2, Math.sin(a) * ry).addScaledVector(n, bulge * (1 - v) - wrap * r2))
    }
  }
  const { base, nrm } = onBone ? surface(guide, nu, nv, true, lift) : { base: guide, nrm: guide.map((r) => r.map(() => n.clone())) }
  const top = []
  const bottom = []
  for (let i = 0; i < nu; i++) {
    top.push([])
    bottom.push([])
    for (let j = 0; j < nv; j++) {
      const v = j / (nv - 1)
      const belly = Math.pow(Math.sin(Math.PI * v), 0.6)
      top[i].push(base[i][j].clone().addScaledVector(nrm[i][j], 0.0004 + thick * belly))
      bottom[i].push(base[i][j].clone())
    }
  }
  finish(name, top, bottom, nu, nv, true)
}

/** Orbicularis oculi: a sheet wrapped on a sphere around the eyeball, snapping to the orbital rim where bone is close. */
function oculi(name, eye, facing, { nu = 72, nv = 10 } = {}) {
  const n = facing.clone().normalize()
  const e1 = new THREE.Vector3().crossVectors(V(0, 1, 0), n).normalize()
  const e2 = new THREE.Vector3().crossVectors(n, e1).normalize()
  const guide = []
  for (let i = 0; i < nu; i++) {
    const a = (i / nu) * Math.PI * 2
    guide.push([])
    for (let j = 0; j < nv; j++) {
      const v = j / (nv - 1)
      const th = (0.42 + v * 0.62) * (1 - 0.18 * Math.sin(a) ** 2)
      const R = 0.0158 + v * 0.0075
      const d = n.clone().multiplyScalar(Math.cos(th)).addScaledVector(e1, Math.sin(th) * Math.cos(a)).addScaledVector(e2, Math.sin(th) * Math.sin(a) * 0.85).normalize()
      guide[i].push(eye.clone().addScaledVector(d, R))
    }
  }
  // snap only the outer rows onto nearby bone
  const base = guide.map((r) => r.map((p) => p.clone()))
  const nrm = guide.map((r) => r.map((p) => p.clone().sub(eye).normalize()))
  for (let i = 0; i < nu; i++)
    for (let j = Math.floor(nv / 2); j < nv; j++) {
      const hit = project(guide[i][j], nrm[i][j], 0.006)
      if (hit) base[i][j].copy(hit.p).addScaledVector(nrm[i][j], 0.0008)
    }
  smoothGrid(base, nu, nv, true, 3)
  const top = []
  const bottom = []
  for (let i = 0; i < nu; i++) {
    top.push([])
    bottom.push([])
    for (let j = 0; j < nv; j++) {
      const v = j / (nv - 1)
      const belly = Math.pow(Math.sin(Math.PI * v), 0.9)
      top[i].push(base[i][j].clone().addScaledVector(nrm[i][j], 0.0003 + 0.0018 * belly))
      bottom[i].push(base[i][j].clone())
    }
  }
  finish(name, top, bottom, nu, nv, true)
}

// Landmarks measured from the model (metres; +x = the body's left, +z = front, +y = up)
const L = (x, y, z) => V(x, y, z)
const both = (fn) => {
  fn('Left', 1)
  fn('Right', -1)
}
both((S, s) => {
  const P = (x, y, z) => L(x * s, y, z)
  strap(`${S} temporalis`, [P(0.066, 1.678, 0.0), P(0.071, 1.64, 0.008), P(0.064, 1.603, 0.02), P(0.05, 1.573, 0.03)], [0.072, 0.064, 0.034, 0.012], 0.0045, { nu: 40, nv: 16, reach: 0.05 })
  strap(`${S} masseter`, [P(0.059, 1.583, 0.042), P(0.06, 1.55, 0.03), P(0.055, 1.512, 0.008)], [0.028, 0.034, 0.03], 0.008, { lift: 0.0015 })
  strap(`${S} frontalis`, [P(0.026, 1.7, 0.044), P(0.027, 1.676, 0.063), P(0.027, 1.645, 0.075), P(0.027, 1.622, 0.077)], [0.054, 0.056, 0.054, 0.05], 0.0018, { nu: 30, nv: 16, lift: 0.0012, reach: 0.05 })
  strap(`${S} occipitalis`, [P(0.03, 1.676, -0.103), P(0.032, 1.646, -0.116)], [0.03, 0.028], 0.002)
  strap(`${S} corrugator supercilii`, [P(0.007, 1.618, 0.083), P(0.02, 1.626, 0.081), P(0.034, 1.628, 0.076)], [0.006, 0.006, 0.004], 0.002, { lift: 0.0025 })
  strap(`${S} nasalis`, [P(0.017, 1.565, 0.085), P(0.012, 1.58, 0.094), P(0.004, 1.594, 0.098)], [0.006, 0.009, 0.008], 0.0015)
  strap(`${S} zygomaticus major`, [P(0.053, 1.588, 0.052), P(0.04, 1.56, 0.071), P(0.024, 1.535, 0.084)], [0.009, 0.008, 0.006], 0.003, { lift: 0.004 })
  strap(`${S} zygomaticus minor`, [P(0.043, 1.592, 0.064), P(0.03, 1.57, 0.079), P(0.015, 1.549, 0.089)], [0.006, 0.006, 0.005], 0.0025, { lift: 0.003 })
  strap(`${S} levator labii superioris`, [P(0.026, 1.582, 0.074), P(0.018, 1.565, 0.084), P(0.01, 1.548, 0.09)], [0.012, 0.011, 0.009], 0.0025, { lift: 0.0025 })
  strap(`${S} levator anguli oris`, [P(0.018, 1.572, 0.078), P(0.022, 1.551, 0.081), P(0.024, 1.537, 0.083)], [0.006, 0.006, 0.005], 0.002, { lift: 0.0015 })
  strap(`${S} buccinator`, [P(0.046, 1.532, 0.04), P(0.037, 1.532, 0.06), P(0.026, 1.532, 0.075)], [0.022, 0.02, 0.013], 0.003, { lift: 0.002 })
  strap(`${S} risorius`, [P(0.053, 1.53, 0.04), P(0.039, 1.531, 0.066), P(0.025, 1.532, 0.083)], [0.006, 0.005, 0.004], 0.0015, { lift: 0.0065 })
  strap(`${S} depressor anguli oris`, [P(0.037, 1.503, 0.055), P(0.03, 1.515, 0.07), P(0.024, 1.53, 0.081)], [0.016, 0.01, 0.005], 0.0025, { lift: 0.0035 })
  strap(`${S} depressor labii inferioris`, [P(0.018, 1.502, 0.073), P(0.013, 1.512, 0.081), P(0.008, 1.522, 0.088)], [0.012, 0.01, 0.008], 0.002, { lift: 0.003 })
  strap(`${S} mentalis`, [P(0.006, 1.505, 0.08), P(0.006, 1.518, 0.086)], [0.008, 0.007], 0.003, { lift: 0.002 })
  oculi(`${S} orbicularis oculi`, P(0.029, 1.596, 0.051), V(0.32 * s, 0.05, 1))
})
strap('Epicranial aponeurosis', [L(0, 1.7, 0.046), L(0, 1.716, 0.0), L(0, 1.71, -0.05), L(0, 1.68, -0.098)], [0.1, 0.13, 0.13, 0.08], 0.001, { nu: 40, nv: 20, lift: 0.0008, reach: 0.06 })
strap('Procerus', [L(0, 1.626, 0.084), L(0, 1.603, 0.09)], [0.011, 0.008], 0.0015, { lift: 0.002 })
ring('Orbicularis oris', L(0, 1.532, 0.09), V(0, 0, 1), [0.027, 0.017], [0.012, 0.0025], 0.0045, { lift: 0.003, bulge: 0.004 })

// ---- foramen markers: a rim around each opening, oriented to the bone surface ----
function marker(name, guess, radius, dir) {
  const hit = project(guess, dir, 0.03)
  if (!hit) {
    console.warn('no surface for', name)
    return
  }
  const n = hit.n.clone()
  if (n.dot(dir ? dir : guess.clone().sub(C)) < 0) n.negate()
  const g = new THREE.TorusGeometry(radius, radius * 0.28, 10, 40)
  const disc = new THREE.CircleGeometry(radius * 0.95, 32)
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n)
  for (const geo of [g, disc]) {
    geo.applyQuaternion(q)
    geo.translate(hit.p.x + n.x * 0.0004, hit.p.y + n.y * 0.0004, hit.p.z + n.z * 0.0004)
  }
  const merged = mergeGeos([g, disc])
  parts.push({ name, layer: 'skeleton', system: 'skeletal', geo: merged })
}
function mergeGeos(list) {
  const pos = []
  const nrm = []
  const idx = []
  for (const g of list) {
    const base = pos.length / 3
    const ng = g.index ? g : g
    ng.computeVertexNormals()
    const P = ng.attributes.position
    const N = ng.attributes.normal
    for (let i = 0; i < P.count; i++) {
      pos.push(P.getX(i), P.getY(i), P.getZ(i))
      nrm.push(N.getX(i), N.getY(i), N.getZ(i))
    }
    for (let i = 0; i < ng.index.count; i++) idx.push(base + ng.index.getX(i))
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  g.setIndex(idx)
  return g
}
both((S, s) => {
  const P = (x, y, z) => L(x * s, y, z)
  marker(`${S} supraorbital foramen`, P(0.021, 1.627, 0.078), 0.0016)
  marker(`${S} infraorbital foramen`, P(0.024, 1.574, 0.074), 0.0019)
  marker(`${S} mental foramen`, P(0.023, 1.508, 0.068), 0.0017)
  marker(`${S} mandibular foramen`, P(0.042, 1.545, 0.01), 0.0018, V(-s, 0, 0))
  marker(`${S} external acoustic meatus`, P(0.068, 1.594, -0.012), 0.0035, V(s, 0, 0))
})
// Foramen magnum: find the opening in the skull base by casting rays upward from below
{
  let sx = 0
  let sz = 0
  let n = 0
  const near = []
  for (let x = -0.025; x <= 0.025; x += 0.0015)
    for (let z = -0.075; z <= 0.0; z += 0.0015) {
      ray.origin.set(x, 1.45, z)
      ray.direction.set(0, 1, 0)
      const h = bvh.raycastFirst(ray, THREE.DoubleSide)
      if (h && h.point.y > 1.66) {
        sx += x
        sz += z
        n++
      } else if (h) near.push([x, z, h.point.y])
    }
  if (n > 10) {
    const cx = sx / n
    const cz = sz / n
    const r = Math.sqrt((n * 0.0015 * 0.0015) / Math.PI)
    // rim height: median bone height just outside the opening
    const ring = near.filter(([x, z]) => Math.abs(Math.hypot(x - cx, z - cz) - r) < 0.004).map((q) => q[2]).sort((a, b) => a - b)
    const y = ring.length ? ring[Math.floor(ring.length / 2)] : 1.575
    const g = new THREE.TorusGeometry(r, 0.0012, 10, 64)
    g.rotateX(Math.PI / 2)
    g.translate(cx, y - 0.0005, cz)
    parts.push({ name: 'Foramen magnum', layer: 'skeleton', system: 'skeletal', geo: mergeGeos([g]) })
    console.log('foramen magnum', cx.toFixed(4), y.toFixed(4), cz.toFixed(4), 'r', r.toFixed(4))
  } else console.warn('foramen magnum not found')
}

// ---- pack into new chunks (same format as build-model.mjs) ----
const pad4 = (n) => (n + 3) & ~3
for (const layer of ['muscles', 'skeleton']) {
  const list = parts.filter((p) => p.layer === layer)
  const bufs = []
  let off = 0
  const ci = index.chunks.length
  const file = `face-${layer}.bin.gz`
  list.forEach((p, k) => {
    const g = p.geo
    const P = g.attributes.position
    const N = g.attributes.normal
    const vc = P.count
    const mn = [Infinity, Infinity, Infinity]
    const mx = [-Infinity, -Infinity, -Infinity]
    for (let i = 0; i < vc; i++) for (let a = 0; a < 3; a++) {
      const v = P.array[i * 3 + a]
      mn[a] = Math.min(mn[a], v)
      mx[a] = Math.max(mx[a], v)
    }
    const size = mx.map((v, a) => Math.max(v - mn[a], 1e-6))
    const posBytes = pad4(vc * 6)
    const nrmBytes = pad4(vc * 3)
    const ic = g.index.count
    const wide = vc > 65535
    const idxBytes = pad4(ic * (wide ? 4 : 2))
    const block = Buffer.alloc(posBytes + nrmBytes + idxBytes)
    for (let i = 0; i < vc * 3; i++) block.writeUInt16LE(Math.round(((P.array[i] - mn[i % 3]) / size[i % 3]) * 65535), i * 2)
    for (let i = 0; i < vc; i++) {
      const x = N.getX(i), y = N.getY(i), z = N.getZ(i)
      const l = Math.hypot(x, y, z) || 1
      block.writeInt8(Math.round((x / l) * 127), posBytes + i * 3)
      block.writeInt8(Math.round((y / l) * 127), posBytes + i * 3 + 1)
      block.writeInt8(Math.round((z / l) * 127), posBytes + i * 3 + 2)
    }
    for (let i = 0; i < ic; i++) {
      const v = g.index.getX(i)
      if (wide) block.writeUInt32LE(v, posBytes + nrmBytes + i * 4)
      else block.writeUInt16LE(v, posBytes + nrmBytes + i * 2)
    }
    index.parts.push({ id: `${GEN}${layer === 'muscles' ? 'M' : 'F'}${String(k + 1).padStart(3, '0')}`, n: p.name, s: p.system, l: layer, c: ci, o: off, v: vc, i: ic, w: wide ? 1 : 0, b: [...mn, ...mx].map((v) => +v.toFixed(5)) })
    bufs.push(block)
    off += block.length
  })
  const raw = Buffer.concat(bufs)
  const gz = gzipSync(raw, { level: 9 })
  writeFileSync(join(DIR, file), gz)
  index.chunks.push({ file, layer, bytes: raw.length, gz: gz.length })
  console.log(file, list.length, 'parts', (gz.length / 1024).toFixed(0), 'KB')
}
index.triangles = index.parts.reduce((s, p) => s + p.i / 3, 0)
writeFileSync(join(DIR, 'parts.json'), JSON.stringify(index))
console.log('parts', index.parts.length)
