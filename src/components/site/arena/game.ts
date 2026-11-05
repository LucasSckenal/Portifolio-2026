// "Die to know me": a timing duel with two buttons.
//   · Roll   — the instant the armor's blow lands (too early or too late: hit)
//   · Attack — only while its guard is open, right after a blow; anywhere
//     else it's blocked and leaves you staggered
// Plain data stepped every frame; the scene reads it and draws it.

export type Phase = 'cine' | 'ready' | 'awaken' | 'fight' | 'dead' | 'won';
export type Blow = 'slam' | 'sweep';

export const P_HP = 3;
export const B_HP = 8;

export const ROLL_T = 0.5;
const ROLL_SAFE: [number, number] = [0.04, 0.36]; // invulnerable part of the roll
const ROLL_CD = 0.25;
export const ATK_T = 0.32;
const ATK_HIT = 0.12;
const STAGGER = 0.7;
const HURT = 0.9;
const CRIT_WINDOW = 0.3; // the first moments of the opening hit twice as hard

export type Input = { roll: boolean; attack: boolean };
export type BossState = 'idle' | 'wind' | 'hold' | 'strike' | 'open' | 'roar' | 'down';

export function newGame() {
  return {
    t: 0,
    p: { hp: P_HP, roll: 0, rollCd: 0, atk: 0, atkDone: true, stagger: 0, hurt: 0 },
    b: { hp: B_HP, raged: false, state: 'idle' as BossState, st: 0, dur: 1.2, blow: 'slam' as Blow, hold: 0, flash: 0, blocked: 0 },
    shake: 0,
    /** hit-stop: the whole duel holds for a few frames on impact */
    freeze: 0,
    /** camera punch (0–1), decays */
    kick: 0,
    /** a burst of sparks: where (0 armor, 1 you) and when */
    spark: null as null | { at: 0 | 1; t: number; big: boolean },
    /** last floating word: 'crit' | 'blocked' | 'dodged' and when */
    word: null as null | { kind: 'crit' | 'blocked' | 'dodged' | 'hit'; t: number },
  };
}
export type Game = ReturnType<typeof newGame>;
export type Events = { playerHit?: boolean; bossHit?: boolean; died?: boolean; won?: boolean; phase2?: boolean };

const enraged = (g: Game) => g.b.hp <= B_HP / 2;

function next(g: Game) {
  const b = g.b;
  b.state = 'idle';
  b.st = 0;
  b.dur = (enraged(g) ? 0.45 : 0.75) + Math.random() * 0.7;
}

export function step(g: Game, input: Input, dt: number): Events {
  const ev: Events = {};
  const { p, b } = g;
  g.t += dt;
  g.kick = Math.max(0, g.kick - dt * 5);
  if (g.freeze > 0) {
    g.freeze -= dt;
    g.shake = Math.max(0, g.shake - dt * 2.4);
    return ev;
  }
  g.shake = Math.max(0, g.shake - dt * 2.4);
  b.flash = Math.max(0, b.flash - dt * 4);
  b.blocked = Math.max(0, b.blocked - dt * 3);
  p.rollCd = Math.max(0, p.rollCd - dt);
  p.stagger = Math.max(0, p.stagger - dt);
  p.hurt = Math.max(0, p.hurt - dt);

  // ── the two buttons ──
  const busy = p.roll > 0 || p.atk > 0 || p.stagger > 0 || p.hurt > 0;
  if (input.roll && !busy && p.rollCd <= 0) {
    p.roll = ROLL_T;
    p.rollCd = ROLL_T + ROLL_CD;
  } else if (input.attack && !busy && b.state !== 'down') {
    p.atk = ATK_T;
    p.atkDone = false;
  }
  if (p.roll > 0) p.roll = Math.max(0, p.roll - dt);
  if (p.atk > 0) {
    p.atk = Math.max(0, p.atk - dt);
    if (!p.atkDone && ATK_T - p.atk >= ATK_HIT) {
      p.atkDone = true;
      if (b.state === 'open') {
        const crit = b.st < CRIT_WINDOW;
        b.hp -= crit ? 2 : 1;
        b.flash = 1;
        g.shake = Math.max(g.shake, crit ? 0.3 : 0.16);
        g.word = { kind: crit ? 'crit' : 'hit', t: g.t };
        g.freeze = crit ? 0.11 : 0.06;
        g.kick = crit ? 1 : 0.5;
        g.spark = { at: 0, t: g.t, big: crit };
        ev.bossHit = true;
        if (b.hp <= 0) {
          b.hp = 0;
          b.state = 'down';
          b.st = 0;
          ev.won = true;
        } else if (crit) {
          // a clean hit knocks it out of the opening early
          b.st = Math.max(b.st, b.dur - 0.25);
        }
      } else if (b.state !== 'down') {
        // guard up: the blade glances off and you're left open
        b.blocked = 1;
        p.stagger = STAGGER;
        g.word = { kind: 'blocked', t: g.t };
        g.freeze = 0.05;
        g.spark = { at: 0, t: g.t, big: false };
        g.shake = Math.max(g.shake, 0.1);
      }
    }
  }

  // ── the armor ──
  b.st += dt;
  if (b.state === 'idle' && b.st >= b.dur) {
    b.state = 'wind';
    b.st = 0;
    b.blow = Math.random() < 0.55 ? 'slam' : 'sweep';
    b.dur = (b.blow === 'slam' ? 0.95 : 0.75) * (enraged(g) ? 0.8 : 1);
    // enraged: sometimes it holds the raised blade a beat (a delayed blow)
    b.hold = enraged(g) && Math.random() < 0.45 ? 0.25 + Math.random() * 0.35 : 0;
  } else if (b.state === 'wind' && b.st >= b.dur) {
    b.state = b.hold > 0 ? 'hold' : 'strike';
    b.st = 0;
  } else if (b.state === 'hold' && b.st >= b.hold) {
    b.state = 'strike';
    b.st = 0;
  }
  if (b.state === 'strike') {
    // the blow lands on its first frame
    if (b.st <= dt + 1e-6) {
      const into = ROLL_T - p.roll; // seconds since the roll started
      const safe = p.roll > 0 && into >= ROLL_SAFE[0] && into <= ROLL_SAFE[1];
      g.shake = Math.max(g.shake, b.blow === 'slam' ? 0.4 : 0.25);
      if (safe) {
        g.word = { kind: 'dodged', t: g.t };
      } else {
        p.hp -= 1;
        p.hurt = HURT;
        g.freeze = 0.1;
        g.kick = 0.8;
        g.spark = { at: 1, t: g.t, big: true };
        p.roll = 0;
        p.atk = 0;
        g.shake = Math.max(g.shake, 0.55);
        ev.playerHit = true;
        if (p.hp <= 0) {
          p.hp = 0;
          ev.died = true;
        }
      }
    }
    if (b.st >= 0.18) {
      b.state = 'open';
      b.st = 0;
      b.dur = enraged(g) ? 0.85 : 1.15;
    }
  } else if (b.state === 'open' && b.st >= b.dur) {
    if (enraged(g) && !b.raged) {
      // half its strength gone: it stops, roars, and fights faster
      b.raged = true;
      b.state = 'roar';
      b.st = 0;
      b.dur = 2.6;
      g.shake = Math.max(g.shake, 0.5);
      ev.phase2 = true;
    } else next(g);
  } else if (b.state === 'roar' && b.st >= b.dur) {
    next(g);
  }
  return ev;
}

/** 0→1 through the windup (1 while holding): drives the closing timing ring */
export function windup(g: Game) {
  const b = g.b;
  if (b.state === 'wind') return Math.min(1, b.st / b.dur);
  if (b.state === 'hold' || b.state === 'strike') return 1;
  return 0;
}
