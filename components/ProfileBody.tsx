import type { ReactNode } from 'react';
import type { Model } from '@/lib/types';
import { SLOTS } from '@/lib/data';
import { art, ftin } from '@/lib/utils';
import Figure from './Figure';
import Rail from './Rail';
import Enquiry from './Enquiry';

function StatBar({ m }: { m: Model }) {
  const lab = m.board === 'Men' ? 'Chest' : 'Bust';
  const items: [string, string | number][] = [
    ['Height', m.h ? `${m.h} cm / ${ftin(m.h)}` : '—'],
    ['Age', m.age !== null ? m.age : '—'],
    [lab, m.bust ? `${m.bust} cm` : '—'],
    ['Waist', m.waist ? `${m.waist} cm` : '—'],
    ['Hips', m.hips ? `${m.hips} cm` : '—'],
    ['Shoe', m.shoe ? `EU ${m.shoe}` : '—'],
    ['Hair', m.hair],
    ['Eyes', m.eyes],
    ['Languages', (m.langs || []).join(', ') || '—'],
  ];
  return (
    <div className="statbar">
      {items.map(([k, v]) => (
        <span key={k}><i>{k}</i><b>{v}</b></span>
      ))}
      {m.ig && (
        <a className="link" href={`https://instagram.com/${encodeURIComponent(m.ig)}`} target="_blank" rel="noopener noreferrer">
          @{m.ig}
        </a>
      )}
    </div>
  );
}

function HeroTiles({ m }: { m: Model }) {
  const src: string[] = [...(m.portfolio || [])];
  SLOTS.forEach((s) => {
    if (m.photos && m.photos[s[0]]) src.push(m.photos[s[0]]);
  });
  const n = m.mine ? Math.max(1, Math.min(2, src.length)) : 2;
  const tiles: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    tiles.push(
      src[i] ? (
        <div className="ph hero2__t" key={i}><img src={src[i]} alt={m.name} /></div>
      ) : (
        <div className="ph hero2__t" key={i} style={art(m, i)}><Figure m={m} i={i} /></div>
      ),
    );
  }
  return <div className="hero2" style={{ gridTemplateColumns: `repeat(${n},minmax(0,1fr))` }}>{tiles}</div>;
}

function portfolioTiles(m: Model): ReactNode[] {
  if (m.portfolio && m.portfolio.length)
    return m.portfolio.map((u, i) => (
      <div className="ph rail__t" key={i}><img src={u} alt={`${m.name}, portfolio ${i + 1}`} loading="lazy" /></div>
    ));
  if (!m.mine)
    return [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div className="ph rail__t" key={i} style={art(m, i)}><Figure m={m} i={i} /></div>
    ));
  return [];
}

function polaroidTiles(m: Model): ReactNode[] {
  const out: ReactNode[] = [];
  SLOTS.forEach((s) => {
    if (m.photos && m.photos[s[0]])
      out.push(
        <div className="ph rail__t" key={s[0]}><img src={m.photos[s[0]]} alt={`${m.name}, ${s[1].toLowerCase()}`} loading="lazy" /></div>,
      );
  });
  if (out.length || m.mine) return out;
  return [1, 2, 3, 4].map((i) => (
    <div className="ph rail__t" key={i} style={{ background: 'linear-gradient(#DAD8D1,#C6C4BA)' }}><Figure m={m} i={i} /></div>
  ));
}

export default function ProfileBody({ m, own = false }: { m: Model; own?: boolean }) {
  const pf = portfolioTiles(m);
  const pl = polaroidTiles(m);
  return (
    <>
      <div className="phead">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="tags">
            <span className="tag tag--a">{m.board}</span>
            {m.isNew && <span className="tag">New face</span>}
            <span className="tag">{m.city}</span>
          </div>
          <h1 className="name">{m.name}</h1>
        </div>
      </div>
      <HeroTiles m={m} />
      <StatBar m={m} />
      {pf.length > 0 && <Rail title="Portfolio" tiles={pf} />}
      {pl.length > 0 && <Rail title="Polaroids" tiles={pl} />}
      <div className="prof2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {m.bio && <p style={{ fontSize: '1.1rem', maxWidth: '56ch' }}>{m.bio}</p>}
          <div>
            <h3 className="h3">Experience</h3>
            {m.exp.length ? (
              <ul className="exp">
                {m.exp.map((x, i) => (
                  <li key={i}><span>{x.y}</span><span>{x.c}</span><span>{x.k}</span></li>
                ))}
              </ul>
            ) : (
              <p className="muted">New to the industry. Building a first portfolio.</p>
            )}
          </div>
        </div>
        {!own && <Enquiry name={m.name} />}
      </div>
    </>
  );
}
