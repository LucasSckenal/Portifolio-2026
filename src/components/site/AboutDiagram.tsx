'use client';

import { useEffect, useRef } from 'react';
import { useT } from '@/components/providers/LanguageProvider';
import { anchors } from './sceneAnchors';
import styles from './about.module.scss';

// "About me" isn't another card: the ring steps back, and the page turns into
// a technical drawing of the person in the middle. Each fact is a callout
// whose leader line lands on a point of his head, read from the 3D scene
// every frame (so the lines follow as he turns). Phones: the same callouts as
// one stacked sheet, no lines.
export default function AboutDiagram({ shown, onClose }: { shown: boolean; onClose: () => void }) {
  const t = useT();
  const a = t.site.about;
  const h = t.site.hero;
  const items = [...a.facts, { label: a.offLabel, value: a.offTitle, body: a.offBody }];
  // which side each callout sits on (matches HEAD_POINTS in HeroScene)
  const side = ['l', 'l', 'r', 'r', 'r'] as const;

  const svg = useRef<SVGSVGElement>(null);
  const notes = useRef<(HTMLElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    let starts: Array<{ x: number; y: number } | null> = [];
    let W = 0;
    let H = 0;
    const measure = () => {
      const box = el.getBoundingClientRect();
      W = box.width;
      H = box.height;
      starts = notes.current.map((n, i) => {
        if (!n || !n.offsetParent) return null;
        const r = n.getBoundingClientRect();
        const x = side[i] === 'l' ? r.right + 10 : r.left - 10;
        return { x: x - box.left, y: r.top + 14 - box.top };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    notes.current.forEach((n) => n && ro.observe(n));
    const paths = Array.from(el.querySelectorAll('path'));
    const dots = Array.from(el.querySelectorAll('circle'));
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const pts = anchors.head;
      paths.forEach((path, i) => {
        const s = starts[i];
        const p = pts?.[i];
        const dot = dots[i];
        if (!s || !p) {
          path.style.opacity = dot.style.opacity = '0';
          return;
        }
        const x = ((p.x + 1) / 2) * W;
        const y = ((1 - p.y) / 2) * H;
        // a callout's elbow: level out of the note, then straight to the point
        const ex = s.x + (x - s.x) * 0.45;
        path.setAttribute('d', `M${s.x.toFixed(1)} ${s.y.toFixed(1)} L${ex.toFixed(1)} ${s.y.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}`);
        dot.setAttribute('cx', x.toFixed(1));
        dot.setAttribute('cy', y.toFixed(1));
        path.style.opacity = dot.style.opacity = '';
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className={`${styles.root} ${shown ? styles.shown : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      onClick={onClose}
    >
      <svg ref={svg} className={styles.lines} aria-hidden>
        {items.map((_, i) => (
          <g key={i} style={{ ['--i' as string]: i }}>
            <path pathLength={1} />
            <circle r={3.5} />
          </g>
        ))}
      </svg>

      <header className={styles.head} onClick={(e) => e.stopPropagation()}>
        <span className={styles.label}>{a.label}</span>
        <h2 id="about-title">Lucas Sckenal</h2>
        <p>{a.body}</p>
      </header>

      <ol className={styles.callouts} onClick={(e) => e.stopPropagation()}>
        {items.map((it, i) => (
          <li
            key={it.label}
            ref={(e) => void (notes.current[i] = e)}
            className={`${styles.callout} ${styles[`c${i}`]} ${side[i] === 'r' ? styles.right : ''}`}
            style={{ ['--i' as string]: i }}
          >
            <span className={styles.label}>
              {String(i + 1).padStart(2, '0')} · {it.label}
            </span>
            <strong>{it.value}</strong>
            {'body' in it && <span className={styles.body}>{it.body}</span>}
          </li>
        ))}
      </ol>

      <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label={h.close}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </div>
  );
}
