'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/components/providers/LanguageProvider';
import { LOCALES, localeMeta, type Locale } from '@/lib/i18n';
import styles from './LanguagePicker.module.scss';

// Minimalist locale dropdown for the header.
//
// The menu is portaled to document.body so it escapes the header's
// `mix-blend-mode: difference`. Without the portal, the dropdown text
// gets the difference treatment and renders as ghosted/double-vision
// over varying backgrounds. Inside the portal it renders with its own
// solid colors and a proper glass backdrop.
export default function LanguagePicker() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Portals only run on the client
  useEffect(() => setMounted(true), []);

  // Position the portaled menu under the trigger
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // Reposition on resize / scroll so the menu tracks the trigger
    const onReposition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      });
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition);
    };
  }, [open]);

  const handleSelect = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
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

      {/* Menu lives in a portal to escape the header's mix-blend-difference */}
      {mounted && open && createPortal(
        <div
          ref={menuRef}
          className={styles.menuFloating}
          style={{ top: menuPos.top, right: menuPos.right }}
        >
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
        </div>,
        document.body
      )}
    </>
  );
}
