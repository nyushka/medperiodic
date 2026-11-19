import type { Region, Structure } from './types'

// Every one of the 206 bones of the adult skeleton. Paired bones are one entry with count 2.
type B = [id: string, name: string, region: Region, count: number, type: string, desc: string, el?: Record<string, string>]

const SKULL: B[] = [
  ['frontal', 'Frontal bone', 'head', 1, 'Flat', 'Forms the forehead and the roofs of the eye sockets. Contains the frontal sinuses. It starts as two halves that fuse in early childhood.'],
  ['parietal', 'Parietal bone', 'head', 2, 'Flat', 'Two curved plates forming the top and sides of the cranium, joined at the sagittal suture. The "soft spot" (anterior fontanelle) closes where they meet the frontal bone by about 18 months.'],
  ['temporal', 'Temporal bone', 'head', 2, 'Irregular', 'Holds the hearing and balance organs in its dense petrous part, the hardest bone in the body. Its mastoid process anchors the sternocleidomastoid; it forms the jaw joint socket.'],
  ['occipital', 'Occipital bone', 'head', 1, 'Flat', 'Back and base of the skull. The spinal cord passes through its large hole, the foramen magnum. Its condyles rock on the atlas (C1) when you nod "yes".'],
  ['sphenoid', 'Sphenoid bone', 'head', 1, 'Irregular', 'Butterfly-shaped keystone bone that touches every other cranial bone. Its sella turcica ("Turkish saddle") cradles the pituitary gland.'],
  ['ethmoid', 'Ethmoid bone', 'head', 1, 'Irregular', 'Light, spongy bone between the eyes. Its cribriform plate is pierced by olfactory nerve fibers carrying smell to the brain.'],
  ['nasal', 'Nasal bone', 'head', 2, 'Flat', 'Two small bones forming the bridge of the nose. The rest of the nose is cartilage. The most commonly fractured facial bones.'],
  ['maxilla', 'Maxilla', 'head', 2, 'Irregular', 'Upper jaw. Holds the upper teeth, forms most of the hard palate and contains the largest sinuses (maxillary).', { F: 'Tooth sockets (alveoli) anchor fluoride-hardened teeth' }],
  ['lacrimal', 'Lacrimal bone', 'head', 2, 'Flat', 'The smallest, most fragile facial bone, about the size of a fingernail, in the inner wall of each eye socket. Its groove channels tears into the nose.'],
  ['zygomatic', 'Zygomatic bone', 'head', 2, 'Irregular', 'The cheekbone. Forms the outer eye socket and joins the temporal bone to make the zygomatic arch, where the masseter attaches.'],
  ['palatine', 'Palatine bone', 'head', 2, 'Irregular', 'L-shaped bones forming the back of the hard palate and part of the nasal cavity and eye socket floor.'],
  ['concha', 'Inferior nasal concha', 'head', 2, 'Irregular', 'Scroll-shaped bones on the side walls of the nasal cavity. They swirl inhaled air so it is warmed, humidified and filtered.'],
  ['vomer', 'Vomer', 'head', 1, 'Flat', 'Thin plow-shaped bone forming the lower back part of the nasal septum.'],
  ['mandible', 'Mandible', 'head', 1, 'Irregular', 'The lower jaw, the largest and strongest facial bone and the only skull bone that moves. Holds the lower teeth; its condyles form the temporomandibular joints.'],
  ['malleus', 'Malleus (hammer)', 'head', 2, 'Ossicle', 'The first middle-ear ossicle, attached to the eardrum. Passes sound vibrations to the incus.'],
  ['incus', 'Incus (anvil)', 'head', 2, 'Ossicle', 'The middle ossicle linking malleus and stapes. Together the ossicles amplify sound about 20-fold.'],
  ['stapes', 'Stapes (stirrup)', 'head', 2, 'Ossicle', 'The smallest bone in the human body, about 3 mm long. Its footplate pushes on the oval window of the cochlea.'],
  ['hyoid', 'Hyoid bone', 'neck', 1, 'Irregular', 'U-shaped bone in the neck that doesn’t touch any other bone. It anchors the tongue and helps with swallowing and speech.'],
]

const VERT: B[] = [
  ['c1', 'Atlas (C1)', 'neck', 1, 'Irregular vertebra', 'Ring-shaped first vertebra with no body, named for the Titan who held up the sky. It holds the skull and allows the "yes" nodding motion.'],
  ['c2', 'Axis (C2)', 'neck', 1, 'Irregular vertebra', 'Its tooth-like dens projects up into the atlas and forms a pivot for the "no" head rotation (about half of all neck rotation).'],
  ...[3, 4, 5, 6].map((n): B => [`c${n}`, `C${n} cervical vertebra`, 'neck', 1, 'Irregular vertebra', `Typical cervical vertebra with a small body, a split (bifid) spinous process, and transverse foramina carrying the vertebral arteries to the brain.${n === 4 ? ' The C3–C5 nerve roots form the phrenic nerve that powers the diaphragm.' : ''}`]),
  ['c7', 'C7 vertebra (vertebra prominens)', 'neck', 1, 'Irregular vertebra', 'Its long spinous process is the bump you can feel at the base of the neck, a landmark for counting vertebrae.'],
  ...Array.from({ length: 12 }, (_, i): B => {
    const n = i + 1
    const notes: Record<number, string> = {
      1: ' Articulates with the first rib and supports the base of the neck.',
      4: ' The level of the sternal angle, where the trachea divides and the aortic arch ends.',
      8: ' The inferior vena cava passes through the diaphragm at this level.',
      10: ' The esophagus passes through the diaphragm at this level.',
      11: ' Transitional vertebra; only one full facet for its rib.',
      12: ' The aorta passes behind the diaphragm here; the thoracolumbar junction is a common fracture site.',
    }
    return [`t${n}`, `T${n} thoracic vertebra`, 'back', 1, 'Irregular vertebra', `Heart-shaped body with facets for rib ${n}. Long downward-pointing spinous process limits backward bending.${notes[n] ?? ''}`]
  }),
  ...Array.from({ length: 5 }, (_, i): B => {
    const n = i + 1
    const notes: Record<number, string> = {
      1: ' The spinal cord itself usually ends near L1–L2; below this the nerve roots form the cauda equina.',
      4: ' The top of the iliac crests lines up with L4, the landmark used for lumbar punctures (spinal taps) at L3–L4 or L4–L5.',
      5: ' The largest, most heavily loaded vertebra. The L5–S1 disc is the most common site of herniation.',
    }
    return [`l${n}`, `L${n} lumbar vertebra`, 'back', 1, 'Irregular vertebra', `Massive kidney-shaped body built to carry upper-body weight. Short, hatchet-shaped spinous process.${notes[n] ?? ''}`]
  }),
  ['sacrum', 'Sacrum', 'pelvis', 1, 'Irregular (5 fused)', 'Five vertebrae fused by about age 25 into a triangular bone that forms the back of the pelvis and transmits body weight to the hips through the sacroiliac joints.'],
  ['coccyx', 'Coccyx (tailbone)', 'pelvis', 1, 'Irregular (3–5 fused)', 'The remnant of a tail, made of 3–5 small fused vertebrae. Anchors pelvic floor muscles and the gluteus maximus.'],
]

const RIB_KIND = (n: number) => (n <= 7 ? 'true rib' : n <= 10 ? 'false rib' : 'floating rib')
const THORAX: B[] = [
  ['sternum', 'Sternum (breastbone)', 'chest', 1, 'Flat', 'Three parts: manubrium, body and xiphoid process. Its red marrow makes blood cells throughout life (used for bone-marrow biopsies). The 7 true ribs attach to it.', { Fe: 'Red marrow here builds iron-rich red blood cells' }],
  ...Array.from({ length: 12 }, (_, i): B => {
    const n = i + 1
    const k = RIB_KIND(n)
    const extra =
      n === 1 ? ' The shortest, flattest and most curved rib. The subclavian artery and vein cross it.'
      : n === 2 ? ' Its cartilage meets the sternal angle, the landmark for counting ribs.'
      : n <= 7 ? ' Connects directly to the sternum by its own costal cartilage.'
      : n <= 10 ? ' Its cartilage joins the cartilage of the rib above instead of the sternum.'
      : ' Ends freely in the abdominal wall with no front attachment. Protects the kidneys.'
    return [`rib${n}`, `Rib ${n}`, 'chest', 2, `Flat (${k})`, `Pair of ${k}s that rise and fall with each breath, moved by the intercostal muscles.${extra}`]
  }),
]

const UPPER: B[] = [
  ['clavicle', 'Clavicle (collarbone)', 'arm', 2, 'Long', 'S-shaped strut between sternum and shoulder blade. The first bone to start ossifying in the embryo (week 5) and one of the last to finish (~age 25). The most commonly broken bone.'],
  ['scapula', 'Scapula (shoulder blade)', 'back', 2, 'Flat', 'Triangular bone gliding on the back of the ribcage. Its shallow glenoid socket lets the shoulder be the most mobile joint in the body; 17 muscles attach to it.'],
  ['humerus', 'Humerus', 'arm', 2, 'Long', 'The upper-arm bone. Its rounded head forms the shoulder joint. The ulnar nerve runs behind its medial epicondyle, the "funny bone".'],
  ['radius', 'Radius', 'arm', 2, 'Long', 'Thumb-side forearm bone that rotates around the ulna to turn the palm up and down. Distal radius (Colles’) fractures are among the most common breaks from falls.'],
  ['ulna', 'Ulna', 'arm', 2, 'Long', 'Little-finger-side forearm bone. Its olecranon is the point of your elbow.'],
  ['scaphoid', 'Scaphoid', 'hand', 2, 'Short (carpal)', 'Boat-shaped carpal at the base of the thumb, the most frequently fractured wrist bone. Its poor blood supply means breaks can heal slowly.'],
  ['lunate', 'Lunate', 'hand', 2, 'Short (carpal)', 'Moon-shaped central carpal. The most commonly dislocated carpal bone.'],
  ['triquetrum', 'Triquetrum', 'hand', 2, 'Short (carpal)', 'Pyramid-shaped carpal on the little-finger side, under the pisiform.'],
  ['pisiform', 'Pisiform', 'hand', 2, 'Sesamoid (carpal)', 'Pea-shaped carpal you can feel at the heel of the hand. It sits inside the flexor carpi ulnaris tendon.'],
  ['trapezium', 'Trapezium', 'hand', 2, 'Short (carpal)', 'Forms the saddle joint with the thumb metacarpal that lets humans oppose the thumb.'],
  ['trapezoid', 'Trapezoid', 'hand', 2, 'Short (carpal)', 'Small wedge-shaped carpal articulating with the index-finger metacarpal.'],
  ['capitate', 'Capitate', 'hand', 2, 'Short (carpal)', 'The largest carpal bone, at the center of the wrist. The first carpal to ossify (in infancy).'],
  ['hamate', 'Hamate', 'hand', 2, 'Short (carpal)', 'Has a hook (hamulus) that forms part of Guyon’s canal for the ulnar nerve. Hook fractures occur in golfers and batters.'],
  ...['I (thumb)', 'II (index)', 'III (middle)', 'IV (ring)', 'V (little)'].map((d, i): B => [`mc${i + 1}`, `Metacarpal ${d}`, 'hand', 2, 'Long', i === 0 ? 'The shortest, thickest and most mobile metacarpal, which gives the thumb its wide range.' : i === 4 ? 'The "boxer’s fracture" bone, broken by punching with a closed fist.' : 'Forms the palm and the knuckle you see when you make a fist.']),
  ['hand-prox', 'Proximal phalanges (hand)', 'hand', 10, 'Long', 'The first and largest finger bones, one per digit (5 per hand). They join the metacarpals at the knuckles (MCP joints).'],
  ['hand-mid', 'Middle phalanges (hand)', 'hand', 8, 'Long', 'One in each finger except the thumb (4 per hand), between the PIP and DIP joints.'],
  ['hand-dist', 'Distal phalanges (hand)', 'hand', 10, 'Long', 'Fingertip bones (5 per hand). Their spade-shaped tufts support the nail bed and the dense touch receptors of the fingertip pad.'],
]

const LOWER: B[] = [
  ['hip', 'Hip bone (os coxae)', 'pelvis', 2, 'Irregular (3 fused)', 'Three bones (ilium, ischium, pubis) fuse at the acetabulum, the hip socket, during the teens. You sit on the ischial tuberosities. The iliac crest is a rich source of marrow for transplants.', { Fe: 'Iliac crest red marrow produces red blood cells' }],
  ['femur', 'Femur (thigh bone)', 'leg', 2, 'Long', 'The longest, heaviest and strongest bone, about a quarter of your height. Can withstand forces of roughly 30 times body weight. The femoral neck is the classic osteoporotic hip-fracture site.'],
  ['patella', 'Patella (kneecap)', 'leg', 2, 'Sesamoid', 'The largest sesamoid bone, embedded in the quadriceps tendon. It increases the leverage of the quadriceps by about 30%. Babies’ kneecaps are cartilage and ossify at ages 3–6.'],
  ['tibia', 'Tibia (shin bone)', 'leg', 2, 'Long', 'The main weight-bearing bone of the lower leg. Its front edge lies just under the skin, which is why shin knocks hurt so much. The medial malleolus is the inner ankle bump.'],
  ['fibula', 'Fibula', 'leg', 2, 'Long', 'Thin bone beside the tibia that carries little weight but anchors muscles and forms the outer ankle bump (lateral malleolus). Pieces are harvested for bone grafts.'],
  ['calcaneus', 'Calcaneus (heel bone)', 'foot', 2, 'Short (tarsal)', 'The largest tarsal bone. Absorbs heel strike and anchors the Achilles tendon.'],
  ['talus', 'Talus', 'foot', 2, 'Short (tarsal)', 'Transfers the whole body’s weight from the tibia to the foot. No muscles attach to it, and about 60% of its surface is cartilage.'],
  ['navicular', 'Navicular', 'foot', 2, 'Short (tarsal)', 'Boat-shaped tarsal at the top of the inner arch. Stress fractures occur in sprinters and jumpers.'],
  ['cuboid', 'Cuboid', 'foot', 2, 'Short (tarsal)', 'Cube-shaped tarsal on the outer foot. The fibularis longus tendon runs in a groove beneath it.'],
  ['cuneiform-m', 'Medial cuneiform', 'foot', 2, 'Short (tarsal)', 'The largest cuneiform, at the base of the big toe. Tibialis anterior and fibularis longus attach here.'],
  ['cuneiform-i', 'Intermediate cuneiform', 'foot', 2, 'Short (tarsal)', 'The smallest cuneiform. Its wedge shape helps form the transverse arch.'],
  ['cuneiform-l', 'Lateral cuneiform', 'foot', 2, 'Short (tarsal)', 'Wedge-shaped tarsal articulating with the third metatarsal and cuboid.'],
  ...['I (big toe)', 'II', 'III', 'IV', 'V'].map((d, i): B => [`mt${i + 1}`, `Metatarsal ${d}`, 'foot', 2, 'Long', i === 0 ? 'The shortest, thickest metatarsal. It carries about a third of body weight when pushing off; two tiny sesamoid bones sit under its head.' : i === 1 ? 'The longest metatarsal and the most common site of "march" stress fractures.' : i === 4 ? 'Its tuberosity anchors fibularis brevis; fractures here are called Jones fractures.' : 'Forms the long arch of the foot between tarsals and toes.']),
  ['foot-prox', 'Proximal phalanges (foot)', 'foot', 10, 'Long', 'First toe bones, one per toe (5 per foot), joining the metatarsals at the balls of the feet.'],
  ['foot-mid', 'Middle phalanges (foot)', 'foot', 8, 'Long', 'One in each lesser toe (4 per foot). The big toe has none. In many people the fifth toe’s middle and distal phalanges are fused.'],
  ['foot-dist', 'Distal phalanges (foot)', 'foot', 10, 'Long', 'Toe-tip bones (5 per foot) supporting the toenails.'],
]

export const BONES: Structure[] = [...SKULL, ...VERT, ...THORAX, ...UPPER, ...LOWER].map(([id, name, region, count, type, desc, el]) => ({
  id: `bone-${id}`,
  name,
  kind: 'bone',
  system: 'skeletal',
  region,
  desc,
  count,
  el,
  facts: [
    ['Bone type', type],
    ['Number in body', count === 1 ? '1 (single)' : `${count}`],
  ],
}))

export const TOTAL_BONES = BONES.reduce((s, b) => s + (b.count ?? 1), 0)
