import { NextResponse } from 'next/server';
import type { Board, Exp, Model } from '@/lib/types';
import { getSupabaseServer } from '@/lib/supabase/server';
import { PAL } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PublicRow = { profile_id: string; model: Record<string, unknown> };

async function signImage(supabase: ReturnType<typeof getSupabaseServer>, path: string): Promise<string> {
  if (!path || !path.includes('/')) return '';
  const { data } = await supabase.storage.from('application-photos').createSignedUrl(path, 3600);
  return data?.signedUrl || '';
}

async function publicModel(supabase: ReturnType<typeof getSupabaseServer>, row: PublicRow): Promise<Model> {
  const raw = row.model;
  const photosRaw = raw.photos && typeof raw.photos === 'object' ? raw.photos as Record<string, string> : {};
  const photos = Object.fromEntries(await Promise.all(Object.entries(photosRaw).map(async ([key, value]) => [key, await signImage(supabase, value)])));
  const portfolioRaw = Array.isArray(raw.portfolio) ? raw.portfolio as string[] : [];
  const portfolio = await Promise.all(portfolioRaw.map((path) => signImage(supabase, path)));
  return {
    id: row.profile_id,
    name: String(raw.name || 'New face'),
    board: (['Women', 'Men', 'Curve'].includes(String(raw.board)) ? raw.board : 'Women') as Board,
    city: String(raw.city || ''),
    age: typeof raw.age === 'number' ? raw.age : null,
    h: Number(raw.h) || 0, bust: Number(raw.bust) || 0, waist: Number(raw.waist) || 0,
    hips: Number(raw.hips) || 0, shoe: Number(raw.shoe) || 0,
    hair: String(raw.hair || ''), eyes: String(raw.eyes || ''),
    langs: Array.isArray(raw.langs) ? raw.langs as string[] : [],
    ig: String(raw.ig || ''), bio: String(raw.bio || ''),
    exp: Array.isArray(raw.exp) ? raw.exp as Exp[] : [],
    photos, portfolio, pal: PAL[0], seed: 0,
    isNew: Boolean(raw.isNew), mine: false,
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from('public_model_profiles').select('profile_id,model');
    if (error) throw error;
    const models = await Promise.all(((data || []) as PublicRow[]).map((row) => publicModel(supabase, row)));
    return NextResponse.json({ models }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('[roster-api] public roster failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Approved profiles are temporarily unavailable.' }, { status: 503 });
  }
}