'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MobileFallback from './MobileFallback';
import SoundToggle from './SoundToggle';
import styles from './KagamiScene.module.scss';

// Client-only orchestrator. Picks between:
//   · Mobile (<= 900px) → static fallback page (own layout, scrollable)
//   · Desktop           → full WebGL scene + overlay chrome (immersive, fixed)
//
// The mobile check happens after mount (window not available on server),
// so the very first paint shows nothing — that's preferable to flashing the
// wrong variant. Mobile typically resolves in <50ms.
const KagamiScene = dynamic(() => import('./KagamiScene'), { ssr: false });

const MOBILE_QUERY = '(max-width: 900px)';

export default function KagamiClient() {
  // null = haven't measured the viewport yet
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // First paint: nothing — avoids flash before viewport is known
  if (isMobile === null) return null;

  // Mobile: static fallback owns its own page layout (scrollable)
  if (isMobile) return <MobileFallback />;

  // Desktop: immersive WebGL scene + floating overlay chrome
  return (
    <main className={styles.page}>
      <KagamiScene />

      {/* ── Overlay UI (desktop only) ── */}
      <div className={styles.overlay}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.back} data-cursor data-cursor-label="Back to portfolio ←">
            <span className={styles.backArrow}>←</span>
            <span>Back to portfolio</span>
          </Link>
          <SoundToggle />
        </div>

        <div className={styles.signature}>
          <span className={styles.signatureKanji}>鏡</span>
          <span className={styles.signatureName}>Kagami</span>
          <span className={styles.signatureSub}>WebGL study · 2026</span>
        </div>

        <div className={styles.hint}>
          <span>Drag to orbit · move cursor for ripples · toggle sound upper right</span>
        </div>
      </div>
    </main>
  );
}
