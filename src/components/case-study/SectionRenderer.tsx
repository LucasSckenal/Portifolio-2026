'use client';

import Reveal from '@/components/ui/Reveal';
import type { CaseSection } from '@/content/projects';
import styles from './CaseStudy.module.scss';

// Each case study section is wrapped in a plain `<section>` for semantics,
// with the Reveal (motion.div) inside as the animated wrapper.
// Keeping the <section> outside framer-motion's tree avoids edge-case
// reconciliation errors during dev strict-mode double-mount.

export default function SectionRenderer({ section }: { section: CaseSection }) {
  switch (section.type) {
    case 'lead':
      return (
        <section className={styles.lead}>
          <Reveal>
            <p>{section.body}</p>
          </Reveal>
        </section>
      );

    case 'paragraph':
      return (
        <section className={styles.paragraph}>
          <Reveal>
            <p>{section.body}</p>
          </Reveal>
        </section>
      );

    case 'heading':
      return (
        <section className={styles.sectionHeading}>
          <Reveal>
            {section.jpLabel && (
              <span className={styles.sectionHeadingJp}>{section.jpLabel}</span>
            )}
            <h2>{section.text}</h2>
          </Reveal>
        </section>
      );

    case 'quote':
      return (
        <section className={styles.quote}>
          <Reveal>
            <blockquote>{section.text}</blockquote>
            {section.attribution && <cite>— {section.attribution}</cite>}
          </Reveal>
        </section>
      );

    case 'list':
      return (
        <section className={styles.list}>
          <Reveal>
            {section.ordered ? (
              <ol>
                {section.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul>
                {section.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            )}
          </Reveal>
        </section>
      );

    case 'image':
      return (
        <section className={styles.imageSection}>
          <Reveal>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={section.src} alt={section.alt} loading="lazy" />
              {section.caption && <figcaption>{section.caption}</figcaption>}
            </figure>
          </Reveal>
        </section>
      );

    case 'gallery':
      return (
        <section className={styles.gallery}>
          <Reveal>
            <div className={styles.galleryGrid}>
              {section.images.map((img, i) => (
                <figure key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} loading="lazy" />
                  {img.caption && <figcaption>{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </Reveal>
        </section>
      );

    case 'stats':
      return (
        <section className={styles.stats}>
          <Reveal>
            <div className={styles.statsGrid}>
              {section.items.map((s, i) => (
                <div key={i} className={styles.stat}>
                  {s.jp && <span className={styles.statJp}>{s.jp}</span>}
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      );

    case 'divider':
      return <div className={styles.divider} aria-hidden />;

    default:
      return null;
  }
}
