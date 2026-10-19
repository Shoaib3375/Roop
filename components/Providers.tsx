'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Draft, Model } from '@/lib/types';
import { SAMPLE } from '@/lib/data';
import { blank, pub } from '@/lib/utils';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

interface Ctx {
  ready: boolean;
  user: User | null;
  authConfigured: boolean;
  mine: Draft | null;
  draft: Draft;
  hasSavedDraft: boolean;
  notice: string;
  roster: Model[];
  updateDraft: (fn: (d: Draft) => Draft) => void;
  submit: (application: Draft) => Promise<boolean>;
  signOut: () => Promise<void>;
  remove: () => Promise<void>;
  startEdit: () => void;
}

const ProfileCtx = createContext<Ctx | null>(null);

export function useProfile(): Ctx {
  const c = useContext(ProfileCtx);
  if (!c) throw new Error('useProfile must be used inside <Providers>');
  return c;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const supabase = getSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [mine, setMine] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft>(blank());
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    let active = true;
    const loadProfile = async () => {
      const response = await fetch('/api/profile', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load your saved application.');
      const result = await response.json();
      if (active && result.profile) setMine({ ...blank(), ...result.profile, portfolio: result.profile.portfolio || [] });
    };
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user);
      if (data.user) {
        try { await loadProfile(); } catch { if (active) setNotice('Could not load your account profile.'); }
      }
      if (active) setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        setMine(null);
        setDraft(blank());
        setHasSavedDraft(false);
        setReady(true);
      } else if (event === 'SIGNED_IN' && session?.user) {
        window.setTimeout(() => { void loadProfile().catch(() => undefined); }, 0);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  const updateDraft = useCallback((fn: (d: Draft) => Draft) => {
    setHasSavedDraft(true);
    setDraft((d) => fn(d));
  }, []);

  const submit = useCallback(async (application: Draft): Promise<boolean> => {
    if (!user || !supabase) {
      setNotice('Sign in to an account before submitting your model application.');
      return false;
    }

    const signedPath = (value: string) => {
      try {
        const url = new URL(value);
        const marker = '/storage/v1/object/sign/application-photos/';
        const index = url.pathname.indexOf(marker);
        return index >= 0 ? decodeURIComponent(url.pathname.slice(index + marker.length)) : value;
      } catch { return value; }
    };
    const upload = async (value: string): Promise<string> => {
      if (!value.startsWith('data:')) return signedPath(value);
      const blob = await fetch(value).then((response) => response.blob());
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('application-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (error) throw error;
      return path;
    };

    try {
      const photos = Object.fromEntries(await Promise.all(
        Object.entries(application.photos || {}).map(async ([slot, value]) => [slot, await upload(value)]),
      ));
      const portfolio = await Promise.all((application.portfolio || []).map(upload));
      const payload = { ...application, photos, portfolio };
      const response = await fetch('/api/profile', {
        method: 'PUT', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ application: payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit your application.');
      const saved = await fetch('/api/profile', { cache: 'no-store' });
      const savedResult = await saved.json();
      setMine({ ...blank(), ...savedResult.profile, portfolio: savedResult.profile?.portfolio || [] });
      setHasSavedDraft(false);
      setDraft(blank());
      setNotice('');
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save your application. Check your connection and try again.');
      return false;
    }
  }, [user, supabase]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, [supabase]);

  const remove = useCallback(async () => {
    const response = await fetch('/api/profile', { method: 'DELETE' });
    if (!response.ok) throw new Error('Could not delete your application.');
    setMine(null);
  }, []);

  const startEdit = useCallback(() => {
    if (!mine) return;
    const copy: Draft = { ...mine, photos: { ...mine.photos }, portfolio: [...(mine.portfolio || [])], exp: [...(mine.exp || [])] };
    delete copy.status;
    delete copy.submitted;
    setHasSavedDraft(false);
    setDraft(copy);
  }, [mine]);

  const roster: Model[] = mine && mine.status === 'live' ? [pub(mine), ...SAMPLE] : SAMPLE;

  return (
    <ProfileCtx.Provider value={{ ready, user, authConfigured: Boolean(supabase), mine, draft, hasSavedDraft, notice, roster, updateDraft, submit, signOut, remove, startEdit }}>
      {children}
    </ProfileCtx.Provider>
  );
}
