'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useT } from '@/components/providers/LanguageProvider';
import type { CaseSection, ProjectCase } from '@/content/projects';
import { useProjectCopy } from '@/lib/hooks/useProjectCopy';
import { EMAIL } from './links';
import { PROJECTS, PROJECT_ORDER, SHOWCASE, type ProjectId } from './panels';
import styles from './case.module.scss';

// A case study in the current edition: light ground, display serif, the
// project's real media in a glass frame, then the story. One column for
// reading, wider frames for pictures.

function HeroMedia({ slug }: { slug: ProjectId }) {
  const media = PROJECTS[slug]?.media;
  const ref = useRef<HTMLVideoElement>(null);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !motion) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [motion]);

  if (!media) return null;
  return (
    <div className={styles.heroMedia}>
      <div className={styles.frame}>
        {media.kind === 'video' ? (
          <video ref={ref} muted loop playsInline preload="metadata" poster={media.poster} aria-hidden>
            {media.sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        ) : media.kind === 'image' ? (
          <Image src={media.src} alt="" fill priority sizes="(max-width: 900px) 100vw, 1100px" />
        ) : (
          <p className={styles.note}>{media.text}</p>
        )}
      </div>
    </div>
  );
}

function Figure({ src, alt, caption, variant }: { src: string; alt: string; caption?: string; variant?: 'wide' | 'mobile' }) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setArmed(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <figure
      ref={ref}
      className={`${styles.figure} ${variant === 'mobile' ? styles.figureMobile : ''} ${armed ? styles.armed : ''} ${seen ? styles.seen : ''}`}
    >
      <div className={styles.frame}>
        <Image src={src} alt={alt} fill sizes={variant === 'mobile' ? '360px' : '(max-width: 900px) 100vw, 1000px'} />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function Section({ s }: { s: CaseSection }) {
  switch (s.type) {
    case 'lead':
      return <p className={styles.lead}>{s.body}</p>;
    case 'paragraph':
      return <p className={styles.p}>{s.body}</p>;
    case 'heading':
      return <h2 className={styles.h2}>{s.text}</h2>;
    case 'quote':
      return (
        <blockquote className={styles.quote}>
          <p>{s.text}</p>
          {s.attribution && <cite>{s.attribution}</cite>}
        </blockquote>
      );
    case 'list': {
      const Tag = s.ordered ? 'ol' : 'ul';
      return (
        <Tag className={styles.list}>
          {s.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </Tag>
      );
    }
    case 'image':
      return <Figure src={s.src} alt={s.alt} caption={s.caption} variant={s.variant} />;
    case 'gallery':
      return (
        <div className={styles.gallery}>
          {s.images.map((im) => (
            <Figure key={im.src} {...im} />
          ))}
        </div>
      );
    case 'stats':
      return (
        <dl className={styles.stats}>
          {s.items.map((it) => (
            <div key={it.label}>
              <dt>{it.label}</dt>
              <dd>{it.value}</dd>
            </div>
          ))}
        </dl>
      );
    case 'divider':
      return <hr className={styles.hr} />;
    default:
      return null;
  }
}

export default function CaseView({ project }: { project: ProjectCase }) {
  const t = useT();
  const { locale } = useLocale();
  const copy = useProjectCopy(project.slug);
  const slug = project.slug as ProjectId;

  const i = PROJECT_ORDER.indexOf(slug);
  const prev = SHOWCASE[(i - 1 + SHOWCASE.length) % SHOWCASE.length];
  const next = SHOWCASE[(i + 1) % SHOWCASE.length];

  return (
    <div className={styles.scroll}>
      <article className={styles.case}>
        <header className={styles.head}>
          <Link href="/" className={styles.back}>
            ← {t.site.nav.back}
          </Link>
          <p className={styles.status}>
            <span className={styles.dot} aria-hidden />
            {copy?.status ?? project.status} · {project.year}
          </p>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.tagline}>{copy?.tagline ?? project.tagline}</p>
          <ul className={styles.chips}>
            {project.roles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className={styles.tech}>
            {t.caseStudy.builtWith} · {project.tech.join(' · ')}
          </p>
          {(project.live || project.href) && (
            <div className={styles.actions}>
              {project.live && (
                <a className={styles.primary} href={project.live} target="_blank" rel="noreferrer">
                  {t.caseStudy.live} ↗
                </a>
              )}
              {project.href && (
                <a className={styles.secondary} href={project.href} target="_blank" rel="noreferrer">
                  {t.caseStudy.repo} ↗
                </a>
              )}
            </div>
          )}
        </header>

        <HeroMedia slug={slug} />

        <div className={styles.body} lang="en">
          {locale !== 'en' && t.caseStudy.bodyNote && (
            <p className={styles.bodyNote} lang={locale}>
              {t.caseStudy.bodyNote}
            </p>
          )}
          {project.sections.map((s, k) => (
            <Section key={k} s={s} />
          ))}
        </div>

        <nav className={styles.neighbours} aria-label="Projects">
          <Link href={`/work/${prev.slug}`} className={styles.neighbour}>
            <span>{t.caseStudy.previous}</span>
            <b>{prev.title}</b>
          </Link>
          <Link href={`/work/${next.slug}`} className={`${styles.neighbour} ${styles.neighbourNext}`}>
            <span>{t.caseStudy.next}</span>
            <b>{next.title}</b>
          </Link>
        </nav>

        <footer className={styles.contact}>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </footer>
      </article>
    </div>
  );
}
