import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Roop Management',
  description: 'Independent model management in Dhaka. Women, Men, Curve and New Faces.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Hanken+Grotesk:wght@400;500;600&family=DM+Mono:wght@400;500&family=Hind+Siliguri:wght@500;600&display=swap"
        />
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
