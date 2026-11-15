import { MEASUREMENTS, categoryById, UNIT } from '../config.js';

const num = (v) => {
  if (v === '' || v == null) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// Value of a closet garment's field, in the same terms as the size chart.
// Closet values are stored flat; if the chart is in circumference, double them.
function referenceValue(garment, field, chartIsCircumference) {
  const v = num(garment.measurements?.[field]);
  if (v == null) return null;
  return MEASUREMENTS[field].flat && chartIsCircumference ? v * 2 : v;
}

// Status of a single difference (item minus reference):
//   'match'       within tolerance
//   'fixable'     off, but a tailor can fix it in this direction
//   'dealbreaker' off in a way that can't be fixed
export function classify(field, diff) {
  const def = MEASUREMENTS[field];
  if (Math.abs(diff) <= def.tolerance) return 'match';
  if (def.fix === 'fixable') {
    const ok = def.fixableWhen === 'larger' ? diff > 0 : true;
    return ok ? 'fixable' : 'dealbreaker';
  }
  return 'dealbreaker';
}

const fmt = (n) => {
  const a = Math.abs(n);
  const r = Math.round(a * 4) / 4;
  return `${r}${UNIT === 'in' ? '"' : ' cm'}`;
};

const LENGTHY = new Set(['bodyLength', 'sleeve', 'inseam', 'length', 'torsoLength', 'rise']);

export function describe(field, diff, status) {
  const def = MEASUREMENTS[field];
  const name = def.label;
  if (status === 'match') return `${name} is spot on`;
  const word = LENGTHY.has(field)
    ? diff > 0 ? 'too long' : 'too short'
    : diff > 0 ? 'too big' : 'too small';
  const fix = status === 'fixable' && def.fixNote ? ` (fixable: ${def.fixNote})` : '';
  return `${name} is ${fmt(diff)} ${word}${fix}`;
}

// Compare one size-chart row against one closet garment.
// Returns null if they share no measured fields.
export function compareRow(row, garment, category, chartIsCircumference) {
  const fields = categoryById(category).fields;
  const lines = [];
  let penalty = 0;
  let weightUsed = 0;
  for (const field of fields) {
    const item = num(row.values?.[field]);
    const ref = referenceValue(garment, field, chartIsCircumference);
    if (item == null || ref == null) continue;
    const def = MEASUREMENTS[field];
    const diff = item - ref;
    const status = classify(field, diff);
    const over = Math.max(0, Math.abs(diff) - def.tolerance);
    // Dealbreakers cost double so a fixable miss never outranks one.
    penalty += over * def.weight * (status === 'dealbreaker' ? 2 : 1);
    weightUsed += def.weight;
    lines.push({ field, item, ref, diff, status, text: describe(field, diff, status) });
  }
  if (lines.length === 0) return null;
  const dealbreakers = lines.filter((l) => l.status === 'dealbreaker').length;
  const fixables = lines.filter((l) => l.status === 'fixable').length;
  return {
    garment,
    lines,
    penalty,
    // Penalty per unit of weight compared, so a piece with fewer measurements
    // filled in doesn't win just by having less to disagree on.
    score: penalty / weightUsed,
    coverage: weightUsed,
    dealbreakers,
    fixables,
    verdict: dealbreakers > 0 ? 'no' : fixables > 0 ? 'tailor' : 'yes',
  };
}

// For one size row, find the closest closet garment (lowest penalty).
// If `onlyGarmentId` is set, compare against that piece only.
export function bestMatchForRow(row, closet, category, chartIsCircumference, onlyGarmentId) {
  const pool = closet.filter(
    (g) => g.category === category && (!onlyGarmentId || g.id === onlyGarmentId),
  );
  let best = null;
  for (const g of pool) {
    const r = compareRow(row, g, category, chartIsCircumference);
    if (!r) continue;
    if (
      !best ||
      r.score < best.score ||
      (r.score === best.score && r.coverage > best.coverage)
    ) best = r;
  }
  return best;
}
