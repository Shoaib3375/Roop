'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from './Providers';

export default function Header() {
  const path = usePathname() || '/';
  const { user, authConfigured, signOut } = useProfile();
  const onRoster = path.startsWith('/roster') || (path.startsWith('/model') && path !== '/model/me');
  const onMine = path.startsWith('/mine') || path === '/model/me';

  function toggleTheme() {
    const r = document.documentElement;
    let cur = r.getAttribute('data-theme');
    if (!cur) cur = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    r.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
  }

  return (
    <header className="hd">
      <div className="wrap hd__in">
        <Link href="/" className="brand" aria-label="Roop Management home">
          <span className="brand__en">Roop</span>
          <span className="brand__bn" lang="bn">রূপ</span>
          <span className="brand__sub">Management</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/roster" aria-current={onRoster ? 'page' : undefined}>Roster</Link>
          <Link href="/#about">About</Link>
          {user && <Link href="/mine" aria-current={onMine ? 'page' : undefined}>My profile</Link>}
          {user?.app_metadata?.role === 'admin' && <Link href="/admin" aria-current={path.startsWith('/admin') ? 'page' : undefined}>Review applications</Link>}
        </nav>
        <div className="hd__r">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Switch light or dark theme" title="Switch theme">◐</button>
          {user ? (
            <button className="btn btn--sm" onClick={() => { void signOut(); }}>Sign out</button>
          ) : authConfigured ? (
            <Link href="/login" className="btn btn--sm">Sign in</Link>
          ) : null}
          <Link href="/join" className="btn btn--solid btn--sm">Join as a model</Link>
        </div>
      </div>
    </header>
  );
}
