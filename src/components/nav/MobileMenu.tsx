'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { cinema } from '@/lib/easings';
import { useLocale } from '@/components/providers/LanguageProvider';
import { LOCALES, localeMeta, type Locale } from '@/lib/i18n';
import styles from './MobileMenu.module.scss';

// Absolute hrefs so the menu navigates back to home from any route.
const items = [
  { label: 'Index',   href: '/#top',      index: '01' },
  { label: 'About',   href: '/#about',    index: '02' },
  { label: 'Work',    href: '/#projects', index: '03' },
  { label: 'Stack',   href: '/#stack',    index: '04' },
  { label: 'Contact', href: '/#contact',  index: '05' },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: Props) {
  const { locale, setLocale } = useLocale();
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
          {/* Drifting kanji watermark */}
          <div className={styles.kanji} aria-hidden>道</div>

          {/* Top bar — label + close */}
          <div className={styles.topBar}>
            <span className={styles.topLabel}>Menu</span>
            <button
              className={styles.close}
              onClick={onClose}
              aria-label="Close menu"
              data-cursor
            >
              <span className={styles.closeBar} />
              <span className={styles.closeBar} />
            </button>
          </div>

          {/* Nav list */}
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
                    hidden: { opacity: 0 },
                    show:   { opacity: 1, transition: { duration: 0.6, ease: cinema } },
                  }}
                >
                  <Link
                    href={item.href}
                    className={styles.link}
                    onClick={onClose}
                    data-cursor
                  >
                    <span className={styles.linkIndex}>{item.index}</span>
                    <span className={styles.linkLabelWrap}>
                      <span className={styles.linkLabel}>{item.label}</span>
                    </span>
                    <span className={styles.linkArrow} aria-hidden>→</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </nav>

          {/* Language strip — quick access in mobile menu */}
          <motion.div
            className={styles.langStrip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.85, duration: 0.8 } }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.langStripLabel}>言語 · Language</span>
            <div className={styles.langStripList}>
              {LOCALES.map((code: Locale) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`${styles.langStripItem} ${code === locale ? styles.langStripItemActive : ''}`}
                  aria-label={`Switch to ${localeMeta[code].name}`}
                  aria-pressed={code === locale}
                >
                  {localeMeta[code].short}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            className={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.9, duration: 1 } }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.footerLeft}>
              <span className={styles.footerLabel}>
                Lucas Sckenal · Frontend / Motion
              </span>
              <span className={styles.footerYear}>
                Crafted in MMXXVI
              </span>
            </div>
            <span className={styles.footerSignature} aria-hidden>静寂</span>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
