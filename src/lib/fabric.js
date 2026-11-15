import { FABRIC_RULES, FIBER_ALIASES } from '../config.js';

// "60% cotton, 35% polyester, 5% spandex" -> { cotton: 60, polyester: 35, elastane: 5 }
// Also accepts "cotton 60%" ordering and "100% Linen".
export function parseComposition(text = '') {
  const out = {};
  const re = /(\d+(?:\.\d+)?)\s*%\s*([a-z]+)|([a-z]+)\s*(\d+(?:\.\d+)?)\s*%/gi;
  let m;
  while ((m = re.exec(text))) {
    const pct = parseFloat(m[1] ?? m[4]);
    let fiber = (m[2] ?? m[3]).toLowerCase();
    fiber = FIBER_ALIASES[fiber] ?? fiber;
    out[fiber] = (out[fiber] ?? 0) + pct;
  }
  return out;
}

export function fabricNotes(text, category) {
  const comp = parseComposition(text);
  if (Object.keys(comp).length === 0) return [];
  return FABRIC_RULES.map((rule) => rule(comp, category)).filter(Boolean);
}
