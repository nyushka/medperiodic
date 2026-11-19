export type Kind = 'bone' | 'joint' | 'foramen' | 'muscle' | 'organ' | 'cell' | 'vessel' | 'nerve' | 'skin' | 'tissue' | 'blood'

export type System =
  | 'skeletal'
  | 'muscular'
  | 'nervous'
  | 'cardiovascular'
  | 'respiratory'
  | 'digestive'
  | 'urinary'
  | 'reproductive'
  | 'endocrine'
  | 'lymphatic'
  | 'integumentary'
  | 'sensory'

export type Region = 'head' | 'neck' | 'chest' | 'abdomen' | 'pelvis' | 'arm' | 'hand' | 'leg' | 'foot' | 'back' | 'whole'

export type CellShape =
  | 'disc'
  | 'neuron'
  | 'lobed'
  | 'round'
  | 'spindle'
  | 'striated'
  | 'column'
  | 'sperm'
  | 'egg'
  | 'fragment'
  | 'star'
  | 'flat'
  | 'cube'
  | 'fat'
  | 'branch'
  | 'cilia'

export interface Structure {
  id: string
  name: string
  kind: Kind
  system: System
  region: Region
  desc: string
  facts?: [string, string][]
  el?: Record<string, string> // element symbol -> its specific role here
  count?: number
  shape?: CellShape
  aka?: string
}

export const SYSTEMS: Record<System, { label: string; color: string }> = {
  skeletal: { label: 'Skeletal', color: '#bfa77a' },
  muscular: { label: 'Muscular', color: '#c0453f' },
  nervous: { label: 'Nervous', color: '#c99a1e' },
  cardiovascular: { label: 'Cardiovascular', color: '#b8283a' },
  respiratory: { label: 'Respiratory', color: '#4f97c4' },
  digestive: { label: 'Digestive', color: '#d47a3a' },
  urinary: { label: 'Urinary', color: '#c9a227' },
  reproductive: { label: 'Reproductive', color: '#c35d8f' },
  endocrine: { label: 'Endocrine', color: '#7f63c0' },
  lymphatic: { label: 'Lymphatic & immune', color: '#3c9a6a' },
  integumentary: { label: 'Skin & hair', color: '#c48a64' },
  sensory: { label: 'Special senses', color: '#3a9fa3' },
}

export const KINDS: Record<Kind, { label: string; plural: string }> = {
  bone: { label: 'Bone', plural: 'Bones' },
  joint: { label: 'Joint', plural: 'Joints' },
  foramen: { label: 'Foramen', plural: 'Foramina & canals' },
  muscle: { label: 'Muscle', plural: 'Muscles' },
  organ: { label: 'Organ', plural: 'Organs' },
  cell: { label: 'Cell', plural: 'Cells' },
  blood: { label: 'Blood component', plural: 'Blood' },
  vessel: { label: 'Blood vessel', plural: 'Vessels' },
  nerve: { label: 'Nerve', plural: 'Nerves' },
  skin: { label: 'Skin & hair', plural: 'Skin, hair & nails' },
  tissue: { label: 'Tissue', plural: 'Tissues' },
}

export const REGIONS: Record<Region, string> = {
  head: 'Head',
  neck: 'Neck',
  chest: 'Chest & thorax',
  abdomen: 'Abdomen',
  pelvis: 'Pelvis',
  arm: 'Shoulder & arm',
  hand: 'Wrist & hand',
  leg: 'Hip & leg',
  foot: 'Ankle & foot',
  back: 'Back & spine',
  whole: 'Throughout the body',
}

const BASE: Record<string, string> = {
  O: 'In water and every biomolecule; used by mitochondria to make ATP',
  C: 'Carbon backbone of proteins, lipids, carbohydrates and DNA',
  H: 'In water and all organic molecules; H⁺ sets local pH',
  N: 'In amino acids (proteins) and DNA/RNA bases',
}

/** Default element roles per kind of structure, merged with each structure's specific roles. */
export const KIND_ELEMENTS: Record<Kind, Record<string, string>> = {
  bone: {
    Ca: 'Calcium hydroxyapatite crystals, Ca₁₀(PO₄)₆(OH)₂, make up ~65% of bone mass and give it hardness',
    P: 'Phosphate is the other half of hydroxyapatite mineral',
    ...BASE,
    N: 'Type I collagen (~90% of bone protein) gives bone its flexibility',
    Mg: 'About 60% of the body’s magnesium is stored in bone mineral',
    F: 'Fluoride substitutes into hydroxyapatite, forming harder fluorapatite',
    Na: 'Bone holds about 30% of the body’s sodium as a reserve',
    Zn: 'Zinc enzymes (alkaline phosphatase) in osteoblasts lay down mineral',
    Cu: 'Lysyl oxidase (copper enzyme) cross-links collagen fibers',
    Mn: 'Needed to build proteoglycans in bone and cartilage matrix',
    Si: 'Found at sites of active bone formation; may aid collagen and mineralization',
    Sr: 'Strontium swaps in for some calcium in the mineral',
    B: 'May reduce urinary loss of calcium and magnesium',
    Pb: 'Lead is stored in bone, mimicking calcium (toxic)',
  },
  foramen: {
    Ca: 'The rim of the opening is calcium hydroxyapatite bone',
    P: 'Phosphate, the other half of bone mineral',
    N: 'Collagen lines the opening as periosteum',
  },
  joint: {
    ...BASE,
    Ca: 'Calcium phosphate in the bone ends beneath the cartilage; calcium pyrophosphate crystals cause pseudogout',
    S: 'Chondroitin sulfate in cartilage holds water so the joint can absorb shock',
    N: 'Type II collagen gives articular cartilage its strength',
    Mn: 'Needed to build proteoglycans in cartilage and synovial fluid',
    Cu: 'Lysyl oxidase (copper) cross-links collagen in ligaments and the joint capsule',
    Na: 'Sodium ions bound to cartilage’s negative charges draw in water',
    Zn: 'Zinc enzymes (MMPs) remodel cartilage; overactive in arthritis',
  },
  muscle: {
    ...BASE,
    N: 'Actin and myosin proteins (the contractile machinery)',
    Ca: 'Ca²⁺ released from the sarcoplasmic reticulum binds troponin to trigger contraction',
    K: 'High intracellular K⁺ sets the resting membrane potential; muscle holds most body potassium',
    Na: 'Na⁺ influx creates the action potential that spreads along the fiber',
    Mg: 'Mg-ATP powers myosin heads; Mg²⁺ helps the muscle relax',
    Fe: 'Iron in myoglobin stores oxygen (gives red muscle its color)',
    P: 'ATP and creatine phosphate provide the energy for contraction',
    S: 'Sulfur amino acids in muscle proteins; glutathione antioxidant',
    Zn: 'About 60% of body zinc is in skeletal muscle',
    Se: 'Selenoproteins protect muscle; deficiency causes myopathy',
  },
  organ: {
    ...BASE,
    P: 'Phospholipid membranes, ATP and DNA in every cell',
    S: 'Sulfur amino acids and glutathione',
    K: 'Main intracellular ion in organ cells',
    Na: 'Main ion of the fluid bathing the organ',
    Cl: 'Balances charge in extracellular fluid',
    Mg: 'Cofactor for hundreds of enzymes and for ATP',
    Fe: 'Mitochondrial cytochromes for energy production',
    Zn: 'Zinc enzymes and zinc-finger gene regulators',
    Cu: 'Cytochrome c oxidase and Cu/Zn superoxide dismutase',
  },
  cell: {
    ...BASE,
    P: 'DNA backbone, ATP and the phospholipid bilayer',
    S: 'Cysteine and methionine in proteins; glutathione',
    K: 'Main positive ion inside the cell (~140 mM)',
    Na: 'Kept low inside by the Na⁺/K⁺ pump',
    Mg: 'Stabilizes ribosomes and DNA; partners with ATP',
    Zn: 'Zinc-finger proteins that read the genome',
    Fe: 'Iron–sulfur clusters and cytochromes in mitochondria',
  },
  blood: {
    ...BASE,
    Fe: 'Iron in hemoglobin carries oxygen',
    Na: 'Main cation of plasma (~140 mM)',
    Cl: 'Main anion of plasma (~100 mM)',
    K: 'Kept at 3.5–5.0 mM in plasma; much higher inside blood cells',
    Ca: 'Plasma calcium is essential for clotting',
    Cu: 'Ceruloplasmin in plasma carries copper and oxidizes iron for transport',
    Zn: 'Carried by albumin; needed by immune cells',
    P: 'Phosphate buffer and membrane phospholipids',
  },
  vessel: {
    ...BASE,
    N: 'Collagen and elastin fibers in the vessel wall',
    Ca: 'Ca²⁺ contracts smooth muscle to narrow the vessel',
    Cu: 'Lysyl oxidase (copper) cross-links elastin for stretch and recoil',
    Si: 'Present in arterial connective tissue',
    K: 'K⁺ channels relax vascular smooth muscle',
    Mg: 'Magnesium relaxes vascular smooth muscle',
    Fe: 'Red blood cells within carry iron-hemoglobin',
  },
  nerve: {
    ...BASE,
    Na: 'Na⁺ rushes in to fire each action potential',
    K: 'K⁺ flows out to reset the nerve (repolarization)',
    Ca: 'Ca²⁺ triggers neurotransmitter release at nerve endings',
    Cl: 'Cl⁻ through GABA/glycine receptors calms nerve firing',
    P: 'Phospholipids make up most of the myelin sheath',
    Mg: 'Blocks NMDA receptors and stabilizes nerve membranes',
    Fe: 'Required to make myelin and neurotransmitters',
    Cu: 'Needed to maintain myelin (deficiency causes neuropathy)',
    Co: 'Vitamin B12 (cobalt) keeps myelin healthy',
  },
  skin: {
    ...BASE,
    S: 'Disulfide bonds between cysteines make keratin tough',
    N: 'Keratin and collagen proteins',
    Zn: 'Zinc speeds wound healing and skin cell renewal',
    Cu: 'Tyrosinase (copper enzyme) makes melanin pigment; lysyl oxidase firms collagen',
    Fe: 'Iron is needed for rapidly dividing hair and skin cells',
    Si: 'Found in hair, nails and connective tissue',
    Se: 'Selenoproteins protect skin from UV oxidative damage',
    Na: 'Lost in sweat (~900 mg/L)',
    Cl: 'Lost in sweat with sodium',
  },
  tissue: {
    ...BASE,
    P: 'Cell membranes and energy molecules',
    S: 'Sulfated proteoglycans and sulfur amino acids',
    Ca: 'Calcium signaling and mineralization',
    Mg: 'Enzyme cofactor',
    K: 'Intracellular ion',
    Na: 'Extracellular ion',
  },
}

export function elementsOf(s: Structure): [string, string][] {
  const merged: Record<string, string> = { ...KIND_ELEMENTS[s.kind], ...(s.el ?? {}) }
  return Object.entries(merged)
}
