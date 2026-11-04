// =========================================
// Every edition of the portfolio, newest first.
//
// The portfolio is meant to keep growing: each redesign ships as the new
// home and the previous one stays reachable as an archived edition.
//
// To archive the current edition before the next redesign:
//   1. git tag it (e.g. v2-orbita) and push the tag
//   2. move its route files into src/app/(arquivo)/<id>/ with their layout
//   3. capture a few screens of it and run
//      node scripts/edition-thumb.mjs <id> <captures…>  (poster + loop)
//   4. add the new edition at the top of this list and mark it current
// =========================================

export type Edition = {
  id: string; // short label shown in the list (v1, v2…)
  name: string; // the edition's own title
  period: string; // when it was the live site
  href: string;
  thumb: string; // 480×300 still (poster)
  clip?: string; // short loop through the edition (scripts/edition-thumb.mjs)
  current?: boolean;
};

export const EDITIONS: Edition[] = [
  { id: 'v2', name: 'Órbita', period: 'nov 2026 —', href: '/', thumb: '/editions/v2.webp', clip: '/editions/v2.mp4', current: true },
  { id: 'v1', name: '静寂 · Seis mundos', period: 'mai — nov 2026', href: '/2026', thumb: '/editions/v1.webp', clip: '/editions/v1.mp4' },
];
