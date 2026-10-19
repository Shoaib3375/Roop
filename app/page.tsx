import Link from 'next/link';
import ModelCard from '@/components/ModelCard';
import { SAMPLE } from '@/lib/data';

const STEPS: [string, string, string][] = [
  ['01', 'Create your profile', 'Add your measurements, a headshot and a full-length photo. It takes about ten minutes.'],
  ['02', 'Team review', 'Our booking team reviews every profile. You hear back within seven days.'],
  ['03', 'Meet us', 'Shortlisted models come in for a go-see in Dhaka, or meet us on a video call.'],
  ['04', 'Go live', 'Approved profiles appear on the public roster and are sent to clients.'],
];

const DIVISIONS: [string, string, string][] = [
  ['Women', 'Editorial, runway and commercial.', 'Women'],
  ['Men', 'Tailoring, sport and lifestyle.', 'Men'],
  ['Curve', 'Fashion and beauty for every size.', 'Curve'],
  ['New Faces', 'Fresh talent, developed with care.', 'New Faces'],
];

export default function Home() {
  const picks = [SAMPLE[0], SAMPLE[1], SAMPLE[3], SAMPLE[8]];
  return (
    <>
      <section className="wrap hero">
        <div className="hero__eyebrow mono">
          <span>Model management</span><span>Dhaka, Bangladesh</span><span>Est. 2016</span>
        </div>
        <div className="hero__title">
          <h1 className="hero__word">Roop</h1>
          <span className="hero__bn" lang="bn" aria-hidden="true">রূপ</span>
        </div>
        <div className="hero__row">
          <p className="hero__lede">
            A boutique roster with a wide client reach. We manage careers in editorial, commercial and runway work across Bangladesh and South Asia.
          </p>
          <div className="hero__cta">
            <Link href="/roster" className="btn">Meet the roster</Link>
            <Link href="/join" className="btn btn--solid">Create your profile</Link>
          </div>
        </div>
        <div className="strip">
          {picks.map((m) => <ModelCard key={m.id} m={m} />)}
        </div>
      </section>

      <section className="sec" id="about">
        <div className="wrap">
          <div className="about">
            <h2 className="h2">Independent by design. <em>Personal</em> by habit.</h2>
            <div>
              <p>
                Roop Management was built in Dhaka for a new generation of South Asian talent. We keep the roster small and the attention close, so every model has a manager who knows their book, their goals and their schedule.
              </p>
              <p>
                We represent women, men and curve models, and run a Creative division for photographers, stylists and beauty artists who work with our clients.
              </p>
            </div>
          </div>
          <div className="divs">
            {DIVISIONS.map(([t, p, f]) => (
              <Link key={t} className="div" href={`/roster?board=${encodeURIComponent(f)}`}>
                <h3>{t}</h3>
                <p>{p}</p>
                <span className="mono muted">View →</span>
              </Link>
            ))}
            <div className="div div--static">
              <h3>Creative</h3>
              <p>Photographers, stylists and beauty artists.</p>
              <span className="mono muted">By invitation</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec__head">
            <h2 className="h2">How to <em>join</em> the roster</h2>
            <Link className="btn" href="/join">Start your profile</Link>
          </div>
          <ol className="steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {STEPS.map(([n, t, p]) => (
              <li className="step" key={n}><b>{n}</b><h3>{t}</h3><p>{p}</p></li>
            ))}
          </ol>
          <div className="reqs">
            <div className="req"><h3>Age</h3><p>Models must be 16 or older. Applicants under 18 need a parent or guardian to give consent.</p></div>
            <div className="req"><h3>Height guide</h3><p>We usually look for 170 cm and above for women and 180 cm and above for men. Curve and New Faces are considered case by case.</p></div>
            <div className="req"><h3>Your privacy</h3><p>Your phone number, email and date of birth are never shown on your public profile.</p></div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div className="cta">
          <h2 className="h2">Your portfolio starts with one profile.</h2>
          <Link href="/join" className="btn">Create your profile</Link>
        </div>
      </section>
    </>
  );
}
