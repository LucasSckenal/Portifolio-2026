'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import { cinema } from '@/lib/easings';
import type { ArchiveEntry, ArchiveKind } from '@/content/projects';
import styles from './page.module.scss';

// Director-style filmography of every project. Restraint over imagery —
// year, title, type, link. Hover reveals the one-liner.

type FilterId = ArchiveKind | 'all';

const filters: Array<{ id: FilterId; label: string }> = [
  { id: 'all',         label: 'All'         },
  { id: 'commercial',  label: 'Commercial'  },
  { id: 'personal',    label: 'Personal'    },
  { id: 'academic',    label: 'Academic'    },
  { id: 'experiment',  label: 'Experiment'  },
];

export default function WorkArchive({ entries }: { entries: ArchiveEntry[] }) {
  const [filter, setFilter] = useState<FilterId>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.kind === filter)),
    [entries, filter]
  );

  const startYear = useMemo(() => {
    const years = entries.map((e) => parseInt(e.year, 10)).filter(Boolean);
    return years.length ? Math.min(...years) : new Date().getFullYear();
  }, [entries]);

  return (
    <article className={styles.archive}>
      <div className={styles.inner}>
        {/* ── Header ──────────────────────── */}
        <header className={styles.header}>
          <div className={styles.labelRow}>
            <span className={styles.label}>007 — Filmography</span>
            <span className={styles.divider} aria-hidden />
            <span className={styles.labelJp}>全作品 · Zen-sakuhin</span>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleLine}>
              <SplitText text="Every piece," by="word" delay={0.1} />
            </span>
            <span className={styles.titleLine}>
              <SplitText text="in chronological order." by="word" delay={0.25} />
            </span>
          </h1>

          <motion.p
            className={styles.intro}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: cinema }}
          >
            Started {startYear} · {entries.length} pieces. Commercial work,
            personal experiments, academic projects, and weekend builds — all
            in one place. The featured three on the home are the highlights;
            this is the full reel.
          </motion.p>
        </header>

        {/* ── Filters ─────────────────────── */}
        <motion.nav
          className={styles.filters}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: cinema }}
        >
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                aria-pressed={isActive}
                data-cursor
              >
                {f.label}
              </button>
            );
          })}
          <span className={styles.filterCount}>
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </span>
        </motion.nav>

        {/* ── Filmography table ───────────── */}
        <motion.ol
          className={styles.list}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05, delayChildren: 0.65 } },
          }}
        >
          {filtered.map((entry, i) => (
            <motion.li
              key={`${entry.year}-${entry.title}-${i}`}
              className={styles.row}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: cinema } },
              }}
            >
              <Row entry={entry} />
            </motion.li>
          ))}
        </motion.ol>

        {/* ── Footer ──────────────────────── */}
        <footer className={styles.footerNote}>
          Looking for something specific?{' '}
          <Link href="/#contact" className={styles.footerLink} data-cursor>
            Ask directly ↗
          </Link>
        </footer>
      </div>
    </article>
  );
}

// ── Single filmography row ──
function Row({ entry }: { entry: ArchiveEntry }) {
  const arrow = entry.external ? '↗' : '→';
  const cursorLabel = entry.external ? 'Open ↗' : 'Read case study →';

  const inner = (
    <>
      <span className={styles.cellYear}>{entry.year}</span>
      <span className={styles.cellTitle}>{entry.title}</span>
      <span className={styles.cellType}>{entry.type}</span>
      <span className={styles.cellArrow} aria-hidden>{entry.href ? arrow : '—'}</span>
      <span className={styles.cellOneLiner}>
        <span className={styles.oneLinerMark}>↳</span> {entry.oneLiner}
      </span>
    </>
  );

  if (!entry.href) {
    return <div className={styles.rowInner}>{inner}</div>;
  }
  if (entry.external) {
    return (
      <a
        href={entry.href}
        target="_blank"
        rel="noreferrer"
        className={styles.rowInner}
        data-cursor
        data-cursor-label={cursorLabel}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={entry.href}
      className={styles.rowInner}
      data-cursor
      data-cursor-label={cursorLabel}
    >
      {inner}
    </Link>
  );
}
