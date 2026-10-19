import Link from 'next/link';
import type { Model } from '@/lib/types';
import ProfileBody from './ProfileBody';
import PhotoTheme from './PhotoTheme';

export default function ModelView({ m }: { m: Model }) {
  return (
    <PhotoTheme m={m}>
      <div className="wrap">
        <div className="crumb mono">
          <Link href="/roster">Roster</Link>
          <span>/</span>
          <span>{m.board}</span>
        </div>
        <ProfileBody m={m} />
        {!m.mine && (
          <p className="fine" style={{ marginBottom: 24 }}>Sample profile and details for demonstration.</p>
        )}
      </div>
    </PhotoTheme>
  );
}
