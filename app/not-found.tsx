import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="wrap page">
      <p className="empty">
        Profile not found. <Link className="link" href="/roster">Back to the roster</Link>
      </p>
    </section>
  );
}
