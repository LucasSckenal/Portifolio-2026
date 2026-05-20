'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cinema } from '@/lib/easings';
import MobileMenu from './MobileMenu';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguagePicker from '@/components/ui/LanguagePicker';
import { useT } from '@/components/providers/LanguageProvider';
import styles from './Header.module.scss';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useT();

  const nav = [
    { label: t.nav.index,   href: '/#top'      },
    { label: t.nav.work,    href: '/#projects' },
    { label: t.nav.about,   href: '/#about'    },
    { label: t.nav.contact, href: '/#contact'  },
  ];

  // On any subpage (e.g. /work/[slug]) the logo gains a `←` prefix and
  // acts as the explicit back-to-home action. Replaces the floating
  // back link that used to overlap the logo.
  const isSubpage = pathname !== '/' && pathname !== '';

  return (
    <>
      {/* Glass panel — sits BEHIND the header (no blend mode of its own) so
          backdrop-blur softens whatever's behind without interfering with
          the header text's mix-blend-difference adaptation. */}
      <div className={styles.glassPanel} aria-hidden />

      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.6, ease: cinema }}
      >
        <Link
          href="/"
          className={`${styles.mark} ${isSubpage ? styles.markBack : ''}`}
          data-cursor
          data-cursor-label={isSubpage ? 'Back to index ←' : undefined}
        >
          {isSubpage && <span className={styles.markBackArrow} aria-hidden>←</span>}
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
          <LanguagePicker />
          <ThemeToggle />
          <Link href="/#contact" className={styles.cta} data-cursor>
            <span>{t.meta.available}</span>
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
