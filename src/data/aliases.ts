import type { Structure } from './types'

// Everyday words people actually type, mapped to the anatomical entries they mean.
// Searching any of these finds the medical structure (and the medical name finds itself as usual).
const LAY: Record<string, string[]> = {
  // Head & face
  skull: ['bone-frontal', 'bone-parietal', 'bone-occipital', 'bone-temporal', 'joint-sutures'], cranium: ['bone-frontal', 'bone-parietal'],
  forehead: ['bone-frontal', 'muscle-frontalis'], 'temple': ['bone-temporal', 'muscle-temporalis'], cheekbone: ['bone-zygomatic'], cheek: ['muscle-buccinator', 'bone-zygomatic'],
  jaw: ['bone-mandible', 'bone-maxilla', 'joint-tmj', 'muscle-masseter'], jawbone: ['bone-mandible'], 'lower jaw': ['bone-mandible'], 'upper jaw': ['bone-maxilla'], chin: ['bone-mandible', 'muscle-mentalis'],
  'jaw joint': ['joint-tmj'], tmj: ['joint-tmj'], 'soft spot': ['joint-sutures'], fontanelle: ['joint-sutures'],
  'roof of mouth': ['palate'], 'roof of the mouth': ['palate'], mouth: ['lips', 'tongue', 'teeth', 'palate', 'muscle-orb-oris'], lip: ['lips'], gum: ['gums'], gums: ['gums'],
  tooth: ['teeth', 'enamel', 'dentin'], molar: ['teeth'], 'wisdom teeth': ['teeth'], 'wisdom tooth': ['teeth'], spit: ['salivary'], saliva: ['salivary'], drool: ['salivary'],
  throat: ['pharynx', 'larynx', 'esophagus'], 'voice box': ['larynx', 'vocal-cords'], 'adams apple': ['larynx'], "adam's apple": ['larynx'], voice: ['vocal-cords', 'larynx'], 'vocal chords': ['vocal-cords'],
  'windpipe': ['trachea'], 'food pipe': ['esophagus'], gullet: ['esophagus'], 'dangly thing': ['uvula'], 'punching bag': ['uvula'],
  nostril: ['nose', 'nasal-septum'], nostrils: ['nose'], 'nose bone': ['bone-nasal'], snot: ['nose', 'mucosa'], booger: ['nose', 'mucosa'], sinus: ['sinuses'],
  ear: ['auricle', 'ear-canal', 'eardrum', 'cochlea'], earlobe: ['auricle'], 'ear lobe': ['auricle'], 'ear wax': ['ear-canal'], earwax: ['ear-canal'], 'inner ear': ['cochlea', 'semicircular'], 'middle ear': ['bone-malleus', 'bone-incus', 'bone-stapes', 'eardrum'],
  'ear bones': ['bone-malleus', 'bone-incus', 'bone-stapes'], hammer: ['bone-malleus'], anvil: ['bone-incus'], stirrup: ['bone-stapes'],
  eyeball: ['eye'], 'white of eye': ['sclera'], 'eye white': ['sclera'], 'eye color': ['iris'], 'eye colour': ['iris'], pupil: ['iris'], eyelid: ['eyelids'], eyelash: ['eyelashes'], eyebrow: ['eyelashes'], brow: ['eyelashes', 'muscle-corrugator'],
  tears: ['lacrimal-gland'], 'tear duct': ['lacrimal-gland'], 'eye muscles': ['muscle-sup-rectus', 'muscle-lat-rectus', 'muscle-sup-oblique'], 'blind spot': ['retina', 'cn-ii'],
  brain: ['brain', 'cerebrum'], 'gray matter': ['cerebrum'], 'grey matter': ['cerebrum'], 'white matter': ['myelin', 'corpus-callosum'], 'memory center': ['hippocampus'], 'fear center': ['amygdala'],
  'speech center': ['broca', 'wernicke'], 'brain stem': ['brainstem'], 'little brain': ['cerebellum'], 'master gland': ['pituitary'], 'third eye': ['pineal'],
  // Neck & trunk
  neck: ['bone-c1', 'bone-c2', 'muscle-scm', 'muscle-scalenes'], nape: ['muscle-trapezius', 'muscle-semispinalis'],
  collarbone: ['bone-clavicle'], 'collar bone': ['bone-clavicle'], 'shoulder blade': ['bone-scapula'], 'shoulder bone': ['bone-scapula', 'bone-humerus'],
  breastbone: ['bone-sternum'], 'breast bone': ['bone-sternum'], ribs: ['bone-rib1'], 'rib cage': ['bone-rib1', 'joint-costovertebral', 'joint-sternocostal'], 'ribcage': ['bone-rib1'],
  chest: ['muscle-pec-major', 'lungs', 'heart', 'bone-sternum'], pecs: ['muscle-pec-major', 'muscle-pec-minor'], boobs: ['breast', 'nipple'], boob: ['breast'], tits: ['breast'], breasts: ['breast'], nipples: ['nipple'], areola: ['nipple'],
  armpit: ['axilla'], underarm: ['axilla'], pits: ['axilla'], 'abs': ['muscle-rectus-abd', 'muscle-ext-oblique', 'muscle-transversus'], 'six pack': ['muscle-rectus-abd'], sixpack: ['muscle-rectus-abd'], obliques: ['muscle-ext-oblique', 'muscle-int-oblique'], 'love handles': ['muscle-ext-oblique', 'adipose'],
  belly: ['stomach', 'muscle-rectus-abd', 'navel'], tummy: ['stomach', 'small-intestine'], gut: ['stomach', 'small-intestine', 'large-intestine', 'microbiome'], guts: ['small-intestine', 'large-intestine'], 'belly button': ['navel'], bellybutton: ['navel'], 'tummy button': ['navel'], 'belly fat': ['adipose', 'omentum'],
  bowel: ['small-intestine', 'large-intestine'], bowels: ['large-intestine'], intestine: ['small-intestine', 'large-intestine'], 'small bowel': ['small-intestine'], 'large bowel': ['large-intestine'], colon: ['large-intestine', 'colon-parts'],
  'gall bladder': ['gallbladder'], bile: ['bile-ducts', 'gallbladder', 'liver'], 'solar plexus': ['celiac-plexus'], 'second brain': ['enteric'], 'pee bag': ['bladder'],
  heart: ['heart'], ticker: ['heart'], 'heart strings': ['heart-valves'], 'heart valve': ['heart-valves'], 'blood': ['blood'], 'blood vessels': ['aorta', 'capillaries'],
  lung: ['lungs'], 'air sacs': ['alveoli'], 'muscle under lungs': ['muscle-diaphragm'], midriff: ['muscle-diaphragm'],
  back: ['muscle-erector', 'muscle-lats', 'spinal-cord', 'bone-l1'], backbone: ['bone-c1', 'bone-t1', 'bone-l1', 'discs'], 'back bone': ['bone-t1', 'bone-l1'], spine: ['spinal-cord', 'bone-c1', 'bone-t1', 'bone-l1', 'discs'], vertebrae: ['bone-c1', 'bone-t1', 'bone-l1'], 'lower back': ['bone-l1', 'muscle-ql', 'muscle-erector'], 'upper back': ['muscle-trapezius', 'muscle-rhomboid-major'],
  lats: ['muscle-lats'], traps: ['muscle-trapezius'], 'slipped disc': ['discs'], 'slipped disk': ['discs'], disc: ['discs'], tailbone: ['bone-coccyx'], 'tail bone': ['bone-coccyx'],
  kidneys: ['kidney'], 'kidney stones': ['kidney', 'ureter'], 'adrenal glands': ['adrenal'],
  // Pelvis, groin & genitals
  hips: ['joint-hip', 'bone-hip'], 'hip bone': ['bone-hip'], hipbone: ['bone-hip'], pelvis: ['bone-hip', 'bone-sacrum', 'joint-sacroiliac', 'joint-pubic-symphysis'], groin: ['groin'], crotch: ['perineum', 'groin'], 'pubic bone': ['joint-pubic-symphysis', 'bone-hip'],
  butt: ['muscle-glute-max', 'muscle-glute-med', 'anus'], bum: ['muscle-glute-max'], buttocks: ['muscle-glute-max', 'muscle-glute-med'], buttock: ['muscle-glute-max'], glutes: ['muscle-glute-max', 'muscle-glute-med', 'muscle-glute-min'], booty: ['muscle-glute-max'], ass: ['muscle-glute-max', 'anus'], bottom: ['muscle-glute-max'], 'butt cheeks': ['muscle-glute-max'],
  butthole: ['anus'], asshole: ['anus'], rectum: ['rectum'], 'back passage': ['anus'], hemorrhoids: ['anus'], piles: ['anus'], 'sit bones': ['bone-hip'], 'pelvic floor': ['muscle-levator-ani', 'muscle-coccygeus', 'perineum'], kegel: ['muscle-levator-ani'], kegels: ['muscle-levator-ani'], taint: ['perineum'],
  penis: ['penis'], dick: ['penis'], cock: ['penis'], willy: ['penis'], wiener: ['penis'], 'private parts': ['penis', 'vulva'], privates: ['penis', 'vulva'], genitals: ['penis', 'vulva', 'testis'], genitalia: ['penis', 'vulva'], erection: ['penis', 'corpus-cavernosum'], boner: ['penis', 'corpus-cavernosum'], shaft: ['penis'],
  'head of penis': ['glans'], tip: ['glans'], foreskin: ['foreskin'], circumcision: ['foreskin'], balls: ['testis', 'scrotum'], ball: ['testis'], testicles: ['testis'], testicle: ['testis'], nuts: ['testis', 'scrotum'], 'ball sack': ['scrotum'], ballsack: ['scrotum'], sack: ['scrotum'], nutsack: ['scrotum'],
  sperm: ['cell-sperm', 'testis', 'vas-deferens'], semen: ['seminal-vesicle', 'prostate'], cum: ['seminal-vesicle', 'prostate'], 'pre cum': ['bulbourethral'], precum: ['bulbourethral'], vasectomy: ['vas-deferens'],
  vagina: ['vagina', 'vulva'], vulva: ['vulva'], pussy: ['vulva', 'vagina'], 'lady parts': ['vulva'], vag: ['vagina'], labia: ['labia-majora', 'labia-minora'], lips: ['lips', 'labia-majora'], clit: ['clitoris'], 'g spot': ['vagina'], 'g-spot': ['vagina'], hymen: ['vagina'], 'pubic mound': ['mons-pubis'],
  womb: ['uterus'], period: ['uterus', 'ovary'], menstruation: ['uterus'], ovaries: ['ovary'], eggs: ['ovary', 'cell-oocyte'], egg: ['cell-oocyte'], tubes: ['fallopian'], 'fallopian tubes': ['fallopian'], cervical: ['cervix'], 'birth canal': ['vagina'], afterbirth: ['placenta'],
  pee: ['bladder', 'urethra', 'kidney'], urine: ['bladder', 'kidney'], wee: ['bladder'], 'pee hole': ['urethra'], poop: ['large-intestine', 'rectum', 'anus'], poo: ['rectum'], 'pubic hair': ['body-hair'], pubes: ['body-hair'],
  // Arms & hands
  arm: ['bone-humerus', 'muscle-biceps', 'muscle-triceps'], 'upper arm': ['bone-humerus', 'muscle-biceps'], forearm: ['bone-radius', 'bone-ulna'], bicep: ['muscle-biceps'], biceps: ['muscle-biceps'], tricep: ['muscle-triceps'], triceps: ['muscle-triceps'], guns: ['muscle-biceps'],
  shoulder: ['joint-shoulder', 'muscle-deltoid', 'bone-scapula'], shoulders: ['joint-shoulder', 'muscle-deltoid'], delts: ['muscle-deltoid'], 'rotator cuff': ['rotator-cuff'],
  elbow: ['joint-elbow'], 'funny bone': ['ulnar', 'joint-elbow'], 'tennis elbow': ['muscle-ecrb'], 'golfers elbow': ['muscle-fcr'], wrist: ['joint-wrist', 'bone-scaphoid'], 'wrist bones': ['bone-scaphoid', 'bone-lunate', 'bone-capitate'],
  hand: ['bone-mc1', 'joint-knuckles'], palm: ['palmar-aponeurosis', 'bone-mc1'], knuckle: ['joint-knuckles', 'joint-pip'], knuckles: ['joint-knuckles', 'joint-pip', 'joint-dip'], 'finger joints': ['joint-pip', 'joint-dip', 'joint-knuckles'], 'knuckle cracking': ['joint-knuckles'],
  finger: ['bone-hand-prox', 'bone-hand-mid', 'bone-hand-dist', 'joint-pip'], fingers: ['bone-hand-prox', 'bone-hand-mid', 'bone-hand-dist'], 'finger bones': ['bone-hand-prox', 'bone-hand-mid', 'bone-hand-dist'], fingertip: ['bone-hand-dist', 'joint-dip', 'meissner'], fingertips: ['bone-hand-dist', 'meissner'], fingerprint: ['papillary'], fingerprints: ['papillary'],
  thumb: ['bone-mc1', 'joint-thumb-cmc', 'muscle-opponens'], pinky: ['muscle-adm-hand', 'bone-mc5'], 'pinky finger': ['bone-mc5'], 'index finger': ['bone-mc2', 'muscle-ei'], 'ring finger': ['bone-mc4'], 'middle finger': ['bone-mc3'],
  nail: ['nail'], nails: ['nail'], fingernail: ['nail'], fingernails: ['nail'], toenail: ['nail'], toenails: ['nail'], cuticle: ['nail'],
  // Legs & feet
  leg: ['bone-femur', 'bone-tibia', 'bone-fibula'], legs: ['bone-femur', 'bone-tibia'], thigh: ['bone-femur', 'muscle-rectus-femoris', 'muscle-biceps-femoris'], 'thigh bone': ['bone-femur'], thighbone: ['bone-femur'], quads: ['muscle-rectus-femoris', 'muscle-vastus-lat', 'muscle-vastus-med', 'muscle-vastus-int'], quad: ['muscle-rectus-femoris'],
  hamstring: ['muscle-biceps-femoris', 'muscle-semitendinosus', 'muscle-semimembranosus'], hamstrings: ['muscle-biceps-femoris', 'muscle-semitendinosus', 'muscle-semimembranosus'], 'inner thigh': ['muscle-add-longus', 'muscle-gracilis'], adductors: ['muscle-add-longus', 'muscle-add-magnus'], 'hip flexor': ['muscle-iliopsoas'], 'hip flexors': ['muscle-iliopsoas', 'muscle-rectus-femoris'],
  knee: ['joint-knee', 'bone-patella'], knees: ['joint-knee'], kneecap: ['bone-patella'], 'knee cap': ['bone-patella'], acl: ['acl'], meniscus: ['menisci'], 'it band': ['it-band'], 'back of knee': ['popliteal', 'muscle-popliteus'],
  shin: ['bone-tibia', 'muscle-tib-ant'], shinbone: ['bone-tibia'], 'shin bone': ['bone-tibia'], 'shin splints': ['muscle-tib-ant', 'bone-tibia'], calf: ['muscle-gastrocnemius', 'muscle-soleus'], calves: ['muscle-gastrocnemius', 'muscle-soleus'],
  ankle: ['joint-ankle', 'bone-talus'], ankles: ['joint-ankle'], 'ankle bone': ['bone-talus', 'bone-tibia', 'bone-fibula'], 'sprained ankle': ['ankle-ligaments'], heel: ['bone-calcaneus', 'achilles'], 'heel bone': ['bone-calcaneus'], 'heel cord': ['achilles'], achilles: ['achilles'],
  foot: ['bone-calcaneus', 'bone-talus', 'bone-mt1'], feet: ['bone-calcaneus', 'bone-mt1'], arch: ['plantar-fascia', 'muscle-tib-post'], sole: ['plantar-fascia', 'muscle-fdb'], 'ball of foot': ['joint-mtp', 'foot-sesamoids'], 'ball of the foot': ['joint-mtp'],
  toe: ['bone-foot-prox', 'joint-toe-ip'], toes: ['bone-foot-prox', 'bone-foot-mid', 'bone-foot-dist'], 'big toe': ['bone-foot-prox', 'joint-mtp', 'muscle-ehl'], 'pinky toe': ['muscle-adm-foot'], 'toe knuckles': ['joint-mtp'], bunion: ['joint-mtp'], gout: ['joint-mtp'],
  // Skin, hair & general
  hair: ['hair-shaft', 'hair-follicle', 'body-hair'], 'hair root': ['hair-bulb', 'hair-follicle'], follicle: ['hair-follicle'], goosebumps: ['arrector-pili'], 'goose bumps': ['arrector-pili'], beard: ['body-hair', 'hair-follicle'],
  sweat: ['eccrine', 'apocrine'], 'sweat glands': ['eccrine', 'apocrine'], 'body odor': ['apocrine'], bo: ['apocrine'], pimple: ['sebaceous'], pimples: ['sebaceous'], acne: ['sebaceous'], zit: ['sebaceous'], oil: ['sebaceous'], 'skin color': ['melanin'], tan: ['melanin', 'cell-melanocyte'], freckles: ['melanin'], mole: ['cell-melanocyte'],
  fat: ['adipose', 'hypodermis'], 'body fat': ['adipose'], 'stretch marks': ['reticular'], scar: ['dermis', 'cell-fibroblast'], wrinkles: ['dermis'], callus: ['str-corneum'],
  joints: ['joint-knee', 'joint-hip', 'joint-shoulder', 'synovial'], joint: ['synovial', 'joint-knee'], cartilage: ['hyaline', 'fibrocartilage'], gristle: ['hyaline'], tendon: ['tendons'], ligament: ['ligaments'], 'joint fluid': ['synovial'],
  nerves: ['cn-x', 'sciatic', 'median'], 'pinched nerve': ['cervical-spinal', 'lumbar-spinal', 'sciatic'], sciatica: ['sciatic', 'lumbar-spinal'], 'carpal tunnel': ['carpal-tunnel', 'median'],
  'bone marrow': ['bone-marrow'], marrow: ['bone-marrow'], 'red blood cell': ['cell-rbc'], 'white blood cell': ['cell-neutrophil', 'cell-b-cell', 'cell-th-cell'], 'white blood cells': ['cell-neutrophil', 'cell-monocyte', 'cell-b-cell'], germs: ['microbiome'], 'gut bacteria': ['microbiome'],
  glands: ['lymph-nodes', 'thyroid', 'salivary'], 'swollen glands': ['lymph-nodes'], tonsil: ['tonsils'], 'adam apple': ['larynx'], pulse: ['radial-a', 'carotid'], veins: ['cephalic', 'jugular', 'saphenous'], 'varicose veins': ['saphenous', 'small-saphenous'],
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const ALIAS: [string, string[]][] = Object.entries(LAY).map(([k, v]) => [norm(k), v])
/** Plural/singular-insensitive comparison of one word. */
const stem = (w: string) => w.replace(/(ies)$/, 'y').replace(/(es|s)$/, '')

/** The everyday names that point at a structure (for "also called" chips). */
export function laymanNames(id: string): string[] {
  return Object.entries(LAY)
    .filter(([, ids]) => ids[0] === id)
    .map(([k]) => k)
    .slice(0, 6)
}

/**
 * Rank structures for a query: exact name or everyday-name hits first, then names that start with it,
 * names that contain it, “also called” names, and finally description matches.
 */
export function searchStructures(query: string, pool: Structure[]): Structure[] {
  const q = norm(query)
  if (!q) return pool
  const qs = stem(q)
  const score = new Map<string, number>()
  const bump = (id: string, v: number) => score.set(id, Math.max(score.get(id) ?? 0, v))
  // Everyday names
  for (const [k, ids] of ALIAS) {
    let v = 0
    if (k === q || stem(k) === qs) v = 100
    else if (q.length >= 3 && k.startsWith(q)) v = 60
    else if (q.length >= 4 && k.length >= 3 && (` ${q} `.includes(` ${k} `) || ` ${k}`.includes(` ${q}`))) v = 35
    if (v) ids.forEach((id, i) => bump(id, v - i))
  }
  const words = q.split(' ')
  for (const s of pool) {
    const n = norm(s.name)
    const aka = s.aka ? norm(s.aka) : ''
    let v = 0
    if (n === q || n.replace(/ \(.*$/, '') === q) v = 95
    else if (n.startsWith(q)) v = 80
    else if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(n)) v = 70
    else if (n.includes(q) || n.includes(qs)) v = 55
    else if (aka && (aka.includes(q) || aka.includes(qs))) v = 50
    else if (words.length > 1 && words.every((w) => n.includes(stem(w)))) v = 45
    else if (q.length >= 3 && ` ${norm(s.desc)}`.includes(` ${q}`)) v = 20
    if (v) bump(s.id, v)
  }
  const byId = new Map(pool.map((s) => [s.id, s]))
  return [...score.entries()]
    .filter(([id]) => byId.has(id))
    .sort((a, b) => b[1] - a[1] || byId.get(a[0])!.name.localeCompare(byId.get(b[0])!.name))
    .map(([id]) => byId.get(id)!)
}

/** Ids every alias points at (used by a self-check). */
export const ALIAS_IDS = [...new Set(Object.values(LAY).flat())]
