import type { CSSProperties } from 'react';
import type { Draft, Model } from './types';
import { PAL, SLOTS } from './data';

export function blank(): Draft {
  return {
    name: '', stage: '', board: 'Women', dob: '', city: 'Dhaka', h: '', bust: '', waist: '', hips: '', shoe: '',
    hair: 'Black', eyes: 'Dark brown', langs: ['Bangla'], bio: '', exp: [], ig: '', email: '', phone: '',
    gName: '', gPhone: '', photos: {}, portfolio: [], ok1: false, ok2: false, okG: false,
  };
}

export function ageOf(d: string): number | null {
  if (!d) return null;
  const b = new Date(d + 'T00:00:00');
  if (isNaN(b.getTime())) return null;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
}

export function ftin(cm: number): string {
  const t = cm / 2.54;
  let f = Math.floor(t / 12);
  let i = Math.round(t - f * 12);
  if (i === 12) { f++; i = 0; }
  return f + '′' + i + '″';
}

export function today(): string {
  const d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}

/** Turn a private draft into the public-safe model shape. */
export function pub(p: Draft): Model {
  const nm = (p.stage || '').trim() || (p.name || '').trim();
  const exp = (p.exp || []).filter((x) => x.c && x.c.trim()).map((x) => ({ c: x.c, y: x.y, k: x.k }));
  return {
    id: 'me', name: nm || 'Your name', board: p.board, city: p.city, age: ageOf(p.dob),
    h: +p.h || 0, bust: +p.bust || 0, waist: +p.waist || 0, hips: +p.hips || 0, shoe: +p.shoe || 0,
    hair: p.hair, eyes: p.eyes, langs: p.langs || [], ig: String(p.ig || '').replace(/^@/, ''), bio: p.bio || '',
    exp, photos: p.photos || {}, portfolio: p.portfolio || [], pal: PAL[0], seed: 0, isNew: exp.length === 0, mine: true,
  };
}

export function cover(m: Model): string | null {
  if (m.portfolio && m.portfolio.length) return m.portfolio[0];
  if (m.photos) {
    for (const s of SLOTS) if (m.photos[s[0]]) return m.photos[s[0]];
  }
  return null;
}

export function art(m: Model, i = 0): CSSProperties {
  const p = m.pal;
  const ang = ((m.seed || 1) * 47 + i * 63) % 360;
  return {
    background:
      'radial-gradient(120% 80% at ' + ((25 + i * 18) % 100) + '% 18%,' + p[2] + ' 0%,transparent 58%),linear-gradient(' + ang + 'deg,' + p[0] + ',' + p[1] + ')',
  };
}

/** Resize to max 900px and re-encode as JPEG so localStorage stays small. */
export function processImage(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('read'));
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => rej(new Error('decode'));
      im.onload = () => {
        const M = 900;
        const s = Math.min(1, M / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * s);
        c.height = Math.round(im.height * s);
        const ctx = c.getContext('2d');
        if (!ctx) return rej(new Error('canvas'));
        ctx.drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      im.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}
