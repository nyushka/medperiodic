import type { Region, Structure, System } from './types'

// Parts added to make the atlas complete: every joint (knuckles included), external and internal genitals,
// mouth, throat, eye and ear parts, brain regions and the full set of spinal and peripheral nerves.

type O = Omit<Structure, 'kind' | 'system'>
const make = (kind: Structure['kind'], system: System) => (o: O): Structure => ({ kind, system, ...o })

// ---------------- Joints ----------------
type J = [id: string, name: string, region: Region, type: string, bones: string, moves: string, desc: string, count?: number]
const J_DATA: J[] = [
  ['sutures', 'Skull sutures', 'head', 'Fibrous (immovable)', 'Cranial bones', 'None in adults', 'Wavy seams joining the skull plates: coronal, sagittal, lambdoid and squamous. In babies they are flexible and leave soft spots (fontanelles) so the head can mould during birth and the brain can grow.', 1],
  ['tmj', 'Temporomandibular joint (jaw joint)', 'head', 'Synovial, hinge + gliding', 'Mandibular condyle and temporal bone', 'Opening, closing, side-to-side and forward sliding', 'The joint in front of each ear that lets you chew and talk. A fibrocartilage disc between the bones lets it hinge and slide at once. Clicking, pain or locking is called TMD.', 2],
  ['atlanto-occipital', 'Atlanto-occipital joint', 'neck', 'Synovial, condyloid', 'Occipital condyles and atlas (C1)', 'Nodding “yes”, slight side tilt', 'Where the skull rocks on the first vertebra. About half of the nodding motion of the head happens here.', 2],
  ['atlanto-axial', 'Atlanto-axial joint', 'neck', 'Synovial, pivot', 'Atlas (C1) and the dens of the axis (C2)', 'Turning the head “no”', 'The atlas ring spins around the tooth-like dens of C2. About half of all head rotation happens at this one joint.', 1],
  ['facet-joints', 'Facet (zygapophyseal) joints', 'back', 'Synovial, plane', 'Articular processes of neighbouring vertebrae', 'Guide bending and twisting of the spine', 'Pairs of small gliding joints at the back of each vertebra. Their orientation lets the neck rotate freely while limiting twisting in the lower back. A common source of back pain with arthritis.', 48],
  ['costovertebral', 'Costovertebral joints', 'back', 'Synovial, plane', 'Rib heads and thoracic vertebrae', 'Rib rotation for breathing', 'Each rib meets the spine at two joints (head and tubercle). Their gliding lets the ribs swing up and out like bucket handles as you breathe in.', 24],
  ['sternocostal', 'Sternocostal joints', 'chest', 'Rib 1 cartilaginous; ribs 2–7 synovial', 'Costal cartilages and sternum', 'Small gliding during breathing', 'Where the rib cartilages join the breastbone. Inflammation here (costochondritis) causes chest-wall pain that can mimic heart pain.', 14],
  ['sternoclavicular', 'Sternoclavicular joint', 'chest', 'Synovial, saddle', 'Clavicle and manubrium of sternum', 'Shrugging and arm elevation', 'The only bony joint connecting the whole arm to the trunk. A disc inside makes it very stable; the clavicle usually breaks before this joint dislocates.', 2],
  ['acromioclavicular', 'Acromioclavicular (AC) joint', 'arm', 'Synovial, plane', 'Acromion of scapula and clavicle', 'Small glides as the shoulder blade moves', 'The bump at the top of the shoulder. Falls on the shoulder tear its ligaments: a “separated shoulder”.', 2],
  ['shoulder', 'Shoulder (glenohumeral) joint', 'arm', 'Synovial, ball and socket', 'Head of humerus and glenoid of scapula', 'Flexion, extension, abduction, adduction, rotation, circumduction', 'The most mobile joint in the body and the most often dislocated: a large ball on a shallow socket deepened by a cartilage rim (the labrum) and held mostly by the rotator cuff muscles.', 2],
  ['elbow', 'Elbow joint', 'arm', 'Synovial, hinge (+ pivot)', 'Humerus, ulna and radius', 'Flexion, extension; forearm rotation at the radial head', 'Three joints in one capsule: humero-ulnar (hinge), humero-radial and proximal radio-ulnar (pivot). The “funny bone” is the ulnar nerve running behind it.', 2],
  ['radioulnar', 'Radio-ulnar joints', 'arm', 'Synovial, pivot', 'Radius and ulna at elbow and wrist', 'Pronation and supination (turning the palm down and up)', 'The radius rolls around the ulna so you can turn a key or a doorknob. A sheet of interosseous membrane binds the two bones between the joints.', 4],
  ['wrist', 'Wrist (radiocarpal) joint', 'hand', 'Synovial, condyloid (ellipsoid)', 'Radius, articular disc and scaphoid, lunate, triquetrum', 'Flexion, extension, side-to-side deviation', 'The radius carries most of the load into the carpal bones. Falling on an outstretched hand commonly breaks the end of the radius (Colles fracture) or the scaphoid.', 2],
  ['carpal-joints', 'Intercarpal and midcarpal joints', 'hand', 'Synovial, plane', 'The eight carpal bones', 'Add range to wrist bending', 'Small gliding joints between the wrist bones that share the work of wrist movement and absorb impact.', 2],
  ['thumb-cmc', 'Thumb base (1st carpometacarpal) joint', 'hand', 'Synovial, saddle', 'Trapezium and 1st metacarpal', 'Opposition: bringing the thumb across to touch the fingertips', 'A saddle-shaped joint that gives the human thumb its unique reach. It wears out often: base-of-thumb arthritis is one of the most common forms of osteoarthritis.', 2],
  ['knuckles', 'Knuckles (metacarpophalangeal / MCP joints)', 'hand', 'Synovial, condyloid', 'Metacarpal heads and proximal phalanges', 'Bending, straightening, spreading and closing the fingers', 'The big knuckles where the fingers join the hand, visible when you make a fist. Cracking them pops a gas bubble in the joint fluid; studies have not linked it to arthritis.', 10],
  ['pip', 'Middle finger joints (proximal interphalangeal / PIP)', 'hand', 'Synovial, hinge', 'Proximal and middle phalanges', 'Bending and straightening', 'The middle knuckles of the fingers. Bony lumps here in osteoarthritis are called Bouchard’s nodes; jammed fingers usually injure this joint.', 8],
  ['dip', 'Fingertip joints (distal interphalangeal / DIP)', 'hand', 'Synovial, hinge', 'Middle and distal phalanges (thumb: proximal and distal)', 'Bending and straightening', 'The joints nearest the fingertips. Bony lumps here are Heberden’s nodes; a torn extensor tendon here gives a drooping “mallet finger”.', 10],
  ['sacroiliac', 'Sacroiliac joint', 'pelvis', 'Synovial + fibrous', 'Sacrum and ilium', 'A few degrees of nutation (tilting)', 'Very strong joints that pass the whole weight of the upper body into the pelvis. Its interlocking surfaces and huge ligaments allow only tiny movements.', 2],
  ['pubic-symphysis', 'Pubic symphysis', 'pelvis', 'Cartilaginous (fibrocartilage disc)', 'The two pubic bones', 'Slight give, more in late pregnancy', 'The joint at the front of the pelvis. The hormone relaxin loosens it during pregnancy so the pelvis can widen for birth.', 1],
  ['hip', 'Hip joint', 'leg', 'Synovial, ball and socket', 'Head of femur and acetabulum of hip bone', 'Flexion, extension, abduction, adduction, rotation', 'A deep, stable ball and socket that carries up to several times body weight when you run. Its blood supply runs along the femoral neck, which is why neck fractures can kill the femoral head.', 2],
  ['knee', 'Knee joint', 'leg', 'Synovial, modified hinge', 'Femur, tibia and patella', 'Flexion, extension and a little rotation', 'The largest joint in the body. Two menisci cushion it and four main ligaments (ACL, PCL, MCL, LCL) hold it together. It locks slightly when fully straight so you can stand with little effort.', 2],
  ['ankle', 'Ankle (talocrural) joint', 'foot', 'Synovial, hinge', 'Tibia, fibula and talus', 'Dorsiflexion (toes up) and plantarflexion (toes down)', 'The talus sits in a mortise formed by the two leg bones. Rolling the foot inward sprains the outer ligaments; it is the most common sports injury.', 2],
  ['subtalar', 'Subtalar joint', 'foot', 'Synovial, plane', 'Talus and calcaneus', 'Inversion and eversion (tilting the sole in and out)', 'Lets the foot adapt to uneven ground. Together with the midfoot joints it turns the foot from a flexible adapter into a rigid lever for push-off.', 2],
  ['mtp', 'Toe knuckles (metatarsophalangeal / MTP joints)', 'foot', 'Synovial, condyloid', 'Metatarsal heads and proximal phalanges of the toes', 'Bending the toes, especially at push-off', 'The “ball of the foot”. The big-toe MTP is where gout most often strikes and where a bunion (hallux valgus) forms.', 10],
  ['toe-ip', 'Toe joints (interphalangeal)', 'foot', 'Synovial, hinge', 'Phalanges of the toes', 'Curling and straightening the toes', 'Small hinge joints of the toes. Tight shoes can fix them bent, causing hammer toes.', 18],
]
const joints: Structure[] = J_DATA.map(([id, name, region, type, bones, moves, desc, count]) => ({
  id: `joint-${id}`,
  name,
  kind: 'joint',
  system: 'skeletal',
  region,
  desc,
  count,
  facts: [
    ['Joint type', type],
    ['Bones', bones],
    ['Movements', moves],
  ],
}))

const tissue = (system: System) => (o: O): Structure => ({ kind: 'tissue', system, ...o })
const jt = tissue('skeletal')
const JOINT_PARTS: Structure[] = [
  jt({ id: 'menisci', name: 'Menisci of the knee', region: 'leg', desc: 'Two C-shaped fibrocartilage pads between femur and tibia that spread load and steady the knee. Twisting on a bent knee tears them.', count: 4 }),
  jt({ id: 'acl', name: 'Anterior cruciate ligament (ACL)', region: 'leg', desc: 'Crosses inside the knee to stop the tibia sliding forward. Tears with sudden pivots or landings, often with a pop; it cannot heal on its own.', count: 2 }),
  jt({ id: 'pcl', name: 'Posterior cruciate ligament (PCL)', region: 'leg', desc: 'The thicker, stronger cruciate; stops the tibia sliding backward. Injured in “dashboard” car crashes.', count: 2 }),
  jt({ id: 'knee-collateral', name: 'Collateral ligaments of the knee (MCL, LCL)', region: 'leg', desc: 'Side straps of the knee. The MCL on the inner side is torn by blows to the outside of the knee.', count: 4 }),
  jt({ id: 'ankle-ligaments', name: 'Ankle ligaments (ATFL, deltoid)', region: 'foot', desc: 'The anterior talofibular ligament on the outer ankle is the most commonly sprained ligament in the body; the fan-shaped deltoid ligament guards the inner side.', count: 2 }),
  jt({ id: 'labrum', name: 'Labrum (shoulder and hip)', region: 'arm', desc: 'A rim of fibrocartilage that deepens the shallow shoulder socket and the hip socket, like a suction seal. Tears cause clicking and catching.', count: 4 }),
  { id: 'foot-sesamoids', name: 'Sesamoid bones of the big toe', kind: 'bone', system: 'skeletal', region: 'foot', count: 4, desc: 'Two pea-sized bones in the tendon of flexor hallucis brevis under each big-toe knuckle. Like tiny kneecaps, they take the load at push-off; dancers and runners can inflame them (sesamoiditis). Variable bones like these are not counted in the standard 206.', facts: [['Bone type', 'Sesamoid'], ['Number in body', 'Usually 4 (not counted in the 206)']] },
  jt({ id: 'bursae', name: 'Bursae', region: 'whole', desc: 'About 150 small fluid-filled sacs that let tendons and skin glide over bone at the shoulder, elbow, hip and knee. Inflamed bursae cause bursitis (“housemaid’s knee”).' }),
  tissue('muscular')({ id: 'achilles', name: 'Achilles (calcaneal) tendon', region: 'foot', aka: 'Heel cord', desc: 'The thickest and strongest tendon in the body, joining the calf muscles to the heel bone. It can carry over 10 times body weight when running.', count: 2 }),
  tissue('muscular')({ id: 'patellar-tendon', name: 'Patellar tendon', region: 'leg', desc: 'Links the kneecap to the tibia; the doctor taps it to test the knee-jerk reflex (L3–L4).', count: 2 }),
  tissue('muscular')({ id: 'rotator-cuff', name: 'Rotator cuff', region: 'arm', desc: 'The tendons of supraspinatus, infraspinatus, teres minor and subscapularis blended into a cuff that holds the humeral head in its socket. Tears are very common after 40.', count: 2 }),
  tissue('muscular')({ id: 'plantar-fascia', name: 'Plantar fascia', region: 'foot', desc: 'A thick band under the sole from heel to toes that supports the arch like a bowstring. Inflammation at the heel (plantar fasciitis) causes sharp first-step pain.', count: 2 }),
  tissue('muscular')({ id: 'carpal-tunnel', name: 'Carpal tunnel & flexor retinaculum', region: 'hand', desc: 'A tunnel of wrist bones roofed by a tough band, carrying nine flexor tendons and the median nerve. Swelling here compresses the nerve: carpal tunnel syndrome.', count: 2 }),
  tissue('muscular')({ id: 'it-band', name: 'Iliotibial band', region: 'leg', desc: 'A long strip of thickened fascia down the outside of the thigh from hip to tibia. Friction where it crosses the knee causes runner’s knee pain.', count: 2 }),
  tissue('muscular')({ id: 'palmar-aponeurosis', name: 'Palmar aponeurosis', region: 'hand', desc: 'Tough triangular sheet in the palm that protects tendons and grips. Its thickening pulls fingers into the palm in Dupuytren’s contracture.', count: 2 }),
]

// ---------------- Reproductive & pelvic ----------------
const rep = make('organ', 'reproductive')
const REPRO: Structure[] = [
  rep({ id: 'penis', name: 'Penis', region: 'pelvis', aka: 'Phallus', desc: 'The male organ for urination and sex, made of three cylinders of spongy erectile tissue (two corpora cavernosa and one corpus spongiosum around the urethra) with a root, shaft and glans. Erection happens when nerves release nitric oxide, relaxing smooth muscle so the tissue fills with blood.', el: { N: 'Nitric oxide (NO) from nerves and blood vessel lining triggers erection', Ca: 'Falling calcium in smooth muscle (via cGMP) relaxes it so blood can fill the erectile tissue', Zn: 'Zinc is needed to make testosterone, which supports erectile function' } }),
  rep({ id: 'corpus-cavernosum', name: 'Corpus cavernosum', region: 'pelvis', desc: 'Two parallel erectile cylinders along the top of the penis (and two smaller ones in the clitoris). Each is wrapped in a tough sheath, the tunica albuginea; scarring of the sheath bends the penis (Peyronie’s disease).', count: 2 }),
  rep({ id: 'corpus-spongiosum', name: 'Corpus spongiosum', region: 'pelvis', desc: 'The single erectile column on the underside of the penis that surrounds the urethra. It stays softer during erection so semen can pass, and swells at its end into the glans.' }),
  rep({ id: 'glans', name: 'Glans penis', region: 'pelvis', aka: 'Head of the penis', desc: 'The cone-shaped tip of the penis, packed with sensory nerve endings, with the external urethral opening at its tip.' }),
  rep({ id: 'foreskin', name: 'Foreskin (prepuce)', region: 'pelvis', desc: 'A fold of skin and mucosa covering the glans, removed in circumcision. A similar hood covers the clitoris.' }),
  rep({ id: 'scrotum', name: 'Scrotum', region: 'pelvis', desc: 'A skin sac holding the testes outside the body, where it is about 2–3 °C cooler; sperm production needs that lower temperature. The dartos and cremaster muscles tighten it in the cold.' }),
  rep({ id: 'epididymis', name: 'Epididymis', region: 'pelvis', desc: 'A tightly coiled tube about 6 m long on the back of each testis where sperm mature and learn to swim over roughly two weeks.', count: 2 }),
  rep({ id: 'vas-deferens', name: 'Vas deferens', region: 'pelvis', desc: 'A muscular tube about 30–45 cm long carrying sperm from the epididymis up through the groin to the urethra. Cutting it is a vasectomy.', count: 2 }),
  rep({ id: 'seminal-vesicle', name: 'Seminal vesicles', region: 'pelvis', desc: 'Glands behind the bladder that make about 70% of the volume of semen, a fluid rich in fructose that fuels sperm.', count: 2, el: { C: 'Fructose they secrete is the main fuel for sperm' } }),
  rep({ id: 'bulbourethral', name: 'Bulbourethral (Cowper’s) glands', region: 'pelvis', desc: 'Pea-sized glands below the prostate that release clear mucus before ejaculation, neutralizing acid in the urethra.', count: 2 }),
  rep({ id: 'spermatic-cord', name: 'Spermatic cord', region: 'pelvis', desc: 'The bundle that suspends each testis: vas deferens, testicular artery, a vein network (pampiniform plexus) and nerves. Twisting it (torsion) is an emergency.', count: 2 }),
  rep({ id: 'vulva', name: 'Vulva', region: 'pelvis', desc: 'The external female genitals: mons pubis, labia majora and minora, clitoris, the urethral and vaginal openings and Bartholin glands.' }),
  rep({ id: 'mons-pubis', name: 'Mons pubis', region: 'pelvis', desc: 'The rounded pad of fat over the pubic bone, covered by pubic hair after puberty.' }),
  rep({ id: 'labia-majora', name: 'Labia majora', region: 'pelvis', desc: 'The outer lips of the vulva: folds of fatty skin that protect the inner structures. They develop from the same tissue as the scrotum.', count: 2 }),
  rep({ id: 'labia-minora', name: 'Labia minora', region: 'pelvis', desc: 'The thin inner lips, rich in blood vessels and nerves, which meet above to form the clitoral hood.', count: 2 }),
  rep({ id: 'clitoris', name: 'Clitoris', region: 'pelvis', desc: 'The female erectile organ. Only the glans is visible; the whole structure, with its crura and bulbs, is about 9–11 cm long. It grows from the same embryonic tissue as the penis and has a dense concentration of sensory nerve endings.', el: { N: 'Nitric oxide relaxes its smooth muscle so the erectile tissue fills with blood' } }),
  rep({ id: 'vagina', name: 'Vagina', region: 'pelvis', desc: 'A stretchy muscular canal about 7–10 cm long from the cervix to the vulva; the birth canal. Lactobacilli keep it acidic (pH 3.8–4.5), which blocks infections.', el: { H: 'Lactic acid from lactobacilli keeps the pH around 4' } }),
  rep({ id: 'cervix', name: 'Cervix', region: 'pelvis', desc: 'The narrow neck of the uterus that opens into the vagina. It makes mucus that changes through the cycle and dilates to 10 cm in labor. Screening (Pap and HPV tests) finds precancerous changes.' }),
  rep({ id: 'bartholin', name: 'Bartholin’s glands', region: 'pelvis', desc: 'Two pea-sized glands beside the vaginal opening that secrete lubricating mucus. A blocked duct forms a Bartholin cyst.', count: 2 }),
  rep({ id: 'nipple', name: 'Nipple & areola', region: 'chest', desc: 'The nipple carries 15–20 milk duct openings; the darker areola around it has Montgomery glands that oil and protect the skin during breastfeeding.', count: 2 }),
  make('organ', 'reproductive')({ id: 'perineum', name: 'Perineum', region: 'pelvis', desc: 'The diamond-shaped area between the thighs, from the pubic bone to the tailbone, holding the genitals, urethra and anus over the pelvic floor. Its central perineal body anchors many muscles.' }),
  make('organ', 'digestive')({ id: 'anus', name: 'Anus & anal canal', region: 'pelvis', aka: 'Back passage', desc: 'The last 3–4 cm of the gut. An involuntary inner smooth-muscle sphincter and a voluntary outer skeletal sphincter keep it closed; cushions of blood vessels inside can swell into hemorrhoids.' }),
]

// ---------------- Head, mouth, throat, eye and ear ----------------
const dg = make('organ', 'digestive')
const rs = make('organ', 'respiratory')
const se = make('organ', 'sensory')
const HEAD: Structure[] = [
  dg({ id: 'lips', name: 'Lips', region: 'head', desc: 'Folds of muscle (orbicularis oris) covered by very thin skin with no sweat glands, so blood vessels show through as red. Packed with touch receptors.', count: 2 }),
  dg({ id: 'gums', name: 'Gums (gingiva)', region: 'head', desc: 'Pink tissue that grips the teeth and covers the jaw bones. Plaque bacteria inflame it (gingivitis), which can progress to tooth-loosening periodontitis.', el: { C: 'Vitamin C deficiency (scurvy) makes gums swell and bleed' } }),
  dg({ id: 'palate', name: 'Hard & soft palate', region: 'head', aka: 'Roof of the mouth', desc: 'The roof of the mouth: a bony front (maxilla and palatine bones) and a muscular back that rises to seal off the nose when you swallow.' }),
  dg({ id: 'uvula', name: 'Uvula', region: 'head', desc: 'The small dangling teardrop at the back of the soft palate. It helps seal the nasal passage during swallowing and adds to some speech sounds; it vibrates during snoring.' }),
  dg({ id: 'pharynx', name: 'Pharynx', region: 'neck', aka: 'Throat', desc: 'The 12–14 cm muscular funnel behind the nose and mouth, shared by air and food: nasopharynx, oropharynx and laryngopharynx. Three constrictor muscles squeeze food down when you swallow.' }),
  rs({ id: 'epiglottis', name: 'Epiglottis', region: 'neck', desc: 'A leaf-shaped flap of elastic cartilage that folds back over the larynx when you swallow so food goes down the esophagus, not the windpipe.' }),
  rs({ id: 'vocal-cords', name: 'Vocal cords (vocal folds)', region: 'neck', aka: 'Voice box cords', desc: 'Two bands of muscle and ligament in the larynx that vibrate 100–250 times a second to make your voice. Longer, thicker folds give lower voices; they lengthen at puberty.', count: 2 }),
  rs({ id: 'sinuses', name: 'Paranasal sinuses', region: 'head', desc: 'Four pairs of air spaces in the skull bones around the nose (frontal, maxillary, ethmoid, sphenoid) that lighten the skull, warm air and add resonance to the voice. Blocked drainage causes sinusitis.' }),
  rs({ id: 'nasal-septum', name: 'Nasal septum', region: 'head', desc: 'The wall of cartilage and bone (vomer, ethmoid) dividing the nose into two nostrils. Most people have a slightly deviated septum.' }),
  make('organ', 'lymphatic')({ id: 'adenoids', name: 'Adenoids', region: 'head', desc: 'A pad of lymphoid tissue at the back of the nasal cavity that samples inhaled germs. Large in children, it shrinks by the teens.' }),
  se({ id: 'auricle', name: 'Outer ear (auricle / pinna)', region: 'head', desc: 'The visible ear, made of elastic cartilage covered by skin. Its folds funnel sound and help you tell whether a sound comes from above, below, in front or behind.', count: 2 }),
  se({ id: 'ear-canal', name: 'Ear canal', region: 'head', desc: 'A 2.5-cm S-shaped tube to the eardrum. Glands in its skin make earwax, which traps dust and slowly migrates outward on its own.', count: 2 }),
  se({ id: 'eustachian', name: 'Eustachian (auditory) tube', region: 'head', desc: 'Connects the middle ear to the back of the nose to equalize pressure: the “pop” when you yawn on a plane. Shorter and flatter in children, which is why they get more ear infections.', count: 2 }),
  se({ id: 'eyelids', name: 'Eyelids', region: 'head', desc: 'Thin folds of skin, muscle and a stiff tarsal plate that close to protect the eye and spread tears with each blink. Their meibomian glands add an oily layer that stops tears evaporating.', count: 4 }),
  se({ id: 'iris', name: 'Iris & pupil', region: 'head', desc: 'The colored ring of muscle that widens or narrows the pupil (2–8 mm) to control how much light enters. Eye color comes from the amount of melanin in its front layer.', count: 2 }),
  se({ id: 'sclera', name: 'Sclera', region: 'head', aka: 'White of the eye', desc: 'The tough white outer coat of the eyeball, made of dense collagen. Six eye muscles attach to it.', count: 2 }),
  se({ id: 'conjunctiva', name: 'Conjunctiva', region: 'head', desc: 'A thin clear membrane covering the white of the eye and the inside of the lids. Inflamed, it becomes “pink eye” (conjunctivitis).', count: 2 }),
  se({ id: 'lacrimal-gland', name: 'Tear glands & ducts (lacrimal apparatus)', region: 'head', aka: 'Tear ducts', desc: 'The almond-sized lacrimal gland above the outer eye makes tears; they drain through tiny openings at the inner corner into the nose, which is why crying makes your nose run.', count: 2 }),
  se({ id: 'vitreous', name: 'Vitreous & aqueous humor', region: 'head', desc: 'Clear gel filling the back of the eye and watery fluid in the front, which together keep the eye’s shape. Blocked drainage of aqueous fluid raises pressure in glaucoma.', count: 2 }),
  make('skin', 'integumentary')({ id: 'eyelashes', name: 'Eyelashes & eyebrows', region: 'head', desc: 'Short, thick hairs that keep sweat, dust and debris out of the eyes. An eyelash lives about 3–5 months.' }),
  make('skin', 'integumentary')({ id: 'body-hair', name: 'Body, scalp & pubic hair', region: 'whole', desc: 'About 5 million hair follicles cover the body: ~100,000 on the scalp. Androgens at puberty turn fine vellus hair into coarse terminal hair in the armpits, groin and (in men) face.' }),
]

// ---------------- Brain regions ----------------
const br = make('organ', 'nervous')
const BRAIN: Structure[] = [
  br({ id: 'frontal-lobe', name: 'Frontal lobe', region: 'head', desc: 'The largest lobe, behind the forehead: planning, decision making, personality, self-control and voluntary movement. It is the last part of the brain to mature, in the mid-20s.', count: 2 }),
  br({ id: 'parietal-lobe', name: 'Parietal lobe', region: 'head', desc: 'Behind the frontal lobe: combines touch, body position and vision to build a map of where your body is in space; also reading and arithmetic.', count: 2 }),
  br({ id: 'temporal-lobe', name: 'Temporal lobe', region: 'head', desc: 'Beside the ears: hearing, understanding language, recognizing faces and objects, and (with the hippocampus inside it) forming memories.', count: 2 }),
  br({ id: 'occipital-lobe', name: 'Occipital lobe', region: 'head', desc: 'At the back of the head: the primary visual cortex. A blow here can make you “see stars”.', count: 2 }),
  br({ id: 'insula', name: 'Insula', region: 'head', desc: 'A hidden lobe folded deep inside the side of each hemisphere. It senses the body’s inner state (heartbeat, hunger, disgust) and taste.', count: 2 }),
  br({ id: 'cingulate', name: 'Cingulate gyrus', region: 'head', desc: 'A belt of cortex arching over the corpus callosum, part of the limbic system: emotion, motivation, error-checking and pain perception.', count: 2 }),
  br({ id: 'motor-cortex', name: 'Primary motor cortex (precentral gyrus)', region: 'head', desc: 'A strip in front of the central sulcus that sends commands for voluntary movement. It maps the body upside-down, with huge areas for the hands and face.', count: 2 }),
  br({ id: 'sensory-cortex', name: 'Primary somatosensory cortex (postcentral gyrus)', region: 'head', desc: 'The strip just behind the central sulcus that receives touch, pain, temperature and position from the opposite side of the body.', count: 2 }),
  br({ id: 'broca', name: 'Broca’s area', region: 'head', desc: 'Part of the inferior frontal gyrus, usually on the left, that produces speech. Damage causes halting, effortful speech with good understanding.' }),
  br({ id: 'wernicke', name: 'Wernicke’s area', region: 'head', desc: 'At the back of the left superior temporal gyrus; understands spoken and written language. Damage causes fluent speech that makes little sense.' }),
  br({ id: 'corpus-callosum', name: 'Corpus callosum', region: 'head', desc: 'A thick bridge of about 200 million nerve fibers joining the left and right hemispheres, the largest white-matter tract in the brain.' }),
  br({ id: 'basal-ganglia', name: 'Basal ganglia (caudate, putamen, globus pallidus)', region: 'head', desc: 'Deep nuclei that select and smooth movements and form habits. Loss of their dopamine input from the substantia nigra causes Parkinson’s disease; Huntington’s destroys the caudate.', count: 2, el: { Fe: 'The globus pallidus and substantia nigra hold the brain’s highest iron levels', Mn: 'Manganese builds up here in overexposure, causing parkinsonism', Cu: 'Copper builds up in the basal ganglia in Wilson disease' } }),
  br({ id: 'substantia-nigra', name: 'Substantia nigra', region: 'head', desc: 'A dark band in the midbrain whose neurons make dopamine for movement. Their loss causes Parkinson’s disease. Its dark color is neuromelanin.', count: 2, el: { Fe: 'Iron-rich neuromelanin gives it its black color' } }),
  br({ id: 'midbrain', name: 'Midbrain', region: 'head', desc: 'The top of the brainstem. Its colliculi drive reflex turns of the eyes and head toward sights and sounds; it contains the substantia nigra and the nuclei of cranial nerves III and IV.' }),
  br({ id: 'pons', name: 'Pons', region: 'head', desc: 'The bulge of the brainstem that relays signals to the cerebellum, helps set breathing rhythm and dreaming (REM) sleep, and holds the nuclei of cranial nerves V–VIII.' }),
  br({ id: 'medulla', name: 'Medulla oblongata', region: 'head', desc: 'The lowest part of the brainstem, joining the spinal cord. It runs heart rate, blood pressure, breathing, swallowing, coughing and vomiting.' }),
  br({ id: 'ventricles', name: 'Ventricles of the brain', region: 'head', desc: 'Four connected cavities (two lateral, third and fourth) filled with cerebrospinal fluid made by the choroid plexus. Blocked flow swells them (hydrocephalus).' }),
  br({ id: 'choroid-plexus', name: 'Choroid plexus', region: 'head', desc: 'Frond-like capillary tufts in the ventricles that filter blood into about 500 mL of cerebrospinal fluid every day.' }),
  br({ id: 'meninges', name: 'Meninges (dura, arachnoid, pia)', region: 'head', desc: 'Three membranes wrapping the brain and spinal cord: tough dura mater, web-like arachnoid (with fluid beneath it) and delicate pia. Infection of them is meningitis.' }),
  br({ id: 'internal-capsule', name: 'Internal capsule', region: 'head', desc: 'A narrow V-shaped bundle of fibers carrying signals between the cortex and the brainstem. A small stroke here can paralyze the whole opposite side.', count: 2 }),
  br({ id: 'fornix', name: 'Fornix', region: 'head', desc: 'An arched fiber tract carrying memory signals from the hippocampus to the mammillary bodies and hypothalamus.' }),
  br({ id: 'mammillary', name: 'Mammillary bodies', region: 'head', desc: 'Two small round nuclei under the hypothalamus that relay memory signals. They shrink in thiamine (vitamin B1) deficiency, causing Korsakoff’s memory loss.', count: 2 }),
  br({ id: 'optic-chiasm', name: 'Optic chiasm & tracts', region: 'head', desc: 'Where the optic nerves meet and the fibers from the nasal half of each retina cross over. A pituitary tumour pressing here causes loss of outer (temporal) vision in both eyes.' }),
  br({ id: 'colliculi', name: 'Superior & inferior colliculi', region: 'head', desc: 'Four bumps on the back of the midbrain: the superior pair steers the eyes toward things you see, the inferior pair relays hearing.' }),
]

// ---------------- Trunk extras ----------------
const TRUNK: Structure[] = [
  make('skin', 'integumentary')({ id: 'navel', name: 'Navel (umbilicus)', region: 'abdomen', aka: 'Belly button', desc: 'The scar where the umbilical cord attached before birth. Inside, the remains of the umbilical vessels become ligaments of the liver and bladder.' }),
  make('organ', 'digestive')({ id: 'peritoneum', name: 'Peritoneum', region: 'abdomen', desc: 'The thin, slippery membrane lining the abdominal cavity and wrapping the gut, about the same area as the skin. Its fluid lets organs slide; inflammation is peritonitis.' }),
  make('organ', 'digestive')({ id: 'omentum', name: 'Greater omentum', region: 'abdomen', desc: 'An apron of fatty peritoneum hanging from the stomach over the intestines. Called the “abdominal policeman”, it moves to wall off infections such as a burst appendix.' }),
  make('organ', 'digestive')({ id: 'mesentery', name: 'Mesentery', region: 'abdomen', desc: 'The fan-shaped fold that anchors the intestines to the back wall and carries their blood vessels, nerves and lymphatics.' }),
  make('organ', 'digestive')({ id: 'colon-parts', name: 'Colon: ascending, transverse, descending & sigmoid', region: 'abdomen', desc: 'The four parts of the colon that frame the abdomen. The S-shaped sigmoid colon is where diverticula and most colon cancers form.' }),
  make('organ', 'digestive')({ id: 'bile-ducts', name: 'Bile ducts', region: 'abdomen', desc: 'Tubes carrying bile from the liver and gallbladder to the duodenum, joined by the pancreatic duct at the ampulla. A stone stuck here causes jaundice.' }),
  make('organ', 'urinary')({ id: 'nephron', name: 'Nephron', region: 'abdomen', desc: 'The kidney’s filtering unit, about 1 million per kidney: a glomerulus that filters blood and a tubule that reclaims water, salts and glucose. Together they filter ~180 L a day.', el: { Na: 'Most filtered sodium is reabsorbed along the tubule', K: 'Potassium is fine-tuned in the collecting duct under aldosterone', Ca: 'Parathyroid hormone tells the tubule to reclaim calcium' } }),
  make('organ', 'cardiovascular')({ id: 'pericardium', name: 'Pericardium', region: 'chest', desc: 'The two-layered sac around the heart. A few spoonfuls of fluid between the layers let it beat without friction; fluid build-up can squeeze the heart (tamponade).' }),
  make('organ', 'respiratory')({ id: 'mediastinum', name: 'Mediastinum', region: 'chest', desc: 'The central compartment of the chest between the lungs, holding the heart, great vessels, trachea, esophagus, thymus and lymph nodes.' }),
  make('organ', 'lymphatic')({ id: 'axilla', name: 'Armpit (axilla)', region: 'chest', desc: 'The pyramid-shaped space under the shoulder that carries the arm’s main artery, vein, the brachial plexus and 20–40 lymph nodes checked for breast cancer spread.', count: 2 }),
  make('organ', 'lymphatic')({ id: 'groin', name: 'Groin (inguinal region)', region: 'pelvis', desc: 'The crease between abdomen and thigh. The inguinal canal passes through it; a weak spot here lets bowel bulge out as an inguinal hernia.', count: 2 }),
]

// ---------------- Named vessels ----------------
const vs = make('vessel', 'cardiovascular')
const VESSELS: Structure[] = [
  vs({ id: 'brachiocephalic', name: 'Brachiocephalic trunk', region: 'chest', desc: 'The first and largest branch of the aortic arch, on the right only. It splits behind the right collarbone into the right subclavian and right common carotid arteries.' }),
  vs({ id: 'cerebral-arteries', name: 'Cerebral & cerebellar arteries', region: 'head', desc: 'The anterior, middle and posterior cerebral arteries and the three pairs of cerebellar arteries, branching from the circle of Willis to cover the brain’s surface. A blocked middle cerebral artery is the most common cause of stroke.', count: 2 }),
  vs({ id: 'ophthalmic-a', name: 'Ophthalmic artery', region: 'head', desc: 'The first branch of the internal carotid inside the skull, supplying the eye, the retina (via the central retinal artery) and the forehead.', count: 2 }),
  vs({ id: 'neck-arteries', name: 'Thyroid & neck arteries (thyrocervical, costocervical)', region: 'neck', desc: 'Short trunks from the subclavian artery that feed the thyroid gland, the neck muscles and the shoulder blade region.', count: 2 }),
  vs({ id: 'axillary-a', name: 'Axillary artery & vein', region: 'arm', desc: 'The main vessels of the armpit, continuing from the subclavian and becoming the brachial vessels at the arm. Their branches supply the chest wall, shoulder and shoulder blade.', count: 2 }),
  vs({ id: 'chest-wall-vessels', name: 'Internal thoracic, intercostal & epigastric vessels', region: 'chest', desc: 'Vessels running under each rib and down the inside of the breastbone to the abdominal wall. The internal thoracic (mammary) artery is the favourite graft for heart bypass surgery.', count: 2 }),
  vs({ id: 'azygos', name: 'Azygos & lumbar veins', region: 'back', desc: 'An unpaired vein system up the right side of the spine draining the chest and back walls into the superior vena cava; a detour route if the vena cava is blocked.' }),
  vs({ id: 'celiac', name: 'Celiac trunk (hepatic, splenic, gastric arteries)', region: 'abdomen', desc: 'A short artery from the aorta that splits three ways to feed the stomach, liver, gallbladder, spleen and part of the pancreas: the blood supply of the foregut.' }),
  vs({ id: 'hepatic-veins', name: 'Hepatic veins', region: 'abdomen', desc: 'Three large veins draining the filtered blood from the liver straight into the inferior vena cava. Surgeons divide the liver into eight segments along them.' }),
  vs({ id: 'gonadal', name: 'Testicular / ovarian vessels', region: 'pelvis', desc: 'Long thin vessels from the aorta near the kidneys to the gonads, because the testes and ovaries start life near the kidneys and descend. Swollen testicular veins form a varicocele.', count: 2 }),
  vs({ id: 'hand-vessels', name: 'Palmar arches & digital vessels', region: 'hand', desc: 'Two arterial arches in the palm, fed by the radial and ulnar arteries, send digital arteries along each side of every finger. The Allen test checks both feed the hand.', count: 2 }),
  vs({ id: 'tibial-vessels', name: 'Tibial & fibular arteries and veins', region: 'leg', desc: 'The popliteal artery divides below the knee into the anterior and posterior tibial arteries and the fibular artery. Deep vein thrombosis usually starts in the matching calf veins.', count: 2 }),
  vs({ id: 'foot-vessels', name: 'Plantar arch & foot vessels', region: 'foot', desc: 'The plantar arteries and arch under the sole and the dorsal venous arch on top of the foot. The posterior tibial pulse is felt behind the inner ankle.', count: 2 }),
  vs({ id: 'small-saphenous', name: 'Small saphenous vein', region: 'leg', desc: 'The superficial vein running up the back of the calf from the outer ankle to the knee pit, a common site of varicose veins.', count: 2 }),
]

// ---------------- Nerves ----------------
type N = [id: string, name: string, region: Region, roots: string, supplies: string, desc: string, count?: number]
const N_DATA: N[] = [
  // Spinal nerves (31 pairs)
  ['cervical-spinal', 'Cervical spinal nerves (C1–C8)', 'neck', 'Cervical spinal cord', 'Neck, diaphragm, shoulder, arm and hand', 'Eight pairs, one more than the cervical vertebrae: C1–C7 exit above their vertebra and C8 below C7. They form the cervical and brachial plexuses.', 16],
  ['thoracic-spinal', 'Thoracic spinal nerves (T1–T12)', 'back', 'Thoracic spinal cord', 'Chest and abdominal wall, back skin', 'Twelve pairs that mostly stay separate as intercostal nerves, each supplying a band of skin (dermatome): T4 at the nipples, T10 at the navel.', 24],
  ['lumbar-spinal', 'Lumbar spinal nerves (L1–L5)', 'back', 'Lumbar spinal cord', 'Groin, front and inner thigh, knee, shin', 'Five pairs forming the lumbar plexus. A slipped disc at L4–L5 commonly pinches the L5 root, causing foot-drop weakness and shin pain.', 10],
  ['sacral-spinal', 'Sacral spinal nerves (S1–S5)', 'pelvis', 'Sacral spinal cord', 'Buttock, back of the leg, sole, genitals, bladder and bowel', 'Five pairs leaving through holes in the sacrum. S2–S4 control the bladder, bowel and sexual function (“S2, 3, 4 keeps the pee off the floor”).', 10],
  ['coccygeal-spinal', 'Coccygeal spinal nerve (Co1)', 'pelvis', 'Conus medullaris', 'Skin around the tailbone', 'The smallest and last spinal nerve pair.', 2],
  ['cauda-equina', 'Cauda equina', 'back', 'L2–Co1 roots', 'Legs, bladder, bowel, genitals', 'The “horse’s tail” of nerve roots hanging below the end of the spinal cord at L1–L2. Compression (cauda equina syndrome) is a surgical emergency.', 1],
  // Cervical plexus
  ['cervical-plexus', 'Cervical plexus', 'neck', 'C1–C4', 'Skin of the neck and ear, neck muscles, diaphragm (via phrenic)', 'A loop network in the neck giving off skin nerves through “Erb’s point” at the back of the sternocleidomastoid and motor branches to strap muscles.', 2],
  ['lesser-occipital', 'Lesser occipital nerve', 'neck', 'C2', 'Skin behind the ear', 'Hooks around the sternocleidomastoid to supply the scalp behind the ear; involved in some headaches.', 2],
  ['great-auricular', 'Great auricular nerve', 'neck', 'C2–C3', 'Skin over the ear and parotid gland', 'The largest skin branch of the cervical plexus, crossing the sternocleidomastoid to the ear lobe.', 2],
  ['transverse-cervical', 'Transverse cervical nerve', 'neck', 'C2–C3', 'Skin of the front of the neck', 'Crosses the neck horizontally under the platysma.', 2],
  ['supraclavicular-n', 'Supraclavicular nerves', 'neck', 'C3–C4', 'Skin over the collarbone and top of the shoulder', 'Fan down over the clavicle. Their shared root with the phrenic nerve explains shoulder-tip pain from diaphragm irritation.', 2],
  ['ansa-cervicalis', 'Ansa cervicalis', 'neck', 'C1–C3', 'Infrahyoid (strap) muscles', 'A nerve loop on the carotid sheath supplying the muscles that pull the hyoid and larynx down.', 2],
  ['greater-occipital', 'Greater occipital nerve', 'neck', 'C2 (dorsal ramus)', 'Skin of the back of the scalp', 'Rises through the neck muscles to the back of the head; irritation causes occipital neuralgia.', 2],
  // Brachial plexus branches
  ['dorsal-scapular', 'Dorsal scapular nerve', 'back', 'C5', 'Rhomboids and levator scapulae', 'Runs down along the inner border of the shoulder blade.', 2],
  ['long-thoracic', 'Long thoracic nerve', 'chest', 'C5–C7', 'Serratus anterior', 'Runs down the side of the chest wall. Injury makes the shoulder blade stick out like a wing (winged scapula).', 2],
  ['suprascapular-n', 'Suprascapular nerve', 'arm', 'C5–C6', 'Supraspinatus and infraspinatus', 'Passes through the notch on top of the shoulder blade to supply two rotator cuff muscles.', 2],
  ['pectoral-n', 'Lateral & medial pectoral nerves', 'chest', 'C5–T1', 'Pectoralis major and minor', 'Named for the cords they leave, not for their position: the medial nerve lies more laterally.', 4],
  ['subscapular-n', 'Upper & lower subscapular nerves', 'arm', 'C5–C6', 'Subscapularis and teres major', 'Short branches of the posterior cord on the front of the shoulder blade.', 4],
  ['thoracodorsal', 'Thoracodorsal nerve', 'back', 'C6–C8', 'Latissimus dorsi', 'Runs with its artery down the back of the armpit; surgeons use the muscle and nerve in breast reconstruction.', 2],
  ['medial-cutaneous', 'Medial cutaneous nerves of arm & forearm', 'arm', 'C8–T1', 'Skin of the inner arm and forearm', 'Pure sensory branches of the medial cord.', 4],
  ['anterior-interosseous', 'Anterior interosseous nerve', 'arm', 'C7–C8 (median)', 'Deep forearm flexors (FPL, half of FDP, pronator quadratus)', 'A pure motor branch of the median nerve; injury stops you making an “OK” sign.', 2],
  ['posterior-interosseous', 'Posterior interosseous nerve', 'arm', 'C7–C8 (radial)', 'Forearm extensors of the fingers and thumb', 'The deep branch of the radial nerve, passing through the supinator. Compression causes finger drop without wrist drop.', 2],
  ['superficial-radial', 'Superficial radial nerve', 'arm', 'C6–C8 (radial)', 'Skin on the back of the thumb side of the hand', 'Sensory branch of the radial nerve; tight watch straps or handcuffs can compress it.', 2],
  ['digital-nerves', 'Digital nerves of the fingers', 'hand', 'Median and ulnar nerves', 'Skin of the fingers', 'Two run along each side of every finger to the fingertip, which is why fingertips are so sensitive. A ring block anaesthetizes them.', 20],
  ['recurrent-median', 'Recurrent (thenar) branch of the median nerve', 'hand', 'C8–T1', 'Thumb muscles (APB, FPB, opponens)', 'Called the “million-dollar nerve”: cutting it in the palm loses thumb opposition.', 2],
  // Lumbar plexus
  ['lumbar-plexus', 'Lumbar plexus', 'back', 'L1–L4', 'Lower abdominal wall, groin, front and inner thigh', 'Forms inside the psoas major muscle and gives off the femoral, obturator and several skin nerves.', 2],
  ['iliohypogastric', 'Iliohypogastric nerve', 'abdomen', 'L1', 'Lower abdominal muscles, skin above the pubis and hip', 'Runs between the abdominal muscles; at risk in low abdominal incisions.', 2],
  ['ilioinguinal', 'Ilioinguinal nerve', 'pelvis', 'L1', 'Skin of the groin, upper thigh and front of scrotum or labia', 'Travels through the inguinal canal; can be trapped in hernia repairs.', 2],
  ['genitofemoral', 'Genitofemoral nerve', 'pelvis', 'L1–L2', 'Cremaster muscle; skin of scrotum or labia and upper thigh', 'Its genital branch triggers the cremasteric reflex: stroking the inner thigh raises the testis.', 2],
  ['lat-fem-cutaneous', 'Lateral femoral cutaneous nerve', 'leg', 'L2–L3', 'Skin of the outer thigh', 'Squeezed under the inguinal ligament by tight belts or weight gain, causing burning outer-thigh numbness (meralgia paresthetica).', 2],
  ['saphenous-n', 'Saphenous nerve', 'leg', 'L3–L4 (femoral)', 'Skin of the inner leg and foot', 'The longest branch of the femoral nerve, running with the great saphenous vein to the inner ankle.', 2],
  // Sacral plexus
  ['sacral-plexus', 'Sacral plexus', 'pelvis', 'L4–S4', 'Buttock, back of thigh, whole leg below the knee, pelvic floor', 'Forms on the piriformis muscle and gives off the sciatic, gluteal and pudendal nerves.', 2],
  ['superior-gluteal', 'Superior gluteal nerve', 'pelvis', 'L4–S1', 'Gluteus medius and minimus, tensor fasciae latae', 'Damage weakens the hip abductors so the pelvis drops on the other side when walking (Trendelenburg sign).', 2],
  ['inferior-gluteal', 'Inferior gluteal nerve', 'pelvis', 'L5–S2', 'Gluteus maximus', 'Exits below piriformis; injury makes climbing stairs and rising from a chair hard.', 2],
  ['post-fem-cutaneous', 'Posterior femoral cutaneous nerve', 'leg', 'S1–S3', 'Skin of the back of the thigh and buttock crease', 'Runs down the back of the thigh just under the fascia.', 2],
  ['deep-fibular', 'Deep fibular (peroneal) nerve', 'leg', 'L4–S1', 'Shin muscles (toe and foot lifters), skin between the 1st and 2nd toes', 'Injury causes foot drop and a numb web space between the big and second toes.', 2],
  ['superficial-fibular', 'Superficial fibular (peroneal) nerve', 'leg', 'L5–S1', 'Fibularis longus and brevis; skin of the top of the foot', 'Supplies the muscles that turn the sole outward and most of the skin on top of the foot.', 2],
  ['sural', 'Sural nerve', 'leg', 'S1–S2', 'Skin of the outer ankle and little-toe side of the foot', 'A pure sensory nerve so expendable that it is the standard site for nerve biopsies and grafts.', 2],
  ['plantar-nerves', 'Medial & lateral plantar nerves', 'foot', 'L4–S3 (tibial)', 'Muscles and skin of the sole', 'The two end branches of the tibial nerve, like the median and ulnar nerves of the hand. Compression between toes forms a painful Morton’s neuroma.', 4],
  ['dorsal-genital', 'Dorsal nerve of the penis / clitoris', 'pelvis', 'S2–S4 (pudendal)', 'Skin of the penis or clitoris', 'The end branch of the pudendal nerve carrying sexual sensation from the glans.', 2],
  ['inferior-rectal', 'Inferior rectal (anal) nerve', 'pelvis', 'S2–S4 (pudendal)', 'External anal sphincter, skin around the anus', 'Explains why the lower anal canal feels pain sharply while the rectum above does not.', 2],
  ['pelvic-splanchnic', 'Pelvic splanchnic nerves', 'pelvis', 'S2–S4', 'Bladder, rectum, erectile tissue (parasympathetic)', 'The parasympathetic outflow to the pelvis: they empty the bladder and cause erection (“point”), while sympathetic nerves cause ejaculation (“shoot”).', 2],
  // Cranial nerve branches
  ['v1', 'Ophthalmic nerve (V1)', 'head', 'Trigeminal nerve', 'Skin of forehead, upper eyelid, cornea and nose', 'The first trigeminal division, through the superior orbital fissure; its corneal branches trigger the blink reflex. Shingles here can threaten the eye.', 2],
  ['v2', 'Maxillary nerve (V2)', 'head', 'Trigeminal nerve', 'Skin of the cheek, upper lip, upper teeth, palate', 'Exits the skull through the foramen rotundum; the infraorbital branch emerges under the eye.', 2],
  ['v3', 'Mandibular nerve (V3)', 'head', 'Trigeminal nerve', 'Chewing muscles; skin of the jaw, lower lip and chin', 'The only trigeminal division with motor fibers, exiting through the foramen ovale to the muscles of mastication.', 2],
  ['inferior-alveolar', 'Inferior alveolar nerve', 'head', 'V3', 'Lower teeth; via the mental nerve, the lower lip and chin', 'Runs inside the mandible. A dentist’s lower injection numbs it, which is why your lip goes numb.', 2],
  ['lingual-n', 'Lingual nerve', 'head', 'V3 (+ chorda tympani)', 'Touch and taste on the front two-thirds of the tongue', 'Lies just under the gum near the wisdom teeth, so it can be injured during their removal.', 2],
  ['chorda-tympani', 'Chorda tympani', 'head', 'Facial nerve (CN VII)', 'Taste from the front of the tongue; submandibular and sublingual saliva', 'Crosses right through the middle ear behind the eardrum before joining the lingual nerve.', 2],
  ['facial-branches', 'Branches of the facial nerve', 'head', 'Facial nerve (CN VII)', 'All muscles of facial expression', 'Five branches fan out through the parotid gland: temporal, zygomatic, buccal, marginal mandibular and cervical (“To Zanzibar By Motor Car”).', 10],
  ['recurrent-laryngeal', 'Recurrent laryngeal nerve', 'neck', 'Vagus nerve (CN X)', 'All muscles of the larynx except cricothyroid', 'Loops under the aorta on the left (under the subclavian on the right) and climbs back to the voice box. Damage during thyroid surgery causes hoarseness.', 2],
  ['superior-laryngeal', 'Superior laryngeal nerve', 'neck', 'Vagus nerve (CN X)', 'Cricothyroid muscle; sensation above the vocal cords', 'Its external branch tunes voice pitch; injury makes high notes impossible.', 2],
  ['ciliary-ganglion', 'Ciliary ganglion', 'head', 'Oculomotor nerve (parasympathetic)', 'Pupil-constricting and focusing muscles of the eye', 'A tiny relay station behind the eye that controls pupil size and focusing for near vision.', 2],
  // Autonomic
  ['splanchnic', 'Thoracic splanchnic nerves', 'chest', 'T5–T12 (sympathetic)', 'Abdominal organs and adrenal medulla', 'Greater, lesser and least splanchnic nerves carry sympathetic signals from the chest chain to the abdominal ganglia.', 6],
  ['celiac-plexus', 'Celiac (solar) plexus', 'abdomen', 'Splanchnic and vagus nerves', 'Stomach, liver, pancreas, spleen, kidneys', 'The large nerve network around the celiac artery behind the stomach. A blow here knocks the wind out of you; doctors block it to ease pancreatic cancer pain.', 1],
  ['cardiac-plexus', 'Cardiac plexus', 'chest', 'Vagus and sympathetic trunk', 'Heart rate and force', 'A web of sympathetic (speed up) and vagal (slow down) fibers below the aortic arch that tunes every heartbeat.', 1],
  ['hypogastric-plexus', 'Hypogastric plexuses', 'pelvis', 'Sympathetic chain and pelvic splanchnics', 'Pelvic organs', 'Superior and inferior plexuses carrying the nerve supply of the bladder, rectum and sex organs; can be damaged in pelvic surgery.', 2],
  ['enteric', 'Enteric nervous system', 'abdomen', 'Within the gut wall', 'Gut movement, secretion and blood flow', 'The “second brain”: 200–600 million neurons in the gut wall that can run digestion on their own and make about 90% of the body’s serotonin.', 1],
]
const nv = make('nerve', 'nervous')
const NERVES: Structure[] = N_DATA.map(([id, name, region, roots, supplies, desc, count]) =>
  nv({ id, name, region, desc, count, facts: [['Roots / origin', roots], ['Supplies', supplies]] }),
)

export const MORE: Structure[] = [...joints, ...JOINT_PARTS, ...REPRO, ...HEAD, ...BRAIN, ...TRUNK, ...VESSELS, ...NERVES]

/** Cross-links for the new parts (made two-way in data/index.ts). */
export const MORE_LINKS: Record<string, string[]> = {
  penis: ['corpus-cavernosum', 'corpus-spongiosum', 'glans', 'foreskin', 'urethra', 'dorsal-genital', 'muscle-bulbospongiosus', 'muscle-ischiocavernosus', 'testis', 'prostate'],
  testis: ['scrotum', 'epididymis', 'vas-deferens', 'spermatic-cord', 'muscle-cremaster'],
  prostate: ['seminal-vesicle', 'bulbourethral', 'vas-deferens'],
  vulva: ['mons-pubis', 'labia-majora', 'labia-minora', 'clitoris', 'vagina', 'bartholin', 'urethra'],
  clitoris: ['corpus-cavernosum', 'dorsal-genital', 'muscle-ischiocavernosus'],
  vagina: ['cervix', 'uterus', 'muscle-bulbospongiosus', 'muscle-levator-ani'],
  uterus: ['cervix'],
  breast: ['nipple'],
  perineum: ['muscle-sup-trans-perineal', 'muscle-deep-trans-perineal', 'muscle-bulbospongiosus', 'anus', 'pudendal'],
  rectum: ['anus', 'muscle-ext-anal', 'inferior-rectal'],
  'joint-knee': ['menisci', 'acl', 'pcl', 'knee-collateral', 'patellar-tendon', 'bone-femur', 'bone-tibia', 'bone-patella', 'bursae', 'synovial', 'hyaline'],
  'joint-hip': ['labrum', 'bone-femur', 'bone-hip', 'synovial'],
  'joint-shoulder': ['labrum', 'rotator-cuff', 'bone-humerus', 'bone-scapula', 'muscle-supraspinatus', 'muscle-infraspinatus', 'muscle-teres-minor', 'muscle-subscapularis', 'bursae'],
  'joint-ankle': ['ankle-ligaments', 'achilles', 'bone-talus', 'bone-tibia', 'bone-fibula'],
  'joint-knuckles': ['bone-mc1', 'bone-hand-prox', 'digital-nerves', 'synovial'],
  'joint-pip': ['bone-hand-prox', 'bone-hand-mid'],
  'joint-dip': ['bone-hand-mid', 'bone-hand-dist', 'nail'],
  'joint-mtp': ['bone-mt1', 'bone-foot-prox'],
  'joint-tmj': ['bone-mandible', 'bone-temporal', 'muscle-masseter', 'muscle-lat-pterygoid'],
  'joint-wrist': ['carpal-tunnel', 'bone-radius', 'bone-scaphoid', 'bone-lunate'],
  'joint-elbow': ['bone-humerus', 'bone-ulna', 'bone-radius', 'ulnar'],
  'carpal-tunnel': ['median', 'recurrent-median'],
  larynx: ['epiglottis', 'vocal-cords', 'recurrent-laryngeal', 'superior-laryngeal', 'muscle-vocalis', 'muscle-cricothyroid', 'muscle-post-cricoarytenoid'],
  pharynx: ['muscle-constrictors', 'muscle-stylopharyngeus', 'uvula', 'tonsils', 'adenoids', 'eustachian'],
  eye: ['iris', 'sclera', 'conjunctiva', 'eyelids', 'lacrimal-gland', 'vitreous', 'eyelashes', 'v1', 'ciliary-ganglion'],
  cochlea: ['auricle', 'ear-canal', 'eustachian'],
  brain: ['frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe', 'insula', 'corpus-callosum', 'basal-ganglia', 'ventricles', 'meninges', 'midbrain', 'pons', 'medulla'],
  cerebrum: ['frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe', 'motor-cortex', 'sensory-cortex', 'broca', 'wernicke', 'cingulate'],
  brainstem: ['midbrain', 'pons', 'medulla', 'substantia-nigra', 'colliculi'],
  csf: ['ventricles', 'choroid-plexus', 'meninges'],
  'spinal-cord': ['cervical-spinal', 'thoracic-spinal', 'lumbar-spinal', 'sacral-spinal', 'coccygeal-spinal', 'cauda-equina', 'meninges'],
  'brachial-plexus': ['dorsal-scapular', 'long-thoracic', 'suprascapular-n', 'pectoral-n', 'subscapular-n', 'thoracodorsal', 'medial-cutaneous', 'musculocutaneous', 'axillary', 'radial-n', 'median', 'ulnar'],
  'radial-n': ['posterior-interosseous', 'superficial-radial'],
  median: ['anterior-interosseous', 'recurrent-median', 'digital-nerves', 'carpal-tunnel'],
  'lumbar-plexus': ['iliohypogastric', 'ilioinguinal', 'genitofemoral', 'lat-fem-cutaneous', 'femoral-n', 'obturator-n'],
  'femoral-n': ['saphenous-n'],
  'sacral-plexus': ['superior-gluteal', 'inferior-gluteal', 'post-fem-cutaneous', 'sciatic', 'pudendal', 'pelvic-splanchnic'],
  'fibular-n': ['deep-fibular', 'superficial-fibular'],
  'tibial-n': ['sural', 'plantar-nerves'],
  pudendal: ['dorsal-genital', 'inferior-rectal'],
  'cn-v': ['v1', 'v2', 'v3'],
  v3: ['inferior-alveolar', 'lingual-n'],
  'cn-vii': ['chorda-tympani', 'facial-branches'],
  'cn-x': ['recurrent-laryngeal', 'superior-laryngeal', 'cardiac-plexus', 'celiac-plexus'],
  sympathetic: ['splanchnic', 'celiac-plexus', 'cardiac-plexus', 'hypogastric-plexus'],
  'small-intestine': ['mesentery', 'enteric', 'peritoneum'],
  'large-intestine': ['colon-parts', 'omentum'],
  stomach: ['omentum', 'celiac-plexus'],
  liver: ['bile-ducts'],
  gallbladder: ['bile-ducts'],
  kidney: ['nephron'],
  heart: ['pericardium', 'cardiac-plexus', 'mediastinum'],
  teeth: ['gums', 'inferior-alveolar'],
  tongue: ['lingual-n', 'chorda-tympani', 'muscle-styloglossus', 'muscle-hyoglossus', 'muscle-palatoglossus', 'muscle-intrinsic-tongue'],
  nose: ['sinuses', 'nasal-septum', 'adenoids'],
  'hair-follicle': ['eyelashes', 'body-hair'],
}
