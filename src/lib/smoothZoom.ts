import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Smooth, eased zoom for an OrbitControls camera.
 * Mouse wheels, trackpad pinches (ctrl+wheel, and Safari gesture events) and two-finger touch pinches
 * all set a goal distance; the camera glides toward it every frame. Zoom heads toward the point under
 * the cursor or between the fingers, so what you pinch stays under your fingers.
 */
export class SmoothZoom {
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private el: HTMLElement
  private toCursor: boolean
  private active = false
  private goalDist = 1
  private goalTarget = new THREE.Vector3()
  private lastTarget = new THREE.Vector3()
  private touches = new Map<number, { x: number; y: number }>()
  private pinchDist = 0
  private gestureBase = 1
  private gestureScale = 1

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls, el: HTMLElement, opts: { toCursor?: boolean } = {}) {
    this.camera = camera
    this.controls = controls
    this.el = el
    this.toCursor = opts.toCursor ?? true
    controls.enableZoom = false
    el.addEventListener('wheel', this.onWheel, { passive: false })
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
    el.addEventListener('gesturestart', this.onGestureStart as EventListener, { passive: false })
    el.addEventListener('gesturechange', this.onGestureChange as EventListener, { passive: false })
  }

  /** Stop any zoom in progress (e.g. when a camera fly-to starts). */
  cancel() {
    this.active = false
  }

  private begin() {
    if (this.active) return
    this.active = true
    this.goalDist = this.camera.position.distanceTo(this.controls.target)
    this.goalTarget.copy(this.controls.target)
    this.lastTarget.copy(this.controls.target)
  }

  /** Multiply the goal distance by `factor`, zooming toward the screen point (clientX, clientY). */
  zoomBy(factor: number, clientX?: number, clientY?: number) {
    this.begin()
    const min = this.controls.minDistance
    const max = this.controls.maxDistance
    const next = THREE.MathUtils.clamp(this.goalDist * factor, min, max)
    const ratio = next / this.goalDist
    if (this.toCursor && clientX !== undefined && clientY !== undefined && ratio !== 1) {
      const p = this.pointUnder(clientX, clientY)
      if (p) this.goalTarget.sub(p).multiplyScalar(ratio).add(p)
    }
    this.goalDist = next
  }

  private pointUnder(x: number, y: number): THREE.Vector3 | null {
    const r = this.el.getBoundingClientRect()
    const ndc = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
    const ray = new THREE.Raycaster()
    ray.setFromCamera(ndc, this.camera)
    const normal = this.camera.getWorldDirection(new THREE.Vector3())
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, this.controls.target)
    return ray.ray.intersectPlane(plane, new THREE.Vector3())
  }

  /** Advance the glide. Returns true while the camera is still moving. */
  update(dt: number): boolean {
    if (!this.active) return false
    const t = this.controls.target
    // If the user panned during the zoom, carry the goal along with them.
    this.goalTarget.add(new THREE.Vector3().subVectors(t, this.lastTarget))
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 14)
    const offset = new THREE.Vector3().subVectors(this.camera.position, t)
    const dist = offset.length()
    const nextDist = dist + (this.goalDist - dist) * k
    t.lerp(this.goalTarget, k)
    this.camera.position.copy(t).add(offset.normalize().multiplyScalar(nextDist))
    this.lastTarget.copy(t)
    if (Math.abs(nextDist - this.goalDist) < this.goalDist * 0.0008 && t.distanceTo(this.goalTarget) < this.goalDist * 0.0008) this.active = false
    return true
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    let dy = e.deltaY
    if (e.deltaMode === 1) dy *= 16
    else if (e.deltaMode === 2) dy *= 400
    // Trackpad pinch arrives as ctrl+wheel with small deltas: make it more sensitive.
    const k = e.ctrlKey ? 0.012 : 0.0016
    this.zoomBy(Math.exp(THREE.MathUtils.clamp(dy, -200, 200) * k), e.clientX, e.clientY)
  }

  private onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return
    this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.touches.size === 2) this.pinchDist = this.spread()
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'touch' || !this.touches.has(e.pointerId)) return
    this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.touches.size !== 2) return
    const d = this.spread()
    if (this.pinchDist > 0 && d > 0) {
      const [a, b] = [...this.touches.values()]
      this.zoomBy(this.pinchDist / d, (a.x + b.x) / 2, (a.y + b.y) / 2)
    }
    this.pinchDist = d
  }

  private onUp = (e: PointerEvent) => {
    this.touches.delete(e.pointerId)
    if (this.touches.size < 2) this.pinchDist = 0
  }

  private spread() {
    const [a, b] = [...this.touches.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  // Safari on macOS reports trackpad pinches as gesture events.
  private onGestureStart = (e: Event & { scale?: number; clientX?: number; clientY?: number }) => {
    e.preventDefault()
    this.begin()
    this.gestureBase = this.goalDist
    this.gestureScale = 1
  }

  private onGestureChange = (e: Event & { scale?: number; clientX?: number; clientY?: number }) => {
    e.preventDefault()
    const s = e.scale ?? 1
    if (!s) return
    this.zoomBy(this.gestureScale / s, e.clientX, e.clientY)
    this.gestureScale = s
    void this.gestureBase
  }

  dispose() {
    const el = this.el
    el.removeEventListener('wheel', this.onWheel)
    el.removeEventListener('pointerdown', this.onDown)
    el.removeEventListener('pointermove', this.onMove)
    el.removeEventListener('pointerup', this.onUp)
    el.removeEventListener('pointercancel', this.onUp)
    el.removeEventListener('gesturestart', this.onGestureStart as EventListener)
    el.removeEventListener('gesturechange', this.onGestureChange as EventListener)
  }
}
