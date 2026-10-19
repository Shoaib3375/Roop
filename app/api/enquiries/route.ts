import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const LIMITS = { model: 120, name: 160, email: 254, dates: 200, details: 3000 };
type Enquiry = { model: string; name: string; email: string; dates: string; details: string };

function clean(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const result = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return result && result.length <= maxLength ? result : null;
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 16_384) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
  }

  let body: Partial<Enquiry>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid payload');
    body = parsed as Partial<Enquiry>;
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON request.' }, { status: 400 });
  }

  const enquiry: Enquiry = {
    model: clean(body.model, LIMITS.model) || '',
    name: clean(body.name, LIMITS.name) || '',
    email: clean(body.email, LIMITS.email) || '',
    dates: clean(body.dates, LIMITS.dates) || '',
    details: clean(body.details, LIMITS.details) || '',
  };

  if (!enquiry.model || !enquiry.name || !enquiry.email || !enquiry.details || !validEmail(enquiry.email)) {
    return NextResponse.json(
      { error: 'Provide a model, your name, a valid email address, and job details.' },
      { status: 400 },
    );
  }

  const webhook = process.env.ROOP_ENQUIRY_WEBHOOK;
  if (!webhook) {
    return NextResponse.json(
      { error: 'Booking enquiries are not configured yet. Please email bookings@roop.example.' },
      { status: 503 },
    );
  }

  let webhookUrl: URL;
  try {
    webhookUrl = new URL(webhook);
    if (webhookUrl.protocol !== 'https:') throw new Error('HTTPS required');
  } catch {
    return NextResponse.json({ error: 'Booking service configuration is invalid.' }, { status: 500 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...enquiry, submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Booking service returned ${response.status}`);
  } catch {
    return NextResponse.json(
      { error: 'We could not send your enquiry right now. Please try again or email bookings@roop.example.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}