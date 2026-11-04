import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif, Noto_Serif_JP } from 'next/font/google';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { personSchema, websiteSchema } from '@/lib/structured-data';
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

// Display serif of the 2027 home (roman + italic pairs in the hero headline)
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
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
    default: 'Lucas Sckenal — Software & Creative Frontend Developer',
    template: '%s · Lucas Sckenal',
  },
  description:
    'Software developer and creative frontend developer from Brazil. Web apps, sites and native desktop software — Next.js, Rust, C++ — with AI inside.',
  keywords: [
    'Lucas Sckenal',
    'software developer',
    'creative frontend developer',
    'desktop software',
    'Rust',
    'C++',
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
    title: 'Lucas Sckenal — Software and interfaces that stay in your head.',
    description:
      'Software developer and creative frontend developer from Brazil. Web apps, sites and native desktop software — Next.js, Rust, C++ — with AI inside.',
    siteName: 'Lucas Sckenal · Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucas Sckenal — Software and interfaces that stay in your head.',
    description:
      'Software developer and creative frontend developer from Brazil. Web apps, sites and native desktop software — Next.js, Rust, C++ — with AI inside.',
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
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} ${notoSerifJp.variable}`}
      // Pre-hydration scripts mutate <html> before React hydrates:
      //   · theme-inverted class (saved Night preference)
      //   · lang attribute (user's saved language)
      // suppressHydrationWarning tells React to preserve those mutations
      // instead of reconciling them back to the SSR output. Without this,
      // the theme-inverted class would be stripped on hydration and the
      // toggle would feel "stuck" in one direction.
      suppressHydrationWarning
    >
      <body data-theme="dark">
        {/* Pre-hydration theme sync — runs synchronously to avoid a flash
            between SSR (default) and hydration.
            Resolution order:
              1. localStorage explicit choice  → respected forever
              2. No stored choice              → time-based default
                                                 Night between 18:00–06:00 local,
                                                 Day otherwise.
              Once the user clicks the toggle, localStorage takes over and the
              time-based default is never consulted again. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=localStorage.getItem('theme-inverted');var n=s==='true'||(s===null&&(function(){var h=new Date().getHours();return h>=18||h<6})());if(n)document.documentElement.classList.add('theme-inverted')}catch(e){}",
          }}
        />

        {/* Schema.org structured data — Person + WebSite. Helps Google build
            a knowledge panel and improve search snippets. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              personSchema(SITE_URL),
              websiteSchema(SITE_URL),
            ]),
          }}
        />

        {/* Keyboard-only skip link — focusable but visually hidden until focused */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {/* Each route group brings its own chrome:
              (site)    → the current portfolio
              (arquivo) → the 2026 edition, kept intact at /2026, /2026/work, /lab */}
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
