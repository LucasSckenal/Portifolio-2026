'use client';

import Link from 'next/link';
import { useLocale, useT } from '@/components/providers/LanguageProvider';
import { LOCALES, localeMeta, type Locale } from '@/lib/i18n';
import { EMAIL } from './links';
import Versions from './Versions';
import styles from './site.module.scss';

export default function Nav() {
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.wordmark}>
        Lucas Sckenal<sup>®</sup>
      </Link>

      <nav className={styles.pill} aria-label="Main">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('orbit:open-first'))}>
          {t.site.nav.work}
        </button>
        <a href={`mailto:${EMAIL}`}>{t.site.nav.contact}</a>
        <Versions />
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
      </nav>

      <a className={styles.cta} href={`mailto:${EMAIL}`}>
        {t.site.nav.cta}
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
          <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </a>
    </header>
  );
}
