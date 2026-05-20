'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import styles from './Cursor.module.scss';

// Dot + lagging ring + contextual label. Hidden on touch / coarse pointers.
// Add `data-cursor` to any element for hover state, plus
// `data-cursor-label="View ↗"` to show a contextual label next to the cursor.
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.5 });
  const dotX = useSpring(x, { stiffness: 1000, damping: 50 });
  const dotY = useSpring(y, { stiffness: 1000, damping: 50 });

  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse) return;

    document.documentElement.classList.add('has-custom-cursor');
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const interactiveEl =
        target?.closest<HTMLElement>(
          'a, button, [data-cursor], input, textarea, label'
        ) ?? null;
      setHover(!!interactiveEl);

      // Read the closest data-cursor-label up the tree (defaults to null)
      const labelEl = target?.closest<HTMLElement>('[data-cursor-label]') ?? null;
      const nextLabel = labelEl?.dataset.cursorLabel ?? null;
      setLabel(nextLabel);
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [x, y]);

  // Position the label to follow the cursor (cheap RAF — no spring needed
  // because it should hug the cursor tightly).
  useEffect(() => {
    if (!enabled || !labelRef.current) return;
    let raf = 0;
    const update = () => {
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${x.get() + 24}px, ${y.get() + 8}px)`;
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className={`${styles.ring} ${hover ? styles.ringHover : ''} ${label ? styles.ringLabel : ''}`}
        style={{ x: ringX, y: ringY }}
        aria-hidden
      />
      <motion.div
        className={`${styles.dot} ${hover ? styles.dotHover : ''}`}
        style={{ x: dotX, y: dotY }}
        aria-hidden
      />
      <div
        ref={labelRef}
        className={`${styles.label} ${label ? styles.labelShow : ''}`}
        aria-hidden
      >
        {label}
      </div>
    </>
  );
}
