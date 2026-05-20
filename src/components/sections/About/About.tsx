'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Reveal from '@/components/ui/Reveal';
import SplitText from '@/components/ui/SplitText';
import { cinema } from '@/lib/easings';
import styles from './About.module.scss';

const paragraphs = [
  "I'm Lucas — a creative frontend developer drawn to interfaces that feel less like software and more like atmosphere.",
  "My practice sits at the intersection of motion, immersion, and visual identity. I build cinematic web experiences, game-inspired UI systems, and digital products that lean toward the emotional rather than the purely functional.",
  "I care about the unhurried details: how a transition lands, how light moves across a panel, how a HUD breathes between actions. The space between things, more than the things themselves.",
  "Currently building a game with custom UI systems, alongside selected client work in design and frontend engineering.",
];

const stats: Array<{ label: string; value: string; jp: string }> = [
  { label: 'Focus',       value: 'Motion · UI',    jp: '専門' },
  { label: 'Building',    value: 'Game · Web',     jp: '制作' },
  { label: 'Currently',   value: 'Open to work',   jp: '現在' },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const kanjiRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Drifting kanji watermark — parallax slower than scroll
      gsap.fromTo(
        kanjiRef.current,
        { yPercent: 14 },
        {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );

      // Portrait drifts up slightly faster than text — subtle depth
      gsap.fromTo(
        portraitRef.current,
        { yPercent: 8 },
        {
          yPercent: -8,
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
    <section ref={sectionRef} id="about" className={styles.about}>
      {/* Faint vertical kanji drifting behind everything */}
      <div ref={kanjiRef} className={styles.watermark} aria-hidden>
        間
      </div>

      <div className={styles.inner}>
        {/* ── Header row ── */}
        <header className={styles.header}>
          <span className={styles.label}>002 — About</span>
          <span className={styles.divider} aria-hidden />
          <span className={styles.labelJp}>間 · Ma</span>
        </header>

        {/* ── Main grid ── */}
        <div className={styles.grid}>
          {/* Portrait column (offset down) */}
          <div className={styles.portraitCol}>
            <div ref={portraitRef} className={styles.portraitFrame}>
              {/*
                Replace this with your portrait:
                <img src="/images/portrait.jpg" alt="" className={styles.portrait} />
              */}
              <div className={styles.portraitPlaceholder} aria-hidden>
                <span className={styles.portraitTimecode}>00:00:14 · F12</span>
                <span className={styles.portraitJp}>L</span>
                <span className={styles.portraitCorner} />
              </div>
            </div>
            <Reveal delay={0.2}>
              <p className={styles.caption}>
                <span className={styles.captionMark}>—</span>
                A self-portrait, in process.
              </p>
            </Reveal>
          </div>

          {/* Copy column */}
          <div className={styles.copyCol}>
            <h2 className={styles.title}>
              <span className={styles.titleLine}>
                <SplitText text="Building worlds" by="word" delay={0.1} />
              </span>
              <span className={styles.titleLine}>
                <SplitText text="inside the browser." by="word" delay={0.25} />
              </span>
            </h2>

            <div className={styles.paragraphs}>
              {paragraphs.map((p, i) => (
                <Reveal key={i} delay={0.1 + i * 0.12} amount={0.4}>
                  <p className={styles.paragraph}>{p}</p>
                </Reveal>
              ))}
            </div>

            <motion.dl
              className={styles.stats}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
              }}
            >
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  className={styles.stat}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 1, ease: cinema } },
                  }}
                >
                  <span className={styles.statJp}>{s.jp}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={styles.statValue}>{s.value}</span>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </section>
  );
}
