'use client';

import { useState, type FormEvent } from 'react';

export default function Enquiry({ name }: { name: string }) {
  const [who, setWho] = useState('');
  const [email, setEmail] = useState('');
  const [dates, setDates] = useState('');
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNote('');
    setSending(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: name, name: who, email, dates, details: msg }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not send your enquiry.');
      setNote('Thanks — your booking enquiry has been sent to our team.');
      setWho('');
      setEmail('');
      setDates('');
      setMsg('');
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Could not send your enquiry. Please email bookings@roop.example.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="enq" id="enq" onSubmit={submit}>
      <h3>Book {name.split(' ')[0]}</h3>
      <p className="muted" style={{ fontSize: 14 }}>
        Share the job details and our booking team will follow up by email.
      </p>
      <div className="two">
        <div className="fld">
          <label htmlFor="enq-who">Your name and brand</label>
          <input className="in" id="enq-who" autoComplete="name" required maxLength={160} placeholder="Name, company" value={who} onChange={(e) => setWho(e.target.value)} />
        </div>
        <div className="fld">
          <label htmlFor="enq-email">Email address</label>
          <input className="in" id="enq-email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="fld" style={{ gridColumn: '1/-1' }}>
          <label htmlFor="enq-dates">Job dates</label>
          <input className="in" id="enq-dates" maxLength={200} placeholder="e.g. 12–13 Dec, Dhaka" value={dates} onChange={(e) => setDates(e.target.value)} />
        </div>
      </div>
      <div className="fld">
        <label htmlFor="enq-msg">About the job</label>
        <textarea className="ta" id="enq-msg" style={{ minHeight: 80 }} required maxLength={3000} placeholder="Type of shoot, usage, budget range" value={msg} onChange={(e) => setMsg(e.target.value)} />
      </div>
      <button className="btn btn--solid" type="submit" disabled={sending || !who.trim() || !email.trim() || !msg.trim()}>
        {sending ? 'Sending…' : 'Send booking enquiry'}
      </button>
      {note && <p className="hint" role="status">{note}</p>}
    </form>
  );
}
