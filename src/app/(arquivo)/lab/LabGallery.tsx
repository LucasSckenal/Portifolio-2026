'use client';

import Link from 'next/link';
import { LAB_PIECES } from '@/content/lab';
import { useT } from '@/components/providers/LanguageProvider';
import styles from './lab.module.scss';

// Client half of /lab so the gallery follows the visitor's language.
export default function LabGallery() {
  const t = useT();
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
            <span className={styles.titleLine}>{t.lab.titleLine1}</span>
            <span className={styles.titleLine}>{t.lab.titleLine2}</span>
          </h1>

          <p className={styles.intro}>{t.lab.intro}</p>
        </header>

        {/* ── Pieces grid ─── */}
        <ul className={styles.grid}>
          {LAB_PIECES.map((p, i) => {
            const copy = t.lab.pieces[p.slug];
            return (
            <li key={p.slug} className={styles.cell}>
              <Link
                href={p.href}
                className={`${styles.card} ${p.preview ? styles.cardWithPreview : ''}`}
                data-cursor
                data-cursor-label={`${t.lab.enter} ${p.title} ↗`}
              >
                {/* ── Top zone: preview image (when present) ── */}
                {p.preview && (
                  <div
                    className={styles.cardPreview}
                    style={{ backgroundImage: `url(${p.preview})` }}
                    aria-hidden
                  >
                    {/* Big kanji overlaid on the preview — identity marker */}
                    <span className={styles.cardPreviewKanji}>{p.kanji}</span>
                  </div>
                )}

                {/* ── Bottom zone: text info (always solid background) ── */}
                <div className={styles.cardInfo}>
                  {/* Index + status meta */}
                  <div className={styles.cardMeta}>
                    <span className={styles.cardIndex}>0{i + 1}</span>
                    <span className={styles.cardStatus}>{copy?.status ?? p.status} · {p.year}</span>
                  </div>

                  {/* Kanji-only fallback when no preview (graceful) */}
                  {!p.preview && (
                    <div className={styles.cardKanji} aria-hidden>{p.kanji}</div>
                  )}

                  {/* Title + tagline */}
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>
                      {p.title}
                      <span className={styles.cardTitleSub}>· {p.kanjiLabel.split('·')[1]?.trim()}</span>
                    </h2>
                    <p className={styles.cardTagline}>{copy?.tagline ?? p.tagline}</p>
                    <p className={styles.cardDescription}>{copy?.description ?? p.description}</p>
                  </div>

                  {/* Tech chips */}
                  <ul className={styles.cardTech}>
                    {p.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>

                  {/* Enter arrow */}
                  <span className={styles.cardEnter}>
                    {t.lab.enter} <span aria-hidden>↗</span>
                  </span>
                </div>
              </Link>
            </li>
            );
          })}
        </ul>

        {/* ── Footer note ─── */}
        <footer className={styles.footer}>
          <p>{t.lab.footer}</p>
        </footer>
      </div>
    </article>
  );
}
