// "Win to know me": a timing duel with two buttons.
//   · Roll   — the instant a blow lands; it carries you sideways round the
//     armor (too early or too late: hit)
//   · Attack — only while its guard is open, after the last blow of a
//     string; anywhere else it's blocked and leaves you staggered
// The armor fights in strings of blows, each with its own windup. At half
// strength it breaks open into its second form, with a new moveset.
// Plain data stepped every frame; the scene reads it and draws it.

export type Phase = 'cine' | 'ready' | 'awaken' | 'fight' | 'dead' | 'won';
/** how a single blow looks (the scene animates each one) */
export type Pose = 'slam' | 'sweepR' | 'sweepL' | 'thrust' | 'spin' | 'leap' | 'lash' | 'bury' | 'whirl' | 'wave';

export const P_HP = 3;
export const B_HP = 14;

export const ROLL_T = 0.42;
const ROLL_SAFE: [number, number] = [0.03, 0.31]; // invulnerable part of the roll
// a roll and its recovery (0.47 s) always fit between two blows of a string:
// the shortest gap is STRIKE_T + 0.4 s of windup = 0.6 s
const ROLL_CD = 0.05;
export const ROLL_ARC = 0.72; // how far round the armor one roll carries you
export const ATK_T = 0.42;
const ATK_HIT = 0.17;
const STAGGER = 0.7;
const HURT = 0.9;
const CRIT_WINDOW = 0.3; // the first moments of the opening hit twice as hard
export const STRIKE_T = 0.2;

type Hit = { pose: Pose; wind: number; hold?: boolean };
type Move = { name: string; hits: Hit[]; open: number; weight: number };

// first form: a knight's halberd work
const FORM1: Move[] = [
  { name: 'slam', hits: [{ pose: 'slam', wind: 0.95 }], open: 1.15, weight: 3 },
  // the raised halberd hangs before it falls: roll on the fall, not the raise
  { name: 'late', hits: [{ pose: 'slam', wind: 0.85, hold: true }], open: 1.15, weight: 1 },
  // a full turn of the body with the blade out
  { name: 'spin', hits: [{ pose: 'spin', wind: 1.0 }], open: 1.3, weight: 2 },
  // everything it has into the floor: the halberd sticks, and while it
  // wrestles it free you get to hit it again and again
  { name: 'bury', hits: [{ pose: 'bury', wind: 1.25 }], open: 3.0, weight: 2 },
  { name: 'sweep', hits: [{ pose: 'sweepR', wind: 0.75 }], open: 1.05, weight: 3 },
  { name: 'thrust', hits: [{ pose: 'thrust', wind: 0.55 }], open: 1.0, weight: 2 },
  {
    name: 'combo',
    hits: [
      { pose: 'sweepR', wind: 0.75 },
      { pose: 'sweepL', wind: 0.45 },
      { pose: 'slam', wind: 0.6 },
    ],
    open: 1.35,
    weight: 2,
  },
];
// second form: the emptiness fights too, faster and less honest
const FORM2: Move[] = [
  { name: 'leap', hits: [{ pose: 'leap', wind: 1.15, hold: true }], open: 1.25, weight: 2 },
  {
    name: 'lash',
    hits: [
      { pose: 'lash', wind: 0.5 },
      { pose: 'lash', wind: 0.4 },
      { pose: 'lash', wind: 0.4 },
    ],
    open: 1.0,
    weight: 3,
  },
  {
    name: 'combo2',
    hits: [
      { pose: 'thrust', wind: 0.48 },
      { pose: 'sweepL', wind: 0.42 },
      { pose: 'slam', wind: 0.55, hold: true },
    ],
    open: 1.1,
    weight: 2,
  },
  { name: 'slam', hits: [{ pose: 'slam', wind: 0.8, hold: true }], open: 0.95, weight: 1 },
  // it spins and spins: one roll per turn, then it stands there spent
  {
    name: 'whirlwind',
    hits: [
      { pose: 'whirl', wind: 0.95 },
      { pose: 'whirl', wind: 0.42 },
      { pose: 'whirl', wind: 0.42 },
      { pose: 'whirl', wind: 0.42 },
      { pose: 'whirl', wind: 0.42 },
    ],
    open: 2.7,
    weight: 2,
  },
  // the leap, and a shockwave out across the floor: roll as it reaches you
  {
    name: 'shock',
    hits: [
      { pose: 'leap', wind: 1.15, hold: true },
      { pose: 'wave', wind: 0.62 },
    ],
    open: 1.3,
    weight: 2,
  },
  {
    name: 'whirl',
    hits: [
      { pose: 'sweepR', wind: 0.5 },
      { pose: 'spin', wind: 0.55 },
    ],
    open: 1.05,
    weight: 2,
  },
  { name: 'thrust', hits: [{ pose: 'thrust', wind: 0.42 }], open: 0.9, weight: 1 },
];

export type Input = { roll: boolean; attack: boolean };
export type BossState = 'idle' | 'wind' | 'hold' | 'strike' | 'open' | 'roar' | 'down';

export function newGame() {
  return {
    t: 0,
    // ang: where you stand on the circle around the armor (radians);
    // a roll carries you from rollFrom to rollTo along it
    p: { hp: P_HP, roll: 0, rollCd: 0, atk: 0, atkDone: true, stagger: 0, hurt: 0, ang: 0, rollFrom: 0, rollTo: 0, side: 1 },
    b: {
      hp: B_HP,
      form: 1 as 1 | 2,
      state: 'idle' as BossState,
      st: 0,
      dur: 1.6,
      move: FORM1[0],
      i: 0, // which blow of the string
      blow: 'slam' as Pose,
      hold: 0,
      flash: 0,
      blocked: 0,
      face: 0, // where it looks (radians, same circle as you)
      last: '',
    },
    shake: 0,
    /** hit-stop: the whole duel holds for a few frames on impact */
    freeze: 0,
    /** camera punch (0–1), decays */
    kick: 0,
    /** a burst of sparks: where (0 armor, 1 you, 2 the halberd's blade) and when */
    spark: null as null | { at: 0 | 1 | 2; t: number; big: boolean },
    /** a heavy blow hit the floor (dust ring), 1 → 0 */
    quake: 0,
    /** last floating word and when */
    word: null as null | { kind: 'crit' | 'blocked' | 'dodged' | 'hit'; t: number },
  };
}
export type Game = ReturnType<typeof newGame>;
export type Events = { playerHit?: boolean; bossHit?: boolean; died?: boolean; won?: boolean; phase2?: boolean };

function pick(g: Game) {
  const list = g.b.form === 2 ? FORM2 : FORM1;
  // never the same string twice in a row
  const pool = list.filter((m) => m.name !== g.b.last);
  let r = Math.random() * pool.reduce((s, m) => s + m.weight, 0);
  for (const m of pool) if ((r -= m.weight) <= 0) return m;
  return pool[0];
}

function idle(g: Game) {
  const b = g.b;
  b.state = 'idle';
  b.st = 0;
  b.dur = (b.form === 2 ? 0.35 : 0.65) + Math.random() * 0.6;
}

function windHit(g: Game) {
  const b = g.b;
  const h = b.move.hits[b.i];
  b.state = 'wind';
  b.st = 0;
  b.blow = h.pose;
  b.dur = h.wind;
  // a held blow: the raised weapon hangs a beat before it falls
  b.hold = h.hold ? 0.22 + Math.random() * 0.4 : 0;
}

const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));

export function step(g: Game, input: Input, dt: number): Events {
  const ev: Events = {};
  const { p, b } = g;
  g.t += dt;
  g.kick = Math.max(0, g.kick - dt * 5);
  g.quake = Math.max(0, g.quake - dt * 1.6);
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
    // sideways round the armor; turn back before drifting too far
    if (Math.abs(p.ang + p.side * ROLL_ARC) > 1.25) p.side *= -1;
    p.rollFrom = p.ang;
    p.rollTo = p.ang + p.side * ROLL_ARC;
  } else if (input.attack && !busy && b.state !== 'down') {
    p.atk = ATK_T;
    p.atkDone = false;
  }
  if (p.roll > 0) {
    p.roll = Math.max(0, p.roll - dt);
    const k = 1 - p.roll / ROLL_T;
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    p.ang = p.rollFrom + (p.rollTo - p.rollFrom) * e;
  }
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
        } else if (crit && b.dur < 1.6) b.st = Math.max(b.st, b.dur - 0.25); // a clean hit knocks it out of a short opening
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
  // it turns to face you while it can still change its mind
  const tracking = b.state === 'idle' || b.state === 'open' || b.state === 'roar' || (b.state === 'wind' && b.st < b.dur * 0.45);
  if (tracking && b.state !== 'down') b.face += wrap(p.ang - b.face) * (1 - Math.exp(-dt * (b.state === 'wind' ? 6 : 3)));

  if (b.state === 'idle' && b.st >= b.dur) {
    b.move = pick(g);
    b.last = b.move.name;
    b.i = 0;
    windHit(g);
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
      const heavy = b.blow === 'slam' || b.blow === 'leap' || b.blow === 'spin' || b.blow === 'bury';
      g.shake = Math.max(g.shake, b.blow === 'bury' ? 0.7 : heavy ? 0.45 : b.blow === 'wave' ? 0.3 : 0.22);
      if (heavy) g.quake = 1;
      if (safe) {
        g.word = { kind: 'dodged', t: g.t };
      } else {
        p.hp -= 1;
        p.hurt = HURT;
        p.roll = 0;
        p.atk = 0;
        g.freeze = 0.1;
        g.kick = 0.8;
        g.spark = { at: 1, t: g.t, big: true };
        g.shake = Math.max(g.shake, 0.55);
        ev.playerHit = true;
        if (p.hp <= 0) {
          p.hp = 0;
          ev.died = true;
        }
      }
    }
    if (b.st >= STRIKE_T) {
      if (b.i < b.move.hits.length - 1) {
        // the string goes on
        b.i += 1;
        windHit(g);
      } else {
        b.state = 'open';
        b.st = 0;
        b.dur = b.move.open;
      }
    }
  } else if (b.state === 'open' && b.st >= b.dur) {
    if (b.form === 1 && b.hp <= B_HP / 2) {
      // half its strength gone: it breaks open into its second form
      b.form = 2;
      b.state = 'roar';
      b.st = 0;
      b.dur = 3.2;
      g.shake = Math.max(g.shake, 0.6);
      ev.phase2 = true;
    } else idle(g);
  } else if (b.state === 'roar' && b.st >= b.dur) {
    idle(g);
  }
  return ev;
}

/** 0→1 through the current windup (1 while holding): drives the closing timing ring */
export function windup(g: Game) {
  const b = g.b;
  if (b.state === 'wind') return Math.min(1, b.st / b.dur);
  if (b.state === 'hold' || b.state === 'strike') return 1;
  return 0;
}
