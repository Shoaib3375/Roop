import type { Model } from '@/lib/types';
import { HAIRC, SKIN } from '@/lib/data';

/** Generated placeholder portrait (SVG). */
export default function Figure({ m, i = 0 }: { m: Model; i?: number }) {
  const s = (m.seed || 1) + i * 3;
  const skin = SKIN[s % SKIN.length];
  const hc = HAIRC[m.hair] || '#15100E';
  const p = m.pal;
  const cx = 150;
  const men = m.board === 'Men';
  const curve = m.board === 'Curve';
  const cloth = [p[2], '#F2EEE6', '#101614', '#E6DDC8'][(s + i) % 4];
  const sw = curve ? 150 : men ? 146 : 128;
  const style = s % 3;
  const flip = (s + i) % 2 ? 1 : -1;

  let back: JSX.Element | null = null;
  if (!men) {
    if (style === 0)
      back = <path d={`M${cx - 50} 190Q${cx - 64} 300 ${cx - 72} 352L${cx + 72} 352Q${cx + 64} 300 ${cx + 50} 190Z`} fill={hc} />;
    else if (style === 1)
      back = <path d={`M${cx - 50} 190Q${cx - 58} 250 ${cx - 54} 262L${cx + 54} 262Q${cx + 58} 250 ${cx + 50} 190Z`} fill={hc} />;
    else back = <circle cx={cx} cy={132} r={22} fill={hc} />;
  }

  const front = men
    ? `M${cx - 44} 188Q${cx - 48} 136 ${cx} 133Q${cx + 48} 136 ${cx + 44} 188Q${cx + 38} 158 ${cx} 156Q${cx - 38} 158 ${cx - 44} 188Z`
    : `M${cx - 45} 192Q${cx - 48} 138 ${cx} 136Q${cx + 48} 138 ${cx + 45} 192Q${cx + 30 + flip * 10} 160 ${cx + flip * 14} 156Q${cx - 30 + flip * 10} 162 ${cx - 45} 192Z`;

  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {back}
      <rect x={cx - 17} y={232} width={34} height={62} fill={skin} />
      <rect x={cx - 17} y={232} width={34} height={22} fill="#000" opacity={0.16} />
      <path
        d={`M${cx - sw} 400L${cx - sw + 8} 332Q${cx - sw + 20} 292 ${cx - 36} 280L${cx + 36} 280Q${cx + sw - 20} 292 ${cx + sw - 8} 332L${cx + sw} 400Z`}
        fill={cloth}
      />
      <path d={`M${cx - 22} 280L${cx} 316L${cx + 22} 280Z`} fill={skin} />
      <ellipse cx={cx} cy={196} rx={41} ry={52} fill={skin} />
      <path d={front} fill={hc} />
      <rect y={250} width={300} height={150} fill="#000" opacity={0.1} />
    </svg>
  );
}
