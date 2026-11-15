import { useEffect, useState } from 'react';
import { load, save } from './lib/storage.js';
import Closet from './screens/Closet.jsx';
import Compare from './screens/Compare.jsx';

const TABS = [
  { id: 'closet', label: 'Closet' },
  { id: 'compare', label: 'Compare' },
];

export default function App() {
  const [tab, setTab] = useState(() => load('tab', 'closet'));
  const [closet, setCloset] = useState(() => load('closet', []));

  useEffect(() => save('closet', closet), [closet]);
  useEffect(() => save('tab', tab), [tab]);

  return (
    <div className="app">
      <header className="topbar">
        <h1>Petite Fit</h1>
      </header>
      <main className="content">
        {tab === 'closet' ? (
          <Closet closet={closet} setCloset={setCloset} />
        ) : (
          <Compare closet={closet} />
        )}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
