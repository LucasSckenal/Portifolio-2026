'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Reveal from '@/components/ui/Reveal';
import SplitText from '@/components/ui/SplitText';
import { cinema } from '@/lib/easings';
import styles from './About.module.scss';

const paragraphs = [
  "I'm Lucas — a frontend developer drawn to digital experiences that go beyond function. The kind that feel cinematic, atmospheric, visually intentional in every detail.",
  "My practice favors modern UI, smooth motion, and the texture of game-inspired interfaces. I try to thread creativity, performance, and a premium feeling into the same work — never one at the cost of the others.",
  "Currently building a Tower Defense game with custom HUD systems, a multilingual medical chatbot, and a gaming-focused commerce concept. Each one is an attempt to give software an identity, an atmosphere, an intent.",
  "I draw from Japanese minimalism, cinematic motion design, and the Apple / Awwwards school of premium interfaces. The goal: products people remember not for the code, but for the experience they transmit.",
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
              <Image
                src="/projects/portrait.png"
                alt="Lucas Sckenal"
                className={styles.portrait}
                fill
                sizes="(max-width: 900px) 90vw, 35vw"
                priority
              />
              {/* Film-still overlay — timecode + corner bracket */}
              <span className={styles.portraitTimecode} aria-hidden>
                00:00:14 · F12
              </span>
              <span className={styles.portraitCorner} aria-hidden />
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
