import * as THREE from 'three'
import { gunzipSync } from 'fflate'
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

function fromBase64(text: string): Uint8Array {
  const bin = atob(text.replace(/\s+/g, ''))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function gunzip(res: Response, onBytes: (n: number) => void, base64: boolean): Promise<ArrayBuffer> {
  const reader = res.body!.getReader()
  const parts: Uint8Array[] = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    parts.push(value)
    onBytes(base64 ? value.length * 0.75 : value.length)
  }
  let blob = new Blob(parts as BlobPart[])
  // Hosts that only serve text get the packs as base64 (.txt).
  if (base64) blob = new Blob([fromBase64(await blob.text()) as BlobPart])
  // Some servers already decoded the gzip transfer; detect the gzip magic number first.
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer())
  if (head[0] !== 0x1f || head[1] !== 0x8b) return blob.arrayBuffer()
  // Older browsers (e.g. Safari before 16.4) lack DecompressionStream: fall back to a JavaScript inflater.
  if (typeof DecompressionStream === 'undefined') {
    const out = gunzipSync(new Uint8Array(await blob.arrayBuffer()))
    return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer
  }
  return new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
}

/** Fetches one chunk and builds a BufferGeometry for every part stored in it. */
export async function loadChunk(index: ModelIndex, chunk: number, onBytes: (n: number) => void): Promise<Map<string, THREE.BufferGeometry>> {
  const c = index.chunks[chunk]
  const res = await fetch(MODEL_BASE + c.file)
  if (!res.ok) throw new Error(`Could not load ${c.file} (HTTP ${res.status}).`)
  const buf = await gunzip(res, onBytes, c.file.endsWith('.txt'))
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
