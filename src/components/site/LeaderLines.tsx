'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { anchors, type Point } from './sceneAnchors';
import styles from './hero.module.scss';

// The side notes are annotations, and these are their leader lines: each one
// carries on from the note's rule and lands on the halo. With nothing in
// focus they rest on the ring's edges; point at a panel and both lines glide
// over and hold it from either side, following it as the ring turns. On
// "About me" they land on either side of Lucas's face in the portrait.
// Drawn straight into the DOM every frame: nothing here re-renders.
export default function LeaderLines({
  left,
  right,
}: {
  left: RefObject<HTMLElement | null>;
  right: RefObject<HTMLElement | null>;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    // layout, read only when something resizes
    let W = 0;
    let H = 0;
    let starts: (Point | null)[] = [null, null];
    const measure = () => {
      const box = el.getBoundingClientRect();
      W = box.width;
      H = box.height;
      starts = [left.current, right.current].map((n, k) => {
        if (!n || !n.offsetParent) return null; // hidden on narrow screens
        const r = n.getBoundingClientRect();
        return { x: (k ? r.right : r.left) - box.left, y: r.bottom - box.top };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (left.current) ro.observe(left.current);
    if (right.current) ro.observe(right.current);

    const now: (Point | null)[] = [null, null];
    let last = performance.now();
    let raf = 0;
    const px = (p: Point): Point => ({ x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H });
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const k = Math.min(1, ((t - last) / 1000) * 9);
      last = t;
      const f = anchors.focus;
      const face = !f && anchors.about && anchors.faceL && anchors.faceR;
      const want: (Point | null)[] = f
        ? [px({ x: f.x0, y: (f.y0 + f.y1) / 2 }), px({ x: f.x1, y: (f.y0 + f.y1) / 2 })]
        : face
          ? [px(anchors.faceL!), px(anchors.faceR!)]
          : [anchors.left && px(anchors.left), anchors.right && px(anchors.right)];
      for (let i = 0; i < 2; i++) {
        const s = starts[i];
        const w = want[i];
        const path = paths.current[i];
        const dot = dots.current[i];
        if (!path || !dot) continue;
        if (!s || !w) {
          path.style.opacity = dot.style.opacity = '0';
          now[i] = null;
          continue;
        }
        const c = now[i] ?? { ...w };
        c.x += (w.x - c.x) * k;
        c.y += (w.y - c.y) * k;
        now[i] = c;
        // down out of the note's rule, then across onto the target
        const drop = Math.max(40, (c.y - s.y) * 0.75);
        path.setAttribute(
          'd',
          `M${s.x.toFixed(1)} ${s.y.toFixed(1)} C ${s.x.toFixed(1)} ${(s.y + drop).toFixed(1)}, ` +
            `${((s.x + c.x) / 2).toFixed(1)} ${c.y.toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
        );
        dot.setAttribute('cx', c.x.toFixed(1));
        dot.setAttribute('cy', c.y.toFixed(1));
        path.style.opacity = dot.style.opacity = '';
      }
      el.classList.toggle(styles.wiresFocus, !!f || !!face);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [left, right]);

  return (
    <svg ref={svg} className={styles.wires} aria-hidden>
      {[0, 1].map((i) => (
        <g key={i}>
          <path ref={(e) => void (paths.current[i] = e)} pathLength={1} />
          <circle ref={(e) => void (dots.current[i] = e)} r={3} />
        </g>
      ))}
    </svg>
  );
}
