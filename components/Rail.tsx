'use client';

import { useRef, type ReactNode } from 'react';

export default function Rail({ title, tiles }: { title: string; tiles: ReactNode[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const t = track.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: 'smooth' });
  };
  return (
    <section className="rail">
      <div className="rail__head">
        <h2 className="h3" style={{ margin: 0 }}>{title}</h2>
        <div className="rail__btns">
          <button type="button" className="icon-btn" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>←</button>
          <button type="button" className="icon-btn" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>→</button>
        </div>
      </div>
      <div className="rail__track" ref={track} tabIndex={0} role="region" aria-label={title}>
        {tiles}
      </div>
    </section>
  );
}
