import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Serif_JP } from 'next/font/google';
import LenisProvider from '@/components/providers/LenisProvider';
import Grain from '@/components/atmosphere/Grain';
import Cursor from '@/components/ui/Cursor';
import Header from '@/components/nav/Header';
import './globals.scss';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const notoSerifJp = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--font-serif-jp',
  display: 'swap',
});

// Resolves the site URL automatically across environments:
//   1. NEXT_PUBLIC_SITE_URL  — your custom domain (set on Vercel env vars)
//   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's main production URL
//   3. VERCEL_URL — preview/branch deploy URL
//   4. localhost — dev fallback
// When you point a custom domain later (e.g. lucassckenal.dev), add it
// to Vercel project settings → Environment Variables as NEXT_PUBLIC_SITE_URL.
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Lucas Sckenal — Creative Frontend Developer',
    template: '%s · Lucas Sckenal',
  },
  description:
    'A creative frontend developer crafting immersive, cinematic interfaces. Game UI, motion design, and premium digital products from Brazil.',
  keywords: [
    'Lucas Sckenal',
    'creative frontend developer',
    'cinematic web',
    'game UI',
    'motion design',
    'Next.js',
    'GSAP',
    'Framer Motion',
    'Three.js',
    'portfolio',
    'Brazil',
  ],
  authors: [{ name: 'Lucas Sckenal', url: SITE_URL }],
  creator: 'Lucas Sckenal',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Lucas Sckenal — Cinematic interfaces, game UI, motion.',
    description:
      'Creative frontend developer crafting immersive interfaces and cinematic experiences. Portfolio · MMXXVI.',
    siteName: 'Lucas Sckenal · Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucas Sckenal — Cinematic interfaces, game UI, motion.',
    description:
      'Creative frontend developer crafting immersive interfaces and cinematic experiences.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: '#1A1816',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${notoSerifJp.variable}`}
    >
      <body data-theme="dark">
        <LenisProvider>
          <Cursor />
          <Header />
          <main>{children}</main>
          <Grain />
        </LenisProvider>
      </body>
    </html>
  );
}
