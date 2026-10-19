'use client';

import { useState } from 'react';
import ModelCard from './ModelCard';
import { CITIES, FILTERS } from '@/lib/data';
import { useProfile } from './Providers';

export default function RosterView({ initialFilter }: { initialFilter: string }) {
  const { roster } = useProfile();
  const [filter, setFilter] = useState(FILTERS.includes(initialFilter) ? initialFilter : 'All');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('All');

  const needle = q.trim().toLowerCase();
  const list = roster.filter((m) => {
    if (filter === 'New Faces') {
      if (!m.isNew) return false;
    } else if (filter !== 'All' && m.board !== filter) return false;
    if (city !== 'All' && m.city !== city) return false;
    if (needle && m.name.toLowerCase().indexOf(needle) < 0 && m.city.toLowerCase().indexOf(needle) < 0) return false;
    return true;
  });

  return (
    <section className="wrap page">
      <p className="mono muted">The roster</p>
      <h1 className="page__title">Our <em>models</em></h1>
      <div className="tools">
        <div className="tabs" role="group" aria-label="Boards">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}>{f}</button>
          ))}
        </div>
        <div className="filters">
          <input className="in" type="search" placeholder="Search name or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search models" />
          <select className="sel" value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
            {['All', ...CITIES].map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All cities' : c}</option>
            ))}
          </select>
        </div>
      </div>
      {list.length ? (
        <div className="grid">{list.map((m) => <ModelCard key={m.id} m={m} />)}</div>
      ) : (
        <div className="empty">No models match. Try another board or city.</div>
      )}
      <p className="fine" style={{ marginTop: 36 }}>
        Twelve fictional sample profiles. Portraits are generated placeholders. Models who create a profile add their own photos.
      </p>
    </section>
  );
}
