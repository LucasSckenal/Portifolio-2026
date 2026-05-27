import type { Metadata } from 'next';
import Link from 'next/link';
import { LAB_PIECES } from '@/content/lab';
import styles from './lab.module.scss';

export const metadata: Metadata = {
  title: 'Lab — Experimental pieces',
  description:
    '3D, WebGL, and shader experiments. Standalone immersive pieces with no client brief, no deliverable, no specification.',
  openGraph: {
    title: 'Lab · Lucas Sckenal',
    description: 'Experimental WebGL studies — standalone immersive pieces.',
  },
};

export default function LabIndex() {
  return (
    <article className={styles.lab}>
      <div className={styles.inner}>
        {/* ── Header ─── */}
        <header className={styles.header}>
          <div className={styles.labelRow}>
            <span className={styles.label}>008 — Lab</span>
            <span className={styles.divider} aria-hidden />
            <span className={styles.labelJp}>実験 · Jikken</span>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleLine}>Experiments</span>
            <span className={styles.titleLine}>without a brief.</span>
          </h1>

          <p className={styles.intro}>
            Standalone WebGL pieces — built when the client work is shipped and
            the question is just &ldquo;what if?&rdquo;. Each one is a full
            immersive route on its own, no header, no chrome, no exit signs
            except the link back to the portfolio.
          </p>
        </header>

        {/* ── Pieces grid ─── */}
        <ul className={styles.grid}>
          {LAB_PIECES.map((p, i) => (
            <li key={p.slug} className={styles.cell}>
              <Link
                href={p.href}
                className={styles.card}
                data-cursor
                data-cursor-label={`Enter ${p.title} ↗`}
              >
                {/* Index + status meta */}
                <div className={styles.cardMeta}>
                  <span className={styles.cardIndex}>
                    0{i + 1}
                  </span>
                  <span className={styles.cardStatus}>{p.status} · {p.year}</span>
                </div>

                {/* Centerpiece kanji */}
                <div className={styles.cardKanji} aria-hidden>{p.kanji}</div>

                {/* Title + tagline */}
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>
                    {p.title}
                    <span className={styles.cardTitleSub}>· {p.kanjiLabel.split('·')[1]?.trim()}</span>
                  </h2>
                  <p className={styles.cardTagline}>{p.tagline}</p>
                  <p className={styles.cardDescription}>{p.description}</p>
                </div>

                {/* Tech chips */}
                <ul className={styles.cardTech}>
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                {/* Enter arrow */}
                <span className={styles.cardEnter}>
                  Enter <span aria-hidden>↗</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Footer note ─── */}
        <footer className={styles.footer}>
          <p>More pieces in development — shaders, audio-reactive sketches, kinetic type studies. Drop in occasionally.</p>
        </footer>
      </div>
    </article>
  );
}
