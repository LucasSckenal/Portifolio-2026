'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import { cinema } from '@/lib/easings';
import type { ArchiveEntry, ArchiveKind } from '@/content/projects';
import { useT, useLocale } from '@/components/providers/LanguageProvider';
import { getProjectCopy } from '@/content/projects.i18n';
import styles from './page.module.scss';

// Director-style filmography of every project. Restraint over imagery —
// year, title, type, link. Hover reveals the one-liner.

type FilterId = ArchiveKind | 'all';

const filters: FilterId[] = ['all', 'commercial', 'personal', 'academic', 'experiment'];

export default function WorkArchive({ entries }: { entries: ArchiveEntry[] }) {
  const [filter, setFilter] = useState<FilterId>('all');
  const t = useT();

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
            <span className={styles.label}>{t.work.label}</span>
            <span className={styles.divider} aria-hidden />
            <span className={styles.labelJp}>全作品 · Zen-sakuhin</span>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleLine}>
              <SplitText text={t.work.titleLine1} by="word" delay={0.1} />
            </span>
            <span className={styles.titleLine}>
              <SplitText text={t.work.titleLine2} by="word" delay={0.25} />
            </span>
          </h1>

          <motion.p
            className={styles.intro}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: cinema }}
          >
            {t.work.intro
              .replace('{year}', String(startYear))
              .replace('{count}', String(entries.length))}
          </motion.p>
        </header>

        {/* ── Filters ─────────────────────── */}
        <motion.nav
          className={styles.filters}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: cinema }}
        >
          {filters.map((id) => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                aria-pressed={isActive}
                data-cursor
              >
                {t.work.filters[id]}
              </button>
            );
          })}
          <span className={styles.filterCount}>
            {filtered.length} {filtered.length === 1 ? t.work.piece : t.work.pieces}
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
          {t.work.footer}{' '}
          <Link href="/#contact" className={styles.footerLink} data-cursor>
            {t.work.footerLink}
          </Link>
        </footer>
      </div>
    </article>
  );
}

// ── Single filmography row ──
function Row({ entry }: { entry: ArchiveEntry }) {
  const t = useT();
  const { locale } = useLocale();
  const arrow = entry.external ? '↗' : '→';
  const cursorLabel = entry.external ? t.work.open : t.work.readCase;
  // Internal entries point at /work/<slug>; use that slug's translated tagline
  const slug = !entry.external && entry.href?.startsWith('/work/')
    ? entry.href.slice('/work/'.length)
    : undefined;
  const oneLiner = (slug && getProjectCopy(slug, locale)?.tagline) || entry.oneLiner;

  const inner = (
    <>
      <span className={styles.cellYear}>{entry.year}</span>
      <span className={styles.cellTitle}>{entry.title}</span>
      <span className={styles.cellType}>{entry.type}</span>
      <span className={styles.cellArrow} aria-hidden>{entry.href ? arrow : '—'}</span>
      <span className={styles.cellOneLiner}>
        <span className={styles.oneLinerMark}>↳</span> {oneLiner}
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
