'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useT } from '@/components/providers/LanguageProvider';
import { getProjectCopy } from '@/content/projects.i18n';
import LeaderLines from './LeaderLines';
import Orbit from './Orbit';
import { SHOWCASE, type PanelId, type ProjectId } from './panels';
import SocialComb from './SocialComb';
import styles from './hero.module.scss';

// Projects that are actually live today (live URLs in content/projects.ts):
// their app icons, each one opening the live product
const LIVE = [
  { icon: '/icons/app/ma-finance-os.png', name: 'Ma Finance OS', href: 'https://project-organization-finaces.vercel.app/' },
  { icon: '/icons/app/nexo.png', name: 'Nexo', href: 'https://nexo-8yq8.vercel.app/' },
  { icon: '/icons/app/lj.png', name: 'LJ Treinamento Integrado', href: 'https://lj-nu.vercel.app/' },
];
// green dot in the captions: anything you can open in a browser today
const LIVE_SLUGS = new Set<ProjectId>(['ma-finance-os', 'nexo', 'lj-treinamento-integrado', 'medical-chatbot']);

// "3 days ago", in the visitor's language
function ago(iso: string, locale: string) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['minute', 60],
    ['hour', 3600],
    ['day', 86400],
    ['week', 604800],
    ['month', 2629800],
  ];
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  let unit: Intl.RelativeTimeFormatUnit = 'minute';
  let size = 60;
  for (const [u, n] of steps) if (Math.abs(s) >= n) [unit, size] = [u, n];
  return rtf.format(Math.round(s / size), unit);
}

export default function Hero() {
  const t = useT();
  const { locale } = useLocale();
  const h = t.site.hero;

  const spin = () => window.dispatchEvent(new CustomEvent('orbit:spin'));
  // the flat list of every project (the 3D halo stays the experience)
  const openFirst = () => window.dispatchEvent(new CustomEvent('projects:open'));

  // the side notes caption the project under the pointer (desktop only)
  const [focus, setFocus] = useState<PanelId | null>(null);
  useEffect(() => {
    const on = (e: Event) => setFocus((e as CustomEvent<PanelId | null>).detail);
    window.addEventListener('panel:hover', on);
    return () => window.removeEventListener('panel:hover', on);
  }, []);
  // latest push to one of the showcased repos (server-cached, real data)
  const [activity, setActivity] = useState<{ slug: ProjectId; at: string; tag?: string } | null>(null);
  useEffect(() => {
    fetch('/api/activity')
      .then((r) => (r.ok ? r.json() : null))
      .then((a) => a?.slug && setActivity(a))
      .catch(() => {});
  }, []);
  const shown = focus ? SHOWCASE.find((p) => p.slug === focus) : undefined;
  const copy = shown ? (getProjectCopy(shown.slug, locale) ?? getProjectCopy(shown.slug, 'en')) : undefined;
  const aboutFocus = focus === 'about';
  // About open: the ring steps back and the copy and notes make room
  const [aboutOpen, setAboutOpen] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setAboutOpen((e as CustomEvent<boolean>).detail);
    window.addEventListener('about:state', on);
    return () => window.removeEventListener('about:state', on);
  }, []);
  const a = t.site.about;
  const leftNote = useRef<HTMLDivElement>(null);
  const rightNote = useRef<HTMLDivElement>(null);
  const busy = activity ? SHOWCASE.find((p) => p.slug === activity.slug) : undefined;

  return (
    <section className={`${styles.hero} ${aboutOpen ? styles.heroAbout : ''}`} aria-labelledby="hero-title">
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

      {/* Side notes: annotations of the halo, with live leader lines */}
      <LeaderLines left={leftNote} right={rightNote} />

      <div ref={leftNote} className={`${styles.note} ${styles.noteLeft}`}>
        {shown ? (
          <div key={shown.slug} className={styles.noteBody}>
            <span className={styles.noteLabel}>
              {h.noteFocus} · {String(SHOWCASE.indexOf(shown) + 1).padStart(2, '0')}/{String(SHOWCASE.length).padStart(2, '0')}
            </span>
            <span className={styles.noteApp}>
              {shown.icon && <Image src={shown.icon} alt="" width={20} height={20} />}
              <em>{shown.note}</em>
            </span>
            <strong>{shown.title}</strong>
            <span>{copy?.tagline}</span>
          </div>
        ) : aboutFocus ? (
          <div key="about" className={styles.noteBody}>
            <span className={styles.noteLabel}>{h.noteFocus}</span>
            <strong>{a.label}</strong>
            <span>{a.teaser}</span>
          </div>
        ) : (
          <div key="idle" className={styles.noteBody}>
            <span className={styles.noteLabel}>{h.noteWhat}</span>
            <strong>{h.cardLeftTitle}</strong>
            <span>{h.cardLeftBody}</span>
          </div>
        )}
      </div>

      <div ref={rightNote} className={`${styles.note} ${styles.noteRight}`}>
        {shown ? (
          <div key={shown.slug} className={styles.noteBody}>
            <span className={styles.noteLabel}>
              <span className={`${styles.liveDot} ${LIVE_SLUGS.has(shown.slug) ? '' : styles.idleDot}`} aria-hidden />
              {h.noteStatus}
            </span>
            <strong>{copy?.status}</strong>
            <span>{h.openHint}</span>
          </div>
        ) : aboutFocus ? (
          <div key="about" className={styles.noteBody}>
            <span className={styles.noteLabel}>
              <span className={styles.liveDot} aria-hidden />
              {h.noteNow}
            </span>
            <strong>{h.cardRightTitle}</strong>
            <span>{h.openHint}</span>
          </div>
        ) : (
          <div key="idle" className={styles.noteBody}>
            <span className={styles.noteLabel}>
              <span className={styles.liveDot} aria-hidden />
              {h.noteNow}
            </span>
            <strong>{h.cardRightTitle}</strong>
            <span>{h.cardRightBody}</span>
            {busy && activity && (
              <span className={styles.activity}>
                <span>{activity.tag ? h.activityRelease : h.activity}</span>
                <span>
                  <Link href={`/work/${busy.slug}`} className={styles.activityLink}>
                    {busy.short}
                    {activity.tag && ` ${activity.tag}`}
                  </Link>{' '}
                  · {ago(activity.at, locale)}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

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
