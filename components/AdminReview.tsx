'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Draft } from '@/lib/types';

type Entry = { userId: string; status: 'pending' | 'live' | 'rejected'; submittedAt: string; application: Draft };

export default function AdminReview() {
  const [applications, setApplications] = useState<Entry[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/applications', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load applications.');
      setApplications(result.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function decide(entry: Entry, status: 'live' | 'rejected') {
    setBusyId(entry.userId);
    setError('');
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: entry.userId, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save review decision.');
      setApplications((items) => items.map((item) => item.userId === entry.userId ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review decision.');
    } finally {
      setBusyId('');
    }
  }

  if (loading) return <section className="wrap page"><p className="muted">Loading applications…</p></section>;

  return (
    <section className="wrap page">
      <p className="mono muted">Staff workspace</p>
      <h1 className="page__title">Application <em>review</em></h1>
      <p className="muted" style={{ marginTop: 14, maxWidth: '65ch' }}>Review private applicant details and photos. Approving publishes only the public profile fields to the roster.</p>
      {error && <p className="note note--warn" role="alert" style={{ marginTop: 20 }}>{error}</p>}
      <div className="actions"><button className="btn" onClick={() => void load()}>Refresh applications</button></div>
      {!applications.length ? <p className="empty">No applications have been submitted.</p> : (
        <div className="admin-list">
          {applications.map((entry) => {
            const p = entry.application;
            const locked = busyId === entry.userId;
            return (
              <article className="admin-entry" key={entry.userId}>
                <div className="admin-entry__head">
                  <div><p className="mono muted">{entry.status} · {new Date(entry.submittedAt).toLocaleDateString()}</p><h2 className="h2">{p.stage || p.name}</h2><p className="muted">{p.email} · {p.phone}</p></div>
                  <span className="tag">{p.board} · {p.city}</span>
                </div>
                <div className="admin-photos">
                  {Object.entries(p.photos || {}).filter(([, src]) => Boolean(src)).map(([slot, src]) => <a href={src} target="_blank" rel="noreferrer" key={slot}><img src={src} alt={`${p.name} — ${slot}`} /><span className="mono">{slot}</span></a>)}
                  {(p.portfolio || []).map((src, index) => <a href={src} target="_blank" rel="noreferrer" key={`portfolio-${index}`}><img src={src} alt={`${p.name} portfolio ${index + 1}`} /><span className="mono">Portfolio {index + 1}</span></a>)}
                </div>
                <div className="admin-facts">
                  <span><b>DOB</b>{p.dob}</span><span><b>Height</b>{p.h} cm</span>
                  <span><b>Measurements</b>{p.bust} / {p.waist} / {p.hips}</span><span><b>Shoe</b>EU {p.shoe}</span>
                  <span><b>Hair / eyes</b>{p.hair} / {p.eyes}</span><span><b>Instagram</b>{p.ig || '—'}</span>
                  {p.gName && <span><b>Guardian</b>{p.gName} · {p.gPhone}</span>}
                </div>
                <p style={{ marginTop: 16 }}>{p.bio}</p>
                {p.exp?.length > 0 && <ul className="admin-exp">{p.exp.map((job, i) => <li key={i}>{job.y} · {job.c} · {job.k}</li>)}</ul>}
                {entry.status === 'pending' && <div className="actions"><button className="btn btn--solid" disabled={locked} onClick={() => void decide(entry, 'live')}>{locked ? 'Saving…' : 'Approve and publish'}</button><button className="btn" disabled={locked} onClick={() => void decide(entry, 'rejected')}>Reject application</button></div>}
                {entry.status !== 'pending' && <p className="hint" style={{ marginTop: 16 }}>This application is {entry.status}. A revised submission returns it to review.</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}