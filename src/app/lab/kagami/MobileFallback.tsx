'use client';

import Link from 'next/link';
import styles from './MobileFallback.module.scss';

// ── Mobile fallback ──────────────────────────────────────
// The full Kagami scene is GPU-intensive (HDRI lighting, MeshReflectorMaterial
// doing render-to-texture, canvas-based ripple distortion, custom moon shader,
// postprocessing pipeline). On phones it would lag, drain battery, and
// potentially crash the WebGL context.
//
// This fallback presents the concept with the same atmospheric language but
// pure CSS — gradient void background, breathing kanji, project metadata,
// and a clear note that the full piece is desktop-only.
//
// When Lucas drops a real screenshot at /public/lab/kagami/poster.jpg the
// component will use that as a hero image; until then, the kanji-only
// composition stands in.

const POSTER_PATH = '/lab/kagami/poster.jpg';

export default function MobileFallback() {
  return (
    <main className={styles.page}>
      {/* ── Back link ── */}
      <Link href="/lab" className={styles.back}>
        <span className={styles.backArrow}>←</span>
        <span>Back to lab</span>
      </Link>

      {/* ── Hero: kanji centerpiece (will show poster.jpg if you drop one) ── */}
      <section className={styles.hero}>
        <div className={styles.heroFrame}>
          {/*
            If poster.jpg exists at /public/lab/kagami/poster.jpg, it shows.
            If 404, browser hides the broken image and the kanji shines through.
          */}
          <picture>
            <img
              src={POSTER_PATH}
              alt="Kagami — a floating torii in the void"
              className={styles.heroImage}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </picture>
          <div className={styles.heroKanji} aria-hidden>鏡</div>
        </div>
      </section>

      {/* ── Project info ── */}
      <section className={styles.info}>
        <div className={styles.labelRow}>
          <span className={styles.label}>008 — Lab piece</span>
          <span className={styles.divider} aria-hidden />
          <span className={styles.labelJp}>鏡 · Kagami</span>
        </div>

        <h1 className={styles.title}>
          A floating torii<br />in an infinite void.
        </h1>

        <p className={styles.description}>
          A 3D study in stillness and disturbance. The torii suspended in pure
          darkness, the lanterns its only warmth. Mouse moves stir the water;
          sound enters when you ask.
        </p>

        {/* ── Desktop-only notice ── */}
        <div className={styles.notice}>
          <div className={styles.noticeIcon} aria-hidden>◇</div>
          <div>
            <h2 className={styles.noticeTitle}>Designed for desktop</h2>
            <p className={styles.noticeBody}>
              This piece runs a real-time 3D scene with custom shaders,
              dynamic reflections, and a postprocessing pipeline. It needs
              a discrete GPU and a mouse to behave properly.
            </p>
            <p className={styles.noticeBody}>
              Visit on a desktop or laptop to enter the full experience.
            </p>
          </div>
        </div>

        {/* ── Tech stack ── */}
        <div className={styles.techWrap}>
          <span className={styles.techLabel}>Built with</span>
          <ul className={styles.techList}>
            <li>Three.js</li>
            <li>React Three Fiber</li>
            <li>Custom GLSL shaders</li>
            <li>HDRI environment</li>
            <li>Postprocessing</li>
            <li>Web Audio</li>
          </ul>
        </div>

        {/* ── Back to portfolio CTA ── */}
        <Link href="/" className={styles.portfolioCta}>
          <span>← Back to portfolio</span>
        </Link>
      </section>
    </main>
  );
}
