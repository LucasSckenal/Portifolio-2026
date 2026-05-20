import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <div className={styles.kanji} aria-hidden>迷</div>

      <div className={styles.inner}>
        <span className={styles.label}>Error · 404</span>

        <h1 className={styles.title}>
          <span className={styles.titleLine}>You wandered</span>
          <span className={styles.titleLine}>off the path.</span>
        </h1>

        <p className={styles.body}>
          The page you&apos;re looking for has either moved, been renamed,
          or simply never existed. Quiet either way.
        </p>

        <Link href="/" className={styles.cta} data-cursor>
          <span className={styles.ctaDot} aria-hidden />
          <span>Return to the start</span>
          <span className={styles.ctaArrow}>↗</span>
        </Link>

        <span className={styles.signature}>
          <span className={styles.signatureJp}>静寂</span>
          <span className={styles.signatureLine} />
          <span className={styles.signatureLabel}>2026</span>
        </span>
      </div>
    </main>
  );
}
