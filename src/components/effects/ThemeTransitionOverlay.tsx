'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/components/providers/ThemeProvider';
import styles from './ThemeTransitionOverlay.module.scss';

// Full-viewport overlay that dims the page during the cinematic theme flip.
// Profile (over 1.5s):
//   0–20%   opacity climbs to 0.45 (fade in)
//   20–80%  holds at 0.45 (totality plateau — the actual theme flips here)
//   80–100% opacity falls back to 0 (fade out)
// Easing matches the global cinematic curve cubic-bezier(0.4, 0, 0.2, 1).
export default function ThemeTransitionOverlay() {
  const { transitioning } = useTheme();

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.45, 0.45, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            times: [0, 0.22, 0.78, 1],
            ease: [0.4, 0, 0.2, 1],
          }}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}
