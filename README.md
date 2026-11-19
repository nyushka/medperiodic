# MedPeriodic

An interactive study tool that connects human anatomy to the periodic table. Explore a real 3D model of the body (2,237 individually selectable pieces from BodyParts3D) along with every bone, major muscle, cell type, organ, vessel, nerve and skin and hair structure, and see which elements of the periodic table are found in each one. For every element you get its electron configuration, features, deficiency signs, who usually runs low, and how to get more of it, plus its links to vitamins.

> Educational reference, not medical advice. Intake values follow the US National Academies / NIH Office of Dietary Supplements (adults 19–50).

## What's inside

| Content | Count |
| --- | --- |
| 3D model | **2,237** selectable pieces, 2.33 M triangles, 23.5 MB, loaded progressively by body system |
| Bones | all **206** (every vertebra C1–L5, all 12 rib pairs, all 8 carpals and 7 tarsals, metacarpals, metatarsals, phalanges, ossicles, hyoid) |
| Muscles | **184** entries (covering all 446 muscle pieces of the model), each with origin, insertion, action and nerve supply |
| Face | **35** muscle meshes for the face and scalp (temporalis, masseter, frontalis, orbicularis oculi and oris, zygomaticus, buccinator and the rest), generated onto the model's skull by `scripts/build-face.mjs` because the source meshes have none |
| Foramina | **29** foramina and canals with what passes through each; the visible ones (supraorbital, infraorbital, mental, mandibular, foramen magnum, ear canal) are marked on the 3D skull |
| Joints | **26**, from skull sutures and the jaw joint to the knuckles (MCP, PIP, DIP), knee, ankle and toe joints, plus menisci, cruciate ligaments, labrum, rotator cuff, Achilles tendon and plantar fascia |
| Cell types & blood components | **96**: red and white blood cells, platelets, neurons, glia, rods/cones, osteoblasts, hepatocytes, beta cells, sperm, egg and more, each with size, lifespan and count |
| Organs & tissues | **174**: brain lobes, basal ganglia and brainstem parts, eye and ear parts, mouth and throat (lips, gums, palate, uvula, pharynx, epiglottis, vocal cords), heart, gut, kidneys, male and female external and internal genitals, cartilage, marrow, myelin, microbiome |
| Vessels & nerves | **38** vessel groups covering all 1,043 vessel pieces of the model; **84** nerves: all 12 cranial nerves and their main branches, all 31 pairs of spinal nerves, the cervical, brachial, lumbar and sacral plexuses with their named branches, and the autonomic plexuses |
| Search | understands everyday names: *kneecap*, *knuckles*, *belly button*, *collarbone*, *penis*, *nail*, *funny bone* and ~400 more find the right structure |
| Flashcards | **2,893** cards in 17 decks by body section (head, neck, chest, abdomen, pelvis, back, upper and lower limbs, cells, elements, vitamins…), plus custom AI-generated decks |
| Skin & hair | 5 epidermal layers, dermis, hair follicle (bulb, dermal papilla, shaft, arrector pili, sebaceous gland), sweat glands, nails, touch receptors |
| Elements | all **118** on the periodic table with computed electron configurations; **34** body elements with full biology (bulk, major minerals, trace, ultratrace and toxic contaminants) |
| Vitamins | all **13**, with the elements in each molecule and their mineral partners |

### Features

- **Study mode**: Anki-style flashcards with spaced repetition (Again / Hard / Good / Easy, SM-2 scheduling), multiple-choice quizzes with distractors drawn from the same deck, and a browse view. Decks are generated from the atlas and grouped by body section. **Custom decks**: type any topic and Claude writes flashcards and a quiz (inside claude.ai it uses the viewer's own Claude account; elsewhere you can paste an Anthropic API key, stored only in your browser), or write cards by hand. Progress is saved per profile in the browser.

- **3D anatomy viewer** (Three.js): a 2.3-million-triangle model of the adult male body with 2,237 individually selectable pieces (every bone, 446 muscle pieces, organs, brain regions, 639 arteries, 404 veins and nerves). Rotate, zoom and pan; switch body systems on and off with opacity sliders; use quick-study presets, anterior/posterior/side and region views, isolate or hide a structure, an exploded view, and textbook callout labels. Selecting a buried structure fades the layers that cover it.
- **3D atom** for every element: a nucleus of protons and neutrons with electrons orbiting on tilted shells, or the true 3D shapes of its valence s, p, d or f orbitals (computed from real spherical harmonics, lobes colored by wavefunction sign, opacity showing how many electrons each orbital holds).
- **3D cell models**: lit, rotatable procedural models of each cell type (biconcave red blood cell, myelinated neuron, multinucleated muscle fiber, ciliated epithelium, sperm, egg with corona, fat cell…), with rendered 3D thumbnails in cell lists.
- **Element panels**: tabbed Overview / Atom / Health / Food / In the body, with full and noble-gas electron configuration, Hund's-rule orbital diagram, valence and unpaired electrons, electronegativity, oxidation states and physical properties. For body elements you also get body amount, functions, where it's concentrated, deficiency symptoms, at-risk groups, toxicity, RDA/UL, food sources with amounts, how to boost absorption, what blocks it, and vitamin links.
- **Periodic table** colored by role in the body or by chemical family, plus a body-composition bar.
- **Study aids**: figure captions, "how to read an electron configuration", key-term glossaries for each kind of structure, and explanations of RDA / AI / UL.
- Electron configurations come from an Aufbau (Madelung) engine with the real ground-state exceptions (Cr, Cu, Mo, Pd, Ag, Au, Pt, Gd, U and others).

## Run it

```bash
npm install
```

```bash
npm run dev
```

Build a static site into `dist/`:

```bash
npm run build
```

The 3D model is fetched from `model/`, so serve `dist/` over HTTP (for example `npm run preview`) rather than opening the file directly.

To rebuild the model pack from its sources (`@dagno/anatomy-model` 0.1.2 and `open-anatomy-3d` 0.1.0 tarballs, downloaded with `npm pack` and unpacked):

```bash
node scripts/build-model.mjs path/to/anatomy-model/model path/to/open-anatomy-3d/models/anatomy-male.glb
```

## Project layout

```
src/
  data/periodic.ts       all 118 elements
  data/bodyElements.ts   biology of 34 body elements
  data/vitamins.ts       13 vitamins
  data/bones.ts          206 bones
  data/muscles.ts        184 muscles
  data/cells.ts          cell types
  data/anatomy.ts        organs, vessels, nerves, skin, tissues, blood
  data/more.ts           joints, genitals, mouth/throat/eye/ear parts, brain regions, vessels, all spinal and peripheral nerves
  data/aliases.ts        everyday names (kneecap, belly button…) and the ranked search
  data/types.ts          shared types + default element roles per structure kind
  lib/electrons.ts       electron configuration engine
  lib/model.ts           loads and decodes the 3D model packs
  lib/scene.ts           Three.js scene: lighting, materials, picking, camera, explode
  lib/meshMatch.ts       links each 3D piece to its anatomy entry
  lib/flashcards.ts      decks by body section, spaced repetition, quiz builder
  lib/ai.ts              AI deck generation (claude.ai sample capability or Anthropic SDK with your key)
  components/            3D viewer, element/vitamin panels, periodic table, study aids
public/model/            repacked BodyParts3D model (CC BY 4.0, see ATTRIBUTION.md)
```

## Credits

3D anatomy: BodyParts3D © The Database Center for Life Science (CC BY 4.0), via Human Atlas (`@dagno/anatomy-model`) and open-anatomy-3d. See [ATTRIBUTION.md](ATTRIBUTION.md).
