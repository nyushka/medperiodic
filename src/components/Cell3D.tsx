import { useEffect, useRef, useState } from 'react'
import type { CellShape } from '../data/types'
import { buildCell } from '../lib/cellGeo'
import { createStudio, renderThumb, type Studio } from '../lib/studio'

/** Interactive 3D cell model (drag to rotate). */
export default function Cell3D({ shape, color, label }: { shape: CellShape; color: string; label: string }) {
  const host = useRef<HTMLDivElement>(null)
  const studio = useRef<Studio | null>(null)
  const [failed, setFailed] = useState(false)

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
    studio.current?.setObject(buildCell(shape, color))
  }, [shape, color])

  if (failed) return null
  return (
    <figure className="cell3d">
      <div className="cell3d-stage" ref={host} role="img" aria-label={`3D model of a ${label}. Drag to rotate.`} />
      <figcaption>3D model · drag to rotate</figcaption>
    </figure>
  )
}

/** Static rendered thumbnail of a cell model, from a shared offscreen renderer. */
export function CellThumb({ shape, color, alt }: { shape: CellShape; color: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    const id = requestAnimationFrame(() => {
      const u = renderThumb(`${shape}|${color}`, () => buildCell(shape, color))
      if (alive) setUrl(u)
    })
    return () => {
      alive = false
      cancelAnimationFrame(id)
    }
  }, [shape, color])
  return url ? <img className="cell-thumb" src={url} alt={alt} width={64} height={64} /> : <span className="cell-thumb ph" aria-hidden="true" />
}
