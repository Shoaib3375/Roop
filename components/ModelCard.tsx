import Link from 'next/link';
import type { Model } from '@/lib/types';
import Ph from './Ph';

export default function ModelCard({ m }: { m: Model }) {
  return (
    <Link className="card" href={`/model/${m.id}`}>
      <Ph m={m} badge={m.isNew} />
      <div className="card__meta">
        <h3>{m.name}</h3>
        <p>{m.board} · {m.city}</p>
      </div>
    </Link>
  );
}

/** Non-clickable version used in the join form's live preview. */
export function PreviewCard({ m }: { m: Model }) {
  return (
    <div className="card" style={{ cursor: 'default' }}>
      <Ph m={m} badge={m.isNew} />
      <div className="card__meta">
        <h3>{m.name}</h3>
        <p>{m.board} · {m.city}</p>
      </div>
    </div>
  );
}
