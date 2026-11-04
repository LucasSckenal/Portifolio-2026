'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useT } from '@/components/providers/LanguageProvider';
import Orbit from './Orbit';
import SocialComb from './SocialComb';
import styles from './hero.module.scss';

// Projects that are actually live today (live URLs in content/projects.ts):
// their app icons, each one opening the live product
const LIVE = [
  { icon: '/icons/ma-finance-os.png', name: 'Ma Finance OS', href: 'https://project-organization-finaces.vercel.app/' },
  { icon: '/icons/nexo.png', name: 'Nexo', href: 'https://nexo-8yq8.vercel.app/' },
  { icon: '/icons/lj.png', name: 'LJ Treinamento Integrado', href: 'https://lj-nu.vercel.app/' },
];

export default function Hero() {
  const t = useT();
  const { locale } = useLocale();
  const h = t.site.hero;

  const spin = () => window.dispatchEvent(new CustomEvent('orbit:spin'));
  const openFirst = () => window.dispatchEvent(new CustomEvent('orbit:open-first'));

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        {/* keyed by language: switching replays the rise as feedback */}
        <h1 id="hero-title" key={`t-${locale}`} className={styles.title}>
          <span>{h.line1}</span>
          <em>{h.line2}</em>
        </h1>
        <p key={`s-${locale}`} className={styles.sub}>
          {h.sub}
        </p>
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
            <a key={p.name} className={styles.faceDot} href={p.href} target="_blank" rel="noreferrer" title={p.name}>
              <Image src={p.icon} alt={p.name} fill sizes="34px" />
            </a>
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
