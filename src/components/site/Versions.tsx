'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/components/providers/LanguageProvider';
import { EDITIONS } from '@/content/editions';
import styles from './versions.module.scss';

// Nav entry to every edition of the portfolio. Also opened by the
// "versions" cell of the social comb (window event `versions:open`).
export default function Versions() {
  const t = useT();
  const v = t.site.versions;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      button.current?.focus();
    };
    window.addEventListener('versions:open', onOpen);
    return () => window.removeEventListener('versions:open', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={styles.root}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="versions-list"
        onClick={() => setOpen((o) => !o)}
      >
        {v.label}
      </button>

      <div id="versions-list" className={`${styles.pop} ${open ? styles.open : ''}`} hidden={!open}>
        <p className={styles.title}>{v.title}</p>
        <ol className={styles.list}>
          {EDITIONS.map((e, i) => (
            <li key={e.id} style={{ ['--i' as string]: i }}>
              <Link href={e.href} className={styles.item} aria-current={e.current ? 'page' : undefined} onClick={() => setOpen(false)}>
                <span className={styles.thumb}>
                  <Image src={e.thumb} alt="" fill sizes="112px" />
                  {e.clip && <ThumbClip src={e.clip} active={open} />}
                  <span className={styles.id}>{e.id}</span>
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>{e.name}</span>
                  <span className={styles.period}>{e.current ? v.current : e.period}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// The edition's loop, layered over its still. It only loads and plays
// while the menu is open, on screen, and once it can play through; it
// never runs for reduced-motion or data-saver visitors (the still stays).
function ThumbClip({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setAllowed(!reduced && !saveData);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !allowed) return;
    if (!active) {
      v.pause();
      return;
    }
    if (v.preload !== 'auto') {
      v.preload = 'auto';
      v.load();
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [active, allowed]);

  if (!allowed) return null;
  return (
    <video
      ref={ref}
      className={`${styles.clip} ${ready ? styles.clipReady : ''}`}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      onCanPlayThrough={() => setReady(true)}
      aria-hidden
    />
  );
}
