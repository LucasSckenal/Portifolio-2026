'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/components/providers/LanguageProvider';
import Orbit from './Orbit';
import SocialComb from './SocialComb';
import styles from './hero.module.scss';

// Projects that are actually live today (live URLs in content/projects.ts)
const LIVE = [
  { src: '/projects/ma-finance-os/dashboard.png', alt: 'Ma Finance OS' },
  { src: '/projects/nexo/Dashboard.png', alt: 'Nexo' },
  { src: '/projects/lj/hero.png', alt: 'LJ Treinamento Integrado' },
];

export default function Hero() {
  const t = useT();
  const h = t.site.hero;

  const spin = () => window.dispatchEvent(new CustomEvent('orbit:spin'));
  const openFirst = () => window.dispatchEvent(new CustomEvent('orbit:open-first'));

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <h1 id="hero-title" className={styles.title}>
          <span>{h.line1}</span>
          <em>{h.line2}</em>
        </h1>
        <p className={styles.sub}>{h.sub}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={openFirst}>
            {h.primary}
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button type="button" className={styles.secondary} onClick={spin}>
            <span className={styles.play} aria-hidden>
              <svg width="8" height="9" viewBox="0 0 8 9">
                <path d="M0 0l8 4.5L0 9z" fill="currentColor" />
              </svg>
            </span>
            {h.secondary}
          </button>
        </div>
      </div>

      <Orbit />

      {/* Side notes, tied to the halo by hairlines */}
      <svg className={styles.wires} viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden>
        <path d="M250 390 C 250 560, 420 640, 560 650" />
        <path d="M1190 470 C 1190 600, 1040 660, 900 660" />
      </svg>

      <aside className={`${styles.note} ${styles.noteLeft}`}>
        <svg className={styles.noteIcon} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path d="M3 13l4-4 3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <strong>{h.cardLeftTitle}</strong>
        <span>{h.cardLeftBody}</span>
      </aside>

      <aside className={`${styles.note} ${styles.noteRight}`}>
        <span className={styles.liveDot} aria-hidden />
        <strong>{h.cardRightTitle}</strong>
        <span>{h.cardRightBody}</span>
      </aside>

      <div className={styles.live}>
        <span className={styles.rule} aria-hidden />
        <p>
          <b>{LIVE.length}</b> {h.liveLabel}
        </p>
        <div className={styles.faces}>
          {LIVE.map((p) => (
            <span key={p.alt} className={styles.faceDot}>
              <Image src={p.src} alt={p.alt} fill sizes="32px" />
            </span>
          ))}
        </div>
        <Link href="/privacidade" className={styles.privacy}>
          {h.privacy}
        </Link>
      </div>

      <SocialComb />

      <div className={styles.badge} aria-hidden>
        <svg viewBox="0 0 100 100">
          <defs>
            <path id="badge-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
          </defs>
          <text>
            <textPath href="#badge-circle">{h.badge.repeat(2)}</textPath>
          </text>
          <path d="M50 38c.7 6.3 4.7 10.3 11 11-6.3.7-10.3 4.7-11 11-.7-6.3-4.7-10.3-11-11 6.3-.7 10.3-4.7 11-11z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
