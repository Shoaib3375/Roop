'use client';

import Link from 'next/link';
import ModelView from '@/components/ModelView';
import { useProfile } from '@/components/Providers';
import { pub } from '@/lib/utils';

export default function MyPublicPage() {
  const { ready, mine } = useProfile();
  if (!ready) return null;
  if (!mine || mine.status !== 'live') {
    return (
      <section className="wrap page">
        <p className="empty">
          Your public page is not live yet. <Link className="link" href="/mine">Back to my profile</Link>
        </p>
      </section>
    );
  }
  return <ModelView m={pub(mine)} />;
}
