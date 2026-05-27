'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import styles from './ScrollProgress.module.scss';

// Thin shu-iro line at the very top of the viewport that fills as the
// user scrolls through the page. Spring-smoothed so it feels organic, not
// twitchy. Subliminal premium signal — most people don't consciously notice
// it but the experience reads "polished."
//
// Hidden on /lab/* routes — immersive 3D pieces don't have meaningful
// scroll progress and the bar would distract from the scene.
export default function ScrollProgress() {
  // IMPORTANT: all hooks must be called BEFORE any conditional return,
  // otherwise React's hook order changes between renders → runtime error.
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });

  // Early return AFTER all hooks — safe.
  if (pathname?.startsWith('/lab/')) return null;

  return (
    <motion.div
      className={styles.bar}
      style={{ scaleX }}
      aria-hidden
    />
  );
}
