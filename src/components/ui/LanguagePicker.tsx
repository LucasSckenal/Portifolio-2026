'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/providers/LanguageProvider';
import { LOCALES, localeMeta, type Locale } from '@/lib/i18n';
import styles from './LanguagePicker.module.scss';

// Minimalist locale dropdown for the header.
//
// Why early-access matters: a non-English visitor who lands on the page
// won't make it to the Contact section (where the bigger language list
// lives) without first understanding what they're reading. Surfacing
// the locale switch in the header solves that.
export default function LanguagePicker() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={ref} className={styles.picker}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        data-cursor
        data-cursor-label="Change language"
      >
        <span className={styles.triggerJp} aria-hidden>言</span>
        <span className={styles.triggerCode}>{localeMeta[locale].short}</span>
        <span className={styles.triggerArrow} aria-hidden>▾</span>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox" aria-label="Languages">
          {LOCALES.map((code: Locale) => {
            const isActive = code === locale;
            return (
              <li key={code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                  data-cursor
                >
                  <span className={styles.optionCode}>{localeMeta[code].short}</span>
                  <span className={styles.optionName}>{localeMeta[code].name}</span>
                  {isActive && <span className={styles.optionDot} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
