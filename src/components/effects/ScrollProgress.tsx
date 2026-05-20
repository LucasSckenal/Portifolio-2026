'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import styles from './ScrollProgress.module.scss';

// Thin shu-iro line at the very top of the viewport that fills as the
// user scrolls through the page. Spring-smoothed so it feels organic, not
// twitchy. Subliminal premium signal — most people don't consciously notice
// it but the experience reads "polished."
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={styles.bar}
      style={{ scaleX }}
      aria-hidden
    />
  );
}
