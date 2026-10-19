import { notFound } from 'next/navigation';
import ModelView from '@/components/ModelView';
import { SAMPLE } from '@/lib/data';

export function generateStaticParams() {
  return SAMPLE.map((m) => ({ id: m.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const m = SAMPLE.find((x) => x.id === params.id);
  return { title: m ? `${m.name} · Roop Management` : 'Roop Management' };
}

export default function ModelPage({ params }: { params: { id: string } }) {
  const m = SAMPLE.find((x) => x.id === params.id);
  if (!m) notFound();
  return <ModelView m={m} />;
}
