'use client';

import { useState, type ReactElement } from 'react';
import { useT } from '@/components/providers/LanguageProvider';
import { EMAIL, SOCIALS } from './links';
import styles from './comb.module.scss';

// ── Social honeycomb, compact ───────────────────────────────────────
// Seven pointy-top hex cells in one SVG, dark like the reference: linked
// cells light up and trade their icon for a name; cells with no link are
// comb only (no placeholder brands).

const R = 100;
const DX = Math.sqrt(3) * R;
const DY = 1.5 * R;
const HEX = 95;

function hexPoints(cx: number, cy: number, r = HEX) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

const RING: Array<[number, number]> = [
  [-DX / 2, -DY],
  [DX / 2, -DY],
  [DX, 0],
  [DX / 2, DY],
  [-DX / 2, DY],
  [-DX, 0],
];

const ICONS: Record<string, ReactElement> = {
  github: (
    <path
      transform="translate(-21 -21) scale(1.75)"
      fill="currentColor"
      d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.57v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.6-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .3"
    />
  ),
  linkedin: (
    <path
      transform="translate(-19 -19) scale(1.6)"
      fill="currentColor"
      d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
    />
  ),
  email: (
    <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round">
      <rect x="-21" y="-15" width="42" height="30" rx="5" />
      <path d="M-19 -12.5 0 3l19-15.5" />
    </g>
  ),
  archive: (
    <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-16 -3a16 16 0 1 1 4.7 11.3" />
      <path d="M-16 -13v10h10" />
      <path d="M0 -9v9l6 4" />
    </g>
  ),
};

export default function SocialComb() {
  const t = useT();
  const s = t.site.social;
  const [copied, setCopied] = useState(false);

  const copyEmail = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      e.preventDefault();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // no clipboard: the mailto link proceeds
    }
  };

  const cells = [
    ...SOCIALS.map((x) => ({
      id: x.id as string,
      label: x.id === 'email' ? (copied ? s.copied : s.copy) : x.label,
      href: x.href,
      external: x.id !== 'email',
      onClick: x.id === 'email' ? copyEmail : undefined,
    })),
    {
      id: 'archive',
      label: t.site.versions.label,
      href: '/2026',
      external: false,
      onClick: (e: React.MouseEvent) => {
        // Phones have no nav pill: let the link go straight to the archive
        if (window.matchMedia('(max-width: 860px)').matches) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('versions:open'));
      },
    },
  ];

  return (
    <nav className={styles.comb} aria-label={s.title}>
      <svg viewBox="-280 -250 560 500">
        <defs>
          <linearGradient id="comb-orb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff5fa2" />
            <stop offset="0.45" stopColor="#7c5cff" />
            <stop offset="1" stopColor="#2fd3c4" />
          </linearGradient>
          <radialGradient id="comb-shine" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {RING.map(([x, y], i) => {
          const c = cells[i];
          if (!c) return <polygon key={i} className={styles.empty} points={hexPoints(x, y)} />;
          return (
            <a
              key={c.id}
              href={c.href}
              className={styles.cell}
              aria-label={c.label}
              onClick={c.onClick}
              {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              <polygon points={hexPoints(x, y)} />
              <polygon className={styles.fill} points={hexPoints(x, y)} />
              <g className={styles.icon} transform={`translate(${x} ${y})`}>
                {ICONS[c.id]}
              </g>
              <text className={styles.label} x={x} y={y} textAnchor="middle" dominantBaseline="central">
                {c.label}
              </text>
            </a>
          );
        })}

        <a href={`mailto:${EMAIL}`} className={`${styles.cell} ${styles.center}`} aria-label={s.center}>
          <polygon points={hexPoints(0, 0)} />
          <g className={styles.icon}>
            <circle r="34" fill="url(#comb-orb)" className={styles.orb} />
            <circle r="34" fill="url(#comb-shine)" />
          </g>
        </a>
      </svg>
    </nav>
  );
}
