import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { loadChunk, loadIndex } from '../lib/model'
import { AnatomyScene } from '../lib/scene'
import { progress, useProgress } from '../lib/progress'
import { Avatar } from './Profile'

interface Props {
  onEnter: () => void
  onSignIn: () => void
}


/** Full-screen start page: the 3D body turning slowly in a dark, rim-lit stage. */
export default function Landing({ onEnter, onSignIn }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(0)
  const [ready, setReady] = useState(false)
  const p = useProgress()

  useEffect(() => {
    if (!host.current) return
    let scene: AnatomyScene
    let cancelled = false
    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xe8dcdc, size: 0.007, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }),
    )
    // Drifting particles around the body
    const N = 700
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.35 + Math.random() * 1.1
      pos.set([Math.cos(a) * r, Math.random() * 2.1, Math.sin(a) * r], i * 3)
    }
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    let last = performance.now()
    function tick() {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const a = particles.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < N; i++) {
        let y = a.getY(i) + dt * (0.03 + (i % 7) * 0.006)
        if (y > 2.1) y = 0
        a.setY(i, y)
      }
      a.needsUpdate = true
      particles.rotation.y += dt * 0.05
    }
    try {
      scene = new AnatomyScene(host.current, { onHover: () => {}, onPick: () => {}, onFrame: () => tick() })
    } catch {
      setReady(true)
      return
    }
    const narrow = window.innerWidth < 760
    // Dark stage with cool rim lighting
    scene.renderer.toneMappingExposure = 0.95
    scene.scene.environmentIntensity = 0.3
    scene.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.09)
    for (const c of [...scene.scene.children]) {
      if ((c as THREE.HemisphereLight).isHemisphereLight) (c as THREE.HemisphereLight).intensity = 0.3
      if ((c as THREE.DirectionalLight).isDirectionalLight) (c as THREE.DirectionalLight).intensity *= 0.6
      if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).geometry.type === 'PlaneGeometry') c.visible = false
    }
    const rimA = new THREE.DirectionalLight(0xd23a44, 3.0)
    rimA.position.set(-2.4, 2.2, -2.6)
    const rimB = new THREE.DirectionalLight(0x9a9aa2, 1.6)
    rimB.position.set(2.6, 1.2, -2.2)
    scene.scene.add(rimA, rimB, particles)
    // Camera: slow 360° turntable; the visitor can drag to spin it
    const target = new THREE.Vector3(narrow ? 0 : -0.05, 0.93, 0)
    scene.controls.target.copy(target)
    scene.camera.position.set(target.x, 1.0, narrow ? 4.4 : 3.7)
    scene.camera.fov = 28
    scene.camera.updateProjectionMatrix()
    scene.controls.autoRotate = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    scene.controls.autoRotateSpeed = 0.9
    scene.controls.enablePan = false
    scene.controls.minDistance = scene.controls.maxDistance = scene.camera.position.distanceTo(target)
    scene.controls.minPolarAngle = scene.controls.maxPolarAngle = Math.PI / 2 - 0.03
    scene.controls.update()
    for (const l of ['skin', 'organs', 'nervous', 'arteries', 'veins'] as const) scene.setLayer(l, false, 1)
    scene.setLayer('skeleton', true, 1)
    scene.setLayer('muscles', true, 1)
    ;(async () => {
      try {
        const index = await loadIndex()
        const chunks = index.chunks.map((c, i) => ({ c, i })).filter(({ c }) => c.layer === 'skeleton' || c.layer === 'muscles')
        const total = chunks.reduce((s, { c }) => s + c.gz, 0)
        let got = 0
        for (const { c, i } of chunks) {
          const geoms = await loadChunk(index, i, (n) => {
            got += n
            if (!cancelled) setLoaded(got / total)
          })
          if (cancelled) return
          scene.addParts(index.parts.filter((q) => q.c === i), geoms)
          scene.setLayer(c.layer, true, 1)
        }
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
      scene.dispose()
    }
  }, [])

  return (
    <section className="landing" aria-label="Welcome to MedPeriodic">
      <div className={`landing-stage${ready ? ' ready' : ''}`} ref={host} aria-hidden="true" />
      <div className="landing-glow" aria-hidden="true" />
      <header className="landing-bar">
        <span className="landing-brand">MedPeriodic</span>
        {progress.signedIn ? (
          <span className="landing-user">
            <Avatar name={p.name} color={p.color} size={28} /> {p.name}
          </span>
        ) : (
          <button className="landing-link" onClick={onSignIn}>Sign in</button>
        )}
      </header>
      <div className="landing-copy">
        <h1>
          The body,
          <br />
          down to the atom.
        </h1>
        <div className="landing-actions">
          <button className="landing-primary" onClick={onEnter}>
            Enter
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </button>
          {!progress.signedIn && (
            <button className="landing-secondary" onClick={onSignIn}>Sign in</button>
          )}
        </div>
      </div>
      {!ready && (
        <div className="landing-load" role="status">
          <span style={{ width: `${Math.round(loaded * 100)}%` }} />
          <small>{Math.round(loaded * 100)}%</small>
        </div>
      )}
      <p className="landing-credit">BodyParts3D © DBCLS, CC BY 4.0</p>
    </section>
  )
}
