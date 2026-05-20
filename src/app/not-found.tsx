'use client';

import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';
import styles from './not-found.module.scss';

export default function NotFound() {
  const { inverted } = useTheme();

  // The 404 carries the same Day/Night duality as the rest of the site.
  //   Day   → 迷 (mayoi · lost)
  //   Night → 闇 (yami · darkness / unknown)
  const kanji = inverted ? '闇' : '迷';
  const title = inverted
    ? ['Lost in', 'the darkness.']
    : ['You wandered', 'off the path.'];
  const body = inverted
    ? "The page you're looking for is somewhere in the dark — or never existed. Either way, the lanterns are out."
    : "The page you're looking for has either moved, been renamed, or simply never existed. Quiet either way.";

  return (
    <main className={`${styles.notFound} ${inverted ? styles.night : ''}`}>
      <div className={styles.kanji} aria-hidden>{kanji}</div>

      <div className={styles.inner}>
        <span className={styles.label}>Error · 404</span>

        <h1 className={styles.title}>
          <span className={styles.titleLine}>{title[0]}</span>
          <span className={styles.titleLine}>{title[1]}</span>
        </h1>

        <p className={styles.body}>{body}</p>

        <Link href="/" className={styles.cta} data-cursor>
          <span className={styles.ctaDot} aria-hidden />
          <span>{inverted ? 'Return to the lanterns' : 'Return to the start'}</span>
          <span className={styles.ctaArrow}>↗</span>
        </Link>

        <span className={styles.signature}>
          <span className={styles.signatureJp}>{inverted ? '夜行' : '静寂'}</span>
          <span className={styles.signatureLine} />
          <span className={styles.signatureLabel}>2026</span>
        </span>
      </div>
    </main>
  );
}
