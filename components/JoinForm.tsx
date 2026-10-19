'use client';

import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Board, Draft } from '@/lib/types';
import { BOARDS, CITIES, EYES, HAIR, KINDS, LANGS, MAXP, SLOTS, STEPS } from '@/lib/data';
import { ageOf, ftin, processImage, pub, today } from '@/lib/utils';
import { useProfile } from './Providers';
import { PreviewCard } from './ModelCard';

type Errors = Record<string, string>;
type Bind = (k: keyof Draft) => {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};
interface StepProps {
  d: Draft;
  set: (p: Partial<Draft>) => void;
  errors: Errors;
  clear: (k: string) => void;
  bind: Bind;
}

/* ---------- validation ---------- */
function validate(step: number, d: Draft): Errors {
  const e: Errors = {};
  const a = ageOf(d.dob);
  if (step === 0) {
    if (!d.name.trim()) e.name = 'Enter your full legal name.';
    if (!d.dob) e.dob = 'Enter your date of birth.';
    else if (a === null || a < 16) e.dob = 'You must be 16 or older to apply.';
    else if (a > 80) e.dob = 'Check the date of birth.';
    if (a !== null && a >= 16 && a < 18) {
      if (!d.gName.trim()) e.gName = 'Enter a parent or guardian name.';
      if (!d.gPhone.trim()) e.gPhone = 'Enter a guardian phone number.';
    }
  }
  if (step === 1) {
    const h = +d.h;
    if (!h || h < 140 || h > 210) e.h = 'Enter your height between 140 and 210 cm.';
    if (!(+d.bust >= 60 && +d.bust <= 160)) e.bust = 'Enter 60–160.';
    if (!(+d.waist >= 50 && +d.waist <= 150)) e.waist = 'Enter 50–150.';
    if (!(+d.hips >= 60 && +d.hips <= 170)) e.hips = 'Enter 60–170.';
    if (!(+d.shoe >= 34 && +d.shoe <= 50)) e.shoe = 'Enter 34–50.';
  }
  if (step === 2) {
    if (!d.photos.headshot) e['p-headshot'] = 'A headshot is required.';
    if (!d.photos.full) e['p-full'] = 'A full-length photo is required.';
  }
  if (step === 3) {
    if (d.bio.trim().length < 40) e.bio = 'Write at least 40 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = 'Enter a valid email address.';
    if (d.phone.replace(/\D/g, '').length < 8) e.phone = 'Enter a valid phone number.';
  }
  if (step === 4) {
    if (!d.ok1) e.ok1 = '1';
    if (!d.ok2) e.ok2 = '1';
    if (a !== null && a < 18 && !d.okG) e.okG = '1';
  }
  return e;
}

function completion(d: Draft): number {
  const a = ageOf(d.dob);
  const items = [
    d.name.trim(), a !== null && a >= 16, +d.h, +d.bust && +d.waist && +d.hips, d.photos.headshot, d.photos.full,
    d.bio.trim().length >= 40, d.email && d.phone, d.langs.length,
  ];
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

/* ---------- field wrapper ---------- */
function Field({ id, label, hint, error, wide, children }: { id: string; label: string; hint?: ReactNode; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={'fld' + (error ? ' is-bad' : '')} id={`w-${id}`} style={wide ? { gridColumn: '1/-1' } : undefined}>
      <label htmlFor={`f-${id}`}>{label}</label>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
      {error ? <p className="err">{error}</p> : null}
    </div>
  );
}

function Options({ list }: { list: string[] }) {
  return <>{list.map((o) => <option key={o} value={o}>{o}</option>)}</>;
}

/* ---------- steps ---------- */
function StepBasics({ d, errors, bind }: StepProps) {
  const a = ageOf(d.dob);
  const minor = a !== null && a >= 16 && a < 18;
  return (
    <>
      <h2>About you</h2>
      <div className="cols">
        <Field id="name" label="Full legal name" hint="Used for contracts. Not shown publicly." error={errors.name}>
          <input className="in" type="text" autoComplete="name" {...bind('name')} />
        </Field>
        <Field id="stage" label="Professional name" hint="Shown on your public profile. Leave empty to use your legal name.">
          <input className="in" type="text" placeholder="Optional" {...bind('stage')} />
        </Field>
        <Field id="board" label="Board" hint="Women, Men or Curve. Models with no professional work yet also appear under New Faces.">
          <select className="sel" {...bind('board')}><Options list={BOARDS} /></select>
        </Field>
        <Field id="city" label="Based in">
          <select className="sel" {...bind('city')}><Options list={CITIES} /></select>
        </Field>
        <Field
          id="dob" label="Date of birth" error={errors.dob}
          hint={<><span>{a !== null ? (a < 16 ? `Age ${a}. You must be 16 or older.` : `Age ${a}.`) : 'You must be 16 or older.'}</span> Not shown publicly.</>}
        >
          <input className="in" type="date" max={today()} {...bind('dob')} />
        </Field>
      </div>
      {minor && (
        <div>
          <div className="note note--warn" style={{ marginBottom: 14 }}>Applicants under 18 need a parent or guardian to give consent.</div>
          <div className="cols">
            <Field id="gName" label="Parent or guardian name" error={errors.gName}>
              <input className="in" type="text" {...bind('gName')} />
            </Field>
            <Field id="gPhone" label="Guardian phone" error={errors.gPhone}>
              <input className="in" type="tel" inputMode="tel" {...bind('gPhone')} />
            </Field>
          </div>
        </div>
      )}
    </>
  );
}

function StepBody({ d, set, errors, bind }: StepProps) {
  const h = +d.h;
  const g = d.board === 'Men' ? 180 : 170;
  const low = h && d.board !== 'Curve' && h < g;
  const toggleLang = (l: string) =>
    set({ langs: d.langs.includes(l) ? d.langs.filter((x) => x !== l) : [...d.langs, l] });
  return (
    <>
      <h2>Measurements</h2>
      <p className="muted" style={{ maxWidth: '56ch' }}>
        Measure without shoes, in fitted clothing, in centimetres. Clients use these numbers for booking, so accuracy matters.
      </p>
      <div className="cols3">
        <Field id="h" label="Height (cm)" hint={h ? ftin(h) : ''} error={errors.h}>
          <input className="in" type="number" min={140} max={210} inputMode="numeric" {...bind('h')} />
        </Field>
        <Field id="bust" label={d.board === 'Men' ? 'Chest (cm)' : 'Bust (cm)'} error={errors.bust}>
          <input className="in" type="number" min={60} max={160} inputMode="numeric" {...bind('bust')} />
        </Field>
        <Field id="waist" label="Waist (cm)" error={errors.waist}>
          <input className="in" type="number" min={50} max={150} inputMode="numeric" {...bind('waist')} />
        </Field>
        <Field id="hips" label="Hips (cm)" error={errors.hips}>
          <input className="in" type="number" min={60} max={170} inputMode="numeric" {...bind('hips')} />
        </Field>
        <Field id="shoe" label="Shoe (EU)" error={errors.shoe}>
          <input className="in" type="number" min={34} max={50} step={0.5} inputMode="decimal" {...bind('shoe')} />
        </Field>
      </div>
      {low ? (
        <div className="note">
          Our usual height guide for {d.board.toLowerCase()} is {g} cm and above. You can still apply and we will consider your profile.
        </div>
      ) : null}
      <div className="cols">
        <Field id="hair" label="Hair colour"><select className="sel" {...bind('hair')}><Options list={HAIR} /></select></Field>
        <Field id="eyes" label="Eye colour"><select className="sel" {...bind('eyes')}><Options list={EYES} /></select></Field>
      </div>
      <div className="fld">
        <span className="lab">Languages</span>
        <div className="chips" role="group" aria-label="Languages">
          {LANGS.map((l) => (
            <button type="button" key={l} className="chip" aria-pressed={d.langs.includes(l)} onClick={() => toggleLang(l)}>{l}</button>
          ))}
        </div>
      </div>
    </>
  );
}

function StepPhotos({ d, set, errors, clear, notice }: StepProps & { notice: string }) {
  const [msg, setMsg] = useState('');

  async function onSlot(slot: string, e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const url = await processImage(f);
      set({ photos: { ...d.photos, [slot]: url } });
      clear('p-' + slot);
      setMsg('');
    } catch {
      setMsg('That file could not be read as an image.');
    }
  }
  function rmSlot(slot: string) {
    const next = { ...d.photos };
    delete next[slot];
    set({ photos: next });
  }
  async function onPortfolio(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, MAXP - d.portfolio.length);
    const added: string[] = [];
    for (const f of files) {
      try {
        added.push(await processImage(f));
      } catch {
        /* skip unreadable file */
      }
    }
    if (added.length) set({ portfolio: [...d.portfolio, ...added].slice(0, MAXP) });
  }

  return (
    <>
      <h2>Photos</h2>
      <p className="muted" style={{ maxWidth: '58ch' }}>
        Polaroids are simple, unretouched photos in natural light. Clients use them to see how you really look. Add portfolio photos if you have professional work.
      </p>
      <div>
        <h3 className="h3">Polaroids (required)</h3>
        <div className="slots">
          {SLOTS.map((s) => {
            const url = d.photos[s[0]];
            const err = errors['p-' + s[0]];
            return (
              <div className="slot" id={`w-p-${s[0]}`} key={s[0]}>
                <div className="box">
                  {url ? (
                    <>
                      <img src={url} alt={s[1]} />
                      <button type="button" className="rm" onClick={() => rmSlot(s[0])}>Remove</button>
                    </>
                  ) : (
                    <>
                      <span>Add photo</span>
                      <input type="file" accept="image/*" aria-label={`Upload ${s[1]}`} onChange={(e) => onSlot(s[0], e)} />
                    </>
                  )}
                </div>
                <b>{s[1]}{s[3] ? <span className="muted" style={{ fontWeight: 400 }}> (required)</span> : null}</b>
                <small>{s[2]}</small>
                {err ? <p className="err">{err}</p> : null}
              </div>
            );
          })}
        </div>

        <h3 className="h3" style={{ marginTop: 28 }}>Portfolio (optional, up to {MAXP})</h3>
        <p className="hint" style={{ marginBottom: 10 }}>
          Professional shots from past work. The first two appear at the top of your profile.
        </p>
        <div className="slots">
          {d.portfolio.map((u, i) => (
            <div className="slot" key={i}>
              <div className="box">
                <img src={u} alt={`Portfolio photo ${i + 1}`} />
                <button type="button" className="rm" onClick={() => set({ portfolio: d.portfolio.filter((_, j) => j !== i) })}>Remove</button>
              </div>
            </div>
          ))}
          {d.portfolio.length < MAXP && (
            <div className="slot">
              <div className="box">
                <span>Add portfolio photos</span>
                <input type="file" accept="image/*" multiple aria-label="Add portfolio photos" onChange={onPortfolio} />
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="hint">{msg || notice}</p>
    </>
  );
}

function StepWork({ d, set, errors, bind }: StepProps) {
  const setRow = (i: number, patch: Partial<Draft['exp'][number]>) =>
    set({ exp: d.exp.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  return (
    <>
      <h2>Work and contact</h2>
      <Field
        id="bio" label="About you" wide error={errors.bio}
        hint={<>Two or three sentences in your own voice. At least 40 characters. <span>{d.bio.length}</span>/400.</>}
      >
        <textarea className="ta" maxLength={400} {...bind('bio')} />
      </Field>
      <div>
        <span className="lab">Professional experience</span>
        <p className="hint" style={{ marginBottom: 10 }}>
          Leave this empty if you have not worked professionally yet. You will be listed under New Faces.
        </p>
        {d.exp.map((x, i) => (
          <div className="exrow" key={i}>
            <input className="in" placeholder="Client or job" aria-label="Client or job" value={x.c} onChange={(e) => setRow(i, { c: e.target.value })} />
            <input className="in" type="number" min={2000} max={2100} aria-label="Year" value={x.y} onChange={(e) => setRow(i, { y: e.target.value })} />
            <select className="sel" aria-label="Type" value={x.k} onChange={(e) => setRow(i, { k: e.target.value })}><Options list={KINDS} /></select>
            <button type="button" className="btn btn--sm" aria-label="Remove row" onClick={() => set({ exp: d.exp.filter((_, j) => j !== i) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn--sm" onClick={() => set({ exp: [...d.exp, { c: '', y: new Date().getFullYear(), k: KINDS[0] }] })}>
          Add a job
        </button>
      </div>
      <div className="cols">
        <Field id="ig" label="Instagram handle" hint="Optional. Shown publicly.">
          <input className="in" type="text" placeholder="@yourname" {...bind('ig')} />
        </Field>
        <span />
        <Field id="email" label="Email" hint="Private. Only our booking team sees it." error={errors.email}>
          <input className="in" type="email" autoComplete="email" inputMode="email" {...bind('email')} />
        </Field>
        <Field id="phone" label="Phone or WhatsApp" hint="Private. Include the country code, for example +880." error={errors.phone}>
          <input className="in" type="tel" autoComplete="tel" inputMode="tel" {...bind('phone')} />
        </Field>
      </div>
    </>
  );
}

function StepReview({ d, set, errors, clear }: StepProps) {
  const m = pub(d);
  const minor = m.age !== null && m.age < 18;
  const polaroids = SLOTS.filter((s) => d.photos[s[0]]).length;
  const check = (k: 'ok1' | 'ok2' | 'okG', text: string) => (
    <div className={'fld' + (errors[k] ? ' is-bad' : '')} id={`w-${k}`}>
      <label className="chk">
        <input type="checkbox" id={`f-${k}`} checked={d[k]} onChange={(e) => { set({ [k]: e.target.checked } as Partial<Draft>); clear(k); }} />
        <span>{text}</span>
      </label>
    </div>
  );
  return (
    <>
      <h2>Review and submit</h2>
      <div className="rev">
        <div><b>Name</b>{m.name}</div>
        <div><b>Board</b>{m.board}{m.isNew ? ' · New face' : ''}</div>
        <div><b>Based in</b>{m.city}</div>
        <div><b>Height</b>{m.h ? `${m.h} cm` : '—'}</div>
        <div><b>Measurements</b>{m.bust || '—'} / {m.waist || '—'} / {m.hips || '—'}</div>
        <div><b>Photos</b>{polaroids} polaroids, {d.portfolio.length} portfolio</div>
        <div><b>Experience</b>{m.exp.length} jobs</div>
        <div><b>Contact</b>{d.email || '—'}</div>
      </div>
      {check('ok1', 'I confirm the details and photos are accurate and recent.')}
      {check('ok2', 'I agree that the booking team may review my profile and contact me. Only approved profiles are published.')}
      {minor && check('okG', 'My parent or guardian has given consent for this application.')}
      {Object.keys(errors).length > 0 && <p className="err">Please tick the boxes above to submit.</p>}
    </>
  );
}

/* ---------- form ---------- */
export default function JoinForm() {
  const { ready, user, mine, draft: d, notice, updateDraft, submit } = useProfile();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const fullName = String(user?.user_metadata.full_name || '');
    if (user && ((!d.email && user.email) || (!d.name && fullName))) {
      updateDraft((current) => ({
        ...current,
        email: current.email || user.email || '',
        name: current.name || fullName,
      }));
    }
  }, [user, d.email, d.name, updateDraft]);

  if (!ready) return null;

  if (!user) {
    return (
      <section className="wrap page">
        <p className="mono muted">Join Roop</p>
        <h1 className="page__title">Start with an <em>account</em></h1>
        <p className="muted" style={{ margin: '20px 0', maxWidth: '55ch', fontSize: '1.1rem' }}>
          Create an account or sign in first. Your application and photos will be saved privately to your account.
        </p>
        <div className="actions">
          <Link className="btn btn--solid" href="/signup?next=/join">Create account</Link>
          <Link className="btn" href="/login?next=/join">Sign in</Link>
        </div>
      </section>
    );
  }

  const set = (p: Partial<Draft>) => updateDraft((x) => ({ ...x, ...p }));
  const clear = (k: string) =>
    setErrors((e) => {
      if (!e[k]) return e;
      const n = { ...e };
      delete n[k];
      return n;
    });
  const bind: Bind = (k) => ({
    id: `f-${k}`,
    value: String(d[k] ?? ''),
    onChange: (e) => {
      set({ [k]: e.target.value } as Partial<Draft>);
      clear(k);
    },
  });

  function fail(e: Errors) {
    setErrors(e);
    const first = Object.keys(e)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const w = document.getElementById('w-' + first);
      if (!w) return;
      w.scrollIntoView({ block: 'center' });
      const i = w.querySelector<HTMLElement>('input:not([type=file]),select,textarea');
      if (i) i.focus({ preventScroll: true });
    });
  }
  const goTo = (n: number) => {
    setStep(n);
    setErrors({});
    window.scrollTo(0, 0);
  };
  function next() {
    const e = validate(step, d);
    if (Object.keys(e).length) fail(e);
    else goTo(step + 1);
  }
  async function onSubmit() {
    for (let s = 0; s < 4; s++) {
      const e = validate(s, d);
      if (Object.keys(e).length) {
        setStep(s);
        fail(e);
        return;
      }
    }
    const e = validate(4, d);
    if (Object.keys(e).length) return fail(e);
    if (await submit(d)) router.push('/mine');
  }

  const props: StepProps = { d, set, errors, clear, bind };
  const last = step === STEPS.length - 1;
  const m = pub(d);
  const pc = completion(d);

  return (
    <>
      <section className="wrap page" style={{ paddingBottom: 0 }}>
        <p className="mono muted">{mine ? 'Edit your profile' : 'Join Roop'}</p>
        <h1 className="page__title">Create your <em>profile</em></h1>
      </section>
      <div className="wrap">
        <div className="stepper" role="group" aria-label="Steps">
          {STEPS.map((t, i) => (
            <button type="button" key={t} className={i === step ? 'on' : i < step ? 'done' : ''} onClick={() => i < step && goTo(i)}>
              {i + 1}. {t}
            </button>
          ))}
        </div>
        <div className="join">
          <form className="form" noValidate onSubmit={(e) => e.preventDefault()}>
            {step === 0 && <StepBasics {...props} />}
            {step === 1 && <StepBody {...props} />}
            {step === 2 && <StepPhotos {...props} notice={notice} />}
            {step === 3 && <StepWork {...props} />}
            {step === 4 && <StepReview {...props} />}
            <div className="nav2">
              <button type="button" className="btn" disabled={step === 0} onClick={() => step > 0 && goTo(step - 1)}>Back</button>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="muted" style={{ alignSelf: 'center', fontSize: 13 }}>Saved to your account when submitted</span>
                {last ? (
                  <button type="button" className="btn btn--solid" onClick={onSubmit}>Submit for review</button>
                ) : (
                  <button type="button" className="btn btn--solid" onClick={next}>Continue</button>
                )}
              </div>
            </div>
          </form>
          <div className="aside">
            <p className="mono muted">Live preview</p>
            <PreviewCard m={m} />
            <div className="meter" aria-hidden="true"><i style={{ width: `${pc}%` }} /></div>
            <p className="hint aside__note"><span>{pc}</span>% complete. This is how your card looks on the roster.</p>
          </div>
        </div>
      </div>
    </>
  );
}
