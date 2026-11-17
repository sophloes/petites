import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, MEASUREMENTS, UNIT, categoryById } from '../config.js';
import { bestMatchForRow } from '../lib/compare.js';
import { load, save, newId } from '../lib/storage.js';
import FabricNotes from '../components/FabricNotes.jsx';
import { Hero, SketchCircle } from '../components/Sketch.jsx';

const emptyRow = () => ({ id: newId(), size: '', values: {} });

const initialDraft = () => ({
  category: CATEGORIES[0].id,
  chartIsCircumference: true,
  referenceId: '', // '' = closest piece per size
  composition: '',
  price: '',
  rows: [emptyRow()],
});

const VERDICT = {
  yes: 'Should fit',
  tailor: 'Fits with tailoring',
  no: 'Dealbreaker',
};

const unit = UNIT === 'in' ? '"' : ' cm';
const signed = (n) => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(Math.round(n * 4) / 4)}${unit}`;

export default function Compare({ closet }) {
  // The draft is saved so a half-typed size chart survives closing the tab.
  const [d, setD] = useState(() => load('compareDraft', initialDraft()));
  useEffect(() => save('compareDraft', d), [d]);

  const cat = categoryById(d.category);
  const pieces = closet.filter((g) => g.category === d.category);
  const hasFlat = cat.fields.some((f) => MEASUREMENTS[f].flat);

  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const setRow = (id, patch) =>
    setD((x) => ({ ...x, rows: x.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const setVal = (id, f, v) =>
    setD((x) => ({
      ...x,
      rows: x.rows.map((r) => (r.id === id ? { ...r, values: { ...r.values, [f]: v } } : r)),
    }));

  const results = useMemo(
    () =>
      d.rows.map((row) => ({
        row,
        match: bestMatchForRow(row, closet, d.category, d.chartIsCircumference, d.referenceId),
      })),
    [d, closet],
  );

  // Best size: no dealbreakers preferred, then lowest score.
  const bestRowId = useMemo(() => {
    const scored = results.filter((r) => r.match);
    if (!scored.length) return null;
    const rank = (m) => [m.dealbreakers, m.score];
    scored.sort((a, b) => {
      const [a1, a2] = rank(a.match);
      const [b1, b2] = rank(b.match);
      return a1 - b1 || a2 - b2;
    });
    return scored[0].row.id;
  }, [results]);

  const best = results.find((r) => r.row.id === bestRowId);
  const tone = { yes: 'ok', tailor: 'warn', no: 'bad' };

  return (
    <section>
      <Hero
        big={best ? best.row.size || '?' : '—'}
        title={best ? 'Best size' : 'Compare'}
        subtitle={
          best
            ? `vs ${best.match.garment.name || best.match.garment.brand || 'your piece'}`
            : 'Type in a size chart below'
        }
        note={best ? 'closest to your closet' : null}
        status={best ? `Status: ${VERDICT[best.match.verdict]}` : null}
        statusTone={best ? tone[best.match.verdict] : 'ok'}
      />

      <label>
        Category
        <select
          value={d.category}
          onChange={(e) => setD((x) => ({ ...x, category: e.target.value, referenceId: '' }))}
        >
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      {pieces.length === 0 ? (
        <p className="empty">
          You have no {cat.label.toLowerCase()} in your closet yet. Add one first to compare against.
        </p>
      ) : (
        <label>
          Compare against
          <select value={d.referenceId} onChange={(e) => set('referenceId', e.target.value)}>
            <option value="">Closest piece for each size</option>
            {pieces.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name || g.brand || 'Unnamed'}{g.size ? ` (${g.size})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      {hasFlat && (
        <div className="toggle">
          <span>The chart lists bust / waist / hip as</span>
          <div className="seg">
            <button
              type="button"
              className={d.chartIsCircumference ? 'on' : ''}
              onClick={() => set('chartIsCircumference', true)}
            >
              All the way round
            </button>
            <button
              type="button"
              className={!d.chartIsCircumference ? 'on' : ''}
              onClick={() => set('chartIsCircumference', false)}
            >
              Flat (half)
            </button>
          </div>
        </div>
      )}

      <h3 className="section-label">Size chart <span className="muted">/ {UNIT}</span></h3>
      {results.map(({ row, match }) => (
        <div key={row.id} className={`size-row ${row.id === bestRowId ? 'best' : ''}`}>
          <div className="row-between">
            {row.id === bestRowId && <SketchCircle />}
            <input
              className="size-label"
              value={row.size}
              onChange={(e) => setRow(row.id, { size: e.target.value })}
              placeholder="Size (e.g. XS)"
            />
            {d.rows.length > 1 && (
              <button
                type="button"
                className="link"
                onClick={() => set('rows', d.rows.filter((r) => r.id !== row.id))}
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid2">
            {cat.fields.map((f) => {
              const line = match?.lines.find((l) => l.field === f);
              return (
                <label key={f} className={line ? `st-${line.status}` : ''}>
                  {MEASUREMENTS[f].label}
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.25"
                    min="0"
                    value={row.values[f] ?? ''}
                    onChange={(e) => setVal(row.id, f, e.target.value)}
                  />
                  {line && (
                    <span className="diff">
                      {signed(line.diff)} vs {Math.round(line.ref * 4) / 4}{unit}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {match && (
            <div className={`verdict v-${match.verdict}`}>
              <div className="verdict-head">
                <strong>{VERDICT[match.verdict]}</strong>
                {row.id === bestRowId && <span className="hand best-note">← best size</span>}
              </div>
              <div className="muted small">
                vs {match.garment.name || match.garment.brand || 'your piece'}
                {match.garment.size ? ` (${match.garment.size})` : ''}
              </div>
              <ul>
                {match.lines.map((l) => (
                  <li key={l.field} className={`st-${l.status}`}>{l.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={() => set('rows', [...d.rows, emptyRow()])}>
        + Add size
      </button>

      <h3 className="section-label">Fabric</h3>
      <label>
        Composition
        <input
          value={d.composition}
          onChange={(e) => set('composition', e.target.value)}
          placeholder="70% viscose, 30% polyester"
        />
      </label>
      <FabricNotes composition={d.composition} category={d.category} />

      <div className="actions">
        <button
          type="button"
          className="danger"
          onClick={() => confirm('Clear this size chart?') && setD({ ...initialDraft(), category: d.category })}
        >
          Clear chart
        </button>
      </div>

      <div className="legend">
        <span className="st-match">✓ match</span>
        <span className="st-fixable">~ fixable</span>
        <span className="st-dealbreaker">✕ dealbreaker</span>
      </div>
    </section>
  );
}
