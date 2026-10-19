import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft__in">
          <div>
            <div className="wm">Roop</div>
            <p className="muted" style={{ marginTop: 8, maxWidth: '30ch', fontSize: 14 }}>
              Independent model management in Dhaka.
            </p>
          </div>
          <div>
            <h4>Roster</h4>
            <ul>
              <li><Link href="/roster?board=Women">Women</Link></li>
              <li><Link href="/roster?board=Men">Men</Link></li>
              <li><Link href="/roster?board=Curve">Curve</Link></li>
              <li><Link href="/roster?board=New%20Faces">New Faces</Link></li>
            </ul>
          </div>
          <div>
            <h4>Models</h4>
            <ul>
              <li><Link href="/join">Create a profile</Link></li>
              <li><Link href="/mine">My profile</Link></li>
              <li><Link href="/#about">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>bookings@roop.example</li>
              <li>Gulshan, Dhaka 1212</li>
              <li>Sun–Thu, 10:00–18:00</li>
            </ul>
          </div>
        </div>
        <p className="fine">
          Demo platform. All agency details and the twelve model profiles shown are fictional sample content.
          Profiles you create are saved in this browser only.
        </p>
      </div>
    </footer>
  );
}
