// Electron configuration engine: Aufbau (Madelung) filling + known ground-state exceptions.

export interface Subshell {
  n: number
  l: number // 0 s, 1 p, 2 d, 3 f
  e: number
}

const L_LETTER = ['s', 'p', 'd', 'f']
const CAP = [2, 6, 10, 14]

// Madelung order: increasing n+l, then n
const ORDER: [number, number][] = []
for (let sum = 1; sum <= 8; sum++) {
  for (let n = 1; n <= sum; n++) {
    const l = sum - n
    if (l < n && l <= 3) ORDER.push([n, l])
  }
}

// Ground-state exceptions: moves of electrons between subshells, applied after Aufbau.
type Move = [string, string, number] // from, to, count
const EXCEPTIONS: Record<number, Move[]> = {
  24: [['4s', '3d', 1]], // Cr — half-filled d5 stability
  29: [['4s', '3d', 1]], // Cu — filled d10 stability
  41: [['5s', '4d', 1]],
  42: [['5s', '4d', 1]], // Mo
  44: [['5s', '4d', 1]],
  45: [['5s', '4d', 1]],
  46: [['5s', '4d', 2]],
  47: [['5s', '4d', 1]],
  57: [['4f', '5d', 1]],
  58: [['4f', '5d', 1]],
  64: [['4f', '5d', 1]],
  78: [['6s', '5d', 1]],
  79: [['6s', '5d', 1]],
  89: [['5f', '6d', 1]],
  90: [['5f', '6d', 2]],
  91: [['5f', '6d', 1]],
  92: [['5f', '6d', 1]],
  93: [['5f', '6d', 1]],
  96: [['5f', '6d', 1]],
  103: [['6d', '7p', 1]],
}

const key = (s: { n: number; l: number }) => `${s.n}${L_LETTER[s.l]}`

function parseKey(k: string): { n: number; l: number } {
  return { n: Number(k.slice(0, -1)), l: L_LETTER.indexOf(k.slice(-1)) }
}

export function configuration(z: number): Subshell[] {
  const shells: Subshell[] = []
  let left = z
  for (const [n, l] of ORDER) {
    if (left <= 0) break
    const e = Math.min(CAP[l], left)
    shells.push({ n, l, e })
    left -= e
  }
  for (const [from, to, count] of EXCEPTIONS[z] ?? []) {
    const f = shells.find((s) => key(s) === from)
    if (f) f.e -= count
    let t = shells.find((s) => key(s) === to)
    if (!t) {
      t = { ...parseKey(to), e: 0 }
      // insert in Madelung position
      const idx = ORDER.findIndex(([n, l]) => n === t!.n && l === t!.l)
      const pos = shells.findIndex((s) => ORDER.findIndex(([n, l]) => n === s.n && l === s.l) > idx)
      if (pos === -1) shells.push(t)
      else shells.splice(pos, 0, t)
    }
    t.e += count
  }
  return shells.filter((s) => s.e > 0)
}

export function subshellLabel(s: Subshell): string {
  return `${s.n}${L_LETTER[s.l]}`
}

const NOBLE = [
  [2, 'He'],
  [10, 'Ne'],
  [18, 'Ar'],
  [36, 'Kr'],
  [54, 'Xe'],
  [86, 'Rn'],
] as const

/** Returns the noble-gas core symbol and the remaining (valence-side) subshells. */
export function shorthand(z: number): { core: string | null; rest: Subshell[] } {
  let core: (typeof NOBLE)[number] | null = null
  for (const ng of NOBLE) if (ng[0] < z) core = ng
  if (!core) return { core: null, rest: configuration(z) }
  const coreCfg = configuration(core[0])
  const rest = configuration(z)
    .map((s) => {
      const c = coreCfg.find((x) => x.n === s.n && x.l === s.l)
      return { ...s, e: s.e - (c?.e ?? 0) }
    })
    .filter((s) => s.e > 0)
  return { core: core[1], rest }
}

/** Electrons per principal shell (K, L, M, N...) for a Bohr diagram. */
export function shellCounts(z: number): number[] {
  const counts: number[] = []
  for (const s of configuration(z)) counts[s.n - 1] = (counts[s.n - 1] ?? 0) + s.e
  return Array.from(counts, (c) => c ?? 0)
}

/** Orbital boxes following Hund's rule: each box is 0, 1 (↑) or 2 (↑↓). */
export function orbitalBoxes(s: Subshell): number[] {
  const orbitals = 2 * s.l + 1
  const boxes = new Array(orbitals).fill(0)
  for (let i = 0; i < s.e; i++) boxes[i % orbitals]++
  return boxes
}

export function unpairedElectrons(z: number): number {
  return configuration(z).reduce((sum, s) => sum + orbitalBoxes(s).filter((b) => b === 1).length, 0)
}

export function valenceElectrons(z: number, group: number | null): number {
  if (group === null) return 3
  if (group <= 2) return group
  if (group >= 13) return group === 18 && z === 2 ? 2 : group - 10
  // transition metals: outer s + (n-1)d
  const cfg = configuration(z)
  const maxN = Math.max(...cfg.map((s) => s.n))
  return cfg.filter((s) => (s.n === maxN && s.l === 0) || (s.n === maxN - 1 && s.l === 2)).reduce((a, s) => a + s.e, 0)
}

export const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']
export const BLOCK_OF = (z: number): string => {
  const cfg = configuration(z)
  const last = cfg[cfg.length - 1]
  // f-block/d-block exceptions where last-filled differs from block convention
  if ((z >= 57 && z <= 71) || (z >= 89 && z <= 103)) return 'f'
  if (z === 2) return 's'
  return L_LETTER[last.l]
}
