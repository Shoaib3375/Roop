'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/components/Providers';
import ProfileBody from '@/components/ProfileBody';
import PhotoTheme from '@/components/PhotoTheme';
import { ageOf, pub } from '@/lib/utils';

export default function MinePage() {
  const { ready, user, mine: p, legacyMine, notice, profileError, reloadProfile, migrateLegacy, hasSavedDraft, remove, startEdit } = useProfile();
  const router = useRouter();
  const [confirmDel, setConfirmDel] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!ready) return null;

  if (!user) {
    return (
      <section className="wrap page">
        <p className="mono muted">My profile</p>
        <h1 className="page__title">Sign in to <em>continue</em></h1>
        <p className="muted" style={{ margin: '20px 0', maxWidth: '52ch', fontSize: '1.1rem' }}>Your model application is private to your account. Sign in to view or manage it.</p>
        <div className="actions"><Link className="btn btn--solid" href="/login?next=/mine">Sign in</Link><Link className="btn" href="/signup?next=/mine">Create account</Link></div>
      </section>
    );
  }

  if (profileError) {
    return (
      <section className="wrap page">
        <p className="mono muted">My profile</p>
        <h1 className="page__title">Couldn’t load <em>your profile</em></h1>
        <p className="note note--warn" role="alert" style={{ marginTop: 20, maxWidth: '70ch' }}>{profileError}</p>
        <p className="muted" style={{ marginTop: 14, maxWidth: '65ch' }}>
          Your profile has not been deleted. This page will not show an empty-profile message until the server confirms there is no saved application.
        </p>
        <button className="btn btn--solid" style={{ marginTop: 18 }} disabled={retrying} onClick={async () => {
          setRetrying(true);
          try { await reloadProfile(); } catch { /* The provider records the next request's error on reload. */ }
          setRetrying(false);
        }}>{retrying ? 'Retrying…' : 'Retry loading profile'}</button>
      </section>
    );
  }

  if (!p) {
    return (
      <section className="wrap page">
        <p className="mono muted">My profile</p>
        {notice && <p className="note note--warn" role="status" style={{ marginBottom: 20 }}>{notice}</p>}
        {legacyMine ? (
          <>
            <h1 className="page__title">Profile found <em>on this device</em></h1>
            <p style={{ margin: '20px 0', maxWidth: '58ch', fontSize: '1.1rem' }} className="muted">
              We found a profile saved by the previous version of this site. It has not been transferred to your account yet. Import it now to save it privately; it will return to the booking team for review.
            </p>
            <div className="actions">
              <button className="btn btn--solid" disabled={migrating} onClick={async () => { setMigrating(true); await migrateLegacy(); setMigrating(false); }}>
                {migrating ? 'Importing profile…' : 'Import saved profile'}
              </button>
              <Link className="btn" href="/join">Start a new profile</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="page__title">No profile <em>yet</em></h1>
            <p style={{ margin: '20px 0', maxWidth: '58ch', fontSize: '1.1rem' }} className="muted">
              We couldn’t find a submitted profile for this account. Profiles submitted before account storage was enabled may still be saved only in the original browser. Sign in there and check for an import option, or create a profile here.
            </p>
            <div className="actions">
              <Link className="btn btn--solid" href="/join">Create your profile</Link>
              {hasSavedDraft && <span className="muted" style={{ alignSelf: 'center', fontSize: 14 }}>You have an unsubmitted draft in this tab.</span>}
            </div>
          </>
        )}
      </section>
    );
  }

  const m = pub(p);
  const live = p.status === 'live';
  const rejected = p.status === 'rejected';
  const st = live ? 3 : 2;
  const age = ageOf(p.dob);

  return (
    <section className="wrap page">
      <p className="mono muted">My profile</p>
      <h1 className="page__title">Hello, <em>{(p.stage || p.name).split(' ')[0]}</em></h1>

      <div className="track" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        {['Submitted', 'In review', 'Live on roster'].map((t, i) => (
          <div key={t} className={i < st ? 'on' : ''}>{t}</div>
        ))}
      </div>
      <p className={'note' + (live ? '' : ' note--warn')} style={{ marginTop: 14 }}>
        {live
          ? 'Your profile is live and appears on the roster.'
          : rejected
            ? 'The booking team has requested changes or declined this application. You can edit and resubmit it for review.'
            : 'Your profile is in review. It does not appear on the public roster until the booking team approves it.'}
      </p>

      <div className="actions">
        <button className="btn" onClick={() => { startEdit(); router.push('/join'); }}>Edit profile</button>
        {live ? (
          <Link className="btn" href="/model/me">View public page</Link>
        ) : (
          <span className="hint" style={{ alignSelf: 'center' }}>The booking team will update this status after review.</span>
        )}
        {confirmDel ? (
          <>
            <button className="btn" style={{ borderColor: 'var(--bad)', color: 'var(--bad)' }} onClick={async () => { await remove(); setConfirmDel(false); }}>Confirm delete</button>
            <button className="btn" onClick={() => setConfirmDel(false)}>Keep it</button>
          </>
        ) : (
          <button className="btn" onClick={() => setConfirmDel(true)}>Delete profile</button>
        )}
      </div>
      {!live && <p className="hint" style={{ margin: '-6px 0 18px' }}>Your application is private and is not shown in the public roster until approved.</p>}

      <h3 className="h3">Private details, visible only to you and the booking team</h3>
      <div className="priv">
        <div><b>Legal name</b>{p.name}</div>
        <div><b>Date of birth</b>{p.dob}</div>
        <div><b>Email</b>{p.email}</div>
        <div><b>Phone</b>{p.phone}</div>
        {age !== null && age < 18 && <div><b>Guardian</b>{p.gName}, {p.gPhone}</div>}
      </div>

      <h3 className="h3" style={{ marginTop: 32 }}>How your public profile looks</h3>
      <PhotoTheme m={m}><ProfileBody m={m} own /></PhotoTheme>
    </section>
  );
}
