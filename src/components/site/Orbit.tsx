'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MORPH, morphTo } from '@/lib/viewMorph';
import { useT } from '@/components/providers/LanguageProvider';
import { PANELS, PROJECTS, PROJECT_ORDER, type PanelId, type ProjectId } from './panels';
import type { OrbitControl, Rect } from './HeroScene';
import AboutDiagram from './AboutDiagram';
import styles from './hero.module.scss';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });
const OrbitTuner = dynamic(() => import('./OrbitTuner'), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

type Open = { slug: PanelId; from: Rect } | null;

// ── Orbit: the scene plus everything it needs to be a real interface ──
//   · the WebGL scene (HeroScene) when the device can draw it
//   · a cut-out portrait with a row of glass chips when it cannot
//   · an always-present, keyboard-reachable list of the projects
//   · the expanded glass panel: the project, and one action — see it
export default function Orbit() {
  const t = useT();
  const router = useRouter();
  const h = t.site.hero;
  const control = useRef<OrbitControl | null>(null);
  const [gl, setGl] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [open, setOpen] = useState<Open>(null);
  const [shown, setShown] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [tuning, setTuning] = useState(false);
  const [flying, setFlying] = useState(false);
  const onReady = useCallback(() => setSceneReady(true), []);
  const lastFocus = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    setGl(hasWebGL());
    setTuning(new URLSearchParams(window.location.search).has('ajustar'));
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // ?motion forces full motion (for testing on a reduced-motion machine)
    const force = new URLSearchParams(window.location.search).has('motion');
    setReduced(mq.matches && !force);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches && !force);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const openProject = useCallback((slug: PanelId, from: Rect) => {
    lastFocus.current = document.activeElement as HTMLElement;
    closing.current = false;
    setOpen({ slug, from });
  }, []);

  // the page around the ring quiets down while About is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('about:state', { detail: open?.slug === 'about' }));
  }, [open]);

  // arriving from another page's "Sobre" (/?sobre): open it once there is a stage
  const askedAbout = useRef(false);
  useEffect(() => {
    if (askedAbout.current || gl === null || (gl && !sceneReady)) return;
    if (!new URLSearchParams(window.location.search).has('sobre')) return;
    askedAbout.current = true;
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('orbit:open-about')), gl ? 900 : 0);
  }, [gl, sceneReady]);

  // FLIP: the transform that lays the card over the panel it came from
  const fromTransform = (from: Rect) => {
    const el = cardRef.current;
    if (!el) return 'none';
    const to = el.getBoundingClientRect();
    const sx = Math.max(from.w / to.width, 0.05);
    const sy = Math.max(from.h / to.height, 0.05);
    const dx = from.x + from.w / 2 - (to.left + to.width / 2);
    const dy = from.y + from.h / 2 - (to.top + to.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  };

  const close = useCallback(() => {
    if (closing.current || !open) return;
    closing.current = true;
    setShown(false);
    const finish = () => {
      setOpen(null);
      lastFocus.current?.focus?.();
    };
    const el = cardRef.current;
    if (!el || reduced) {
      window.setTimeout(finish, reduced ? 160 : 0);
      return;
    }
    // back into its panel, faster than it came out
    el.animate(
      [{ transform: 'none', opacity: 1 }, { transform: fromTransform(open.from), opacity: 0 }],
      { duration: 320, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
    ).finished.then(finish, finish);
  }, [reduced, open]);

  // Mount → the card is born from the panel's box and grows to the centre
  useEffect(() => {
    if (!open) return;
    const el = cardRef.current;
    if (el && !reduced) {
      el.animate(
        [
          { transform: fromTransform(open.from), opacity: 0.4, borderRadius: '18px' },
          { transform: 'none', opacity: 1, borderRadius: '30px' },
        ],
        { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
    const id = requestAnimationFrame(() => setShown(true));
    const f = window.setTimeout(() => (ctaRef.current ?? closeRef.current)?.focus({ preventScroll: true }), 80);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(f);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Hero buttons talk to the ring through window events
  useEffect(() => {
    const spin = () => control.current?.spin();
    const openAt = (i: number) => {
      if (control.current?.open(i)) return; // flies in and opens on arrival
      control.current?.focus(i);
      const w = 220;
      openProject(PANELS[i].slug, { x: window.innerWidth / 2 - w / 2, y: window.innerHeight * 0.6, w, h: w * 0.62 });
    };
    const first = () => openAt(0);
    // "Sobre" in the nav opens the About card, wherever the ring has it
    // (no flight: the ring itself steps back for it)
    const about = () => {
      control.current?.focus(PANELS.findIndex((p) => p.slug === 'about'));
      openProject('about', { x: window.innerWidth / 2 - 110, y: window.innerHeight * 0.6, w: 220, h: 136 });
    };
    window.addEventListener('orbit:spin', spin);
    window.addEventListener('orbit:open-first', first);
    window.addEventListener('orbit:open-about', about);
    return () => {
      window.removeEventListener('orbit:spin', spin);
      window.removeEventListener('orbit:open-first', first);
      window.removeEventListener('orbit:open-about', about);
    };
  }, [openProject]);

  // Real links (they work without JS); with JS they open the glass panel
  const fromLink = (slug: PanelId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    openProject(slug, { x: r.left, y: r.top, w: r.width, h: r.height });
  };

  const view = open && open.slug !== 'about' ? PROJECTS[open.slug] : null;
  const a = t.site.about;

  return (
    <div className={`${styles.stage} ${open || flying ? styles.stageRaised : ''}`}>
      {/* Server-rendered portrait: the page never starts empty. It is the
          whole picture without WebGL, and the skeleton until the 3D scene
          has its textures. */}
      <div className={`${styles.posterPortrait} ${sceneReady ? styles.posterGone : ''}`}>
        <Image src="/home/head/poster.webp" alt="Lucas Sckenal" fill priority sizes="(max-width: 700px) 175vw, 1200px" />
      </div>
      {gl && tuning && <OrbitTuner />}
      {gl && (
        <HeroScene
          reduced={reduced}
          onOpen={openProject}
          openSlug={open?.slug ?? null}
          onFlight={setFlying}
          controlRef={control}
          onReady={onReady}
        />
      )}

      {/* Keyboard and screen-reader route to every project. A visible row
          of glass chips when WebGL is unavailable; with the scene it stays
          in the DOM and appears while focused. */}
      <ul className={`${styles.projectList} ${gl ? styles.projectListQuiet : ''}`}>
        {PROJECT_ORDER.map((slug) => (
          <li key={slug}>
            <a
              href={`/work/${slug}`}
              onClick={fromLink(slug)}
              onFocus={() => control.current?.focus(PANELS.findIndex((p) => p.slug === slug))}
            >
              {PROJECTS[slug].title}
            </a>
          </li>
        ))}
        <li>
          <a
            href="/?sobre"
            onClick={fromLink('about')}
            onFocus={() => control.current?.focus(PANELS.findIndex((p) => p.slug === 'about'))}
          >
            {a.label}
          </a>
        </li>
      </ul>

      {gl && (
        <span className={styles.dragHint} aria-hidden>
          {h.dragHint}
        </span>
      )}

      {open?.slug === 'about' && <AboutDiagram shown={shown} onClose={close} />}

      {open && view && (
        <div className={`${styles.overlay} ${shown ? styles.overlayShown : ''}`} onClick={close} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            ref={cardRef}
            className={styles.expanded}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.expandedMedia} style={{ viewTransitionName: MORPH.media }}>
              {view.media.kind === 'video' ? (
                <video autoPlay={!reduced} controls={reduced} muted loop playsInline poster={view.media.poster} aria-hidden={!reduced}>
                  {view.media.sources.map((s) => (
                    <source key={s.src} src={s.src} type={s.type} />
                  ))}
                </video>
              ) : view.media.kind === 'note' ? (
                <p className={styles.expandedNote}>{view.media.text}</p>
              ) : (
                <Image src={view.media.src} alt="" fill sizes="(max-width: 700px) 92vw, 860px" />
              )}
            </div>
            <div className={styles.expandedBar}>
              <h2 id="panel-title" className={styles.expandedTitle} style={{ viewTransitionName: MORPH.title }}>
                {view.title}
              </h2>
              <Link
                ref={ctaRef}
                href={`/work/${open.slug}`}
                className={styles.viewProject}
                onClick={(e) => {
                  // the card grows into the case page (plain link without JS)
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  morphTo(router, `/work/${open.slug}`);
                }}
              >
                {h.viewProject}
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </Link>
            </div>
            <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label={h.close}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
