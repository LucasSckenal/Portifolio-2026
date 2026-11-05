'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useT } from '@/components/providers/LanguageProvider';
import { LOCALES, localeMeta, type Locale } from '@/lib/i18n';
import { showWork, whatsappHref } from './links';
import Versions from './Versions';
import MobileMenu from './MobileMenu';
import ProjectsIndex from './ProjectsIndex';
import styles from './site.module.scss';

export default function Nav() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  // "About" lives on the home page: elsewhere it goes home first
  const [aboutOn, setAboutOn] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setAboutOn((e as CustomEvent<boolean>).detail);
    window.addEventListener('about:state', on);
    return () => window.removeEventListener('about:state', on);
  }, []);
  const about = () => {
    if (pathname === '/') window.dispatchEvent(new CustomEvent('about:toggle'));
    else router.push('/?sobre');
  };

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.wordmark}>
        Lucas Sckenal<sup>®</sup>
      </Link>

      <nav className={styles.pill} aria-label="Main">
        <button type="button" onClick={() => showWork(router, pathname)}>
          {t.site.nav.work}
        </button>
        <button type="button" aria-pressed={aboutOn} onClick={about}>
          {t.site.about.nav}
        </button>
        <Versions />
        <label className={styles.lang}>
          {/* a globe reads as "language" in any language */}
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1.8 8h12.4M8 1.6c1.9 2 1.9 10.8 0 12.8M8 1.6c-1.9 2-1.9 10.8 0 12.8" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        <select
          aria-label={t.site.nav.language}
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {localeMeta[l].short}
            </option>
          ))}
        </select>
        </label>
      </nav>
      <ProjectsIndex />

      <div className={styles.navEnd}>
        <MobileMenu />
        <a className={styles.cta} href={whatsappHref(t.site.nav.quoteMessage)} target="_blank" rel="noreferrer">
        {t.site.nav.cta}
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
          <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        </a>
      </div>
    </header>
  );
}
