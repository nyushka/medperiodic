// All 118 elements: symbol, name, standard atomic weight.
// Positions, blocks and electron configurations are computed in lib/electrons.ts.

export type ElementCategory =
  | 'alkali metal'
  | 'alkaline earth metal'
  | 'transition metal'
  | 'post-transition metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble gas'
  | 'lanthanide'
  | 'actinide'

export interface BasicElement {
  z: number
  symbol: string
  name: string
  mass: number
  category: ElementCategory
  group: number | null // null for f-block
  period: number
}

const RAW: [string, string, number][] = [
  ['H', 'Hydrogen', 1.008], ['He', 'Helium', 4.0026], ['Li', 'Lithium', 6.94], ['Be', 'Beryllium', 9.0122],
  ['B', 'Boron', 10.81], ['C', 'Carbon', 12.011], ['N', 'Nitrogen', 14.007], ['O', 'Oxygen', 15.999],
  ['F', 'Fluorine', 18.998], ['Ne', 'Neon', 20.180], ['Na', 'Sodium', 22.990], ['Mg', 'Magnesium', 24.305],
  ['Al', 'Aluminium', 26.982], ['Si', 'Silicon', 28.085], ['P', 'Phosphorus', 30.974], ['S', 'Sulfur', 32.06],
  ['Cl', 'Chlorine', 35.45], ['Ar', 'Argon', 39.948], ['K', 'Potassium', 39.098], ['Ca', 'Calcium', 40.078],
  ['Sc', 'Scandium', 44.956], ['Ti', 'Titanium', 47.867], ['V', 'Vanadium', 50.942], ['Cr', 'Chromium', 51.996],
  ['Mn', 'Manganese', 54.938], ['Fe', 'Iron', 55.845], ['Co', 'Cobalt', 58.933], ['Ni', 'Nickel', 58.693],
  ['Cu', 'Copper', 63.546], ['Zn', 'Zinc', 65.38], ['Ga', 'Gallium', 69.723], ['Ge', 'Germanium', 72.630],
  ['As', 'Arsenic', 74.922], ['Se', 'Selenium', 78.971], ['Br', 'Bromine', 79.904], ['Kr', 'Krypton', 83.798],
  ['Rb', 'Rubidium', 85.468], ['Sr', 'Strontium', 87.62], ['Y', 'Yttrium', 88.906], ['Zr', 'Zirconium', 91.224],
  ['Nb', 'Niobium', 92.906], ['Mo', 'Molybdenum', 95.95], ['Tc', 'Technetium', 98], ['Ru', 'Ruthenium', 101.07],
  ['Rh', 'Rhodium', 102.91], ['Pd', 'Palladium', 106.42], ['Ag', 'Silver', 107.87], ['Cd', 'Cadmium', 112.41],
  ['In', 'Indium', 114.82], ['Sn', 'Tin', 118.71], ['Sb', 'Antimony', 121.76], ['Te', 'Tellurium', 127.60],
  ['I', 'Iodine', 126.90], ['Xe', 'Xenon', 131.29], ['Cs', 'Caesium', 132.91], ['Ba', 'Barium', 137.33],
  ['La', 'Lanthanum', 138.91], ['Ce', 'Cerium', 140.12], ['Pr', 'Praseodymium', 140.91], ['Nd', 'Neodymium', 144.24],
  ['Pm', 'Promethium', 145], ['Sm', 'Samarium', 150.36], ['Eu', 'Europium', 151.96], ['Gd', 'Gadolinium', 157.25],
  ['Tb', 'Terbium', 158.93], ['Dy', 'Dysprosium', 162.50], ['Ho', 'Holmium', 164.93], ['Er', 'Erbium', 167.26],
  ['Tm', 'Thulium', 168.93], ['Yb', 'Ytterbium', 173.05], ['Lu', 'Lutetium', 174.97], ['Hf', 'Hafnium', 178.49],
  ['Ta', 'Tantalum', 180.95], ['W', 'Tungsten', 183.84], ['Re', 'Rhenium', 186.21], ['Os', 'Osmium', 190.23],
  ['Ir', 'Iridium', 192.22], ['Pt', 'Platinum', 195.08], ['Au', 'Gold', 196.97], ['Hg', 'Mercury', 200.59],
  ['Tl', 'Thallium', 204.38], ['Pb', 'Lead', 207.2], ['Bi', 'Bismuth', 208.98], ['Po', 'Polonium', 209],
  ['At', 'Astatine', 210], ['Rn', 'Radon', 222], ['Fr', 'Francium', 223], ['Ra', 'Radium', 226],
  ['Ac', 'Actinium', 227], ['Th', 'Thorium', 232.04], ['Pa', 'Protactinium', 231.04], ['U', 'Uranium', 238.03],
  ['Np', 'Neptunium', 237], ['Pu', 'Plutonium', 244], ['Am', 'Americium', 243], ['Cm', 'Curium', 247],
  ['Bk', 'Berkelium', 247], ['Cf', 'Californium', 251], ['Es', 'Einsteinium', 252], ['Fm', 'Fermium', 257],
  ['Md', 'Mendelevium', 258], ['No', 'Nobelium', 259], ['Lr', 'Lawrencium', 266], ['Rf', 'Rutherfordium', 267],
  ['Db', 'Dubnium', 268], ['Sg', 'Seaborgium', 269], ['Bh', 'Bohrium', 270], ['Hs', 'Hassium', 277],
  ['Mt', 'Meitnerium', 278], ['Ds', 'Darmstadtium', 281], ['Rg', 'Roentgenium', 282], ['Cn', 'Copernicium', 285],
  ['Nh', 'Nihonium', 286], ['Fl', 'Flerovium', 289], ['Mc', 'Moscovium', 290], ['Lv', 'Livermorium', 293],
  ['Ts', 'Tennessine', 294], ['Og', 'Oganesson', 294],
]

const METALLOIDS = new Set(['B', 'Si', 'Ge', 'As', 'Sb', 'Te'])
const NONMETALS = new Set(['H', 'C', 'N', 'O', 'P', 'S', 'Se'])
const HALOGENS = new Set(['F', 'Cl', 'Br', 'I', 'At', 'Ts'])

function periodOf(z: number): number {
  if (z <= 2) return 1
  if (z <= 10) return 2
  if (z <= 18) return 3
  if (z <= 36) return 4
  if (z <= 54) return 5
  if (z <= 86) return 6
  return 7
}

function groupOf(z: number): number | null {
  const p = periodOf(z)
  const starts = [0, 1, 3, 11, 19, 37, 55, 87]
  const i = z - starts[p] // 0-based index within period
  if (p === 1) return z === 1 ? 1 : 18
  if (p <= 3) return i < 2 ? i + 1 : i + 11
  if (p <= 5) return i + 1
  // periods 6 and 7 include 14 f-block elements after group 2
  if (i < 2) return i + 1
  if (i < 17) return i === 2 ? 3 : null // La/Ac sit in group 3 here; Ce–Lu, Th–Lr are f-block
  return i - 13
}

function categoryOf(sym: string, z: number, group: number | null, period: number): ElementCategory {
  if (z >= 57 && z <= 71) return 'lanthanide'
  if (z >= 89 && z <= 103) return 'actinide'
  if (HALOGENS.has(sym)) return 'halogen'
  if (group === 18) return 'noble gas'
  if (METALLOIDS.has(sym)) return 'metalloid'
  if (NONMETALS.has(sym)) return 'nonmetal'
  if (group === 1) return 'alkali metal'
  if (group === 2) return 'alkaline earth metal'
  if (group !== null && group >= 3 && group <= 12) return 'transition metal'
  void period
  return 'post-transition metal'
}

export const PERIODIC: BasicElement[] = RAW.map(([symbol, name, mass], idx) => {
  const z = idx + 1
  const period = periodOf(z)
  const group = groupOf(z)
  return { z, symbol, name, mass, period, group, category: categoryOf(symbol, z, group, period) }
})

export const BY_SYMBOL: Record<string, BasicElement> = Object.fromEntries(PERIODIC.map((e) => [e.symbol, e]))

/** Grid position for the standard 18-column layout (row 9/10 = lanthanides/actinides). */
export function gridPos(e: BasicElement): { row: number; col: number } {
  if (e.z >= 58 && e.z <= 71) return { row: 9, col: e.z - 58 + 4 }
  if (e.z >= 90 && e.z <= 103) return { row: 10, col: e.z - 90 + 4 }
  return { row: e.period, col: e.group ?? 3 }
}

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali metal': '#d0694a',
  'alkaline earth metal': '#d39a3a',
  'transition metal': '#b75a7c',
  'post-transition metal': '#7d8a96',
  metalloid: '#3f9aa6',
  nonmetal: '#4f9a5c',
  halogen: '#b79a2c',
  'noble gas': '#7a6fb8',
  lanthanide: '#4f9c8f',
  actinide: '#b56a6a',
}
