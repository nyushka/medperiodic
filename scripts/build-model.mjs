// Builds the compact 3D anatomy model in public/model from two CC BY 4.0 BodyParts3D derivatives:
//   1. Human Atlas / @dagno/anatomy-model 0.1.2  — 2,234 meshes (atlas.json + body-*.bin.gz)
//   2. open-anatomy-3d 0.1.0                     — used only for the lungs and liver, missing from (1)
//
// Usage: node scripts/build-model.mjs <path to anatomy-model/model> <path to anatomy-male.glb>
// Output: public/model/parts.json and public/model/<layer>-<n>.bin.gz
// Format per part (each section padded to 4 bytes): Uint16x3 positions quantized to the part bounds,
// Int8x3 normals, then Uint16 or Uint32 indices (Uint32 when vertexCount > 65535).

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

const [srcDir, glbPath] = process.argv.slice(2)
if (!srcDir || !glbPath) {
  console.error('Usage: node scripts/build-model.mjs <anatomy-model/model dir> <anatomy-male.glb>')
  process.exit(1)
}
const OUT = new URL('../public/model/', import.meta.url).pathname
const CHUNK_TARGET = 4_500_000 // raw bytes per output chunk before gzip

// ---------- 1. Human Atlas model ----------
const atlas = JSON.parse(readFileSync(join(srcDir, 'atlas.json'), 'utf8'))
const chunks = atlas.chunks.map((c) => gunzipSync(readFileSync(join(srcDir, c.gzip))))

const LAYER_OF = {
  integumentary: 'skin',
  skeletal: 'skeleton',
  muscular: 'muscles',
  connective: 'muscles',
  arterial: 'arteries',
  venous: 'veins',
  nervous: 'nervous',
  digestive: 'organs', respiratory: 'organs', cardiac: 'organs', urinary: 'organs', reproductive: 'organs', endocrine: 'organs', lymphatic: 'organs', sensory: 'organs',
}

const parts = []
for (const p of atlas.parts) {
  // Cavities are blood/CSF volumes, not tissue: skip heart chamber cavities; brain ventricles go to nervous.
  if (/^cavity of (atrium|ventricle)$/i.test(p.name)) continue
  let layer = LAYER_OF[p.system] ?? 'organs'
  let system = p.system
  if (/fibularis/i.test(p.name)) { layer = 'muscles'; system = 'muscular' }
  if (/tensor fasciae latae/i.test(p.name)) { layer = 'muscles'; system = 'muscular' }
  if (/ventricle$|interventricular foramen/i.test(p.name) && /lateral|third|fourth|interventricular/i.test(p.name)) { layer = 'nervous'; system = 'nervous' }
  if (/(hair|eyebrow)/i.test(p.name)) layer = 'skin'
  const buf = chunks[p.chunk]
  const pos = new Float32Array(buf.buffer, buf.byteOffset + p.positions, p.vertexCount * 3)
  const nrm = new Int16Array(buf.buffer, buf.byteOffset + p.normals, p.vertexCount * 3)
  const idx = new Uint32Array(buf.buffer, buf.byteOffset + p.indices, p.indexCount)
  parts.push({ id: p.id, name: p.name, system, layer, pos: Float32Array.from(pos), nrm: Array.from(nrm, (v) => v / 32767), idx: Uint32Array.from(idx) })
}

const bbox = (pos) => {
  const mn = [Infinity, Infinity, Infinity]
  const mx = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], pos[i + k]); mx[k] = Math.max(mx[k], pos[i + k]) }
  return [mn, mx]
}

// ---------- 2. Lungs and liver from open-anatomy-3d ----------
await MeshoptDecoder.ready
const glb = readFileSync(glbPath)
const gltf = await new Promise((resolve, reject) =>
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), '', resolve, reject),
)
gltf.scene.updateMatrixWorld(true)
// The GLB uses a different origin. Calibrate with structures present in both models (the kidneys: GLB organs sit 2 m below its skeleton).
const glbBox = (key) => {
  const o = gltf.scene.getObjectByName(key)
  const pts = []
  o.traverse((m) => { if (m.isMesh) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); const P = g.attributes.position; for (let i = 0; i < P.count; i++) pts.push(P.getX(i), P.getY(i), P.getZ(i)) } })
  return pts
}
const center = ([mn, mx]) => mn.map((v, k) => (v + mx[k]) / 2)
const offsets = [['kidney_l', 'Left kidney'], ['kidney_r', 'Right kidney']].map(([g, h]) => {
  const a = center(bbox(Float32Array.from(glbBox(g))))
  const b = center(bbox(parts.find((p) => p.name === h).pos))
  return b.map((v, k) => v - a[k])
})
console.log('Calibration offsets (x,y,z):', offsets.map((o) => o.map((v) => v.toFixed(4)).join(',')).join(' | '))
const SHIFT = [0, 1, 2].map((k) => offsets.reduce((a, o) => a + o[k], 0) / offsets.length)
const EXTRA = { lung_l: ['OA-LUNG-L', 'Left lung', 'respiratory'], lung_r: ['OA-LUNG-R', 'Right lung', 'respiratory'], liver: ['OA-LIVER', 'Liver', 'digestive'] }
for (const [key, [id, name, system]] of Object.entries(EXTRA)) {
  const obj = gltf.scene.getObjectByName(key)
  if (!obj) throw new Error(`Missing ${key} in GLB`)
  const meshes = []
  obj.traverse((o) => o.isMesh && meshes.push(o))
  const pos = []
  const nrm = []
  const idx = []
  for (const m of meshes) {
    const g = m.geometry.clone()
    g.applyMatrix4(m.matrixWorld)
    if (!g.attributes.normal) g.computeVertexNormals()
    const base = pos.length / 3
    const P = g.attributes.position
    const N = g.attributes.normal
    for (let i = 0; i < P.count; i++) {
      pos.push(P.getX(i) + SHIFT[0], P.getY(i) + SHIFT[1], P.getZ(i) + SHIFT[2])
      nrm.push(N.getX(i), N.getY(i), N.getZ(i))
    }
    const I = g.index
    if (I) for (let i = 0; i < I.count; i++) idx.push(base + I.getX(i))
    else for (let i = 0; i < P.count; i++) idx.push(base + i)
  }
  parts.push({ id, name, system, layer: 'organs', pos: Float32Array.from(pos), nrm, idx: Uint32Array.from(idx) })
}

// Alignment check: compare the heart in both models via the ventricle wall bounds vs GLB heart bounds.
{
  const heartGlb = gltf.scene.getObjectByName('heart')
  const hb = []
  heartGlb?.traverse((o) => { if (o.isMesh) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); g.computeBoundingBox(); hb.push(g.boundingBox) } })
  const wall = parts.filter((p) => /^wall of (ventricle|atrium)$/i.test(p.name))
  const wb = bbox(Float32Array.from(wall.flatMap((p) => Array.from(p.pos))))
  if (hb.length) {
    const min = hb.reduce((a, b) => a.union(b)).min
    console.log('Heart min (Human Atlas walls):', wb[0].map((v) => v.toFixed(3)).join(', '), '| (open-anatomy):', [min.x, min.y, min.z].map((v) => v.toFixed(3)).join(', '))
  }
}

// ---------- 3. Quantize and pack ----------
const ORDER = ['skin', 'skeleton', 'muscles', 'organs', 'nervous', 'arteries', 'veins']
parts.sort((a, b) => ORDER.indexOf(a.layer) - ORDER.indexOf(b.layer))
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const pad4 = (n) => (n + 3) & ~3
const outChunks = []
const meta = []
let cur = null
const flush = () => {
  if (!cur) return
  const raw = Buffer.concat(cur.bufs)
  const file = `${cur.layer}-${outChunks.filter((c) => c.layer === cur.layer).length}.bin.gz`
  const gz = gzipSync(raw, { level: 9 })
  writeFileSync(join(OUT, file), gz)
  outChunks.push({ file, layer: cur.layer, bytes: raw.length, gz: gz.length })
  cur = null
}

let triangles = 0
for (const p of parts) {
  const vc = p.pos.length / 3
  const [mn, mx] = bbox(p.pos)
  const size = mx.map((v, k) => Math.max(v - mn[k], 1e-6))
  const posBytes = pad4(vc * 6)
  const nrmBytes = pad4(vc * 3)
  const wide = vc > 65535
  const idxBytes = pad4(p.idx.length * (wide ? 4 : 2))
  const block = Buffer.alloc(posBytes + nrmBytes + idxBytes)
  for (let i = 0; i < vc * 3; i++) block.writeUInt16LE(Math.round(((p.pos[i] - mn[i % 3]) / size[i % 3]) * 65535), i * 2)
  for (let i = 0; i < vc; i++) {
    const x = p.nrm[i * 3], y = p.nrm[i * 3 + 1], z = p.nrm[i * 3 + 2]
    const l = Math.hypot(x, y, z) || 1
    block.writeInt8(Math.round((x / l) * 127), posBytes + i * 3)
    block.writeInt8(Math.round((y / l) * 127), posBytes + i * 3 + 1)
    block.writeInt8(Math.round((z / l) * 127), posBytes + i * 3 + 2)
  }
  for (let i = 0; i < p.idx.length; i++) {
    if (wide) block.writeUInt32LE(p.idx[i], posBytes + nrmBytes + i * 4)
    else block.writeUInt16LE(p.idx[i], posBytes + nrmBytes + i * 2)
  }
  if (!cur || cur.layer !== p.layer || cur.size + block.length > CHUNK_TARGET) {
    flush()
    cur = { layer: p.layer, bufs: [], size: 0 }
  }
  meta.push({ id: p.id, n: p.name, s: p.system, l: p.layer, c: outChunks.length, o: cur.size, v: vc, i: p.idx.length, w: wide ? 1 : 0, b: [...mn, ...mx].map((v) => +v.toFixed(5)) })
  cur.bufs.push(block)
  cur.size += block.length
  triangles += p.idx.length / 3
}
flush()

writeFileSync(
  join(OUT, 'parts.json'),
  JSON.stringify({
    source: 'BodyParts3D 4.0 (c) DBCLS, CC BY 4.0, via Human Atlas / @dagno/anatomy-model 0.1.2 and open-anatomy-3d 0.1.0 (lungs, liver). Repacked by MedPeriodic.',
    triangles,
    chunks: outChunks,
    parts: meta,
  }),
)
const total = outChunks.reduce((a, c) => a + readFileSync(join(OUT, c.file)).length, 0)
console.log(`${meta.length} parts, ${triangles.toLocaleString()} triangles, ${outChunks.length} chunks, ${(total / 1e6).toFixed(1)} MB gzipped`)
for (const L of ORDER) console.log(' ', L.padEnd(9), meta.filter((m) => m.l === L).length, 'parts')
