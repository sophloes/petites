import { useState } from 'react';
import { CATEGORIES, MEASUREMENTS, UNIT, categoryById } from '../config.js';
import { newId } from '../lib/storage.js';
import ConfirmButton from '../components/ConfirmButton.jsx';
import FabricNotes from '../components/FabricNotes.jsx';
import { Hero, DataRows, SketchUnderline } from '../components/Sketch.jsx';

const blank = (category = CATEGORIES[0].id) => ({
  id: null,
  category,
  name: '',
  brand: '',
  size: '',
  composition: '',
  price: '',
  measurements: {},
});

export default function Closet({ closet, setCloset }) {
  const [editing, setEditing] = useState(null); // garment being edited, or null
  const [filter, setFilter] = useState('all');

  const startNew = () => setEditing(blank(filter === 'all' ? undefined : filter));

  const saveGarment = (g) => {
    setCloset((list) =>
      g.id ? list.map((x) => (x.id === g.id ? g : x)) : [...list, { ...g, id: newId() }],
    );
    setEditing(null);
  };

  const remove = (g) => {
    setCloset((list) => list.filter((x) => x.id !== g.id));
    setEditing(null);
  };

  if (editing) {
    return (
      <GarmentForm
        initial={editing}
        onSave={saveGarment}
        onCancel={() => setEditing(null)}
        onDelete={editing.id ? () => remove(editing) : null}
      />
    );
  }

  const shown = closet.filter((g) => filter === 'all' || g.category === filter);

  const unit = UNIT === 'in' ? '"' : ' cm';
  const filterLabel = filter === 'all' ? 'All categories' : categoryById(filter).label;

  return (
    <section>
      <button className="plus" onClick={startNew} aria-label="Add piece">+</button>
      <Hero
        big={shown.length}
        title="Fit closet"
        subtitle={filterLabel}
        note={shown.length === 1 ? 'piece that fits' : 'pieces that fit'}
      />

      <div className="chips">
        <button className={filter === 'all' ? 'chip on' : 'chip'} onClick={() => setFilter('all')}>
          All · {closet.length}
        </button>
        {CATEGORIES.map((c) => {
          const n = closet.filter((g) => g.category === c.id).length;
          return (
            <button
              key={c.id}
              className={filter === c.id ? 'chip on' : 'chip'}
              onClick={() => setFilter(c.id)}
            >
              {c.label} · {n}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <p className="hand">
            Nothing here yet. Lay a piece that fits you perfectly flat, measure it, and add it.
          </p>
          <button className="primary" onClick={startNew}>+ Add piece</button>
        </div>
      ) : (
        <ul className="cards">
          {shown.map((g, i) => (
            <li key={g.id} className="card" onClick={() => setEditing(g)}>
              <div className="card-head">
                <span className="mono card-idx">{String(i + 1).padStart(2, '0')}</span>
                <div className="card-title">
                  <strong>{g.name || categoryById(g.category).label}</strong>
                  <span className="muted">{g.brand}</span>
                </div>
                {g.size && <span className="status status-ok">Size {g.size}</span>}
              </div>
              <DataRows
                rows={categoryById(g.category).fields
                  .filter((f) => g.measurements[f])
                  .map((f) => ({ label: MEASUREMENTS[f].label, value: `${g.measurements[f]}${unit}` }))}
              />
              {g.composition && <div className="hand card-fabric">{g.composition}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GarmentForm({ initial, onSave, onCancel, onDelete }) {
  const [g, setG] = useState(initial);
  const cat = categoryById(g.category);
  const set = (k, v) => setG((x) => ({ ...x, [k]: v }));
  const setM = (k, v) => setG((x) => ({ ...x, measurements: { ...x.measurements, [k]: v } }));

  const submit = (e) => {
    e.preventDefault();
    // Keep only the fields that belong to the chosen category.
    const measurements = Object.fromEntries(
      cat.fields.filter((f) => g.measurements[f] !== '' && g.measurements[f] != null)
        .map((f) => [f, g.measurements[f]]),
    );
    onSave({ ...g, measurements });
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-head">
        <span className="mono muted">{initial.id ? 'Edit / spec' : 'New / spec'}</span>
        <h2>{initial.id ? 'Edit piece' : 'Add a piece that fits'}</h2>
        <SketchUnderline />
      </div>

      <label>
        Category
        <select value={g.category} onChange={(e) => set('category', e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      <label>
        Name <span className="muted">(optional)</span>
        <input value={g.name} onChange={(e) => set('name', e.target.value)} placeholder="Navy crewneck" />
      </label>

      <div className="grid2">
        <label>
          Brand
          <input value={g.brand} onChange={(e) => set('brand', e.target.value)} />
        </label>
        <label>
          Size
          <input value={g.size} onChange={(e) => set('size', e.target.value)} placeholder="XS, 2P…" />
        </label>
      </div>

      <fieldset>
        <legend>Measurements ({UNIT}, laid flat)</legend>
        <div className="grid2">
          {cat.fields.map((f) => (
            <label key={f}>
              {MEASUREMENTS[f].label}
              {MEASUREMENTS[f].flat && <span className="muted"> (flat)</span>}
              <input
                type="number"
                inputMode="decimal"
                step="0.25"
                min="0"
                value={g.measurements[f] ?? ''}
                onChange={(e) => setM(f, e.target.value)}
              />
            </label>
          ))}
        </div>
        <p className="hand annotation">
          ← bust, waist &amp; hip: straight across, laid flat. The app doubles them for size charts.
        </p>
      </fieldset>

      <label>
        Fabric composition
        <input
          value={g.composition}
          onChange={(e) => set('composition', e.target.value)}
          placeholder="95% cotton, 5% elastane"
        />
      </label>
      <FabricNotes composition={g.composition} category={g.category} />

      <label>
        Price
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={g.price}
          onChange={(e) => set('price', e.target.value)}
        />
      </label>

      <div className="actions">
        <button type="submit" className="primary">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        {onDelete && <ConfirmButton label="Delete" confirmLabel="Tap again to delete" onConfirm={onDelete} />}
      </div>
    </form>
  );
}
