import type { Kind } from '../data/types'

// Textbook-style explainers shown beside the data so the app works as a study tool.

export const GLOSSARY: Record<string, string> = {
  'Atomic number (Z)': 'The number of protons in the nucleus. It defines the element. A neutral atom has the same number of electrons.',
  'Electron shell': 'An energy level (K, L, M, N…) at a set average distance from the nucleus. Shell n can hold up to 2n² electrons.',
  Subshell: 'A group of orbitals within a shell: s (1 orbital), p (3), d (5) or f (7). Each orbital holds at most 2 electrons.',
  'Aufbau principle': 'Electrons fill the lowest-energy subshell first: 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p…',
  "Hund's rule": 'Within a subshell, electrons occupy empty orbitals one at a time (all spin-up) before pairing up.',
  'Pauli exclusion': 'Two electrons in the same orbital must have opposite spins (↑↓).',
  'Valence electrons': 'Electrons in the outermost shell. They decide how an element bonds and reacts.',
  Electronegativity: 'How strongly an atom pulls shared electrons toward itself (Pauling scale, 0.7–4.0).',
  'Oxidation state': 'The charge an atom has, or would have, after gaining or losing electrons, e.g., Fe²⁺ or Fe³⁺.',
  RDA: 'Recommended Dietary Allowance: the daily intake that meets the needs of 97–98% of healthy people.',
  AI: 'Adequate Intake: used when there isn’t enough evidence to set an RDA.',
  UL: 'Tolerable Upper Intake Level: the highest daily intake unlikely to cause harm.',
  Bioavailability: 'The fraction of a nutrient you actually absorb and use, which depends on its chemical form and what you eat it with.',
  Origin: 'Where a muscle attaches to the bone that stays still when it contracts (usually closer to the body’s center).',
  Insertion: 'Where a muscle attaches to the bone that moves.',
  Action: 'The movement a muscle produces when it shortens.',
  Innervation: 'The nerve that carries signals telling the muscle to contract.',
  Flexion: 'Bending a joint to decrease the angle (e.g., bending the elbow).',
  Extension: 'Straightening a joint to increase the angle.',
  'Abduction / adduction': 'Moving a limb away from / toward the body’s midline.',
  'Long bone': 'Longer than wide, with a shaft (diaphysis) and two ends (epiphyses), e.g., femur.',
  'Short bone': 'Roughly cube-shaped, for stability and small movements, e.g., carpals.',
  'Flat bone': 'Thin and often curved; protects organs and anchors muscles, e.g., skull, sternum.',
  'Irregular bone': 'Complex shapes that don’t fit other groups, e.g., vertebrae.',
  'Sesamoid bone': 'A bone embedded within a tendon, e.g., patella.',
  Hydroxyapatite: 'Ca₁₀(PO₄)₆(OH)₂, the calcium phosphate crystal that makes bone and teeth hard.',
  Nucleus: 'The membrane-bound compartment holding a cell’s DNA.',
  Mitochondria: 'Organelles that make ATP using oxygen, the cell’s power plants.',
  ATP: 'Adenosine triphosphate, the molecule cells use to store and spend energy.',
  'Action potential': 'A rapid electrical spike along a nerve or muscle membrane, driven by Na⁺ rushing in and K⁺ flowing out.',
  Artery: 'A vessel carrying blood away from the heart (usually oxygen-rich).',
  Vein: 'A vessel returning blood to the heart (usually oxygen-poor). Veins have valves.',
  Capillary: 'The smallest vessel, one cell thick, where gas and nutrient exchange happens.',
  Cofactor: 'A non-protein helper, often a metal ion such as Zn²⁺ or Fe²⁺, that an enzyme needs to work.',
  Keratin: 'A tough structural protein in hair, nails and skin, cross-linked by sulfur bonds.',
  Collagen: 'The most abundant protein in the body; it forms the fibers of bone, skin, tendons and ligaments.',
  'Synovial joint': 'A movable joint with a fluid-filled capsule and slippery cartilage-covered bone ends, such as the knee or knuckles.',
  'Articular cartilage': 'Smooth hyaline cartilage capping bone ends inside a joint; it has no blood supply, so it heals poorly.',
  Ligament: 'A tough band of collagen joining bone to bone across a joint.',
}

const KIND_TERMS: Record<Kind, string[]> = {
  bone: ['Long bone', 'Short bone', 'Flat bone', 'Irregular bone', 'Sesamoid bone', 'Hydroxyapatite', 'Collagen'],
  foramen: ['Innervation', 'Collagen'],
  joint: ['Synovial joint', 'Articular cartilage', 'Ligament', 'Flexion', 'Extension', 'Abduction / adduction'],
  muscle: ['Origin', 'Insertion', 'Action', 'Innervation', 'Flexion', 'Extension', 'Abduction / adduction'],
  organ: ['Mitochondria', 'Cofactor', 'ATP'],
  cell: ['Nucleus', 'Mitochondria', 'ATP', 'Cofactor'],
  blood: ['Artery', 'Vein', 'Capillary', 'Cofactor'],
  vessel: ['Artery', 'Vein', 'Capillary'],
  nerve: ['Action potential', 'Innervation'],
  skin: ['Keratin', 'Collagen'],
  tissue: ['Collagen', 'Cofactor'],
}

export function KeyTerms({ kind }: { kind: Kind }) {
  return <TermList terms={KIND_TERMS[kind]} title="Key terms" />
}

export function TermList({ terms, title }: { terms: string[]; title: string }) {
  return (
    <details className="learn">
      <summary>
        <span className="learn-tag">Study note</span>{title}
      </summary>
      <dl className="terms">
        {terms.map((t) => (
          <div key={t}>
            <dt>{t}</dt>
            <dd>{GLOSSARY[t]}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}


