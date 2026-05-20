'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cinema } from '@/lib/easings';
import MobileMenu from './MobileMenu';
import ThemeToggle from '@/components/ui/ThemeToggle';
import styles from './Header.module.scss';

// All hrefs use absolute paths so the header works correctly from any route.
// On the home page, Next's <Link> handles smooth scroll to the hash anchor.
// On a case study page, clicking navigates back to home AND scrolls there.
const nav = [
  { label: 'Index',    href: '/#top' },
  { label: 'Work',     href: '/#projects' },
  { label: 'About',    href: '/#about' },
  { label: 'Contact',  href: '/#contact' },
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
        <Link href="/" className={styles.mark} data-cursor>
          <span className={styles.markJp}>静</span>
          <span className={styles.markEn}>Lucas</span>
        </Link>

        <nav className={styles.nav}>
          {nav.map((item, i) => (
            <Link key={item.href} href={item.href} className={styles.link} data-cursor>
              <span className={styles.linkIndex}>0{i + 1}</span>
              <span className={styles.linkLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <ThemeToggle />
          <Link href="/#contact" className={styles.cta} data-cursor>
            <span>Available · 2026</span>
            <span className={styles.dot} aria-hidden />
          </Link>

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
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
