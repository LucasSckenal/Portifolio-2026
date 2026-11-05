'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { useT } from '@/components/providers/LanguageProvider';
import { B_HP, P_HP, newGame, type Events, type Game, type Input, type Phase } from './game';
import World, { CINE_END, CREDIT_AT, CREDIT_LEN, TITLE_AT } from './World';
import styles from './arena.module.scss';

// ── "Win to know me" ─────────────────────────────────────────────────
// The About card opens a short film and a duel, in the site's black and
// white. The opening rolls Lucas's facts as credits over a flight through a
// ruined arena built from his work (project tablets on the walls, his real
// GitHub year as the ring of stones). An empty armor kneels at the centre
// with a sword through it; pulling the sword wakes it. Two buttons: roll the
// instant a blow lands, attack only while its guard is open.

type Word = { text: string; id: number } | null;

export default function Arena({ onReveal, onClose }: { onReveal: () => void; onClose: () => void }) {
  const t = useT();
  const a = t.site.about;
  const ar = a.arena;
  const credits = useMemo(() => [{ label: ar.portrait, value: 'Lucas Sckenal' }, ...a.facts], [a.facts, ar.portrait]);
  const game = useRef<Game>(newGame());
  const input = useRef<Input>({ roll: false, attack: false });
  const phaseRef = useRef<Phase>('cine');
  const cine = useRef({ t: 0, skip: false, awaken: 0 });
  const [phase, setPhaseState] = useState<Phase>('cine');
  const [hp, setHp] = useState({ p: P_HP, b: B_HP });
  const [credit, setCredit] = useState(-1);
  const [title, setTitle] = useState(false);
  const [late, setLate] = useState(false); // the mid-fight credit
  const [word, setWord] = useState<Word>(null);
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const focusRef = useRef<HTMLButtonElement>(null);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);
  const skipCine = useCallback(() => {
    if (phaseRef.current === 'cine') cine.current.skip = true;
  }, []);

  const fight = () => {
    if (phaseRef.current !== 'ready') return;
    cine.current.awaken = 0;
    setPhase('awaken');
  };
  const retry = () => {
    game.current = newGame();
    setHp({ p: P_HP, b: B_HP });
    setLate(false);
    // it's already awake: straight back into the duel
    setPhase('fight');
  };

  // keys: Space/K/L roll · J/Enter attack · any key skips the opening
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'escape') return onClose();
      if (phaseRef.current === 'cine') {
        e.preventDefault();
        return skipCine();
      }
      if (phaseRef.current !== 'fight') return;
      if (k === ' ' || k === 'k' || k === 'l' || k === 'shift') {
        e.preventDefault();
        input.current.roll = true;
      }
      if (k === 'j' || k === 'enter') input.current.attack = true;
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onClose, skipCine]);

  // ?arenadebug: expose the duel's state to automated play-tests
  useEffect(() => {
    if (window.location.search.includes('arenadebug')) (window as unknown as { __arena: unknown }).__arena = { game, input, phase: phaseRef, cine };
  }, []);

  useEffect(() => {
    if (phase === 'ready' || phase === 'dead' || phase === 'won') focusRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const onEvents = (ev: Events) => {
    const g = game.current;
    if (ev.playerHit || ev.bossHit) setHp({ p: g.p.hp, b: Math.max(0, g.b.hp) });
    if (g.word && g.word.t === g.t) {
      const text = { crit: ar.crit, blocked: ar.blocked, dodged: ar.dodged, hit: '' }[g.word.kind];
      if (text) setWord({ text, id: g.t });
    }
    if (ev.phase2) {
      setLate(true);
      window.setTimeout(() => setLate(false), 4600);
    }
    if (ev.died) {
      phaseRef.current = 'dead';
      window.setTimeout(() => setPhaseState('dead'), 900);
    }
    if (ev.won) {
      phaseRef.current = 'won';
      window.setTimeout(() => setPhaseState('won'), 2600);
    }
  };

  // the opening's timeline: credits, then the armor's name
  const onCine = (time: number) => {
    let idx = -1;
    for (let i = 0; i < credits.length; i++) if (time >= CREDIT_AT(i) && time < CREDIT_AT(i) + CREDIT_LEN) idx = i;
    setCredit((c) => (c === idx ? c : idx));
    const showTitle = time >= TITLE_AT && time < CINE_END;
    setTitle((s) => (s === showTitle ? s : showTitle));
    if (time >= CINE_END) {
      setCredit(-1);
      setTitle(false);
      setPhase('ready');
    }
  };
  const onAwake = () => setPhase('fight');

  const press = (k: keyof Input) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phaseRef.current === 'fight') input.current[k] = true;
  };

  const bars = phase === 'cine' || phase === 'awaken' || phase === 'won';

  return createPortal(
    <div
      className={`${styles.root} ${bars ? styles.cinema : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={ar.title}
      onPointerDown={skipCine}
    >
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [0, 9, 20], fov: 42, near: 0.1, far: 120 }}
        gl={{ antialias: true }}
        onPointerDown={(e) => {
          if (!touch && e.button === 0 && phaseRef.current === 'fight') input.current.attack = true;
        }}
      >
        <World game={game} input={input} phase={phaseRef} cine={cine} onEvents={onEvents} onCine={onCine} onAwake={onAwake} />
      </Canvas>

      {/* letterbox */}
      <i className={styles.barTop} aria-hidden />
      <i className={styles.barBottom} aria-hidden />

      {/* opening credits */}
      <div className={styles.credits} aria-live="polite">
        {credit >= 0 && (
          <p key={credit} className={styles.credit}>
            <span>{credits[credit].label}</span>
            <strong>{credits[credit].value}</strong>
          </p>
        )}
      </div>
      {title && (
        <div className={styles.title} aria-hidden>
          <strong>{ar.boss}</strong>
          <i />
        </div>
      )}
      {phase === 'cine' && <p className={styles.skipHint}>{ar.skipCine}</p>}

      {/* the last fact arrives mid-fight, when it roars */}
      {late && (
        <p className={`${styles.credit} ${styles.lateCredit}`} aria-live="polite">
          <span>{a.offLabel}</span>
          <strong>
            {a.offTitle} <em>{a.offBody}</em>
          </strong>
        </p>
      )}

      {/* HUD */}
      {(phase === 'fight' || phase === 'dead') && (
        <div className={styles.hud}>
          <div className={styles.pips} aria-label={`${hp.p}/${P_HP}`}>
            {Array.from({ length: P_HP }, (_, i) => (
              <i key={i} className={i < hp.p ? styles.pipOn : ''} />
            ))}
          </div>
          <div className={styles.boss}>
            <span>{ar.boss}</span>
            <div className={styles.bar}>
              <i style={{ width: `${(hp.b / B_HP) * 100}%` }} />
            </div>
          </div>
          {word && (
            <span key={word.id} className={styles.word}>
              {word.text}
            </span>
          )}
        </div>
      )}

      {phase === 'fight' && (
        <div className={styles.buttons}>
          <button type="button" onPointerDown={press('roll')}>
            {ar.dodge}
            {!touch && <kbd>Space</kbd>}
          </button>
          <button type="button" className={styles.attackBtn} onPointerDown={press('attack')}>
            {ar.attack}
            {!touch && <kbd>J</kbd>}
          </button>
        </div>
      )}

      <div className={styles.corner} onPointerDown={(e) => e.stopPropagation()}>
        {phase !== 'won' && (
          <button type="button" className={styles.skip} onClick={onReveal}>
            {ar.skip}
          </button>
        )}
        <button type="button" className={styles.close} onClick={onClose} aria-label={t.site.hero.close}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      {phase === 'ready' && (
        <div className={styles.card}>
          <span className={styles.kicker}>{a.label}</span>
          <h2>{ar.title}</h2>
          <p>{ar.intro}</p>
          <p className={styles.keys}>{touch ? ar.touch : ar.keys}</p>
          <button ref={focusRef} type="button" className={styles.primary} onClick={fight}>
            {ar.fight}
          </button>
        </div>
      )}

      {phase === 'dead' && (
        <div className={styles.died} role="status">
          <h2>{ar.died}</h2>
          <button ref={focusRef} type="button" className={styles.primary} onClick={retry}>
            {ar.retry}
          </button>
        </div>
      )}

      {phase === 'won' && (
        <div className={styles.won} role="status">
          <h2>{ar.won}</h2>
          <p>{ar.wonBody}</p>
          <button ref={focusRef} type="button" className={styles.primary} onClick={onReveal}>
            {ar.reveal}
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
