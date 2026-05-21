'use client';

import { useEffect, useRef } from 'react';
import FadeImage from '@/components/ui/FadeImage';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Reveal from '@/components/ui/Reveal';
import SplitText from '@/components/ui/SplitText';
import { useT } from '@/components/providers/LanguageProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cinema } from '@/lib/easings';
import styles from './About.module.scss';

export default function About() {
  const t = useT();
  const { inverted } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

  const stats = [
    { label: t.about.statFocusLabel,      value: t.about.statFocusValue,      jp: '専門' },
    { label: t.about.statBuildingLabel,   value: t.about.statBuildingValue,   jp: '制作' },
    { label: t.about.statCurrentlyLabel,  value: t.about.statCurrentlyValue,  jp: '現在' },
  ];

  // In Night mode, append a paragraph that frames the after-hours version of
  // the studio. Same voice, slightly more confessional. Stays in English for
  // now — Night content has its own register independent of i18n locales.
  const paragraphs = inverted
    ? [
        ...t.about.paragraphs,
        "By night, this becomes a different studio — looser, more experimental. The work that fits no brief comes out here.",
      ]
    : t.about.paragraphs;
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
          <span className={styles.label}>{t.about.label}</span>
          <span className={styles.divider} aria-hidden />
          <span className={styles.labelJp}>{t.about.labelJp}</span>
        </header>

        {/* ── Main grid ── */}
        <div className={styles.grid}>
          {/* Portrait column (offset down) */}
          <div className={styles.portraitCol}>
            <div ref={portraitRef} className={styles.portraitFrame}>
              <FadeImage
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
                {t.about.caption}
              </p>
            </Reveal>
          </div>

          {/* Copy column */}
          <div className={styles.copyCol}>
            <h2 className={styles.title}>
              <span className={styles.titleLine}>
                <SplitText text={t.about.titleLine1} by="word" delay={0.1} />
              </span>
              <span className={styles.titleLine}>
                <SplitText text={t.about.titleLine2} by="word" delay={0.25} />
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

            {/* ── Now / Currently card ─────
                Update this monthly. Inspired by nownownow.com — signals
                the site is alive, not a snapshot. */}
            <Reveal delay={0.45} amount={0.4}>
              <aside className={styles.now}>
                <div className={styles.nowHeader}>
                  <span className={styles.nowJp}>現</span>
                  <span className={styles.nowLabel}>Now · January 2026</span>
                </div>
                <ul className={styles.nowList}>
                  <li>Building the Yōkai shader gallery — first 3 entries shipping soon.</li>
                  <li>Reading <em>The Death of the Heart</em> (Bowen) and re-reading Tufte.</li>
                  <li>Currently obsessed with Three.js post-processing and Japanese paper textures.</li>
                </ul>
              </aside>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
