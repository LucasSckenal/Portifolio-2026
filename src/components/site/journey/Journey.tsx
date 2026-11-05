'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { useT } from '@/components/providers/LanguageProvider';
import Arena from '../arena/Arena';
import type { Drive } from '../arena/Player';
import MapWorld, { type MapCmd, type Walker } from './MapWorld';
import { NO_GEAR, START, STOPS } from './stops';
import styles from './journey.module.scss';

// ── "Sobre" as a walk ────────────────────────────────────────────────
// A village (Brazil), a road, and one place for each experience, oldest
// first. Reaching a place tells its story and gives the wanderer something
// that stays on him; the road ends at the arena, where the duel lives.
// Everything is also readable as a plain list, and is the only view when
// there's no WebGL.

function hasGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Journey({ onClose }: { onClose: () => void }) {
  const t = useT();
  const mp = t.site.about.map;
  const [gl] = useState(hasGL);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches);
  const [tall, setTall] = useState(() => window.innerHeight > window.innerWidth * 1.15);
  const [mode, setMode] = useState<'map' | 'arena'>('map');
  const [list, setList] = useState(!gl);
  const [stop, setStop] = useState<number | null>(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [gain, setGain] = useState<{ i: number; id: number } | null>(null);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(true);

  const drive = useRef<Drive>({ x: START.x, z: START.z, yaw: Math.PI, speed: 0, gear: { ...NO_GEAR }, flash: 0 });
  const walker = useRef<Walker>({ x: START.x, z: START.z, path: [], keys: new Set() });
  const cmd = useRef<MapCmd>({ next: 0, goto: null });
  const seen = useRef(new Set<number>([0]));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = () => setTall(window.innerHeight > window.innerWidth * 1.15);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  useEffect(() => {
    const id = window.setTimeout(() => setHint(false), 6000);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  // Esc: close the list first, then the map (the arena handles its own)
  useEffect(() => {
    if (mode !== 'map') return;
    const down = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (list && gl) setList(false);
      else onClose();
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [mode, list, gl, onClose]);

  // arriving somewhere: the first time, it gives you its thing
  const onStop = useCallback((i: number | null) => {
    setStop(i);
    if (i === null) return;
    setHint(false);
    if (seen.current.has(i)) return;
    seen.current.add(i);
    setVisited(Array.from(seen.current).sort((a, b) => a - b));
    const g = STOPS[i].gain;
    if (g && g !== 'sword') {
      drive.current.gear = { ...drive.current.gear, [g]: true };
      drive.current.flash = 1;
      setGain({ i, id: Date.now() });
    }
  }, []);

  useEffect(() => {
    if (!gain) return;
    const id = window.setTimeout(() => setGain(null), 2600);
    return () => window.clearTimeout(id);
  }, [gain]);

  const next = () => {
    cmd.current.next += 1;
    setHint(false);
  };
  const goTo = (i: number) => {
    cmd.current.goto = i;
    setList(false);
  };
  const onWon = () => {
    setWon(true);
    drive.current.gear = { ...drive.current.gear, sword: true };
  };
  const back = () => {
    setMode('map');
    if (won) {
      drive.current.flash = 1;
      setGain({ i: STOPS.length - 1, id: Date.now() });
    }
  };

  const s = stop !== null ? mp.stops[stop] : null;
  const S = stop !== null ? STOPS[stop] : null;
  const isArena = stop === STOPS.length - 1;
  const carried = STOPS.map((x, i) => (x.gain && (x.gain === 'sword' ? won : visited.includes(i)) ? mp.stops[i].item : null)).filter(Boolean);
  const done = visited.length >= STOPS.length;

  return createPortal(
    <div ref={rootRef} tabIndex={-1} className={styles.root} role="dialog" aria-modal="true" aria-label={mp.title}>
      {gl && (
        <Canvas
          className={styles.canvas}
          dpr={[1, 1.5]}
          shadows
          frameloop={mode === 'map' ? 'always' : 'never'}
          camera={{ position: [0, 12, 16], fov: tall ? 52 : 44, near: 0.1, far: 140 }}
          gl={{ antialias: true }}
        >
          <MapWorld
            drive={drive}
            walker={walker}
            cmd={cmd}
            visited={seen}
            won={won}
            tall={tall}
            reduced={reduced}
            onStop={onStop}
          />
        </Canvas>
      )}

      {/* top: the title and how far you've come */}
      <header className={styles.top}>
        <div className={styles.titleBox}>
          <span className={styles.kicker}>{t.site.about.label}</span>
          <strong>{mp.title}</strong>
          <span className={styles.progress} aria-label={`${visited.length} / ${STOPS.length}`}>
            {STOPS.map((x, i) => (
              <i key={x.key} className={visited.includes(i) ? styles.on : ''} />
            ))}
          </span>
        </div>
        <div className={styles.actions}>
          {gl && (
            <button type="button" className={styles.ghost} onClick={() => setList((v) => !v)} aria-pressed={list}>
              {list ? mp.map : mp.list}
            </button>
          )}
          <button type="button" className={styles.close} onClick={onClose} aria-label={t.site.hero.close}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </header>

      {/* what he carries */}
      {gl && !list && carried.length > 0 && (
        <p className={styles.carry}>
          <span>{mp.carry}</span>
          {carried.join(' · ')}
        </p>
      )}

      {/* the item, the moment you get it */}
      {gain && (
        <div key={gain.id} className={styles.gain} role="status">
          <span>{mp.got}</span>
          <strong>{mp.stops[gain.i].item}</strong>
        </div>
      )}

      {gl && !list && hint && <p className={styles.hint}>{touch ? mp.hintTouch : mp.hintKeys}</p>}

      {/* where you are */}
      {gl && !list && s && S && (
        <article key={stop} className={styles.card} aria-live="polite">
          <span className={styles.kicker}>
            {String(stop! + 1).padStart(2, '0')} · {s.place}
          </span>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
          {stop === 0 && <p className={styles.item}>{mp.nothing}</p>}
          {S.gain && S.gain !== 'sword' && (
            <p className={styles.item}>
              {mp.got} · <strong>{s.item}</strong>
            </p>
          )}
          {stop === 0 && won && <p className={styles.item}>{mp.flag}</p>}
          <div className={styles.row}>
            {S.href && (
              <a className={styles.ghostDark} href={S.href}>
                {mp.project} ↗
              </a>
            )}
            {isArena && (
              <button type="button" className={styles.primary} onClick={() => setMode('arena')}>
                {won ? `${mp.won} · ${mp.enter}` : mp.enter}
              </button>
            )}
          </div>
        </article>
      )}

      {/* follow the road */}
      {gl && !list && !isArena && (
        <button type="button" className={styles.next} onClick={next}>
          {done ? mp.stops[STOPS.length - 1].place : mp.next}
          <span aria-hidden>→</span>
        </button>
      )}

      {/* everything, as a list */}
      {list && (
        <section className={styles.list} aria-label={mp.listTitle}>
          <h2>{mp.listTitle}</h2>
          <ol>
            {STOPS.map((x, i) => {
              const c = mp.stops[i];
              return (
                <li key={x.key}>
                  <span className={styles.kicker}>
                    {String(i + 1).padStart(2, '0')} · {c.place}
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                  <div className={styles.row}>
                    {gl && (
                      <button type="button" className={styles.ghostDark} onClick={() => goTo(i)}>
                        {c.place} →
                      </button>
                    )}
                    {x.href && (
                      <a className={styles.ghostDark} href={x.href}>
                        {mp.project} ↗
                      </a>
                    )}
                    {i === STOPS.length - 1 && gl && (
                      <button
                        type="button"
                        className={styles.primary}
                        onClick={() => {
                          setList(false);
                          setMode('arena');
                        }}
                      >
                        {mp.enter}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {mode === 'arena' && <Arena fromMap onWon={onWon} onReveal={back} onClose={back} />}
    </div>,
    document.body
  );
}
