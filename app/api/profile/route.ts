import { NextResponse } from 'next/server';
import type { Draft } from '@/lib/types';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StoredProfile = { application: Draft; status: 'pending' | 'live'; submitted_at: string };

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<Draft>;
  const age = typeof draft.dob === 'string' ? new Date(draft.dob + 'T00:00:00') : null;
  const years = age && !Number.isNaN(age.getTime())
    ? (() => {
      const today = new Date();
      let value = today.getFullYear() - age.getFullYear();
      if (today.getMonth() < age.getMonth() || (today.getMonth() === age.getMonth() && today.getDate() < age.getDate())) value--;
      return value;
    })()
    : 0;
  const numberInRange = (value: unknown, min: number, max: number) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max;
  };
  const photos = draft.photos;
  const portfolio = draft.portfolio;
  const allowedBoards = ['Women', 'Men', 'Curve'];
  return typeof draft.name === 'string' && draft.name.trim().length > 0 && draft.name.length <= 160
    && typeof draft.email === 'string' && draft.email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
    && typeof draft.phone === 'string' && draft.phone.replace(/\D/g, '').length >= 8 && draft.phone.length <= 40
    && typeof draft.dob === 'string' && years >= 16 && years <= 80
    && typeof draft.board === 'string' && allowedBoards.includes(draft.board)
    && typeof draft.city === 'string' && draft.city.length <= 80
    && numberInRange(draft.h, 140, 210) && numberInRange(draft.bust, 60, 160)
    && numberInRange(draft.waist, 50, 150) && numberInRange(draft.hips, 60, 170)
    && numberInRange(draft.shoe, 34, 50)
    && typeof draft.bio === 'string' && draft.bio.trim().length >= 40 && draft.bio.length <= 400
    && Array.isArray(draft.langs) && draft.langs.length <= 20 && draft.langs.every((item) => typeof item === 'string' && item.length <= 40)
    && Array.isArray(draft.exp) && draft.exp.length <= 30
    && Boolean(draft.ok1) && Boolean(draft.ok2) && (years >= 18 || (Boolean(draft.okG) && Boolean(draft.gName?.trim()) && Boolean(draft.gPhone?.trim())))
    && Boolean(photos && typeof photos === 'object' && !Array.isArray(photos)
      && Object.entries(photos).every(([slot, path]) => ['headshot', 'full', 'profile', 'smile', 'extra'].includes(slot) && typeof path === 'string')
      && photos.headshot && photos.full)
    && Boolean(portfolio && Array.isArray(portfolio) && portfolio.length <= 8 && portfolio.every((item) => typeof item === 'string'));
}

function applicationMedia(application: Draft): string[] {
  return [...Object.values(application.photos || {}), ...(application.portfolio || [])]
    .filter((path): path is string => typeof path === 'string' && !/^https?:\/\//i.test(path) && !path.startsWith('data:'));
}

async function getUserClient() {
  const supabase = getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 }) };
  return { supabase, user };
}

async function signMedia(supabase: Awaited<ReturnType<typeof getSupabaseServer>>, userId: string, draft: Draft) {
  const signPath = async (path: string): Promise<string> => {
    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
    if (!path.startsWith(`${userId}/`)) return '';
    const { data } = await supabase.storage.from('application-photos').createSignedUrl(path, 3600);
    return data?.signedUrl || '';
  };
  const photos = Object.fromEntries(await Promise.all(
    Object.entries(draft.photos || {}).map(async ([slot, path]) => [slot, await signPath(path)]),
  ));
  const portfolio = await Promise.all((draft.portfolio || []).map(signPath));
  return { ...draft, photos, portfolio };
}

export async function GET() {
  try {
    const auth = await getUserClient();
    if ('response' in auth) return auth.response;
    const { data, error } = await auth.supabase
      .from('model_profiles')
      .select('application,status,submitted_at')
      .eq('user_id', auth.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ profile: null });
    const row = data as StoredProfile;
    const application = await signMedia(auth.supabase, auth.user.id, row.application);
    return NextResponse.json({ profile: { ...application, status: row.status, submitted: Date.parse(row.submitted_at) } });
  } catch {
    return NextResponse.json({ error: 'Could not load your profile.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getUserClient();
    if ('response' in auth) return auth.response;
    if (!auth.user.email_confirmed_at) {
      return NextResponse.json({ error: 'Confirm your email address before submitting an application.' }, { status: 403 });
    }
    const length = Number(request.headers.get('content-length') || 0);
    if (length > 256_000) return NextResponse.json({ error: 'Profile data is too large.' }, { status: 413 });

    const payload: unknown = await request.json();
    const application = payload && typeof payload === 'object' && 'application' in payload
      ? (payload as { application: unknown }).application : null;
    if (!isDraft(application)) return NextResponse.json({ error: 'Complete all required profile fields before submitting.' }, { status: 400 });
    if (application.email.trim().toLowerCase() !== (auth.user.email || '').toLowerCase()) {
      return NextResponse.json({ error: 'Use the verified email address on your account.' }, { status: 400 });
    }
    const media = applicationMedia(application);
    if (media.length !== Object.keys(application.photos).length + application.portfolio.length
      || media.some((path) => !path.startsWith(`${auth.user.id}/`))) {
      return NextResponse.json({ error: 'Profile photos must be uploaded to your private account storage.' }, { status: 400 });
    }

    const { data: current, error: lookupError } = await auth.supabase
      .from('model_profiles').select('application,status').eq('user_id', auth.user.id).maybeSingle();
    if (lookupError) throw lookupError;
    const now = new Date().toISOString();
    const { data: saved, error } = await auth.supabase.from('model_profiles').upsert({
      user_id: auth.user.id,
      application,
      status: current?.status || 'pending',
      submitted_at: now,
      updated_at: now,
    }, { onConflict: 'user_id' }).select('status,submitted_at').single();
    if (error) throw error;
    const replaced = current ? applicationMedia(current.application as Draft).filter((path) => !media.includes(path)) : [];
    if (replaced.length) await auth.supabase.storage.from('application-photos').remove(replaced);
    return NextResponse.json({ ok: true, status: saved.status, submitted: Date.parse(saved.submitted_at) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Could not save your application. Please check the database setup and try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const auth = await getUserClient();
    if ('response' in auth) return auth.response;
    const { data: current, error: lookupError } = await auth.supabase
      .from('model_profiles').select('application').eq('user_id', auth.user.id).maybeSingle();
    if (lookupError) throw lookupError;
    const { error } = await auth.supabase.from('model_profiles').delete().eq('user_id', auth.user.id);
    if (error) throw error;
    const media = current ? applicationMedia(current.application as Draft) : [];
    if (media.length) await auth.supabase.storage.from('application-photos').remove(media);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not delete your application.' }, { status: 500 });
  }
}