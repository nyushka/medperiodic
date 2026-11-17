import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

function light(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.65
  scene.add(new THREE.HemisphereLight(0xf2f5ff, 0x30343c, 0.9))
  const key = new THREE.DirectionalLight(0xfff6ea, 2.2)
  key.position.set(2, 3, 3)
  const rim = new THREE.DirectionalLight(0xbcd6ff, 1.3)
  rim.position.set(-2.5, 1.5, -2.5)
  scene.add(key, rim)
}

export interface Studio {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  setObject: (o: THREE.Object3D, dist?: number) => void
  onTick: (fn: (t: number) => void) => void
  dispose: () => void
}

/** A small interactive 3D viewport that renders only while visible on screen. */
export function createStudio(host: HTMLElement, opts: { autoRotate?: boolean } = {}): Studio {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(renderer.domElement)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  const scene = new THREE.Scene()
  light(scene, renderer)
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
  camera.position.set(0, 0.4, 4)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.autoRotate = opts.autoRotate ?? true
  controls.autoRotateSpeed = 1.1
  controls.minDistance = 1
  controls.maxDistance = 12
  let current: THREE.Object3D | null = null
  const ticks: ((t: number) => void)[] = []
  let visible = true
  let raf = 0
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(host)
  const ro = new ResizeObserver(() => {
    const w = host.clientWidth
    const h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  ro.observe(host)
  const stopAuto = () => (controls.autoRotate = false)
  renderer.domElement.addEventListener('pointerdown', stopAuto)
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) controls.autoRotate = false
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop)
    if (!visible || document.hidden) return
    if (!reduce) for (const fn of ticks) fn(t / 1000)
    controls.update()
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    scene,
    camera,
    controls,
    setObject(o, dist) {
      if (current) {
        scene.remove(current)
        disposeTree(current)
      }
      current = o
      scene.add(o)
      const sphere = new THREE.Box3().setFromObject(o).getBoundingSphere(new THREE.Sphere())
      controls.target.copy(sphere.center)
      const d = dist ?? (sphere.radius / Math.sin((camera.fov * Math.PI) / 360)) * 0.82
      camera.position.copy(sphere.center).add(new THREE.Vector3(0, d * 0.18, d))
      controls.update()
    },
    onTick(fn) {
      ticks.push(fn)
    },
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', stopAuto)
      controls.dispose()
      if (current) disposeTree(current)
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

export function disposeTree(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh
    if (m.isMesh) {
      m.geometry.dispose()
      const mats = Array.isArray(m.material) ? m.material : [m.material]
      for (const mat of mats) {
        ;(mat as THREE.MeshStandardMaterial).map?.dispose()
        mat.dispose()
      }
    }
  })
}

// ---------- Thumbnails: one shared offscreen renderer, results cached as data URLs ----------
let thumbRenderer: THREE.WebGLRenderer | null = null
let thumbScene: THREE.Scene | null = null
const thumbCache = new Map<string, string>()

export function renderThumb(key: string, build: () => THREE.Object3D, size = 160): string | null {
  const hit = thumbCache.get(key)
  if (hit) return hit
  try {
    if (!thumbRenderer) {
      thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
      thumbRenderer.toneMapping = THREE.ACESFilmicToneMapping
      thumbRenderer.outputColorSpace = THREE.SRGBColorSpace
      thumbScene = new THREE.Scene()
      light(thumbScene, thumbRenderer)
    }
    thumbRenderer.setPixelRatio(2)
    thumbRenderer.setSize(size, size, false)
    const o = build()
    thumbScene!.add(o)
    const cam = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
    const s = new THREE.Box3().setFromObject(o).getBoundingSphere(new THREE.Sphere())
    const d = (s.radius / Math.sin((cam.fov * Math.PI) / 360)) * 1.02
    cam.position.copy(s.center).add(new THREE.Vector3(d * 0.25, d * 0.2, d).normalize().multiplyScalar(d))
    cam.lookAt(s.center)
    thumbRenderer.render(thumbScene!, cam)
    const url = thumbRenderer.domElement.toDataURL('image/png')
    thumbScene!.remove(o)
    disposeTree(o)
    thumbCache.set(key, url)
    return url
  } catch {
    return null
  }
}
