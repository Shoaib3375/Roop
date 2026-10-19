import type { Model } from '@/lib/types';
import { SLOTS } from '@/lib/data';
import { art, cover } from '@/lib/utils';
import Figure from './Figure';

/** 3:4 portrait: real photo if the model has one, generated placeholder otherwise. */
export default function Ph({ m, i = 0, badge = false }: { m: Model; i?: number; badge?: boolean }) {
  const slot = SLOTS[i];
  const src = i === 0 ? cover(m) : (slot && m.photos && m.photos[slot[0]]) || null;
  return (
    <div className="ph" style={src ? undefined : art(m, i)}>
      {badge && <span className="badge">New face</span>}
      {src ? <img src={src} alt={m.name} /> : <Figure m={m} i={i} />}
    </div>
  );
}
