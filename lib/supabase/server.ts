import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase is not configured.');

  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options) {
        try { cookieStore.set({ name, value, ...options }); } catch { /* Middleware refreshes cookies. */ }
      },
      remove(name: string, options) {
        try { cookieStore.set({ name, value: '', ...options }); } catch { /* Middleware refreshes cookies. */ }
      },
    },
  });
}