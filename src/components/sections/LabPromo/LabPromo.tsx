'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { LAB_PIECES } from '@/content/lab';
import { cinema } from '@/lib/easings';
import styles from './LabPromo.module.scss';

// ── LabPromo — home page entry point for the Lab gallery ───────
// Replaces the "Lab" nav item that was overcrowding the header. Lives
// between Projects and Stack — the page flow becomes:
//   Work (real client/showcase) → Lab (experimental side) → Stack (tools)
//
// Visually consistent with the other interstitial sections (NightReading,
// GameWorlds) — labeled, titled, sub-explained, ends with a clear CTA.
// Includes mini-cards for each piece (kanji + name) so the user sees
// what's behind the door before clicking.

export default function LabPromo() {
  return (
    <section id="lab-promo" className={styles.section}>
      <div className={styles.inner}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.labelRow}>
            <span className={styles.label}>↳ Side experiments</span>
            <span className={styles.divider} aria-hidden />
            <span className={styles.labelJp}>実験 · Jikken</span>
          </div>

          <h2 className={styles.title}>
            <span className={styles.titleLine}>
              <SplitText text="What I build" by="word" delay={0.1} />
            </span>
            <span className={styles.titleLine}>
              <SplitText text="without a brief." by="word" delay={0.3} />
            </span>
          </h2>

          <Reveal delay={0.5} amount={0.4}>
            <p className={styles.body}>
              Standalone WebGL pieces — built when the client work is shipped
              and the question becomes &ldquo;what if?&rdquo;. Each one lives on its
              own full-route, no chrome, no exit signs except the way back.
            </p>
          </Reveal>
        </header>

        {/* ── Pieces preview — kanji + name cards ── */}
        <motion.ul
          className={styles.pieces}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.6 } },
          }}
        >
          {LAB_PIECES.map((piece) => (
            <motion.li
              key={piece.slug}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show:   { opacity: 1, y: 0, transition: { duration: 1, ease: cinema } },
              }}
            >
              <Link
                href={piece.href}
                className={styles.piece}
                data-cursor
                data-cursor-label={`Enter ${piece.title} ↗`}
              >
                <span className={styles.pieceKanji} aria-hidden>{piece.kanji}</span>
                <div className={styles.pieceMeta}>
                  <span className={styles.pieceName}>{piece.title}</span>
                  <span className={styles.pieceTagline}>{piece.tagline}</span>
                </div>
                <span className={styles.pieceArrow} aria-hidden>↗</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        {/* ── CTA ── */}
        <footer className={styles.footer}>
          <Reveal delay={0.3}>
            <Link
              href="/lab"
              className={styles.cta}
              data-cursor
              data-cursor-label="Enter lab →"
            >
              <span>Enter the lab</span>
              <span className={styles.ctaArrow} aria-hidden>→</span>
            </Link>
          </Reveal>
        </footer>
      </div>
    </section>
  );
}
