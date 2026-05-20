'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from '@/components/ui/SplitText';
import Reveal from '@/components/ui/Reveal';
import { cinema } from '@/lib/easings';
import styles from './ProjectScene.module.scss';

export type Mood = 'dark' | 'light' | 'glass';

type Props = {
  index: string;
  title: string;
  status: string;
  year: string;
  roles: string[];
  description: string;
  jp: string;
  mood: Mood;
  align?: 'left' | 'right';
  href?: string;       // Source / repository URL
  live?: string;       // Live deployment URL (optional secondary CTA)
  caseSlug?: string;   // /work/[slug] route — primary action when present
  // Optional sub-details that enrich the card without bloating the layout
  tech?: string[];     // e.g., ['Godot 4.6', 'GDScript']
  team?: string;       // e.g., 'Team of 4 · UI / Frontend'
  children: React.ReactNode;
};

const moodClass: Record<Mood, string> = {
  dark:  styles.moodDark,
  light: styles.moodLight,
  glass: styles.moodGlass,
};

export default function ProjectScene({
  index,
  title,
  status,
  year,
  roles,
  description,
  jp,
  mood,
  align = 'left',
  href,
  live,
  caseSlug,
  tech,
  team,
  children,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  // Pointer-follow highlight: writes the mouse position to CSS variables
  // on the media wrap, so a radial gradient in CSS can track the cursor.
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = mediaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Media — clip-path mask reveal from bottom on scroll-in
      gsap.fromTo(
        mediaRef.current,
        { clipPath: 'inset(0 0 100% 0)', y: 60 },
        {
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          duration: 1.6,
          ease: cinema as unknown as gsap.EaseFunction,
          scrollTrigger: {
            trigger: mediaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Index watermark — slow drift through the scene
      gsap.fromTo(
        watermarkRef.current,
        { yPercent: 12 },
        {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.scene} ${moodClass[mood]} ${
        align === 'right' ? styles.alignRight : styles.alignLeft
      }`}
    >
      {/* Giant kanji watermark */}
      <div ref={watermarkRef} className={styles.watermark} aria-hidden>
        {jp}
      </div>

      {/* Massive index in opposite corner */}
      <div className={styles.indexBig} aria-hidden>
        {index}
      </div>

      <div className={styles.inner}>
        {/* Media side — click goes to case study when available */}
        {caseSlug ? (
          <Link
            href={`/work/${caseSlug}`}
            ref={mediaRef as unknown as React.RefObject<HTMLAnchorElement>}
            className={styles.mediaSlot}
            onMouseMove={handleMouseMove}
            data-cursor
            data-cursor-label="Read case study →"
          >
            <div className={styles.mediaHighlight} aria-hidden />
            {children}
          </Link>
        ) : (
          <div
            ref={mediaRef}
            className={styles.mediaSlot}
            onMouseMove={handleMouseMove}
            data-cursor
            data-cursor-label={live ? 'Open Live ↗' : href ? 'View source ↗' : undefined}
          >
            <div className={styles.mediaHighlight} aria-hidden />
            {children}
          </div>
        )}

        {/* Info side */}
        <div className={styles.info}>
          <motion.div
            className={styles.statusRow}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: cinema }}
          >
            <span className={styles.statusDot} aria-hidden />
            <span className={styles.statusText}>{status}</span>
            <span className={styles.statusSep}>·</span>
            <span className={styles.statusText}>{year}</span>
          </motion.div>

          <h3 className={styles.title}>
            <span className={styles.titleLine}>
              <SplitText text={title} by="word" delay={0.1} />
            </span>
          </h3>

          <Reveal delay={0.25} amount={0.4}>
            <p className={styles.description}>{description}</p>
          </Reveal>

          <motion.ul
            className={styles.roles}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
            }}
          >
            {roles.map((r) => (
              <motion.li
                key={r}
                className={styles.role}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: cinema } },
                }}
              >
                {r}
              </motion.li>
            ))}
          </motion.ul>

          {tech && tech.length > 0 && (
            <Reveal delay={0.4} amount={0.4}>
              <div className={styles.tech}>
                <span className={styles.techLabel}>Built with</span>
                <span className={styles.techList}>{tech.join(' · ')}</span>
              </div>
            </Reveal>
          )}

          {team && (
            <Reveal delay={0.5} amount={0.4}>
              <div className={styles.team}>
                <span className={styles.teamMark} aria-hidden>↳</span>
                <span>{team}</span>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.55} amount={0.4}>
            <div className={styles.footer}>
              <span className={styles.indexSmall}>{index} / 03</span>

              <div className={styles.actions}>
                {caseSlug && (
                  <Link
                    href={`/work/${caseSlug}`}
                    className={`${styles.view} ${styles.viewCase}`}
                    data-cursor
                    data-cursor-label="Read case study →"
                  >
                    <span>Case study</span>
                    <span className={styles.viewArrow}>→</span>
                  </Link>
                )}

                {live && (
                  <a
                    className={`${styles.view} ${styles.viewPrimary}`}
                    href={live}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor
                    data-cursor-label="Open Live ↗"
                  >
                    <span className={styles.viewDot} aria-hidden />
                    <span>Live</span>
                    <span className={styles.viewArrow}>↗</span>
                  </a>
                )}

                {href && (
                  <a
                    className={styles.view}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor
                    data-cursor-label="View source ↗"
                  >
                    <span>Repo</span>
                    <span className={styles.viewArrow}>↗</span>
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
