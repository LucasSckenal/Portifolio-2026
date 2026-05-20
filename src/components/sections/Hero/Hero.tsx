'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Fog from '@/components/atmosphere/Fog';
import styles from './Hero.module.scss';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const kanjiRef = useRef<HTMLDivElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLAnchorElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  // Force autoplay + gate the opening curtain on video readiness.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.play().catch(() => {});

    const fadeCurtain = () => {
      if (!curtainRef.current) return;
      gsap.to(curtainRef.current, {
        opacity: 0,
        duration: 1.8,
        ease: 'power2.out',
        onComplete: () => {
          if (curtainRef.current) curtainRef.current.style.pointerEvents = 'none';
        },
      });
    };

    if (v.readyState >= 3) {
      fadeCurtain();
      return;
    }

    v.addEventListener('canplay', fadeCurtain, { once: true });
    const safety = window.setTimeout(fadeCurtain, 4000);

    return () => {
      v.removeEventListener('canplay', fadeCurtain);
      window.clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Scroll cue floats in shortly after curtain (real-time, not scroll)
      gsap.fromTo(
        scrollCueRef.current,
        { opacity: 0, y: 12 },
        { opacity: 0.8, y: 0, duration: 1.4, delay: 1.4, ease: 'power2.out' }
      );

      if (reduced) {
        gsap.set(
          [topRowRef.current, bottomRowRef.current, kanjiRef.current],
          { opacity: 1, y: 0 }
        );
        const lines = titleRef.current?.querySelectorAll<HTMLElement>(
          `.${styles.titleInner}`
        );
        if (lines) gsap.set(lines, { y: '0%', opacity: 1 });
        return;
      }

      gsap.set(topRowRef.current,    { opacity: 0, y: -10 });
      gsap.set(bottomRowRef.current, { opacity: 0, y: 24  });
      gsap.set(kanjiRef.current,     { opacity: 0 });

      const titleInners = titleRef.current?.querySelectorAll<HTMLElement>(
        `.${styles.titleInner}`
      );
      if (titleInners) {
        gsap.set(titleInners, { yPercent: 110 });
      }

      // ── Scrubbed timeline driven by section scroll progress ──
      // IMPORTANT: no `pin:true`. CSS `position: sticky` on .sticky handles the
      // visual pinning. This avoids GSAP mutating the DOM (pin-spacer wrapper),
      // which was causing React `removeChild` errors during route transitions.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });

      // Continuous cinematic camera zoom across the entire sticky range
      tl.to(videoRef.current, { scale: 1.10, ease: 'none' }, 0);

      // 1. Kanji watermark drifts in (early atmosphere)
      tl.to(
        kanjiRef.current,
        { opacity: 0.16, duration: 1.2, ease: 'power2.out' },
        0.3
      );

      // 2. Top labels reveal
      tl.to(
        topRowRef.current,
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
        1.0
      );

      // 3. Title lines rise one by one
      if (titleInners) {
        tl.to(
          titleInners,
          {
            yPercent: 0,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.55,
          },
          1.6
        );
      }

      // 4. Bio
      tl.to(
        bottomRowRef.current,
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        4.0
      );

      // 5. Scroll cue retracts as we approach exit
      tl.to(
        scrollCueRef.current,
        { opacity: 0, y: -10, duration: 0.6, ease: 'power2.in' },
        4.6
      );

      // 6. Cinematic exit
      tl.to(
        [topRowRef.current, titleRef.current, bottomRowRef.current],
        { opacity: 0, y: -60, duration: 1.2, ease: 'power2.in' },
        5.4
      );
      tl.to(
        kanjiRef.current,
        { opacity: 0, y: -40, duration: 1.2, ease: 'power2.in' },
        5.4
      );
      tl.to(
        videoRef.current,
        { filter: 'brightness(0.45)', duration: 1.2, ease: 'power2.in' },
        5.4
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero} id="top">
      {/* Sticky container — CSS pins it for the section's full scroll range */}
      <div className={styles.sticky}>
        {/* ── Video bed ── */}
        <div className={styles.videoWrap}>
          <video
            ref={videoRef}
            className={styles.video}
            src="/video/hero.mp4"
            poster="/video/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className={styles.tint} aria-hidden />
          <Fog />
          <div className={styles.vignette} aria-hidden />
        </div>

        {/* ── Drifting kanji watermark ── */}
        <div ref={kanjiRef} className={styles.kanji} aria-hidden>
          静寂
        </div>

        {/* ── Content ── */}
        <div className={styles.content}>
          <div ref={topRowRef} className={styles.topRow}>
            <span className={styles.label}>Lucas — 001 / Portfolio</span>
            <span className={styles.label}>MMXXVI · Frontend / Motion</span>
          </div>

          <h1 ref={titleRef} className={styles.title}>
            <span className={styles.titleLine}>
              <span className={styles.titleInner}>Six worlds.</span>
            </span>
            <span className={styles.titleLine}>
              <span className={styles.titleInner}>Three projects.</span>
            </span>
            <span className={styles.titleLine}>
              <span className={styles.titleInner}>One quiet practice.</span>
            </span>
          </h1>

          <div ref={bottomRowRef} className={styles.bottomRow}>
            <div className={styles.meta}>
              <span className={styles.metaJp}>静</span>
              <p className={styles.metaText}>
                Lucas — creative frontend developer<br />
                crafting immersive, cinematic interfaces.
              </p>
            </div>
          </div>

          <a
            ref={scrollCueRef}
            href="#about"
            className={styles.scrollCue}
            data-cursor
          >
            <span className={styles.scrollLabel}>Scroll</span>
            <span className={styles.scrollLine}>
              <span className={styles.scrollDot} />
            </span>
          </a>
        </div>

        {/* ── Ink-wash transition into the next section ── */}
        <div className={styles.inkWash} aria-hidden />

        {/* ── Initial black curtain fading away ── */}
        <div ref={curtainRef} className={styles.curtain} aria-hidden />
      </div>
    </section>
  );
}
