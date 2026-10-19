import { notFound } from 'next/navigation';
import ModelView from '@/components/ModelView';
import { SAMPLE } from '@/lib/data';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { Board, Exp, Model } from '@/lib/types';
import { PAL } from '@/lib/data';

export function generateStaticParams() {
  return SAMPLE.map((m) => ({ id: m.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const m = SAMPLE.find((x) => x.id === params.id);
  return { title: m ? `${m.name} · Roop Management` : 'Roop Management' };
}

export const dynamicParams = true;

export default async function ModelPage({ params }: { params: { id: string } }) {
  const sample = SAMPLE.find((x) => x.id === params.id);
  if (sample) return <ModelView m={sample} />;

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from('public_model_profiles').select('profile_id,model').eq('profile_id', params.id).maybeSingle();
    if (error || !data) notFound();
    const raw = data.model as Record<string, unknown>;
    const photosRaw = raw.photos && typeof raw.photos === 'object' ? raw.photos as Record<string, string> : {};
    const sign = async (path: string) => {
      if (!path?.startsWith(`${data.profile_id}/`)) return '';
      const { data: signed } = await supabase.storage.from('application-photos').createSignedUrl(path, 3600);
      return signed?.signedUrl || '';
    };
    const photos = Object.fromEntries(await Promise.all(Object.entries(photosRaw).map(async ([key, path]) => [key, await sign(path)])));
    const portfolio = await Promise.all((Array.isArray(raw.portfolio) ? raw.portfolio as string[] : []).map(sign));
    const model: Model = {
      id: data.profile_id,
      name: String(raw.name || 'New face'),
      board: (['Women', 'Men', 'Curve'].includes(String(raw.board)) ? raw.board : 'Women') as Board,
      city: String(raw.city || ''), age: typeof raw.age === 'number' ? raw.age : null,
      h: Number(raw.h) || 0, bust: Number(raw.bust) || 0, waist: Number(raw.waist) || 0,
      hips: Number(raw.hips) || 0, shoe: Number(raw.shoe) || 0,
      hair: String(raw.hair || ''), eyes: String(raw.eyes || ''),
      langs: Array.isArray(raw.langs) ? raw.langs as string[] : [],
      ig: String(raw.ig || ''), bio: String(raw.bio || ''),
      exp: Array.isArray(raw.exp) ? raw.exp as Exp[] : [],
      photos, portfolio, pal: PAL[0], seed: 0, isNew: Boolean(raw.isNew), mine: false,
    };
    return <ModelView m={model} />;
  } catch {
    notFound();
  }
}
