import * as THREE from 'three'
import type { LayerId, PartMeta } from './meshMatch'

export interface ModelIndex {
  source: string
  triangles: number
  chunks: { file: string; layer: LayerId; bytes: number; gz: number }[]
  parts: PartMeta[]
}

export const MODEL_BASE = 'model/'

export async function loadIndex(): Promise<ModelIndex> {
  const r = await fetch(MODEL_BASE + 'parts.json')
  if (!r.ok) throw new Error(`Could not load the anatomy model index (HTTP ${r.status}).`)
  return r.json()
}

async function gunzip(res: Response, onBytes: (n: number) => void): Promise<ArrayBuffer> {
  const reader = res.body!.getReader()
  const parts: Uint8Array[] = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    parts.push(value)
    onBytes(value.length)
  }
  const blob = new Blob(parts as BlobPart[])
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress the model (DecompressionStream is missing). Try a current Chrome, Edge, Firefox or Safari.')
  // Some servers already decoded the gzip transfer; detect the gzip magic number first.
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer())
  if (head[0] !== 0x1f || head[1] !== 0x8b) return blob.arrayBuffer()
  return new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
}

/** Fetches one chunk and builds a BufferGeometry for every part stored in it. */
export async function loadChunk(index: ModelIndex, chunk: number, onBytes: (n: number) => void): Promise<Map<string, THREE.BufferGeometry>> {
  const c = index.chunks[chunk]
  const res = await fetch(MODEL_BASE + c.file)
  if (!res.ok) throw new Error(`Could not load ${c.file} (HTTP ${res.status}).`)
  const buf = await gunzip(res, onBytes)
  const out = new Map<string, THREE.BufferGeometry>()
  for (const p of index.parts) {
    if (p.c !== chunk) continue
    const [x0, y0, z0, x1, y1, z1] = p.b
    const sx = (x1 - x0) / 65535
    const sy = (y1 - y0) / 65535
    const sz = (z1 - z0) / 65535
    const q = new Uint16Array(buf, p.o, p.v * 3)
    const pos = new Float32Array(p.v * 3)
    for (let i = 0; i < p.v; i++) {
      pos[i * 3] = x0 + q[i * 3] * sx
      pos[i * 3 + 1] = y0 + q[i * 3 + 1] * sy
      pos[i * 3 + 2] = z0 + q[i * 3 + 2] * sz
    }
    const posBytes = (p.v * 6 + 3) & ~3
    const nrmBytes = (p.v * 3 + 3) & ~3
    const nrm = new Int8Array(buf, p.o + posBytes, p.v * 3)
    const idx = p.w ? new Uint32Array(buf, p.o + posBytes + nrmBytes, p.i) : new Uint16Array(buf, p.o + posBytes + nrmBytes, p.i)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.BufferAttribute(nrm.slice(), 3, true))
    g.setIndex(new THREE.BufferAttribute(idx.slice(), 1))
    g.computeBoundingBox()
    g.computeBoundingSphere()
    out.set(p.id, g)
  }
  return out
}
