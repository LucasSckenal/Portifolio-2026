'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { setupGLTFLoader } from '@/lib/gltf-setup';
import styles from './NiwaScene.module.scss';

// One-time DRACO decoder configuration — must run before any useGLTF call
setupGLTFLoader();

// Mobile fallback for Niwa lives inline here for now (simpler than a
// dedicated component). When Niwa is feature-complete, lift it into its
// own NiwaMobileFallback.tsx following the Kagami pattern.
const NiwaScene = dynamic(() => import('./NiwaScene'), { ssr: false });

const MOBILE_QUERY = '(max-width: 900px)';

export default function NiwaClient() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (isMobile === null) return null;

  // Mobile: simple fallback while the dedicated MobileFallback for Niwa
  // is still TBD. Mirrors Kagami's overlay layout.
  if (isMobile) {
    return (
      <main className={styles.page}>
        <div className={styles.overlay}>
          <div className={styles.topBar}>
            <Link href="/lab" className={styles.back}>
              <span className={styles.backArrow}>←</span>
              <span>Back to lab</span>
            </Link>
          </div>
          <div className={styles.signature}>
            <span className={styles.signatureKanji}>庭</span>
            <span className={styles.signatureName}>Niwa</span>
            <span className={styles.signatureSub}>WIP · view on desktop</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <NiwaScene />

      <div className={styles.overlay}>
        <div className={styles.topBar}>
          <Link href="/lab" className={styles.back} data-cursor data-cursor-label="Back to lab ←">
            <span className={styles.backArrow}>←</span>
            <span>Back to lab</span>
          </Link>
        </div>

        <div className={styles.signature}>
          <span className={styles.signatureKanji}>庭</span>
          <span className={styles.signatureName}>Niwa</span>
          <span className={styles.signatureSub}>WebGL study · 2026 · WIP</span>
        </div>

        <div className={styles.hint}>
          <span>Drag to orbit · stones drifting soon · sound TBD</span>
        </div>
      </div>
    </main>
  );
}
