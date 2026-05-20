'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.scss';

// Day (default) ↔ Night (inverted palette).
// Mirrors the design system but flips page tokens — about/stack/contact
// invert, while locked-mood sections (Hero video, project scenes) stay.
// Persists choice to localStorage; initial sync via inline script in layout
// to avoid first-paint flash.
const STORAGE_KEY = 'theme-inverted';

export default function ThemeToggle() {
  const [inverted, setInverted] = useState(false);

  useEffect(() => {
    // Read initial state from DOM (set by inline script pre-hydration)
    setInverted(document.documentElement.classList.contains('theme-inverted'));
  }, []);

  const toggle = () => {
    const next = !inverted;
    setInverted(next);
    document.documentElement.classList.toggle('theme-inverted', next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore (Safari private mode, etc.)
    }
  };

  // Show the OPPOSITE of current mode — clicking switches TO that mode.
  const nextJp    = inverted ? '陽' : '陰';
  const nextLabel = inverted ? 'Day' : 'Night';

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.toggle}
      aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
      data-cursor
      data-cursor-label={`Switch to ${nextLabel} ↗`}
    >
      <span className={styles.jp} aria-hidden>{nextJp}</span>
      <span className={styles.label}>{nextLabel}</span>
    </button>
  );
}
