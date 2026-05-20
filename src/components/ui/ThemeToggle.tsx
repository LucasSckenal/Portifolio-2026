'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import styles from './ThemeToggle.module.scss';

// Eclipse toggle — the "conductor" of the cinematic theme transition.
// A small floating circle that holds the current celestial body (sun or moon).
// On click, a shadow disc sweeps across, perfectly eclipsing the visible body
// at totality (50% of the 1.5s animation). The sun↔moon swap happens behind
// the shadow, so the change feels instantaneous *to the user* but is in fact
// hidden during the darkest moment of the eclipse.
export default function EclipseToggle() {
  const { inverted, transitioning, toggle } = useTheme();

  const nextLabel = inverted ? 'Day' : 'Night';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={transitioning}
      className={[
        styles.toggle,
        inverted ? styles.inverted : '',
        transitioning ? styles.transitioning : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
      data-cursor
      data-cursor-label={`Eclipse → ${nextLabel} ☾`}
    >
      <span className={styles.sun} aria-hidden />
      <span className={styles.moon} aria-hidden />
      <span className={styles.shadow} aria-hidden />
      <span className={styles.halo} aria-hidden />
    </button>
  );
}
