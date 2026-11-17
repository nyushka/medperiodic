# Corpus Atlas

An interactive, cyberpunk-styled study tool for the human body. Explore every bone, major muscle, cell type, organ, vessel, nerve and skin and hair structure, and see which elements of the periodic table are found in each one. For every element you get its electron configuration, features, deficiency signs, who usually runs low, and how to get more of it, plus its links to vitamins.

> Educational reference, not medical advice. Intake values follow the US National Academies / NIH Office of Dietary Supplements (adults 19–50).

## What's inside

| Content | Count |
| --- | --- |
| Bones | all **206** (every vertebra C1–L5, all 12 rib pairs, all 8 carpals and 7 tarsals, metacarpals, metatarsals, phalanges, ossicles, hyoid) |
| Muscles | **132**, each with origin, insertion, action and nerve supply |
| Cell types & blood components | **96**: red and white blood cells, platelets, neurons, glia, rods/cones, osteoblasts, hepatocytes, beta cells, sperm, egg and more, each with size, lifespan and count |
| Organs & tissues | brain regions, senses, glands, heart chambers, gut, kidneys, reproductive organs, cartilage, marrow, myelin, microbiome |
| Vessels & nerves | major arteries and veins, all 12 cranial nerves, limb nerves |
| Skin & hair | 5 epidermal layers, dermis, hair follicle (bulb, dermal papilla, shaft, arrector pili, sebaceous gland), sweat glands, nails, touch receptors |
| Elements | all **118** on the periodic table with computed electron configurations; **34** body elements with full biology (bulk, major minerals, trace, ultratrace and toxic contaminants) |
| Vitamins | all **13**, with the elements in each molecule and their mineral partners |

### Features

- **Interactive body scan**: switch between skeleton, muscles, organs, blood & lymph, nerves and region layers, then tap any structure. Zoom into the head, chest, hand or foot to reach individual carpals and phalanges.
- **Element panels**: animated Bohr model, full and noble-gas electron configuration, Hund's-rule orbital diagram, valence and unpaired electrons, electronegativity, oxidation states and physical properties. For body elements you also get body amount, functions, where it's concentrated, deficiency symptoms, at-risk groups, toxicity, RDA/UL, food sources with amounts, how to boost absorption, what blocks it, and vitamin links.
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

Build a single self-contained HTML file (`dist/corpus-atlas.html`) you can open directly or share:

```bash
npm run build:single
```

## Project layout

```
src/
  data/periodic.ts       all 118 elements
  data/bodyElements.ts   biology of 34 body elements
  data/vitamins.ts       13 vitamins
  data/bones.ts          206 bones
  data/muscles.ts        132 muscles
  data/cells.ts          cell types
  data/anatomy.ts        organs, vessels, nerves, skin, tissues, blood
  data/types.ts          shared types + default element roles per structure kind
  lib/electrons.ts       electron configuration engine
  components/            body map, element/vitamin panels, periodic table, study aids
```
