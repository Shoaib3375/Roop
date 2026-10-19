import { NextResponse } from 'next/server';
import type { Draft } from '@/lib/types';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getAdmin() {
  const supabase = getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: 'Sign in is required.' }, { status: 401 }) };
  if (user.app_metadata?.role !== 'admin') {
    return { response: NextResponse.json({ error: 'Admin access is required.' }, { status: 403 }) };
  }
  return { supabase };
}

async function signedApplication(supabase: Awaited<ReturnType<typeof getSupabaseServer>>, userId: string, application: Draft) {
  const sign = async (path: string) => {
    if (!path || !path.startsWith(`${userId}/`)) return '';
    const { data, error } = await supabase.storage.from('application-photos').createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  };
  const photos = Object.fromEntries(await Promise.all(Object.entries(application.photos || {}).map(async ([key, value]) => [key, await sign(value)])));
  const portfolio = await Promise.all((application.portfolio || []).map(sign));
  return { ...application, photos, portfolio };
}

export async function GET() {
  try {
    const auth = await getAdmin();
    if ('response' in auth) return auth.response;
    const { data, error } = await auth.supabase
      .from('model_profiles')
      .select('user_id,application,status,submitted_at,updated_at')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    const applications = await Promise.all((data || []).map(async (row) => ({
      userId: row.user_id,
      status: row.status,
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at,
      application: await signedApplication(auth.supabase, row.user_id, row.application as Draft),
    })));
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('[admin-api] list applications failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not load applications. Check the admin role and database migration.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAdmin();
    if ('response' in auth) return auth.response;
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid review decision.' }, { status: 400 });
    const { userId, status } = body as { userId?: unknown; status?: unknown };
    if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId) || !['live', 'rejected'].includes(String(status))) {
      return NextResponse.json({ error: 'Provide a profile ID and an approve or reject decision.' }, { status: 400 });
    }
    const { data, error } = await auth.supabase
      .from('model_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('user_id,status')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, application: data });
  } catch (error) {
    console.error('[admin-api] review decision failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not save the review decision.' }, { status: 500 });
  }
}