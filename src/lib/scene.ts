import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import type { LayerId, PartMeta } from './meshMatch'

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

export type ViewPreset = 'front' | 'back' | 'left' | 'right' | 'head' | 'torso' | 'arm' | 'leg' | 'hand' | 'foot'

type PartMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial> & { userData: { meta: PartMeta; center: THREE.Vector3; baseColor: THREE.Color; layer: LayerId; glass?: boolean; baseOpacity: number } }

// Textbook palette for tissues, matched against the BodyParts3D piece name.
const ORGAN_COLORS: [RegExp, string, number?][] = [
  [/lung/i, '#e9a2a6'],
  [/liver|hepatic|biliary/i, '#7c2a21'],
  [/gallbladder|cystic duct/i, '#4f8f3a'],
  [/valve|leaflet|cusp/i, '#f1d9c6'],
  [/wall of (atrium|ventricle)|papillary/i, '#a01e2c'],
  [/stomach/i, '#d97b5f'],
  [/esophagus|pharyn/i, '#c76a58'],
  [/duoden|jejun|ileum|ileocecal|mesentery/i, '#e8947c'],
  [/colon|cecum|append|rectum|taenia|mesocolon/i, '#c26a4f'],
  [/pancrea/i, '#e8c47c'],
  [/spleen/i, '#6e2445'],
  [/kidney/i, '#8d2b2b'],
  [/ureter|bladder|urethra/i, '#e2bf57'],
  [/adrenal/i, '#d9a33a'],
  [/thymus/i, '#cbd37b'],
  [/thyroid gland/i, '#a6555a'],
  [/tongue|uvula/i, '#c8545e'],
  [/gland/i, '#e0a98a'],
  [/bronch|trachea/i, '#cfe3ea'],
  [/cartilage|epiglottis|ligament|membrane/i, '#bcd5e1'],
  [/cornea|vitreous|anterior chamber|lacrimal lake/i, '#dff3ff', 0.18],
  [/lens/i, '#eaf4ff', 0.45],
  [/iris/i, '#3e70a9'],
  [/retina|choroid/i, '#cf5a49'],
  [/sclera|eyeball/i, '#f3f1ec'],
  [/testis|epididymis|prostate|seminal|deferent|penis|glans|corpus/i, '#c98d8a'],
]

function colorFor(p: PartMeta): { color: string; opacity?: number; rough?: number; coat?: number } {
  const n = p.n
  switch (p.l) {
    case 'skin':
      return /hair|eyebrow/i.test(n) ? { color: '#3a2a20', rough: 0.9 } : { color: '#d8a183', opacity: 0.32, rough: 0.6 }
    case 'skeleton':
      if (/tooth/i.test(n)) return { color: '#f5f0e2', rough: 0.35, coat: 0.4 }
      if (/gingiva/i.test(n)) return { color: '#d9817f', rough: 0.5 }
      if (/cartilage|disk|disc/i.test(n)) return { color: '#a9c8d8', rough: 0.45, coat: 0.3 }
      return { color: '#e7dabf', rough: 0.72 }
    case 'muscles':
      if (/tendon|ligament|membrane|linea|raphe|retinaculum|aponeurosis/i.test(n)) return { color: '#efe2cf', rough: 0.4, coat: 0.3 }
      return { color: '#a8302b', rough: 0.52, coat: 0.15 }
    case 'arteries':
      return { color: '#d4202f', rough: 0.38, coat: 0.4 }
    case 'veins':
      return { color: '#3557c8', rough: 0.4, coat: 0.4 }
    case 'nervous':
      if (/ventricle|aqueduct|canal|foramen|choroid plexus/i.test(n)) return { color: '#7fc8f8', rough: 0.3, opacity: 0.7 }
      if (/nerve|ganglion|chiasm|tract|plexus/i.test(n)) return { color: '#f2c94c', rough: 0.45 }
      return { color: '#e5b8b1', rough: 0.55, coat: 0.2 }
    default: {
      const hit = ORGAN_COLORS.find(([re]) => re.test(n))
      return hit ? { color: hit[1], opacity: hit[2], rough: 0.42, coat: 0.35 } : { color: '#c97b6b', rough: 0.45, coat: 0.3 }
    }
  }
}

const HIGHLIGHT = new THREE.Color('#2f6fed')
const HOVER = new THREE.Color('#f2b33d')
const BLACK = new THREE.Color(0)

export interface SceneCallbacks {
  onHover: (meta: PartMeta | null, x: number, y: number) => void
  onPick: (meta: PartMeta | null) => void
  onFrame?: () => void
}

export class AnatomyScene {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(30, 1, 0.01, 60)
  readonly controls: OrbitControls
  private meshes = new Map<string, PartMesh>()
  private layerState = new Map<LayerId, { visible: boolean; opacity: number }>()
  private hidden = new Set<string>()
  private isolated: Set<string> | null = null
  private highlighted = new Set<string>()
  private hovered: string | null = null
  private explode = 0
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private tween: { t0: number; dur: number; fromPos: THREE.Vector3; toPos: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3 } | null = null
  private raf = 0
  private ro: ResizeObserver
  private down: { x: number; y: number } | null = null
  private hoverQueued = false
  private lastMove = { x: 0, y: 0 }
  private disposed = false
  private dirty = true

  /** Request a redraw on the next frame (the scene renders on demand). */
  invalidate() {
    this.dirty = true
  }

  private host: HTMLElement
  private cb: SceneCallbacks

  constructor(host: HTMLElement, cb: SceneCallbacks) {
    this.host = host
    this.cb = cb
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.5 : 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(this.renderer.domElement)
    ;(this.raycaster as THREE.Raycaster & { firstHitOnly?: boolean }).firstHitOnly = true

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.7
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d4cc, 1.0))
    const key = new THREE.DirectionalLight(0xfff8f0, 2.2)
    key.position.set(1.8, 3.4, 3.2)
    const fill = new THREE.DirectionalLight(0xeef3ff, 0.8)
    fill.position.set(-2.6, 1.4, 2.0)
    const back = new THREE.DirectionalLight(0xffffff, 0.9)
    back.position.set(0, 2.4, -3)
    this.scene.add(key, fill, back)

    // Soft contact shadow under the feet
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(30,30,40,0.28)')
    grad.addColorStop(1, 'rgba(30,30,40,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }))
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.001
    this.scene.add(shadow)

    this.camera.position.set(0, 1.0, 3.7)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 0.92, 0)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 0.12
    this.controls.maxDistance = 7
    this.controls.screenSpacePanning = true
    this.controls.update()

    const el = this.renderer.domElement
    el.style.touchAction = 'none'
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerleave', this.onLeave)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.resize()
    this.loop()
  }

  // ---------- parts ----------
  addParts(metas: PartMeta[], geoms: Map<string, THREE.BufferGeometry>) {
    for (const meta of metas) {
      const g = geoms.get(meta.id)
      if (!g) continue
      const c = colorFor(meta)
      const mat = new THREE.MeshPhysicalMaterial({
        color: c.color,
        roughness: c.rough ?? 0.55,
        metalness: 0,
        clearcoat: c.coat ?? 0,
        clearcoatRoughness: 0.45,
        side: THREE.FrontSide,
      })
      // Tiny lightness jitter so neighbouring muscles and bones read as separate pieces, like a painted model.
      const jitter = (hash(meta.id) - 0.5) * (meta.l === 'muscles' ? 0.09 : 0.05)
      mat.color.offsetHSL(0, 0, jitter)
      const mesh = new THREE.Mesh(g, mat) as unknown as PartMesh
      mesh.userData = {
        meta,
        layer: meta.l,
        center: new THREE.Vector3((meta.b[0] + meta.b[3]) / 2, (meta.b[1] + meta.b[4]) / 2, (meta.b[2] + meta.b[5]) / 2),
        baseColor: mat.color.clone(),
        glass: c.opacity !== undefined,
        baseOpacity: c.opacity ?? 1,
      }
      if (c.opacity !== undefined) {
        mat.transparent = true
        mat.opacity = c.opacity
        mat.depthWrite = false
      }
      mesh.renderOrder = meta.l === 'skin' ? 10 : c.opacity !== undefined ? 5 : 0
      this.meshes.set(meta.id, mesh)
      this.scene.add(mesh)
      this.applyState(mesh)
    }
    // Build raycast acceleration structures off the critical path.
    const ids = metas.map((m) => m.id)
    let i = 0
    const work = () => {
      if (this.disposed) return
      const t = performance.now()
      while (i < ids.length && performance.now() - t < 12) {
        const m = this.meshes.get(ids[i++])
        if (m && !m.geometry.boundsTree) m.geometry.computeBoundsTree()
      }
      if (i < ids.length) setTimeout(work, 0)
    }
    setTimeout(work, 50)
  }

  hasPart(id: string) {
    return this.meshes.has(id)
  }

  // ---------- state ----------
  setLayer(layer: LayerId, visible: boolean, opacity: number) {
    this.layerState.set(layer, { visible, opacity })
    for (const m of this.meshes.values()) if (m.userData.layer === layer) this.applyState(m)
  }

  private applyState(m: PartMesh) {
    this.dirty = true
    const st = this.layerState.get(m.userData.layer) ?? { visible: true, opacity: 1 }
    const id = m.userData.meta.id
    const shown = st.visible && st.opacity > 0.01 && !this.hidden.has(id) && (!this.isolated || this.isolated.has(id))
    m.visible = shown
    const glass = m.userData.glass
    const mat = m.material
    mat.opacity = m.userData.baseOpacity * st.opacity
    const transparent = glass || st.opacity < 0.999
    if (mat.transparent !== transparent) {
      mat.transparent = transparent
      mat.needsUpdate = true
    }
    mat.depthWrite = !transparent || st.opacity > 0.85
    // highlight / hover
    const hl = this.highlighted.has(id)
    const hv = this.hovered === id
    mat.color.copy(m.userData.baseColor).lerp(hl ? HIGHLIGHT : HOVER, hl ? 0.62 : hv ? 0.25 : 0)
    mat.emissive.copy(hl ? HIGHLIGHT : hv ? HOVER : BLACK)
    mat.emissiveIntensity = hl ? 0.32 : hv ? 0.22 : 0
    if (hl && transparent) mat.opacity = Math.max(mat.opacity, 0.85)
  }

  private refreshAll() {
    for (const m of this.meshes.values()) this.applyState(m)
  }

  setHighlight(ids: string[]) {
    const prev = this.highlighted
    this.highlighted = new Set(ids)
    for (const id of new Set([...prev, ...ids])) {
      const m = this.meshes.get(id)
      if (m) this.applyState(m)
    }
  }

  isolate(ids: string[] | null) {
    this.isolated = ids && ids.length ? new Set(ids) : null
    this.refreshAll()
  }

  hide(ids: string[]) {
    for (const id of ids) this.hidden.add(id)
    this.refreshAll()
  }

  showAll() {
    this.hidden.clear()
    this.isolated = null
    this.refreshAll()
  }

  get isIsolated() {
    return !!this.isolated
  }

  setExplode(k: number) {
    this.explode = k
    this.dirty = true
    for (const m of this.meshes.values()) {
      const c = m.userData.center
      m.position.set(c.x * 1.6 * k, (c.y - 0.95) * 0.45 * k, (c.z + 0.02) * 2.4 * k)
    }
  }

  // ---------- camera ----------
  private flyTo(target: THREE.Vector3, pos: THREE.Vector3, dur = 650) {
    this.tween = { t0: performance.now(), dur, fromPos: this.camera.position.clone(), toPos: pos, fromTarget: this.controls.target.clone(), toTarget: target }
  }

  view(p: ViewPreset) {
    const T: Record<ViewPreset, [number, number, number, number, THREE.Vector3]> = {
      front: [0, 0.92, 0, 3.7, new THREE.Vector3(0, 0.02, 1)],
      back: [0, 0.92, 0, 3.7, new THREE.Vector3(0, 0.02, -1)],
      left: [0, 0.92, 0, 3.7, new THREE.Vector3(1, 0.02, 0)],
      right: [0, 0.92, 0, 3.7, new THREE.Vector3(-1, 0.02, 0)],
      head: [0, 1.58, 0.02, 0.75, new THREE.Vector3(0.25, 0.05, 1)],
      torso: [0, 1.18, 0, 1.45, new THREE.Vector3(0, 0.05, 1)],
      arm: [-0.24, 1.1, 0, 1.35, new THREE.Vector3(-0.15, 0.05, 1)],
      hand: [-0.3, 0.8, 0.02, 0.5, new THREE.Vector3(-0.35, 0.1, 1)],
      leg: [-0.09, 0.5, 0, 1.8, new THREE.Vector3(0, 0.05, 1)],
      foot: [-0.09, 0.05, 0.05, 0.55, new THREE.Vector3(0.1, 0.55, 1)],
    }
    const [x, y, z, d, dir] = T[p]
    const target = new THREE.Vector3(x, y, z)
    this.flyTo(target, target.clone().add(dir.normalize().multiplyScalar(d)))
  }

  focus(ids: string[]) {
    const box = new THREE.Box3()
    for (const id of ids) {
      const m = this.meshes.get(id)
      if (!m) continue
      const b = m.geometry.boundingBox!.clone()
      b.translate(m.position)
      box.union(b)
    }
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3()).length()
    const dist = Math.max(0.28, (size / (2 * Math.tan((this.camera.fov * Math.PI) / 360))) * 1.15)
    const dir = this.camera.position.clone().sub(this.controls.target).normalize()
    this.flyTo(center, center.clone().add(dir.multiplyScalar(dist)))
  }

  /** Screen position (CSS px within the host) of a point on the visible surface of a set of parts. */
  anchorFor(ids: string[]): { x: number; y: number } | null {
    const box = new THREE.Box3()
    let any = false
    for (const id of ids) {
      const m = this.meshes.get(id)
      if (!m || !m.visible) continue
      const b = m.geometry.boundingBox!.clone()
      b.translate(m.position)
      box.union(b)
      any = true
    }
    if (!any) return null
    const c = box.getCenter(new THREE.Vector3())
    const toCam = this.camera.position.clone().sub(c).normalize()
    const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5)
    c.add(new THREE.Vector3(toCam.x * half.x, toCam.y * half.y, toCam.z * half.z).multiplyScalar(0.9))
    const v = c.project(this.camera)
    if (v.z > 1) return null
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h }
  }

  // ---------- picking ----------
  private pick(x: number, y: number): PartMesh | null {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const cand: PartMesh[] = []
    for (const m of this.meshes.values()) {
      if (!m.visible) continue
      const st = this.layerState.get(m.userData.layer)
      if (st && st.opacity < 0.5 && !this.highlighted.has(m.userData.meta.id)) continue // click through see-through layers
      if (m.userData.glass && m.userData.layer !== 'skin') continue
      if (m.userData.layer === 'skin') continue
      cand.push(m)
    }
    const hit = this.raycaster.intersectObjects(cand, false)[0]
    return (hit?.object as PartMesh) ?? null
  }

  private onDown = (e: PointerEvent) => {
    this.down = { x: e.clientX, y: e.clientY }
  }

  private onUp = (e: PointerEvent) => {
    if (!this.down) return
    const moved = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y)
    this.down = null
    if (moved > 6) return
    const m = this.pick(e.clientX, e.clientY)
    this.cb.onPick(m ? m.userData.meta : null)
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.buttons) return
    this.lastMove = { x: e.clientX, y: e.clientY }
    if (this.hoverQueued) return
    this.hoverQueued = true
    requestAnimationFrame(() => {
      this.hoverQueued = false
      const m = this.pick(this.lastMove.x, this.lastMove.y)
      const id = m?.userData.meta.id ?? null
      if (id !== this.hovered) {
        const prev = this.hovered
        this.hovered = id
        if (prev) {
          const pm = this.meshes.get(prev)
          if (pm) this.applyState(pm)
        }
        if (m) this.applyState(m)
      }
      const r = this.host.getBoundingClientRect()
      this.cb.onHover(m ? m.userData.meta : null, this.lastMove.x - r.left, this.lastMove.y - r.top)
    })
  }

  private onLeave = () => {
    if (this.hovered) {
      const pm = this.meshes.get(this.hovered)
      this.hovered = null
      if (pm) this.applyState(pm)
    }
    this.cb.onHover(null, 0, 0)
  }

  // ---------- loop ----------
  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.dirty = true
  }

  private loop = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    if (this.tween) {
      const k = Math.min(1, (performance.now() - this.tween.t0) / this.tween.dur)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, e)
      this.controls.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, e)
      if (k >= 1) {
        this.tween = null
        this.dirty = true
      }
    }
    const moved = this.controls.update()
    if (!moved && !this.dirty && !this.tween) return
    this.dirty = false
    this.renderer.render(this.scene, this.camera)
    this.cb.onFrame?.()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.controls.dispose()
    for (const m of this.meshes.values()) {
      m.geometry.disposeBoundsTree?.()
      m.geometry.dispose()
      m.material.dispose()
    }
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  get explodeAmount() {
    return this.explode
  }
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return ((h >>> 0) % 1000) / 1000
}
