'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cinema } from '@/lib/easings';
import styles from './MobileMenu.module.scss';

const items = [
  { label: 'Index',   href: '#top',      index: '01' },
  { label: 'About',   href: '#about',    index: '02' },
  { label: 'Work',    href: '#projects', index: '03' },
  { label: 'Stack',   href: '#stack',    index: '04' },
  { label: 'Contact', href: '#contact',  index: '05' },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      document.documentElement.classList.add('menu-open');
    } else {
      document.documentElement.classList.remove('menu-open');
    }
    return () => {
      document.documentElement.classList.remove('menu-open');
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{    clipPath: 'inset(100% 0 0 0)' }}
          transition={{ duration: 0.9, ease: cinema }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Close menu"
            data-cursor
          >
            <span className={styles.closeBar} />
            <span className={styles.closeBar} />
          </button>

          <div className={styles.kanji} aria-hidden>道</div>

          <nav className={styles.nav}>
            <motion.ul
              className={styles.list}
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
              }}
            >
              {items.map((item) => (
                <motion.li
                  key={item.href}
                  className={styles.item}
                  variants={{
                    hidden: { y: '110%' },
                    show:   { y: '0%', transition: { duration: 1, ease: cinema } },
                  }}
                >
                  <a
                    href={item.href}
                    className={styles.link}
                    onClick={onClose}
                    data-cursor
                  >
                    <span className={styles.linkIndex}>{item.index}</span>
                    <span className={styles.linkLabel}>{item.label}</span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className={styles.footer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.9, duration: 1 } }}
              exit={{ opacity: 0 }}
            >
              <span>Lucas Sckenal · MMXXVI</span>
              <span>静寂 · Quiet practice</span>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
