'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useT } from '@/components/providers/LanguageProvider';
import { LOCALES, localeMeta } from '@/lib/i18n';
import { EDITIONS } from '@/content/editions';
import { EMAIL, SOCIALS } from './links';
import styles from './mobileMenu.module.scss';

// Phones and narrow screens: everything the nav pill and the social comb
// carry on desktop, in one glass sheet under a Menu button.
export default function MobileMenu() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={styles.root}>
      <button
        ref={button}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="mobile-sheet"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.burger} data-open={open} aria-hidden>
          <i />
          <i />
        </span>
        {t.site.nav.menu}
      </button>

      <div id="mobile-sheet" className={`${styles.sheet} ${open ? styles.open : ''}`} hidden={!open}>
        <nav className={styles.links} aria-label="Main">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent('orbit:open-first'));
            }}
          >
            {t.site.nav.work}
          </button>
          <a href={`mailto:${EMAIL}`}>{t.site.nav.contact}</a>
        </nav>

        <p className={styles.label}>{t.site.versions.title}</p>
        <ul className={styles.editions}>
          {EDITIONS.map((e) => (
            <li key={e.id}>
              <Link href={e.href} onClick={() => setOpen(false)} aria-current={e.current ? 'page' : undefined}>
                <b>{e.id}</b>
                <span>{e.name}</span>
                <em>{e.current ? t.site.versions.current : e.period}</em>
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.label}>{t.site.nav.language}</p>
        <div className={styles.langs}>
          {LOCALES.map((l) => (
            <button key={l} type="button" aria-pressed={l === locale} onClick={() => setLocale(l)}>
              {localeMeta[l].short}
            </button>
          ))}
        </div>

        <div className={styles.socials}>
          {SOCIALS.map((s) => (
            <a key={s.id} href={s.href} {...(s.id !== 'email' ? { target: '_blank', rel: 'noreferrer' } : {})}>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
