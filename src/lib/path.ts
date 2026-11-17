export type Pt = [number, number]

/** Catmull-Rom spline through points, emitted as cubic Bézier SVG path data. */
export function smooth(points: Pt[], closed = false, tension = 0.5): string {
  if (points.length < 2) return ''
  const p = closed ? [points[points.length - 1], ...points, points[0], points[1]] : [points[0], ...points, points[points.length - 1]]
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1]
    const [x1, y1] = p[i]
    const [x2, y2] = p[i + 1]
    const [x3, y3] = p[i + 2]
    const t = tension / 3
    const c1x = x1 + (x2 - x0) * t
    const c1y = y1 + (y2 - y0) * t
    const c2x = x2 - (x3 - x1) * t
    const c2y = y2 - (y3 - y1) * t
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
  }
  return closed ? d + 'Z' : d
}

export const mirrorX = (pts: Pt[], cx = 200): Pt[] => pts.map(([x, y]) => [2 * cx - x, y])

export const line = (a: Pt, b: Pt) => `M${a[0]},${a[1]} L${b[0]},${b[1]}`
