'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cinema } from '@/lib/easings';
import MobileMenu from './MobileMenu';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguagePicker from '@/components/ui/LanguagePicker';
import { useT } from '@/components/providers/LanguageProvider';
import styles from './Header.module.scss';

// Nav order follows the page scroll order: Index → About → Work → Contact.
// "Where am I" indication is handled by the right-side SideIndex (no need
// to duplicate it in the header with an active dot — less is more).
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const pathname = usePathname();
  const t = useT();
  const { scrollY } = useScroll();

  // On any subpage (e.g. /work/[slug]) the logo gains a `←` prefix and
  // acts as the explicit back-to-home action.
  const isSubpage = pathname !== '/' && pathname !== '';

  const nav = [
    { label: t.nav.index,   href: '/#top'      },
    { label: t.nav.about,   href: '/#about'    },
    { label: t.nav.work,    href: '/#projects' },
    { label: t.nav.contact, href: '/#contact'  },
  ];
  // Lab no longer in the global nav — too crowded at 5 items. Lab is
  // surfaced via the dedicated LabPromo section in the home page flow
  // (between Projects and Stack), so users still discover it naturally.

  // Condense the header after 120px of scroll — softer padding, smaller logo.
  // IMPORTANT: this hook must be called BEFORE any conditional return, or
  // React complains about inconsistent hook order between renders.
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setCondensed(latest > 120);
  });

  // Immersive lab pieces (/lab/[piece]) hide the global header entirely —
  // they own the full viewport. The /lab index itself KEEPS the header
  // (it's a regular browseable page, not an immersive scene).
  // Early return AFTER all hooks above.
  if (pathname?.startsWith('/lab/')) return null;

  return (
    <>
      {/* Glass panel — sits BEHIND the header */}
      <div className={`${styles.glassPanel} ${condensed ? styles.glassPanelCondensed : ''}`} aria-hidden />

      <motion.header
        className={`${styles.header} ${condensed ? styles.headerCondensed : ''}`}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.6, ease: cinema }}
      >
        {/* Inner container constrains the layout width — same max-width as
            the page content, so the nav doesn't stretch edge-to-edge on
            wide screens. Aligns with the visual rhythm of the rest of the site. */}
        <div className={styles.inner}>
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
              <Link
                key={item.href}
                href={item.href}
                className={styles.link}
                data-cursor
              >
                <span className={styles.linkIndex}>0{i + 1}</span>
                <span className={styles.linkLabel}>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className={styles.right}>
            {/* Language picker first so non-English visitors immediately see
                they can switch. Theme toggle (eclipse) right after. */}
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
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
