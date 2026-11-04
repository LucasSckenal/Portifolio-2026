'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useT } from '@/components/providers/LanguageProvider';
import { getProjectCopy } from '@/content/projects.i18n';
import { SHOWCASE } from './panels';
import styles from './projectsIndex.module.scss';

// The flat view of the work: every project as a card in a plain grid.
// "Trabalhos" (nav) and "Ver projetos" (hero) open it from any page, so the
// 3D orbit is the experience and this is the straightforward way in.
export const openProjects = () => window.dispatchEvent(new CustomEvent('projects:open'));

export default function ProjectsIndex() {
  const t = useT();
  const { locale } = useLocale();
  const p = t.site.projects;
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(() => setOpen(false), 260);
    (opener.current as HTMLElement | null)?.focus?.();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      opener.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener('projects:open', onOpen);
    return () => window.removeEventListener('projects:open', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setShown(true));
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div className={`${styles.backdrop} ${shown ? styles.shown : ''}`} onClick={close} role="presentation">
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="projects-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <div>
            <h2 id="projects-title" className={styles.title}>
              {p.title}
            </h2>
            <p className={styles.sub}>{p.sub}</p>
          </div>
          <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label={t.site.hero.close}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>

        <ul className={styles.grid}>
          {SHOWCASE.map((s, i) => {
            const copy = getProjectCopy(s.slug, locale) ?? getProjectCopy(s.slug, 'en');
            const shot = s.shots[0]?.src;
            return (
              <li key={s.slug} style={{ '--i': i } as React.CSSProperties}>
                <Link href={`/work/${s.slug}`} className={styles.card} onClick={() => setOpen(false)}>
                  <span className={styles.thumb}>
                    {shot && <Image src={shot} alt="" fill sizes="(max-width: 700px) 92vw, 380px" />}
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.icon}>
                      {s.icon ? (
                        <Image src={s.icon} alt="" fill sizes="36px" />
                      ) : (
                        <span className={styles.mono} aria-hidden>
                          {s.title.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className={styles.text}>
                      <b>{s.title}</b>
                      <span>{copy?.status ?? s.note}</span>
                    </span>
                    <svg className={styles.arrow} width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                      <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                  {copy?.tagline && <span className={styles.tagline}>{copy.tagline}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
  );
}
