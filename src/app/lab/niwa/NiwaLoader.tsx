'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import styles from './NiwaScene.module.scss';

// The tree model is ~11 MB, so the scene stays empty for several seconds
// on a cold load. This veil shows real download progress and fades out
// once every asset is in. useProgress reads drei's global loading store,
// so it works outside the <Canvas>.
export default function NiwaLoader() {
  const { active, progress } = useProgress();
  const [everActive, setEverActive] = useState(false);
  // If the model is already cached, no loading ever starts — don't wait forever.
  const [graceOver, setGraceOver] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (active) setEverActive(true);
  }, [active]);

  useEffect(() => {
    const id = window.setTimeout(() => setGraceOver(true), 4000);
    return () => window.clearTimeout(id);
  }, []);

  const visible = active || (!everActive && !graceOver);

  useEffect(() => {
    if (visible) {
      setRemoved(false);
      return;
    }
    const id = window.setTimeout(() => setRemoved(true), 450);
    return () => window.clearTimeout(id);
  }, [visible]);

  if (removed) return null;

  return (
    <div
      className={`${styles.loader} ${visible ? '' : styles.loaderHidden}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.loaderKanji} aria-hidden>庭</span>
      <span className={styles.loaderText}>Loading the garden · {Math.round(progress)}%</span>
      <span className={styles.loaderBar} aria-hidden>
        <span className={styles.loaderBarFill} style={{ transform: `scaleX(${progress / 100})` }} />
      </span>
    </div>
  );
}
