import RosterView from '@/components/RosterView';

export const metadata = { title: 'Roster · Roop Management' };

export default function RosterPage({ searchParams }: { searchParams: { board?: string } }) {
  return <RosterView initialFilter={searchParams.board || 'All'} />;
}
