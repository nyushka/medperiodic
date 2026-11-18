import { BLOOD, NERVES, ORGANS, SKIN, TISSUES, VESSELS } from './anatomy'
import { BONES } from './bones'
import { CELLS } from './cells'
import { MORE, MORE_LINKS } from './more'
import { MUSCLES } from './muscles'
import type { Kind, Structure } from './types'

export const ALL: Structure[] = [...ORGANS, ...BONES, ...MUSCLES, ...CELLS, ...BLOOD, ...VESSELS, ...NERVES, ...SKIN, ...TISSUES, ...MORE]

export const BY_ID: Record<string, Structure> = Object.fromEntries(ALL.map((s) => [s.id, s]))

const c = (...ids: string[]) => ids.map((i) => `cell-${i}`)
const BONE_CELLS = c('osteoblast', 'osteocyte', 'osteoclast', 'hsc')
const MUSCLE_CELLS = c('skeletal-fiber', 'satellite', 'motor-neuron', 'endothelial')
const NERVE_CELLS = c('neuron', 'schwann', 'motor-neuron', 'sensory-neuron')
const VESSEL_CELLS = c('endothelial', 'smooth-muscle', 'rbc', 'pericyte')
const BLOOD_CELLS = c('rbc', 'neutrophil', 'eosinophil', 'basophil', 'monocyte', 'b-cell', 'th-cell', 'tc-cell', 'nk-cell', 'platelet')

/** Explicit cross-links: organ → its cells and parts. Links are made two-way below. */
const LINKS: Record<string, string[]> = {
  brain: [...c('neuron', 'pyramidal', 'astrocyte', 'oligodendrocyte', 'microglia', 'ependymal'), 'cerebrum', 'cerebellum', 'brainstem', 'hypothalamus', 'hippocampus', 'amygdala', 'thalamus', 'pituitary', 'pineal', 'csf', 'willis'],
  cerebellum: c('purkinje'),
  cerebrum: c('pyramidal', 'interneuron'),
  'spinal-cord': [...c('motor-neuron', 'interneuron', 'oligodendrocyte', 'astrocyte'), 'csf', 'myelin'],
  eye: ['cornea', 'lens', 'retina', ...c('rod', 'cone', 'rgc', 'lens-fiber'), 'cn-ii', 'muscle-sup-rectus', 'muscle-inf-rectus', 'muscle-med-rectus', 'muscle-lat-rectus', 'muscle-sup-oblique', 'muscle-inf-oblique', 'muscle-lev-palpebrae'],
  retina: c('rod', 'cone', 'rgc'),
  lens: c('lens-fiber'),
  cochlea: [...c('hair-cell'), 'cn-viii', 'bone-stapes', 'bone-incus', 'bone-malleus', 'eardrum', 'semicircular'],
  nose: [...c('olfactory-neuron', 'ciliated', 'goblet'), 'cn-i', 'bone-nasal', 'bone-ethmoid'],
  tongue: [...c('taste-cell'), 'muscle-genioglossus', 'cn-xii'],
  teeth: [...c('odontoblast', 'ameloblast'), 'enamel', 'dentin', 'bone-maxilla', 'bone-mandible'],
  salivary: c('acinar'),
  thyroid: c('thyrocyte', 'c-cell'),
  parathyroid: ['bone-hyoid'],
  trachea: c('ciliated', 'goblet'),
  bronchi: c('ciliated', 'goblet', 'smooth-muscle'),
  lungs: [...c('pneumocyte-1', 'pneumocyte-2', 'macrophage', 'ciliated'), 'alveoli', 'bronchi', 'pleura', 'pulmonary-a', 'pulmonary-v', 'muscle-diaphragm'],
  alveoli: c('pneumocyte-1', 'pneumocyte-2', 'macrophage', 'endothelial'),
  heart: [...c('cardiomyocyte', 'pacemaker', 'endothelial'), 'heart-ra', 'heart-rv', 'heart-la', 'heart-lv', 'heart-valves', 'coronary', 'aorta', 'svc', 'ivc'],
  'heart-ra': c('pacemaker'),
  stomach: c('parietal', 'chief', 'goblet', 'enteroendocrine', 'smooth-muscle'),
  liver: [...c('hepatocyte', 'kupffer', 'stellate', 'cholangiocyte'), 'gallbladder', 'portal'],
  pancreas: c('acinar', 'beta', 'alpha', 'delta'),
  spleen: c('macrophage', 'b-cell', 'th-cell', 'rbc', 'platelet'),
  'small-intestine': [...c('enterocyte', 'goblet', 'paneth', 'enteroendocrine'), 'duodenum', 'jejunum', 'ileum', 'mesenteric'],
  duodenum: c('enterocyte', 'goblet'),
  jejunum: c('enterocyte', 'goblet'),
  ileum: c('enterocyte', 'paneth'),
  'large-intestine': [...c('goblet', 'enterocyte'), 'cecum', 'appendix', 'rectum', 'microbiome'],
  kidney: [...c('podocyte', 'pct-cell', 'endothelial'), 'renal-a', 'ureter', 'adrenal'],
  adrenal: c('chromaffin'),
  pituitary: c('somatotroph'),
  thymus: c('th-cell', 'tc-cell', 'treg'),
  'lymph-nodes': [...c('b-cell', 'th-cell', 'tc-cell', 'dendritic', 'macrophage', 'plasma-cell', 'memory-b', 'memory-t'), 'lymph-vessels'],
  tonsils: c('b-cell', 'dendritic'),
  'bone-marrow': [...c('hsc', 'megakaryocyte', 'reticulocyte', 'plasma-cell', 'msc'), 'yellow-marrow'],
  blood: [...BLOOD_CELLS, 'plasma', 'hemoglobin', 'clotting', 'albumin', 'antibodies'],
  ovary: c('oocyte', 'granulosa'),
  testis: c('sperm', 'sertoli', 'leydig'),
  breast: c('adipocyte'),
  skin: [...c('keratinocyte', 'melanocyte', 'langerhans-cell', 'merkel', 'fibroblast', 'mast-cell'), 'epidermis', 'dermis', 'hypodermis', 'hair-follicle', 'eccrine', 'apocrine', 'nail', 'sebaceous', 'melanin'],
  epidermis: [...c('keratinocyte', 'melanocyte', 'langerhans-cell', 'merkel'), 'str-basale', 'str-spinosum', 'str-granulosum', 'str-lucidum', 'str-corneum'],
  dermis: [...c('fibroblast', 'mast-cell'), 'papillary', 'reticular', 'meissner', 'pacinian', 'free-nerve'],
  'hair-follicle': [...c('hair-matrix', 'dermal-papilla-cell', 'melanocyte', 'sebocyte'), 'hair-bulb', 'dermal-papilla', 'hair-shaft', 'arrector-pili', 'sebaceous'],
  sebaceous: c('sebocyte'),
  'arrector-pili': c('smooth-muscle'),
  hypodermis: c('adipocyte'),
  adipose: c('adipocyte', 'brown-adipocyte'),
  'hyaline': c('chondrocyte'),
  fibrocartilage: c('chondrocyte'),
  discs: c('chondrocyte'),
  tendons: c('fibroblast'),
  ligaments: c('fibroblast'),
  myelin: c('oligodendrocyte', 'schwann'),
  capillaries: c('endothelial', 'pericyte', 'rbc'),
  uterus: c('smooth-muscle'),
  bladder: c('smooth-muscle'),
  placenta: c('endothelial'),
}

const linkMap: Record<string, Set<string>> = {}
const add = (a: string, b: string) => {
  if (!BY_ID[a] || !BY_ID[b] || a === b) return
  ;(linkMap[a] ??= new Set()).add(b)
  ;(linkMap[b] ??= new Set()).add(a)
}
for (const src of [LINKS, MORE_LINKS]) for (const [a, list] of Object.entries(src)) for (const b of list) add(a, b)
const DEFAULTS: Partial<Record<Kind, string[]>> = { joint: c('chondrocyte', 'fibroblast'), bone: BONE_CELLS, muscle: MUSCLE_CELLS, nerve: NERVE_CELLS, vessel: VESSEL_CELLS }
for (const s of ALL) for (const b of DEFAULTS[s.kind] ?? []) if (BY_ID[b]) (linkMap[s.id] ??= new Set()).add(b)

export function related(id: string): Structure[] {
  return [...(linkMap[id] ?? [])].map((i) => BY_ID[i]).filter(Boolean)
}

/** Structures where an element has a specific, named role (not just the generic default). */
export function structuresForElement(symbol: string): [Structure, string][] {
  return ALL.filter((s) => s.el?.[symbol]).map((s) => [s, s.el![symbol]])
}

export const COUNTS = ALL.reduce<Record<Kind, number>>(
  (acc, s) => {
    acc[s.kind] = (acc[s.kind] ?? 0) + 1
    return acc
  },
  {} as Record<Kind, number>,
)

/** Pages generated at runtime for 3D model pieces that have no hand-written entry. */
export const SYNTH: Record<string, Structure> = {}
export const getStructure = (id: string | null): Structure | null => (id ? BY_ID[id] ?? SYNTH[id] ?? null : null)
