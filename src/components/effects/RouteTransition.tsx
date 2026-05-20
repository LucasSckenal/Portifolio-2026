'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './RouteTransition.module.scss';

// Cinematic ink-wipe between routes.
// On every pathname change (skipping the initial render), a dark curtain
// sweeps UP through the entire viewport in one motion — wiping the old
// page reveal of the new one. Pure visual flourish; navigation happens
// instantly underneath. Skips first paint so the Hero's own opening
// curtain isn't doubled.
export default function RouteTransition() {
  const pathname = usePathname();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setActiveKey(pathname);
    const t = window.setTimeout(() => setActiveKey(null), 1400);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {activeKey && (
        <motion.div
          key={activeKey}
          className={styles.curtain}
          initial={{ y: '100%' }}
          animate={{ y: '-100%' }}
          transition={{ duration: 1.2, ease: [0.83, 0, 0.17, 1] }}
          aria-hidden
        >
          <motion.span
            className={styles.curtainGlyph}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{
              duration: 1.2,
              times: [0, 0.3, 0.65, 1],
              ease: 'easeOut',
            }}
          >
            静
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
