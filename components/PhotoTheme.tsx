'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { Model } from '@/lib/types';
import { SLOTS } from '@/lib/data';

function getPhotoHue(src: string): Promise<number | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return resolve(null);
        context.drawImage(image, 0, 0, 32, 32);
        const { data } = context.getImageData(0, 0, 32, 32);
        const buckets = Array.from({ length: 24 }, () => ({ x: 0, y: 0, weight: 0 }));

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lightness = (max + min) / 2;
          if (delta < 0.08 || lightness < 0.12 || lightness > 0.88) continue;

          let hue = 0;
          if (max === r) hue = ((g - b) / delta) % 6;
          else if (max === g) hue = (b - r) / delta + 2;
          else hue = (r - g) / delta + 4;
          hue = (hue * 60 + 360) % 360;
          const weight = delta * (1 - Math.abs(lightness - 0.5));
          const bucket = buckets[Math.floor(hue / 15) % buckets.length];
          const radians = (hue * Math.PI) / 180;
          bucket.x += Math.cos(radians) * weight;
          bucket.y += Math.sin(radians) * weight;
          bucket.weight += weight;
        }

        const strongest = buckets.reduce((best, item) => item.weight > best.weight ? item : best, buckets[0]);
        if (!strongest.weight) return resolve(null);
        const hue = (Math.atan2(strongest.y, strongest.x) * 180 / Math.PI + 360) % 360;
        resolve(hue);
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function hueFromHex(hex: string): number {
  const value = hex.replace('#', '');
  if (value.length !== 6) return 154;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (!delta) return 154;
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return (hue * 60 + 360) % 360;
}

export default function PhotoTheme({ m, children }: { m: Model; children: ReactNode }) {
  const fallbackHue = useMemo(() => hueFromHex(m.pal[1] || '#0B5D45'), [m.pal]);
  const [photoHue, setPhotoHue] = useState(fallbackHue);
  const photo = m.portfolio?.[0] || SLOTS.map(([slot]) => m.photos?.[slot]).find(Boolean) || null;

  useEffect(() => {
    let current = true;
    if (photo) getPhotoHue(photo).then((hue) => {
      if (current && hue !== null) setPhotoHue(hue);
    });
    return () => { current = false; };
  }, [photo]);

  const themeHue = photoHue;

  return (
    <section className="photo-theme" style={{ '--photo-hue': String(themeHue) } as CSSProperties & { '--photo-hue': string }}>
      {children}
    </section>
  );
}