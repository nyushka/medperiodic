import { mirrorX, smooth, type Pt } from '../lib/path'
import type { Region } from '../data/types'

// Front (anterior) view of the body, drawn in a 400 × 900 box with the midline at x = 200.
// Shapes flagged `mirror` are drawn on the image-left and reflected to the right.

export interface Shape {
  id?: string
  d: string
  fill?: string
  stroke?: string
  w?: number
  mirror?: boolean
  dash?: string
  deco?: boolean
  opacity?: number
}

export type Layer = 'skeleton' | 'muscles' | 'organs' | 'circulation' | 'nerves' | 'regions'

export const LAYERS: { id: Layer; label: string; color: string }[] = [
  { id: 'skeleton', label: 'Skeleton', color: '#f1e3c6' },
  { id: 'muscles', label: 'Muscles', color: '#ff5d6c' },
  { id: 'organs', label: 'Organs', color: '#ff9b42' },
  { id: 'circulation', label: 'Blood & lymph', color: '#ff2e55' },
  { id: 'nerves', label: 'Nerves', color: '#ffd84d' },
  { id: 'regions', label: 'Regions', color: '#e8b58c' },
]

// ---------- Silhouette ----------
const LEFT: Pt[] = [
  [186, 112], [184, 138], [160, 146], [134, 156], [122, 172], [116, 200], [110, 250], [104, 300], [100, 330],
  [94, 380], [88, 430], [84, 458], [78, 474], [70, 492], [64, 512], [67, 522], [73, 519], [78, 506], [80, 528],
  [86, 541], [94, 544], [103, 539], [110, 530], [114, 514], [112, 490], [108, 470], [106, 458], [112, 420],
  [118, 370], [124, 330], [130, 290], [138, 250], [146, 222], [150, 250], [152, 300], [150, 350], [144, 400],
  [140, 432], [140, 480], [144, 560], [150, 630], [152, 650], [148, 700], [152, 760], [158, 820], [157, 840],
  [150, 864], [153, 881], [187, 883], [192, 866], [190, 846], [187, 828], [186, 760], [184, 700], [183, 650],
  [186, 600], [192, 530], [200, 494],
]
export const SILHOUETTE = smooth([...LEFT, ...mirrorX(LEFT).reverse().slice(1)], true, 0.35)
export const HEAD = 'M200,22 C224,22 238,42 238,70 C238,98 222,122 200,122 C178,122 162,98 162,70 C162,42 176,22 200,22 Z'

// ---------- Skeleton ----------
const BONE = '#efe4cc'
const BONE_D = '#cdbf9f'
const sk: Shape[] = []
const bone = (id: string, d: string, mirror = false, extra: Partial<Shape> = {}) => sk.push({ id: `bone-${id}`, d, fill: BONE, stroke: BONE_D, w: 0.6, mirror, ...extra })
const boneLine = (id: string, d: string, w: number, mirror = true) => sk.push({ id: `bone-${id}`, d, stroke: BONE, w, mirror })

sk.push({ id: 'bone-scapula', d: 'M142,160 L172,166 L156,232 Z', fill: BONE, stroke: BONE_D, w: 0.6, mirror: true, opacity: 0.45 })
bone('parietal', 'M200,26 C222,26 234,44 234,66 C234,80 230,90 226,96 L174,96 C170,90 166,80 166,66 C166,44 178,26 200,26 Z')
bone('frontal', 'M172,72 C170,46 184,32 200,32 C216,32 230,46 228,72 C220,68 210,66 200,66 C190,66 180,68 172,72 Z')
bone('temporal', 'M166,64 C164,76 166,90 170,98 L175,94 C172,84 171,74 172,64 Z', true)
bone('sphenoid', 'M172,73 L178,72 L176,84 L171,82 Z', true)
sk.push({ d: 'M178,80 C178,74 194,74 194,80 C194,87 178,87 178,80 Z', fill: '#2a2236', deco: true, mirror: true })
bone('ethmoid', 'M197,74 L203,74 L202,82 L198,82 Z')
bone('lacrimal', 'M193,77 L196,77 L196,82 L193,81 Z', true)
bone('nasal', 'M197,83 L203,83 L202,93 L198,93 Z')
bone('zygomatic', 'M168,86 C172,84 178,88 180,92 L176,99 C172,97 168,93 166,90 Z', true)
bone('maxilla', 'M181,93 C187,91 194,95 200,95 C206,95 213,91 219,93 L217,106 C211,108 206,108 200,108 C194,108 189,108 183,106 Z')
bone('vomer', 'M199,94 L201,94 L201,101 L199,101 Z')
bone('concha', 'M195,95 L197,95 L197,100 L195,100 Z', true)
bone('palatine', 'M196,103 L199,103 L199,106 L196,106 Z', true)
bone('mandible', 'M174,100 C174,114 186,124 200,124 C214,124 226,114 226,100 L220,104 C218,114 210,118 200,118 C190,118 182,114 180,104 Z')
bone('malleus', 'M163,84 L165,84 L165,88 L163,88 Z', true)
bone('incus', 'M163,89 L165,89 L165,92 L163,92 Z', true)
bone('stapes', 'M163,93 L165,93 L165,95 L163,95 Z', true)
boneLine('hyoid', 'M192,128 Q200,134 208,128', 2.4, false)
// vertebral column
for (let i = 0; i < 7; i++) bone(`c${i + 1}`, `M195,${124 + i * 3} h10 v2.5 h-10 Z`)
for (let i = 0; i < 12; i++) bone(`t${i + 1}`, `M191,${146 + i * 11.4} h18 v10 h-18 Z`)
for (let i = 0; i < 5; i++) bone(`l${i + 1}`, `M188,${283 + i * 15} h24 v13 h-24 Z`)
bone('sacrum', 'M185,360 L215,360 L207,402 L193,402 Z')
bone('coccyx', 'M196,403 L204,403 L200,414 Z')
// ribs
const RIB_W = [26, 36, 44, 49, 52, 54, 54, 53, 51, 48, 44, 38]
export const ribPath = (i: number): string => {
  const n = i + 1
  const y = 156 + i * 10.5
  const lx = 200 - RIB_W[i]
  const ly = y + 14
  if (n >= 11) return smooth([[lx + 6, ly - 6], [lx, ly + 2], [lx + 8, ly + 12]])
  const sx = n <= 7 ? 195 : 195 - (n - 7) * 6
  const sy = n <= 7 ? y : y + (n - 7) * 5
  return smooth([[sx, sy], [sx - 14, sy - 3], [lx + 4, ly - 6], [lx, ly + 2], [lx + 6, ly + 12]])
}
for (let i = 0; i < 12; i++) sk.push({ id: `bone-rib${i + 1}`, d: ribPath(i), stroke: BONE, w: 3.6, mirror: true })
bone('sternum', 'M196,152 h8 v96 l-4,12 l-4,-12 Z')
// shoulder & arm
boneLine('clavicle', 'M194,149 C178,146 160,154 138,156', 4)
boneLine('humerus', 'M134,166 C128,220 120,280 114,322', 8)
sk.push({ id: 'bone-humerus', d: 'M128,164 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0', fill: BONE, stroke: BONE_D, w: 0.6, mirror: true })
boneLine('radius', 'M108,332 C100,380 92,420 86,455', 4)
boneLine('ulna', 'M120,326 C114,380 108,420 102,456', 4.6)
const CARPALS: [string, number, number][] = [['scaphoid', 86, 462], ['lunate', 93, 461], ['triquetrum', 100, 462], ['pisiform', 105, 458], ['trapezium', 83, 472], ['trapezoid', 89, 474], ['capitate', 95, 474], ['hamate', 102, 473]]
for (const [id, x, y] of CARPALS) bone(id, `M${x - 3},${y} a3,3.6 0 1,0 6,0 a3,3.6 0 1,0 -6,0`, true)
const MC: [Pt, Pt][] = [[[82, 478], [74, 494]], [[88, 480], [85, 504]], [[94, 481], [93, 506]], [[99, 480], [100, 504]], [[104, 478], [107, 500]]]
MC.forEach(([a, b], i) => boneLine(`mc${i + 1}`, `M${a[0]},${a[1]} L${b[0]},${b[1]}`, 2.6))
const FINGERS: { prox: [Pt, Pt]; mid?: [Pt, Pt]; dist: [Pt, Pt] }[] = [
  { prox: [[74, 497], [70, 508]], dist: [[69, 511], [67, 518]] },
  { prox: [[85, 507], [84, 517]], mid: [[84, 520], [83, 526]], dist: [[83, 529], [83, 534]] },
  { prox: [[93, 509], [93, 520]], mid: [[93, 523], [93, 530]], dist: [[93, 533], [93, 538]] },
  { prox: [[100, 507], [101, 517]], mid: [[101, 520], [102, 526]], dist: [[102, 529], [102, 533]] },
  { prox: [[107, 503], [109, 511]], mid: [[109, 514], [110, 518]], dist: [[110, 521], [111, 525]] },
]
const seg = ([a, b]: [Pt, Pt]) => `M${a[0]},${a[1]} L${b[0]},${b[1]}`
boneLine('hand-prox', FINGERS.map((f) => seg(f.prox)).join(' '), 2.2)
boneLine('hand-mid', FINGERS.filter((f) => f.mid).map((f) => seg(f.mid!)).join(' '), 2)
boneLine('hand-dist', FINGERS.map((f) => seg(f.dist)).join(' '), 1.9)
// pelvis & leg
bone('hip', 'M196,392 C182,368 158,360 146,372 C140,386 146,406 158,420 C166,432 178,440 194,446 L197,438 C186,430 182,414 190,402 Z', true)
sk.push({ d: 'M172,426 a6,8 0 1,0 12,0 a6,8 0 1,0 -12,0', fill: '#2a2236', deco: true, mirror: true })
boneLine('femur', 'M168,432 L152,452 C154,520 157,580 161,632', 9)
sk.push({ id: 'bone-femur', d: 'M162,430 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0', fill: BONE, stroke: BONE_D, w: 0.6, mirror: true })
bone('patella', 'M156,646 a6,7 0 1,0 12,0 a6,7 0 1,0 -12,0', true)
boneLine('tibia', 'M166,660 C167,720 168,780 171,828', 8)
boneLine('fibula', 'M152,664 C153,720 155,780 158,826', 3.6)
const TARSALS: [string, number, number, number, number][] = [['talus', 172, 836, 8, 4], ['calcaneus', 163, 845, 6, 5], ['navicular', 181, 845, 4, 3], ['cuboid', 163, 854, 4, 3.6], ['cuneiform-m', 187, 853, 3, 3.4], ['cuneiform-i', 181, 854, 2.6, 3], ['cuneiform-l', 175, 854, 2.8, 3.2]]
for (const [id, x, y, rx, ry] of TARSALS) bone(id, `M${x - rx},${y} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`, true)
const MT: [Pt, Pt][] = [[[187, 858], [189, 869]], [[181, 859], [181, 871]], [[175, 859], [174, 871]], [[168, 859], [166, 870]], [[162, 858], [158, 868]]]
MT.forEach(([a, b], i) => boneLine(`mt${i + 1}`, `M${a[0]},${a[1]} L${b[0]},${b[1]}`, 2.4))
const toe = (i: number, k: number, len: number) => {
  const [, b] = MT[i]
  const dx = (b[0] - MT[i][0][0]) / 12
  const y0 = b[1] + 1.5 + k
  return `M${(b[0] + dx * k).toFixed(1)},${y0.toFixed(1)} L${(b[0] + dx * (k + len)).toFixed(1)},${(y0 + len).toFixed(1)}`
}
boneLine('foot-prox', [0, 1, 2, 3, 4].map((i) => toe(i, 0, 3.5)).join(' '), 2.2)
boneLine('foot-mid', [1, 2, 3, 4].map((i) => toe(i, 5, 2)).join(' '), 2)
boneLine('foot-dist', [0, 1, 2, 3, 4].map((i) => toe(i, i === 0 ? 5 : 8.5, 2)).join(' '), 2)

// ---------- Muscles ----------
const MU = '#ff5d6c'
const MU2 = '#e24459'
const mu: Shape[] = []
const muscle = (id: string, d: string, mirror = true, fill = MU) => mu.push({ id: `muscle-${id}`, d, fill, stroke: '#7a1f2e', w: 0.5, mirror })
const muscleLine = (id: string, d: string, w: number, mirror = true) => mu.push({ id: `muscle-${id}`, d, stroke: MU2, w, mirror })
muscle('frontalis', 'M175,58 C178,40 190,32 200,32 L200,66 C190,66 182,68 174,72 Z')
muscle('temporalis', 'M166,56 C163,70 165,86 170,94 L176,86 C172,76 172,64 174,52 Z', true, MU2)
muscleLine('orb-oculi', 'M176,81 C176,72 196,72 196,81 C196,90 176,90 176,81 Z', 3.4)
muscle('masseter', 'M172,96 L182,98 L185,118 L176,114 Z', true, MU2)
muscleLine('zyg-major', 'M172,92 L189,110', 2.4)
muscleLine('orb-oris', 'M191,112 C191,107 209,107 209,112 C209,117 191,117 191,112 Z', 3.2, false)
muscle('scm', 'M172,104 L180,104 L199,148 L191,148 Z')
muscle('trapezius', 'M184,126 C176,138 158,146 136,154 L150,160 C166,155 182,149 194,142 Z', true, MU2)
muscle('deltoid', 'M134,156 C122,162 115,182 118,214 C126,208 136,196 146,188 C148,174 144,162 134,156 Z')
muscle('pec-major', 'M197,155 C176,153 156,160 146,182 C146,198 150,214 162,226 C176,233 190,231 198,224 Z')
muscle('serratus', 'M152,226 L161,230 L152,238 L162,243 L153,250 L163,255 L155,263 L150,250 Z', true, MU2)
muscle('rectus-abd', 'M199,232 L186,234 C184,280 184,340 188,398 L199,404 Z')
for (const y of [262, 292, 322]) mu.push({ d: `M186,${y} L199,${y + 2}`, stroke: '#7a1f2e', w: 1, mirror: true, deco: true })
muscle('ext-oblique', 'M185,236 C170,240 158,250 154,270 C152,310 154,350 162,390 L188,398 C184,340 184,280 186,236 Z', true, MU2)
muscleLine('diaphragm', 'M150,286 C170,264 230,264 250,286', 2.6, false)
muscle('biceps', 'M134,214 C126,236 122,270 122,306 C128,312 132,312 136,306 C142,276 144,240 140,216 Z')
muscle('triceps', 'M118,214 C112,240 108,280 110,316 L116,316 C116,280 120,240 125,216 Z', true, MU2)
muscle('brachioradialis', 'M108,330 C102,360 94,410 90,446 L98,448 C104,410 110,370 118,334 Z')
muscle('fds', 'M120,334 C118,370 108,420 104,450 L110,450 C116,420 124,380 126,336 Z', true, MU2)
muscle('apb', 'M78,486 C78,478 86,478 86,486 C86,494 78,496 78,486 Z')
muscle('adm-hand', 'M108,486 C108,480 113,480 113,488 C113,496 108,496 108,486 Z', true, MU2)
muscle('tfl', 'M146,410 C144,430 146,450 150,470 L158,460 C154,440 152,425 152,410 Z', true, MU2)
muscle('sartorius', 'M150,416 C160,470 176,560 184,640 L178,642 C170,560 154,470 144,420 Z', true, '#ff7a86')
muscle('rectus-femoris', 'M162,452 C156,500 156,560 162,630 L172,630 C176,560 176,500 170,452 Z')
muscle('vastus-lat', 'M146,462 C140,520 142,590 154,636 L160,632 C154,580 152,510 158,458 Z', true, MU2)
muscle('vastus-med', 'M176,582 C184,602 186,622 178,640 C170,636 168,620 170,600 Z', true, MU2)
muscle('add-longus', 'M194,470 C188,500 182,530 178,560 L186,560 C190,530 194,500 198,478 Z', true, MU2)
muscle('gracilis', 'M198,482 C194,540 189,600 185,640 L189,640 C193,600 199,540 200,492 Z')
muscle('tib-ant', 'M164,664 C162,720 164,780 170,826 L176,826 C172,780 170,720 170,664 Z')
muscle('fib-longus', 'M150,668 C148,720 152,780 158,826 L162,826 C158,780 156,720 156,666 Z', true, MU2)
muscle('gastrocnemius', 'M180,660 C188,690 188,720 180,750 L176,748 C180,720 180,690 176,662 Z')
muscle('soleus', 'M182,752 C184,780 184,800 182,820 L178,820 C180,800 180,780 178,754 Z', true, MU2)
muscle('edb', 'M170,858 C170,852 180,852 180,858 C180,864 170,864 170,858 Z', true, MU2)

// ---------- Organs ----------
const og: Shape[] = []
const organ = (id: string, d: string, fill: string, mirror = false, extra: Partial<Shape> = {}) => og.push({ id, d, fill, stroke: 'rgba(0,0,0,.35)', w: 0.6, mirror, ...extra })
organ('brain', 'M170,56 C170,36 186,28 200,28 C214,28 230,36 230,56 C230,72 216,80 200,80 C184,80 170,72 170,56 Z', '#ff9ec7')
for (const d of ['M180,44 C186,40 190,48 196,44', 'M204,44 C210,40 214,48 220,44', 'M178,58 C184,54 190,62 196,58', 'M204,58 C210,54 216,62 222,58', 'M184,70 C190,66 194,72 198,68', 'M202,68 C206,72 210,66 216,70', 'M200,30 L200,80'])
  og.push({ d, stroke: '#c75a8a', w: 0.9, deco: true })
organ('eye', 'M180.5,84 a5.5,5.5 0 1,0 11,0 a5.5,5.5 0 1,0 -11,0', '#f4f7ff', true)
og.push({ d: 'M183.5,84 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0', fill: '#3aa7ff', deco: true, mirror: true })
organ('nose', 'M200,86 L205,99 L195,99 Z', '#f0a98a')
organ('teeth', 'M190,104 h20 v5 h-20 Z', '#fffbe9')
organ('tongue', 'M193,110 C193,108 207,108 207,110 C207,114 193,114 193,110 Z', '#ff7b8e')
organ('trachea', 'M196,122 h8 v50 h-8 Z', '#9fd8ff')
for (let y = 126; y < 172; y += 5) og.push({ d: `M196,${y} h8`, stroke: '#5aa9d6', w: 0.8, deco: true })
organ('esophagus', 'M203,172 C204,220 206,260 214,292', 'none', false, { stroke: '#e89a6a', w: 4 })
organ('thyroid', 'M190,134 C188,128 194,126 198,132 L202,132 C206,126 212,128 210,134 C210,142 204,142 200,138 C196,142 190,142 190,134 Z', '#b78cff')
organ('lungs', 'M193,170 C178,170 160,180 154,206 C148,234 148,262 152,284 C166,280 182,282 194,288 C196,250 196,200 193,170 Z', '#6ad5ff')
organ('lungs', 'M207,170 C222,170 240,180 246,206 C252,234 252,262 248,284 C236,280 224,282 212,286 C214,270 222,262 220,246 C214,232 208,220 207,200 Z', '#6ad5ff')
organ('thymus', 'M192,160 C188,172 194,184 200,180 C206,184 212,172 208,160 C204,164 196,164 192,160 Z', '#4fe39b')
organ('heart', 'M196,214 C188,206 176,212 180,228 C184,246 200,262 214,270 C228,256 238,240 236,224 C234,208 220,206 212,214 C206,208 200,208 196,214 Z', '#ff2e55')
organ('liver', 'M152,286 C170,276 210,276 238,284 C232,300 214,312 196,318 C178,324 160,326 154,316 C150,304 150,294 152,286 Z', '#b0413e')
organ('gallbladder', 'M177,322 a5,7 0 1,0 10,0 a5,7 0 1,0 -10,0', '#7fd36b')
organ('spleen', 'M246,292 C256,294 260,310 254,322 C248,316 243,304 246,292 Z', '#8e3b6e')
organ('stomach', 'M216,288 C232,282 252,292 250,312 C248,332 232,344 214,340 C206,338 204,330 210,326 C222,328 232,320 232,308 C230,298 220,296 214,298 Z', '#ffb36b')
organ('kidney', 'M166,326 C156,326 153,346 158,358 C162,368 174,368 176,358 C172,352 172,342 176,334 C174,328 170,326 166,326 Z', '#c4473a', true)
organ('adrenal', 'M161,323 L172,323 L167,315 Z', '#e0b84d', true)
organ('pancreas', 'M188,334 C200,328 222,328 244,322 C246,328 232,338 214,340 C204,342 192,342 188,334 Z', '#ffd27a')
organ('large-intestine', 'M170,404 C164,380 162,360 164,346 C180,340 220,340 236,346 C238,360 238,380 232,402 C226,414 210,414 202,420', 'none', false, { stroke: '#d9824a', w: 9 })
organ('small-intestine', 'M178,356 C190,350 212,350 224,356 C230,370 228,392 216,400 C200,406 184,402 178,392 C172,380 172,366 178,356 Z', '#ffa98a')
for (const d of ['M182,366 C190,360 196,372 204,366 C212,360 218,372 222,366', 'M180,378 C188,372 196,384 204,378 C212,372 218,384 224,378', 'M184,390 C192,384 198,396 206,390 C212,386 216,394 220,390'])
  og.push({ d, stroke: '#d6735a', w: 1.2, deco: true })
organ('appendix', 'M170,405 C165,411 166,417 171,419', 'none', false, { stroke: '#d9824a', w: 3 })
organ('rectum', 'M200,418 L200,432', 'none', false, { stroke: '#c96d3a', w: 5 })
organ('bladder', 'M188,430 C188,418 212,418 212,430 C212,442 206,448 200,448 C194,448 188,442 188,430 Z', '#f7c948')

// ---------- Circulation ----------
const ART = '#ff2e55'
const VEIN = '#4f7bff'
const LYM = '#4fe39b'
const ci: Shape[] = []
const vessel = (id: string, d: string, stroke: string, w: number, mirror = true, extra: Partial<Shape> = {}) => ci.push({ id, d, stroke, w, mirror, ...extra })
ci.push({ id: 'heart', d: og.find((s) => s.id === 'heart')!.d, fill: '#ff2e55', stroke: 'rgba(0,0,0,.3)', w: 0.6, opacity: 0.85 })
vessel('willis', 'M194,64 a6,5 0 1,0 12,0 a6,5 0 1,0 -12,0', ART, 1.6, false)
vessel('carotid', 'M198,198 C196,170 191,140 187,108', ART, 2.4)
vessel('jugular', 'M182,108 C184,140 188,170 192,198', VEIN, 2.6)
vessel('subclavian', 'M197,200 C176,190 150,184 132,192', ART, 2.4)
vessel('brachial', 'M132,192 C126,240 121,290 117,328', ART, 2.2)
vessel('radial-a', 'M117,328 C108,380 96,420 88,456 M117,328 C116,380 109,420 104,456', ART, 1.7)
vessel('cephalic', 'M128,182 C116,232 109,290 103,332 C97,380 89,420 83,452', VEIN, 1.7)
vessel('capillaries', 'M86,500 C90,506 84,512 90,518 M94,500 C98,508 90,514 96,522 M102,500 C106,506 98,512 104,520 M84,486 C92,490 98,484 106,490', ART, 0.8, true, { dash: '1.5 1.2' })
vessel('aorta', 'M210,224 C212,200 200,192 194,204 C196,214 198,224 200,236 C200,290 200,350 200,398', ART, 5, false)
vessel('coronary', 'M214,230 C222,240 226,252 222,262', '#ff8fa6', 1.8, false)
vessel('svc', 'M193,200 L193,230', VEIN, 4.2, false)
vessel('ivc', 'M194,244 C194,300 194,360 193,400', VEIN, 4.4, false)
vessel('pulmonary-a', 'M204,226 C190,214 176,214 164,222', '#9b7bff', 2.6)
vessel('pulmonary-v', 'M206,240 C192,236 180,238 168,246', '#ff6f9b', 2.2)
vessel('renal-a', 'M200,346 L174,344', ART, 2)
vessel('portal', 'M204,350 C198,338 190,326 182,312', '#7c6bff', 2.6, false)
vessel('mesenteric', 'M205,340 C209,360 210,380 205,398', ART, 1.6, false)
vessel('iliac', 'M200,398 C190,408 180,420 172,436', ART, 3)
vessel('femoral-a', 'M172,436 C168,500 168,560 176,640', ART, 2.8)
vessel('popliteal', 'M176,640 C176,656 174,670 172,680 C170,740 170,800 174,836', ART, 2)
vessel('dorsalis-pedis', 'M174,836 C176,848 180,858 184,868', ART, 1.6)
vessel('saphenous', 'M186,452 C190,520 186,600 182,650 C180,720 184,790 186,836', VEIN, 1.9)
vessel('lymph-vessels', 'M206,382 C208,300 208,220 192,196', LYM, 1.6, false)
for (const [x, y] of [[184, 118], [182, 126], [186, 134], [150, 212], [146, 219], [153, 222], [176, 440], [182, 447], [188, 441], [190, 364], [196, 372]] as Pt[])
  ci.push({ id: 'lymph-nodes', d: `M${x - 2.6},${y} a2.6,2.6 0 1,0 5.2,0 a2.6,2.6 0 1,0 -5.2,0`, fill: LYM, stroke: '#1d7a4f', w: 0.5, mirror: true })
ci.push({ id: 'spleen', d: og.find((s) => s.id === 'spleen')!.d, fill: '#2fbf7a', stroke: 'rgba(0,0,0,.3)', w: 0.6 })

// ---------- Nerves ----------
const NV = '#ffd84d'
const nv: Shape[] = []
const nerve = (id: string, d: string, w: number, mirror = true, extra: Partial<Shape> = {}) => nv.push({ id, d, stroke: NV, w, mirror, ...extra })
nv.push({ id: 'brain', d: og[0].d, fill: '#ffe680', stroke: '#b8962a', w: 0.6, opacity: 0.9 })
for (const s of og.slice(1, 8)) nv.push({ ...s, stroke: '#c9a227' })
nerve('spinal-cord', 'M200,80 L200,300 M200,300 L195,402 M200,300 L200,404 M200,300 L205,402', 3.6, false)
nerve('cn-ii', 'M186,84 L196,72', 1.6)
nerve('cn-v', 'M178,74 L172,66 M178,74 L170,84 M178,74 L174,96', 1.2)
nerve('cn-vii', 'M172,98 L184,90 M172,98 L183,104 M172,98 L186,98', 1.2)
nerve('cn-x', 'M195,96 C190,140 196,180 190,220 C186,260 196,300 190,340', 1.6)
nerve('phrenic', 'M190,132 C186,180 176,230 170,282', 1.4)
nerve('brachial-plexus', 'M197,136 C180,150 160,166 144,184 M197,142 C180,156 162,170 146,186', 1.6)
nerve('radial-n', 'M142,186 C128,232 116,290 108,330 C100,380 92,420 86,452', 1.6)
nerve('median', 'M146,188 C136,240 128,290 122,330 C116,380 104,420 96,474', 1.6)
nerve('ulnar', 'M148,190 C142,240 136,290 130,320 C124,380 114,420 106,468', 1.4)
nerve('musculocutaneous', 'M144,192 C136,220 131,250 128,270', 1.2)
nerve('intercostal-n', [3, 4, 5, 6, 7, 8, 9].map((i) => ribPath(i)).join(' '), 0.9, true, { opacity: 0.75 })
nerve('sympathetic', 'M193,140 L193,382', 1.2, true, { dash: '3 2' })
nerve('femoral-n', 'M194,382 C182,410 170,440 166,480 C164,520 168,560 170,600', 1.6)
nerve('obturator-n', 'M197,402 C193,440 191,480 189,520', 1.2)
nerve('sciatic', 'M190,402 C176,440 166,480 164,560 C163,600 162,620 164,640', 2.6, true, { dash: '5 3' })
nerve('tibial-n', 'M164,640 C166,720 170,790 174,840', 1.6)
nerve('fibular-n', 'M164,640 C156,654 150,662 152,680 C154,720 160,780 164,830', 1.3)
nerve('pudendal', 'M198,404 C194,420 194,440 198,452', 1.2)

export const LAYER_SHAPES: Record<Exclude<Layer, 'regions'>, Shape[]> = {
  skeleton: sk,
  muscles: mu,
  organs: og,
  circulation: ci,
  nerves: nv,
}

// ---------- Regions ----------
export const REGION_SHAPES: { region: Region; d: string; mirror?: boolean }[] = [
  { region: 'head', d: HEAD },
  { region: 'neck', d: 'M184,116 L216,116 L218,146 L182,146 Z' },
  { region: 'chest', d: 'M182,146 L218,146 C240,148 262,152 266,158 L254,222 C252,250 250,270 250,288 L150,288 C150,270 148,250 146,222 L134,158 C138,152 160,148 182,146 Z' },
  { region: 'abdomen', d: 'M150,288 L250,288 C252,320 252,360 256,400 L144,400 C148,360 148,320 150,288 Z' },
  { region: 'pelvis', d: 'M144,400 L256,400 C260,430 260,460 260,486 L200,494 L140,486 C140,460 140,430 144,400 Z' },
  { region: 'arm', d: 'M134,156 L122,172 L104,300 L84,458 L106,462 L124,330 L146,222 Z', mirror: true },
  { region: 'hand', d: 'M84,458 L64,512 L86,545 L112,532 L114,490 L106,460 Z', mirror: true },
  { region: 'leg', d: 'M140,486 L144,560 L152,650 L148,700 L158,830 L188,830 L184,700 L184,650 L192,530 L200,494 Z', mirror: true },
  { region: 'foot', d: 'M158,830 L150,866 L153,883 L189,883 L192,850 L188,830 Z', mirror: true },
]

export const ZOOMS: Record<'full' | Exclude<Region, 'whole' | 'back'>, [number, number, number, number]> = {
  full: [30, 14, 340, 878],
  head: [146, 16, 108, 120],
  neck: [150, 96, 100, 76],
  chest: [118, 128, 164, 172],
  abdomen: [128, 268, 144, 150],
  pelvis: [124, 356, 152, 140],
  arm: [56, 140, 120, 330],
  hand: [56, 446, 66, 104],
  leg: [124, 400, 92, 440],
  foot: [142, 822, 56, 66],
}

/** Every structure id that can be shown on the map, with its layer. */
export const ID_LAYER: Record<string, Layer> = {}
for (const [layer, shapes] of Object.entries(LAYER_SHAPES) as [Layer, Shape[]][])
  for (const s of shapes) if (s.id && !(s.id in ID_LAYER)) ID_LAYER[s.id] = layer
