// All category / measurement definitions live here. Edit this file to tune
// the app: add fields, change weights, or flip fixable vs dealbreaker.
//
// Units: inches.
// Storage convention: everything is stored FLAT, as measured on the garment.
// Fields with `flat: true` (bust, waist, hip) are doubled at compare time to
// get the full circumference, since size charts usually list circumference.

export const UNIT = 'in';

// Measurement definitions, shared across categories.
//   label       shown in the UI
//   flat        stored flat; doubled when comparing against a size chart
//   weight      importance for a petite frame (higher = matters more)
//   tolerance   a difference within ± this many inches counts as a match
//   fix         'dealbreaker' or 'fixable'
//   fixableWhen for fixable fields: which direction a tailor can fix.
//               'larger' = fixable only if the item is bigger/longer than
//               your reference (you can hem or take in, not add fabric).
//   fixNote     what the alteration is called
export const MEASUREMENTS = {
  shoulder: { label: 'Shoulder width', weight: 3, tolerance: 0.25, fix: 'dealbreaker' },
  bust: { label: 'Bust', flat: true, weight: 3, tolerance: 0.5, fix: 'dealbreaker' },
  torsoLength: { label: 'Length from shoulder', weight: 2, tolerance: 0.5, fix: 'dealbreaker' },
  bodyLength: {
    label: 'Body length', weight: 1.5, tolerance: 0.5,
    fix: 'fixable', fixableWhen: 'larger', fixNote: 'hem',
  },
  sleeve: {
    label: 'Sleeve length', weight: 1, tolerance: 0.5,
    fix: 'fixable', fixableWhen: 'larger', fixNote: 'shorten sleeves',
  },
  waist: {
    label: 'Waist', flat: true, weight: 2, tolerance: 0.5,
    fix: 'fixable', fixableWhen: 'larger', fixNote: 'take in waist',
  },
  hip: { label: 'Hip', flat: true, weight: 2.5, tolerance: 0.5, fix: 'dealbreaker' },
  rise: { label: 'Front rise', weight: 2.5, tolerance: 0.25, fix: 'dealbreaker' },
  inseam: {
    label: 'Inseam', weight: 1, tolerance: 0.5,
    fix: 'fixable', fixableWhen: 'larger', fixNote: 'hem',
  },
  legOpening: {
    label: 'Leg opening', weight: 0.5, tolerance: 0.5,
    fix: 'fixable', fixableWhen: 'larger', fixNote: 'taper',
  },
  length: {
    label: 'Length', weight: 1, tolerance: 0.5,
    fix: 'fixable', fixableWhen: 'larger', fixNote: 'hem',
  },
};

export const CATEGORIES = [
  { id: 'tops', label: 'Tops and sweaters', fields: ['shoulder', 'bust', 'sleeve', 'bodyLength'] },
  { id: 'jackets', label: 'Blazers and jackets', fields: ['shoulder', 'bust', 'sleeve', 'bodyLength', 'waist'] },
  { id: 'dresses', label: 'Dresses', fields: ['shoulder', 'bust', 'waist', 'hip', 'torsoLength'] },
  { id: 'pants', label: 'Pants and jeans', fields: ['waist', 'hip', 'rise', 'inseam', 'legOpening'] },
  { id: 'skirts', label: 'Skirts', fields: ['waist', 'hip', 'length'] },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

// Fabric warnings. Each rule gets the parsed composition ({ fiber: percent })
// and the garment category, and returns a message or null.
// Fiber names are normalised through FIBER_ALIASES first.
export const FIBER_ALIASES = {
  spandex: 'elastane',
  lycra: 'elastane',
  rayon: 'viscose',
  modal: 'viscose',
  lyocell: 'viscose',
  tencel: 'viscose',
  flax: 'linen',
  merino: 'wool',
  cashmere: 'wool',
  poly: 'polyester',
};

const STRETCH = ['elastane'];

export const FABRIC_RULES = [
  (c) => {
    const plant = (c.cotton ?? 0) + (c.linen ?? 0);
    const stretch = STRETCH.reduce((s, f) => s + (c[f] ?? 0), 0);
    return plant >= 90 && stretch === 0
      ? { level: 'warn', text: 'Mostly cotton/linen: likely to shrink. Wash cold, or allow a little extra length.' }
      : null;
  },
  (c) =>
    (c.viscose ?? 0) >= 50
      ? { level: 'warn', text: 'Viscose-heavy: can shrink in length when washed. Wash cold, hang dry.' }
      : null,
  (c) =>
    STRETCH.some((f) => (c[f] ?? 0) >= 2)
      ? { level: 'info', text: 'Contains stretch: a slightly smaller measurement can still fit.' }
      : null,
  (c, category) =>
    category === 'tops' && (c.acrylic ?? 0) >= 30
      ? { level: 'warn', text: 'High acrylic in a sweater tends to pill.' }
      : null,
];
