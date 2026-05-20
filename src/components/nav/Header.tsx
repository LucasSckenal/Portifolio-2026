'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cinema } from '@/lib/easings';
import MobileMenu from './MobileMenu';
import styles from './Header.module.scss';

const nav = [
  { label: 'Index',    href: '#top' },
  { label: 'Work',     href: '#projects' },
  { label: 'About',    href: '#about' },
  { label: 'Contact',  href: '#contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.6, ease: cinema }}
      >
        <a href="#top" className={styles.mark} data-cursor>
          <span className={styles.markJp}>静</span>
          <span className={styles.markEn}>Lucas</span>
        </a>

        <nav className={styles.nav}>
          {nav.map((item, i) => (
            <a key={item.href} href={item.href} className={styles.link} data-cursor>
              <span className={styles.linkIndex}>0{i + 1}</span>
              <span className={styles.linkLabel}>{item.label}</span>
            </a>
          ))}
        </nav>

        <a href="#contact" className={styles.cta} data-cursor>
          <span>Available · 2026</span>
          <span className={styles.dot} aria-hidden />
        </a>

        {/* Mobile menu trigger — only visible on small screens */}
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          data-cursor
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
