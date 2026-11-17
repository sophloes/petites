import { useEffect, useState } from 'react';
import { load, save } from './lib/storage.js';
import Closet from './screens/Closet.jsx';
import Compare from './screens/Compare.jsx';
import { SketchDefs, Logo } from './components/Sketch.jsx';

const TABS = [
  { id: 'closet', label: 'Closet', num: '01' },
  { id: 'compare', label: 'Compare', num: '02' },
];

export default function App() {
  const [tab, setTab] = useState(() => load('tab', 'closet'));
  const [closet, setCloset] = useState(() => load('closet', []));

  useEffect(() => save('closet', closet), [closet]);
  useEffect(() => save('tab', tab), [tab]);

  return (
    <div className="blueprint">
      <SketchDefs />
      <span className="cross c1" aria-hidden="true" />
      <span className="cross c2" aria-hidden="true" />
      <span className="cross c3" aria-hidden="true" />
      <span className="pin p1" aria-hidden="true" />
      <span className="pin p2" aria-hidden="true" />

      <div className="sheet">
        <header className="topbar">
          <Logo />
          <span className="mono topbar-tag">Petite Fit<br />Spec sheet / v1</span>
        </header>
        <main className="content">
          {tab === 'closet' ? (
            <Closet closet={closet} setCloset={setCloset} />
          ) : (
            <Compare closet={closet} />
          )}
        </main>
      </div>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-num">{t.num}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
