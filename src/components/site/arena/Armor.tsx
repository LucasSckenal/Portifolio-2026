'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { windup, type Game, type Phase, type Pose } from './game';
import { AW } from './timeline';
import Trail from './Trail';
import { bossPos, halberdTip, hilt } from './shared';

// The Empty Armor, low poly. A nod to a certain first boss, in its own form:
// it waits on its knees with a sword through its chest and wakes when you
// pull it out. First form: halberd work (overhead slam, sweeps both ways, a
// thrust, a three-blow string). At half strength it breaks open: a black
// mass bursts from its back and shoulders, tendrils lash, it leaps.

const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.45, metalness: 0.45, ...extra });
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const damp = (cur: number, to: number, rate: number, dt: number) => cur + (to - cur) * (1 - Math.exp(-dt * rate));

// ── the blows, as keyframes ──
// ax: arm pitch (0 hanging, -π/2 forward, -π overhead); ay: arm swing round
// the body; wr: the halberd against the arm (π/2 across it, π along it);
// lax: the off hand; turn: the whole body round its feet.
type P = {
  ax: number; ay: number; az: number; wr: number; reach: number; stepZ: number; lean: number;
  twist: number; lift: number; crouch: number; lash: number; turn: number; lax: number;
};
const KEYS = ['ax', 'ay', 'az', 'wr', 'reach', 'stepZ', 'lean', 'twist', 'lift', 'crouch', 'lash', 'turn', 'lax'] as const;
// guard: halberd low and forward in both hands, weight sunk
const G: P = { ax: -0.4, ay: 0.15, az: 0, wr: 2.6, reach: 0, stepZ: 0, lean: 0.1, twist: -0.18, lift: 0, crouch: 0.08, lash: 0, turn: 0, lax: -0.75 };
const P_ = (o: Partial<P>): P => ({ ...G, ...o });
const mixP = (a: P, b: P, k: number): P => {
  const o = { ...a };
  for (const key of KEYS) o[key] = a[key] + (b[key] - a[key]) * k;
  return o;
};
const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));

// W: top of the windup · S: the instant of contact (at tS s) · F: where the
// swing ends (at tF s), weapon buried or thrown wide; then it hangs there
// for part of the opening and hauls itself back to guard
const BLOWS = {
  slam: {
    // both hands high, leaning back on its heels; then it falls with the whole body
    W: P_({ ax: -2.95, wr: 0.75, lean: -0.3, twist: 0.12, crouch: -0.08, stepZ: -0.2, lax: -2.75 }),
    S: P_({ ax: -1.1, wr: 3.75, lean: 0.45, twist: -0.05, crouch: 0.34, stepZ: 0.8, lax: -1.25 }),
    F: P_({ ax: -0.98, wr: 3.7, lean: 0.52, twist: -0.08, crouch: 0.4, stepZ: 0.85, lax: -1.15 }),
    tS: 0.07,
    tF: 0.3,
  },
  sweepR: {
    // coiled hard to one side, blade far behind; it unwinds through you
    W: P_({ ax: -1.35, ay: 1.95, wr: 3.0, twist: 0.7, turn: 0.45, crouch: 0.18, lean: 0.05, stepZ: -0.15, lax: 0.25 }),
    S: P_({ ax: -1.45, ay: 0.0, wr: 3.1, twist: 0.0, turn: 0.0, crouch: 0.24, lean: 0.18, stepZ: 0.55, lax: 0.4 }),
    F: P_({ ax: -1.3, ay: -1.5, wr: 3.0, twist: -0.65, turn: -0.5, crouch: 0.22, lean: 0.2, stepZ: 0.6, lax: 0.5 }),
    tS: 0.06,
    tF: 0.28,
  },
  sweepL: {
    // the backhand: it comes straight back the other way
    W: P_({ ax: -1.35, ay: -1.6, wr: 3.0, twist: -0.65, turn: -0.5, crouch: 0.2, lean: 0.12, stepZ: 0.4, lax: 0.45 }),
    S: P_({ ax: -1.45, ay: 0.0, wr: 3.1, twist: 0.0, turn: 0.0, crouch: 0.24, lean: 0.18, stepZ: 0.75, lax: 0.3 }),
    F: P_({ ax: -1.3, ay: 1.7, wr: 3.0, twist: 0.6, turn: 0.45, crouch: 0.2, lean: 0.15, stepZ: 0.8, lax: 0.2 }),
    tS: 0.06,
    tF: 0.28,
  },
  thrust: {
    // drawn back low, like a spear; then the lunge
    W: P_({ ax: -1.0, wr: 2.55, reach: -0.15, twist: 0.55, turn: 0.25, crouch: 0.32, lean: -0.05, stepZ: -0.35, lax: -1.2 }),
    S: P_({ ax: -1.55, wr: 3.1, reach: 0.75, twist: -0.25, turn: -0.05, crouch: 0.3, lean: 0.35, stepZ: 1.5, lax: -1.4 }),
    F: P_({ ax: -1.5, wr: 3.1, reach: 0.65, twist: -0.3, turn: -0.08, crouch: 0.28, lean: 0.38, stepZ: 1.55, lax: -1.3 }),
    tS: 0.06,
    tF: 0.25,
  },
  spin: {
    // wound up past its own shoulder, then a whole turn with the blade out
    W: P_({ ax: -1.4, ay: 2.1, wr: 3.05, twist: 0.75, turn: 1.25, crouch: 0.3, lean: 0.1, lax: 0.35 }),
    S: P_({ ax: -1.5, ay: 0.3, wr: 3.1, twist: 0.1, turn: 0.2, crouch: 0.26, lean: 0.12, stepZ: 0.4, lax: 0.5 }),
    F: P_({ ax: -1.35, ay: -0.9, wr: 3.0, twist: -0.4, turn: 0.2 - Math.PI * 2, crouch: 0.3, lean: 0.25, stepZ: 0.7, lax: 0.5 }),
    tS: 0.07,
    tF: 0.5,
  },
  leap: {
    // up into the air, halberd overhead, and down on you
    W: P_({ ax: -2.95, wr: 0.75, lean: -0.25, lift: 3.2, stepZ: 1.1, crouch: 0, lax: -2.7 }),
    S: P_({ ax: -1.1, wr: 3.75, lean: 0.5, lift: 0, stepZ: 1.4, crouch: 0.48, lax: -1.2 }),
    F: P_({ ax: -1.0, wr: 3.7, lean: 0.55, lift: 0, stepZ: 1.4, crouch: 0.5, lax: -1.1 }),
    tS: 0.06,
    tF: 0.3,
  },
  lash: {
    // the emptiness strikes; the steel only braces
    W: P_({ ax: -0.6, wr: 1.7, lash: -1, twist: 0.35, turn: 0.2, crouch: 0.2, lean: -0.15 }),
    S: P_({ ax: -0.6, wr: 1.7, lash: 1, twist: -0.25, turn: -0.1, crouch: 0.15, lean: 0.25, stepZ: 0.3 }),
    F: P_({ ax: -0.6, wr: 1.7, lash: 0.6, twist: -0.2, turn: -0.08, crouch: 0.15, lean: 0.2, stepZ: 0.3 }),
    tS: 0.05,
    tF: 0.22,
  },
} as Record<Pose, { W: P; S: P; F: P; tS: number; tF: number }>;
// bury: the slam with everything behind it; the blade goes deep and sticks
BLOWS.bury = {
  W: P_({ ax: -3.05, wr: 0.6, lean: -0.4, twist: 0.15, crouch: -0.12, stepZ: -0.3, lax: -2.9 }),
  S: P_({ ax: -0.85, wr: 3.9, lean: 0.62, twist: -0.05, crouch: 0.48, stepZ: 0.9, lax: -0.95 }),
  F: P_({ ax: -0.8, wr: 3.85, lean: 0.66, twist: -0.08, crouch: 0.5, stepZ: 0.9, lax: -0.9 }),
  tS: 0.06,
  tF: 0.25,
};
// whirl: arm out, blade level; the body turns (worked out live from where it is)
const WHIRL = P_({ ax: -1.5, ay: 0.1, wr: 3.1, twist: -0.1, crouch: 0.28, lean: 0.12, stepZ: 0.5, lax: 0.6 });
// spent after the whirlwind: bent over, halberd dragging, heaving
const TIRED = P_({ ax: -0.35, wr: 2.75, ay: 0.3, lean: 0.55, crouch: 0.42, twist: 0.1, stepZ: 0.5, lax: 0.2 });
BLOWS.whirl = { W: WHIRL, S: WHIRL, F: TIRED, tS: 0.05, tF: 0.5 };
// wave: it stays down where it landed while the shock runs out across the floor
BLOWS.wave = { W: BLOWS.leap.F, S: P_({ ...BLOWS.leap.F, crouch: 0.55, lean: 0.6 }), F: BLOWS.leap.F, tS: 0.05, tF: 0.2 };
// how far into the opening it starts to recover (the rest is your window)
const RECOVER: Partial<Record<Pose, number>> = { bury: 0.86, whirl: 0.82 };

const LEAP_CROUCH = P_({ ax: -1.3, wr: 2.2, crouch: 0.5, lean: 0.3, lax: -1.4 });
const ROAR = P_({ ax: -2.6, wr: 1.0, lean: -0.42, crouch: -0.05, lax: -2.3, twist: 0 });
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
// the stuck axe: three heaves, each harder, before it tears free
const TUGS: Array<[number, number]> = [
  [0.2, 0.55],
  [0.48, 0.8],
  [0.76, 1],
];
function heaveAt(u: number) {
  let h = 0;
  for (const [c, k] of TUGS) {
    // a quick heave back, a slow slump forward
    const x = u < c ? (u - (c - 0.06)) / 0.06 : 1 - (u - c) / 0.14;
    h = Math.max(h, k * Math.max(0, Math.min(1, x)));
  }
  return h;
}
const DOWN = new THREE.Vector3(0, -1, 0);
const pinTmp = { O: new THREE.Vector3(), D: new THREE.Vector3(), S: new THREE.Vector3(), P: new THREE.Vector3(), v: new THREE.Vector3(), q: new THREE.Quaternion() };
const easeIn2 = (t: number) => t * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

// the axe blade: a crescent edge, flat and thin
const axeHead = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(0.04, 0.26);
  sh.lineTo(0.38, 0.4);
  sh.lineTo(0.66, 0.5);
  sh.lineTo(0.55, 0.15);
  sh.lineTo(0.53, -0.15);
  sh.lineTo(0.66, -0.52);
  sh.lineTo(0.36, -0.36);
  sh.lineTo(0.04, -0.2);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false });
  g.translate(0, 0, -0.02);
  return g;
})();

export default function Armor({
  game,
  phase,
  cine,
}: {
  game: React.RefObject<Game>;
  phase: React.RefObject<Phase>;
  cine: React.RefObject<{ t: number; skip: boolean; awaken: number }>;
}) {
  const root = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const helm = useRef<THREE.Group>(null);
  const slit = useRef<THREE.Mesh>(null);
  const arm = useRef<THREE.Group>(null);
  const haft = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const elL = useRef<THREE.Group>(null);
  const thighL = useRef<THREE.Group>(null);
  const thighR = useRef<THREE.Group>(null);
  const shinL = useRef<THREE.Group>(null);
  const shinR = useRef<THREE.Group>(null);
  const impaled = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const mass = useRef<THREE.Group>(null);
  const bladeA = useRef<THREE.Object3D>(null);
  const bladeB = useRef<THREE.Object3D>(null);
  const s = useRef<P & { form: number; face: number; shield: number }>({ ...G, ax: -0.15, wr: 1.57, lax: 0.15, form: 0, face: 0, shield: 0 });
  // which part of which blow we're in, since when, and the pose it started from
  const an = useRef({ key: '', t: 0, from: { ...G } as P, trail: false });
  // the axe held in the floor: its world placement while stuck, the last heave seen
  const pin = useRef({ on: false, mat: new THREE.Matrix4(), tug: -1 });
  const debris = useRef<THREE.Group>(null);

  const m = useMemo(
    () => ({
      steel: flat('#8d9097'),
      plate: flat('#55575e'),
      dark: flat('#1c1d21', { metalness: 0.2, roughness: 0.7 }),
      cloth: flat('#2a2b2f', { metalness: 0, roughness: 0.9, side: THREE.DoubleSide }),
      void: new THREE.MeshStandardMaterial({ color: '#050506', flatShading: true, roughness: 1, metalness: 0 }),
      eye: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      blade: flat('#d9dadc', { metalness: 0.7, roughness: 0.25 }),
      plume: new THREE.MeshStandardMaterial({ color: '#e4e4e0', flatShading: true, roughness: 0.95, side: THREE.DoubleSide }),
      sword: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.35, flatShading: true, metalness: 0.6, roughness: 0.25 }),
    }),
    []
  );

  const seeds = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        ry: (i / 10) * Math.PI * 2,
        tilt: 0.45 + ((i * 37) % 10) / 20,
        len: 2.4 + ((i * 53) % 10) / 4,
        ph: i * 1.7,
      })),
    []
  );
  const lumps = useMemo(
    () => [
      [0.0, 1.25, -0.45, 0.55],
      [-0.55, 1.35, -0.25, 0.42],
      [0.6, 1.4, -0.2, 0.46],
      [-0.2, 1.75, -0.4, 0.38],
      [0.3, 1.0, -0.55, 0.4],
      [0.0, 1.95, -0.15, 0.3],
    ],
    []
  );

  useFrame(({ clock }, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const g = game.current;
    const b = g.b;
    const ph = phase.current;
    const st = s.current;
    if (!root.current || !torso.current || !arm.current || !hips.current) return;
    const time = clock.elapsedTime;
    const a = cine.current.awaken;

    // ── kneeling ↔ standing (the awakening) ──
    let kneel = 0;
    if (ph === 'cine' || ph === 'ready') kneel = 1;
    else if (ph === 'awaken') kneel = 1 - ease(clamp01((a - AW.rise) / (AW.end - AW.rise - 0.2)));
    else if (b.state === 'down') kneel = Math.min(1, b.st / 1.4);
    if (impaled.current) impaled.current.visible = ph === 'cine' || ph === 'ready' || (ph === 'awaken' && a < AW.grip);
    const shudder = ph === 'awaken' && a > AW.pull && a < AW.rise + 0.3 ? 1 : 0;

    // ── the pose it should be in ──
    const live = kneel < 0.5 && b.state !== 'down';
    const hitting = b.state === 'strike' || b.state === 'open';
    const key = !live ? 'off' : hitting ? `hit:${b.move.name}:${b.i}` : `${b.state}:${b.move.name}:${b.i}`;
    const A = an.current;
    if (key !== A.key) {
      A.key = key;
      A.t = 0;
      for (const k of KEYS) A.from[k] = st[k];
      A.from.turn = wrap(A.from.turn);
    }
    A.t += dt;
    const B = BLOWS[b.blow];
    let target: P;
    let rate = 7;
    if (!live) {
      target = P_({ ax: kneel > 0.5 ? -0.15 : -0.45, wr: 1.57, ay: 0, twist: 0, lean: 0, crouch: 0, lax: 0.15 });
      rate = 6;
    } else if (b.state === 'roar') {
      target = ROAR;
      rate = 5;
    } else if (b.state === 'wind') {
      // the raise is quick and the top is long: it hangs there, and you wait
      const w = windup(g);
      if (b.blow === 'whirl') {
        // the first coils up the other way; the rest keep turning
        const coil = b.i === 0 ? 1.3 * easeOut(clamp01(w / 0.8)) : -w * 1.6;
        target = { ...mixP(A.from, WHIRL, easeOut(clamp01(w / 0.5))), turn: A.from.turn + coil };
      } else if (b.blow === 'leap') {
        target = w < 0.4 ? mixP(A.from, LEAP_CROUCH, smooth(w / 0.4)) : mixP(LEAP_CROUCH, B.W, Math.sin(clamp01((w - 0.4) / 0.6) * Math.PI * 0.5));
      } else target = mixP(A.from, B.W, easeOut(clamp01(w / 0.8)));
      // the steel strains at the top
      if (w > 0.75) target.lean += Math.sin(time * 40) * 0.008;
      rate = 22;
    } else if (b.state === 'hold') {
      target = { ...B.W, lean: B.W.lean - 0.05, ax: B.W.ax - 0.06 };
      rate = 10;
    } else if (hitting) {
      const t = A.t;
      target =
        t < B.tS
          ? mixP(A.from, B.S, easeIn2(t / B.tS))
          : mixP(B.S, B.F, easeOut(clamp01((t - B.tS) / (B.tF - B.tS))));
      if (b.blow === 'whirl' && t < 0.45) target = { ...WHIRL, turn: A.from.turn - Math.PI * 2 * easeOut(t / 0.45) };
      if (b.state === 'open' && t >= B.tF) {
        // buried, then hauled back to guard in the second half of the opening
        const F = { ...B.F, turn: b.blow === 'whirl' ? 0 : wrap(B.F.turn) };
        const from = RECOVER[b.blow] ?? 0.45;
        const r = smooth(clamp01((b.st - b.dur * from) / (b.dur * (1 - from))));
        if (b.blow === 'bury') {
          // it wrestles the haft: braces, heaves back with its whole weight,
          // slumps over it, and heaves again, harder each time
          const u = clamp01(b.st / (b.dur * from));
          const hv = heaveAt(u);
          F.lean = F.lean + 0.06 - hv * 0.62;
          F.crouch = F.crouch + 0.04 + hv * 0.16;
          F.stepZ = F.stepZ - hv * 0.4;
          F.twist = hv * 0.14 + Math.sin(time * 34) * 0.012 * hv;
          F.lax = F.lax - hv * 0.4;
          // each heave jolts the floor
          const n = TUGS.findIndex(([c]) => Math.abs(u - c) < 0.02);
          if (n >= 0 && n !== pin.current.tug) {
            pin.current.tug = n;
            g.shake = Math.max(g.shake, 0.1 + n * 0.06);
            g.spark = { at: 2, t: g.t + 0.001 * (n + 1), big: false };
          }
        } else if (b.blow === 'whirl') {
          // spent: heaving for breath
          F.crouch = F.crouch + Math.sin(time * 5) * 0.04;
          F.lean = F.lean + Math.sin(time * 5) * 0.05;
        }
        target = mixP(F, G, r);
        // a wrench as it tears the blade out of the floor
        if (r > 0 && r < 0.35 && (b.blow === 'slam' || b.blow === 'leap')) target.lean -= Math.sin((r / 0.35) * Math.PI) * 0.12;
        // torn free: it staggers back with the blade
        if (r > 0 && r < 0.45 && b.blow === 'bury') {
          const k = Math.sin((r / 0.45) * Math.PI);
          target.lean -= k * 0.5;
          target.stepZ -= k * 0.5;
          target.ax -= k * 0.9;
        }
      }
      rate = t < B.tF ? 60 : b.blow === 'bury' ? 20 : 9;
    } else {
      // idle: it circles, weight rolling from foot to foot
      target = { ...G, turn: Math.sin(time * 0.9) * 0.06, crouch: G.crouch + Math.abs(Math.sin(time * 1.8)) * 0.03 };
      rate = 5;
    }
    A.trail = live && hitting && A.t < (b.blow === 'whirl' ? 0.45 : B.tF + 0.04) && b.blow !== 'lash' && b.blow !== 'wave';

    // ease toward it; a whole turn (the spin) is unwound without spinning back
    while (st.turn - target.turn > Math.PI) st.turn -= Math.PI * 2;
    while (st.turn - target.turn < -Math.PI) st.turn += Math.PI * 2;
    const kd = 1 - Math.exp(-dt * rate);
    for (const k of KEYS) st[k] += (target[k] - st[k]) * kd;
    st.lean -= b.flash * 0.18 * kd;

    // facing: it turns to you
    st.face += Math.atan2(Math.sin(b.face - st.face), Math.cos(b.face - st.face)) * (1 - Math.exp(-dt * 12));
    root.current.rotation.y = st.face + st.turn;
    root.current.position.set(
      Math.sin(st.face) * st.stepZ + (shudder ? (Math.random() - 0.5) * 0.06 : 0),
      st.lift + Math.sin(time * 1.6) * 0.02 * (1 - kneel),
      Math.cos(st.face) * st.stepZ
    );

    hips.current.position.y = lerp(1.9, 1.05, kneel) - st.crouch;
    torso.current.rotation.set(lerp(0, 0.42, kneel) + st.lean + (b.state === 'roar' ? Math.sin(time * 30) * 0.03 : 0), st.twist, 0);
    if (thighL.current && thighR.current && shinL.current && shinR.current) {
      // one knee down, one foot planted; a lunge puts the right foot forward
      const c = st.crouch * 1.4;
      const lunge = clamp01(st.stepZ / 1.2);
      thighL.current.rotation.x = lerp(-c * 0.7 + lunge * 0.45, -1.45, kneel);
      shinL.current.rotation.x = lerp(c * 1.3 + lunge * 0.35, 1.5, kneel);
      thighR.current.rotation.x = lerp(-c * 0.9 - lunge * 0.6, 0.4, kneel);
      shinR.current.rotation.x = lerp(c * 1.4 + lunge * 0.3, 1.55, kneel);
    }
    arm.current.rotation.set(st.ax, st.ay, st.az);
    arm.current.position.z = 0.1 + st.reach;
    if (haft.current) haft.current.rotation.x = st.wr;
    // the shield arm: forearm across the front, shield up; it jerks higher to
    // take a blow you threw at the wrong time
    const la = armL.current;
    const le = elL.current;
    if (la && le) {
      const up = live ? 1 : 0;
      st.shield = damp(st.shield, b.blocked > 0.2 ? 1 : 0, 25, dt);
      la.rotation.set(lerp(0.15, -0.3 + st.lax * 0.1 - st.shield * 0.6, up), 0, lerp(-0.1, -0.15, up));
      le.rotation.set(lerp(-0.9, -1.4 - st.shield * 0.15, up), 0, 0);
    }

    // ── the buried axe stays where it went in; the arm holds on to it ──
    const hf = haft.current;
    const pinned = live && b.blow === 'bury' && b.state === 'open' && A.t >= B.tF && b.st < b.dur * (RECOVER.bury ?? 0.86);
    if (hf) {
      const P_ = pin.current;
      if (pinned) {
        root.current.updateMatrixWorld(true);
        if (!P_.on) {
          P_.on = true;
          P_.tug = -1;
          P_.mat.copy(hf.matrixWorld);
          if (bladeB.current && debris.current) {
            bladeB.current.getWorldPosition(halberdTip);
            debris.current.position.set(halberdTip.x, 0, halberdTip.z);
          }
        }
        const { O, D: dir, S, P, v, q } = pinTmp;
        O.setFromMatrixPosition(P_.mat);
        dir.set(0, 1, 0).transformDirection(P_.mat);
        arm.current.getWorldPosition(S);
        // the hand slides along the haft to wherever the arm can reach it
        const L = 1.16;
        v.subVectors(S, O);
        const along = dir.dot(v);
        const h = L * L - (v.lengthSq() - along * along);
        let sAt = along;
        if (h > 0) {
          const r1 = along - Math.sqrt(h);
          const r2 = along + Math.sqrt(h);
          sAt = Math.abs(r1) < Math.abs(r2) ? r1 : r2;
        }
        sAt = Math.min(1.2, Math.max(-0.5, sAt));
        P.copy(O).addScaledVector(dir, sAt);
        torso.current.getWorldQuaternion(q);
        v.subVectors(P, S).normalize().applyQuaternion(q.invert());
        arm.current.quaternion.setFromUnitVectors(DOWN, v);
        arm.current.updateMatrixWorld(true);
        hf.matrixAutoUpdate = false;
        hf.matrix.copy(arm.current.matrixWorld).invert().multiply(P_.mat);
        hf.matrixWorldNeedsUpdate = true;
        hf.updateMatrixWorld(true);
      } else if (P_.on) {
        // torn out: earth and sparks where the blade was
        P_.on = false;
        hf.matrixAutoUpdate = true;
        g.spark = { at: 2, t: g.t + 0.0005, big: true };
        g.quake = 1;
        g.shake = Math.max(g.shake, 0.4);
        g.kick = Math.max(g.kick, 0.5);
      }
    }
    if (debris.current) {
      debris.current.visible = pin.current.on;
      if (pin.current.on) {
        // the cracked earth heaves with every pull
        const u = clamp01(b.st / (b.dur * (RECOVER.bury ?? 0.86)));
        debris.current.scale.setScalar(1 + heaveAt(u) * 0.25);
      }
    }

    // ── live points for the rest of the scene ──
    bossPos.copy(root.current.position).setY(0);
    if (impaled.current) {
      impaled.current.updateWorldMatrix(true, false);
      impaled.current.getWorldPosition(hilt.pos);
      impaled.current.getWorldQuaternion(hilt.quat);
      hilt.axis.set(0, 1, 0).applyQuaternion(hilt.quat);
    }
    if (bladeB.current && (A.trail || pin.current.on)) {
      bladeB.current.updateWorldMatrix(true, false);
      bladeB.current.getWorldPosition(halberdTip);
    }

    // ── materials ──
    m.steel.emissive.set('#ffffff');
    m.steel.emissiveIntensity = b.flash * 0.7;
    m.plate.emissive.set('#ffffff');
    m.plate.emissiveIntensity = b.flash * 0.5 + b.blocked * 0.25;
    const eyeOn = ph === 'cine' || ph === 'ready' ? 0.15 : ph === 'awaken' ? clamp01((a - AW.pull) / 1.0) : 1;
    m.eye.color.setScalar(0.15 + eyeOn * 0.85 * (b.state === 'down' ? Math.max(0, 1 - b.st) : 1));
    // the slit flares at the top of every windup: the tell
    const tell = live && (b.state === 'hold' || (b.state === 'wind' && windup(g) > 0.7)) ? 1 : 0;
    if (slit.current) slit.current.scale.y = damp(slit.current.scale.y, 1 + tell * 1.8, 18, dt);

    // ── second form: the emptiness breaks out ──
    const form = b.form === 2 && b.state !== 'down' ? (b.state === 'roar' ? clamp01(b.st / 2.4) : 1) : b.state === 'down' ? Math.max(0, 1 - b.st) * st.form : 0;
    st.form = damp(st.form, form, 4, dt);
    m.steel.color.set('#8d9097').lerp(new THREE.Color('#4a4c52'), st.form);
    if (helm.current) helm.current.rotation.z = st.form * 0.32 + (b.state === 'roar' ? Math.sin(time * 26) * 0.05 : 0);
    if (mass.current) {
      mass.current.visible = st.form > 0.02;
      mass.current.children.forEach((c, i) => {
        const pulse = 1 + Math.sin(time * 3 + i) * 0.06;
        c.scale.setScalar(st.form * lumps[i][3] * pulse * 1.0);
      });
    }
    const tg = tendrils.current;
    if (tg) {
      tg.visible = st.form > 0.02;
      tg.children.forEach((c, i) => {
        const sd = seeds[i];
        // a lash throws them all forward at once
        const whip = st.lash;
        const fwd = whip > 0 ? whip * 1.6 : whip * 0.7;
        c.rotation.set(sd.tilt + Math.sin(time * 2.2 + sd.ph) * 0.25 - fwd, sd.ry * (1 - Math.abs(whip) * 0.6) + Math.sin(time * 1.3 + sd.ph) * 0.2, 0);
        c.scale.set(1, st.form * sd.len * (1 + Math.sin(time * 3 + sd.ph) * 0.08) * (1 + Math.max(0, whip) * 0.6), 1);
      });
    }
  });

  return (
    <>
      <group ref={root}>
        <group ref={hips} position={[0, 1.9, 0]}>
          {/* legs: thigh and shin on joints, so it can kneel and crouch */}
          {(
            [
              [thighL, shinL, -0.3],
              [thighR, shinR, 0.3],
            ] as const
          ).map(([th, sh, x]) => (
            <group key={x} ref={th} position={[x, 0, 0]}>
              <mesh position={[0, -0.45, 0]} castShadow material={m.plate}>
                <boxGeometry args={[0.34, 0.9, 0.4]} />
              </mesh>
              <group ref={sh} position={[0, -0.9, 0]}>
                <mesh position={[0, -0.45, 0]} castShadow material={m.steel}>
                  <boxGeometry args={[0.3, 0.9, 0.36]} />
                </mesh>
                {/* knee cop */}
                <mesh position={[0, 0, 0.17]} scale={[1, 0.85, 0.75]} castShadow material={m.steel}>
                  <icosahedronGeometry args={[0.21, 0]} />
                </mesh>
                {/* sabaton, pointed */}
                <mesh position={[0, -0.92, 0.08]} castShadow material={m.plate}>
                  <boxGeometry args={[0.3, 0.14, 0.46]} />
                </mesh>
                <mesh position={[0, -0.93, 0.44]} rotation={[Math.PI / 2, Math.PI / 4, 0]} castShadow material={m.steel}>
                  <coneGeometry args={[0.15, 0.32, 4]} />
                </mesh>
              </group>
            </group>
          ))}

          <group ref={torso}>
            {/* tasset skirt, cuirass, gorget */}
            <mesh position={[0, 0.12, 0]} castShadow material={m.dark}>
              <cylinderGeometry args={[0.5, 0.74, 0.62, 8]} />
            </mesh>
            <mesh position={[0, 0.8, 0]} castShadow material={m.steel}>
              <cylinderGeometry args={[0.74, 0.5, 0.95, 8]} />
            </mesh>
            <mesh position={[0, 0.82, 0.38]} rotation={[0.1, 0, 0]} castShadow material={m.plate}>
              <boxGeometry args={[0.7, 0.7, 0.18]} />
            </mesh>
            <mesh position={[0, 1.34, 0]} castShadow material={m.dark}>
              <cylinderGeometry args={[0.3, 0.42, 0.18, 8]} />
            </mesh>
            {/* belt, and a long tabard hanging from it */}
            <mesh position={[0, 0.4, 0]} castShadow material={m.dark}>
              <cylinderGeometry args={[0.57, 0.57, 0.11, 8]} />
            </mesh>
            <mesh position={[0, -0.25, 0.6]} rotation={[0.05, 0, 0]} castShadow material={m.cloth}>
              <planeGeometry args={[0.42, 1.25, 1, 3]} />
            </mesh>
            <mesh position={[0, -0.05, 0.615]} rotation={[0.05, 0, Math.PI / 4]} material={m.plate}>
              <boxGeometry args={[0.16, 0.16, 0.02]} />
            </mesh>
            {[-1, 1].map((sx) => (
              <group key={sx} position={[sx * 0.8, 1.16, 0]}>
                <mesh scale={[1, 0.62, 1.05]} castShadow material={m.steel}>
                  <icosahedronGeometry args={[0.42, 0]} />
                </mesh>
                <mesh position={[sx * 0.08, -0.22, 0]} scale={[1, 0.4, 1]} castShadow material={m.plate}>
                  <icosahedronGeometry args={[0.38, 0]} />
                </mesh>
                <mesh position={[sx * 0.18, 0.28, 0]} rotation={[0, 0, -sx * 0.5]} castShadow material={m.steel}>
                  <coneGeometry args={[0.07, 0.3, 4]} />
                </mesh>
              </group>
            ))}
            {/* great helm with a crest and a narrow slit */}
            <group ref={helm} position={[0, 1.66, 0.02]}>
              <mesh castShadow material={m.steel}>
                <cylinderGeometry args={[0.27, 0.32, 0.56, 7]} />
              </mesh>
              <mesh position={[0, 0.36, 0]} castShadow material={m.plate}>
                <coneGeometry args={[0.28, 0.3, 7]} />
              </mesh>
              <mesh position={[0, 0.42, -0.05]} castShadow material={m.dark}>
                <boxGeometry args={[0.06, 0.34, 0.6]} />
              </mesh>
              <mesh ref={slit} position={[0, 0.04, 0.29]} material={m.eye}>
                <boxGeometry args={[0.34, 0.045, 0.04]} />
              </mesh>
              {/* horns: out from the temples, then up */}
              {[-1, 1].map((sx) => (
                <group key={sx} position={[sx * 0.27, 0.16, 0]}>
                  <mesh position={[sx * 0.15, 0.04, 0]} rotation={[0, 0, -sx * 1.25]} castShadow material={m.steel}>
                    <cylinderGeometry args={[0.05, 0.08, 0.32, 5]} />
                  </mesh>
                  <mesh position={[sx * 0.3, 0.26, 0]} rotation={[0, 0, sx * 0.35]} castShadow material={m.steel}>
                    <coneGeometry args={[0.055, 0.42, 5]} />
                  </mesh>
                </group>
              ))}
              {/* plume, falling back from the crown */}
              {[-0.12, 0, 0.12].map((x, i) => (
                <mesh key={x} position={[x * 0.6, 0.38, -0.32]} rotation={[-2.05 - i * 0.12, 0, x * 1.5]} castShadow material={m.plume}>
                  <coneGeometry args={[0.1, 0.85 - i * 0.12, 4]} />
                </mesh>
              ))}
            </group>
            {/* tattered cloak */}
            <mesh position={[0, 0.25, -0.62]} rotation={[0.16, 0, 0]} castShadow material={m.cloth}>
              <planeGeometry args={[1.5, 2.3, 2, 4]} />
            </mesh>
            {/* the shield arm: upper arm, couter, forearm across the front, the round shield */}
            <group ref={armL} position={[-0.92, 1.0, 0.1]}>
              <mesh position={[0, -0.38, 0]} castShadow material={m.dark}>
                <boxGeometry args={[0.24, 0.76, 0.26]} />
              </mesh>
              <group ref={elL} position={[0, -0.78, 0]}>
                <mesh scale={[1, 0.9, 1.1]} castShadow material={m.steel}>
                  <icosahedronGeometry args={[0.16, 0]} />
                </mesh>
                <mesh position={[0, -0.32, 0]} castShadow material={m.plate}>
                  <boxGeometry args={[0.21, 0.62, 0.23]} />
                </mesh>
                {/* the shield faces out along the forearm: a wide disc, a raised rim, a spike */}
                <group position={[0.22, -0.72, 0]}>
                  <mesh castShadow material={m.steel}>
                    <cylinderGeometry args={[0.74, 0.74, 0.08, 10]} />
                  </mesh>
                  <mesh position={[0, -0.05, 0]} castShadow material={m.plate}>
                    <cylinderGeometry args={[0.52, 0.6, 0.05, 10]} />
                  </mesh>
                  <mesh position={[0, -0.09, 0]} castShadow material={m.steel}>
                    <cylinderGeometry args={[0.2, 0.26, 0.06, 8]} />
                  </mesh>
                  <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]} castShadow material={m.blade}>
                    <coneGeometry args={[0.16, 0.48, 6]} />
                  </mesh>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <mesh
                      key={i}
                      position={[Math.cos((i / 8) * Math.PI * 2) * 0.66, -0.06, Math.sin((i / 8) * Math.PI * 2) * 0.66]}
                      castShadow
                      material={m.dark}
                    >
                      <icosahedronGeometry args={[0.045, 0]} />
                    </mesh>
                  ))}
                </group>
              </group>
            </group>

            {/* the sword through its chest, hilt toward whoever comes */}
            <group ref={impaled} position={[-0.2, 0.8, 0.62]} rotation={[-2.16, 0, 0.1]}>
              {/* the wanderer's sword, blade buried: guard at the origin, as in the hand */}
              <mesh castShadow material={m.dark}>
                <boxGeometry args={[0.24, 0.04, 0.05]} />
              </mesh>
              <mesh position={[0, -0.1, 0]} material={m.dark}>
                <cylinderGeometry args={[0.025, 0.025, 0.16, 5]} />
              </mesh>
              <mesh position={[0, 0.55, 0]} material={m.sword}>
                <boxGeometry args={[0.07, 1.05, 0.02]} />
              </mesh>
            </group>

            {/* the weapon arm and its long axe */}
            <group ref={arm} position={[0.92, 1.0, 0.05]} rotation-order="YXZ">
              <mesh position={[0, -0.3, 0]} castShadow material={m.dark}>
                <boxGeometry args={[0.24, 0.62, 0.26]} />
              </mesh>
              <mesh position={[0, -0.6, 0]} scale={[1, 0.9, 1.1]} castShadow material={m.steel}>
                <icosahedronGeometry args={[0.16, 0]} />
              </mesh>
              <mesh position={[0, -0.88, 0]} castShadow material={m.plate}>
                <boxGeometry args={[0.21, 0.56, 0.23]} />
              </mesh>
              <mesh position={[0, -1.16, 0]} castShadow material={m.steel}>
                <boxGeometry args={[0.24, 0.16, 0.27]} />
              </mesh>
              <group ref={haft} position={[0, -1.16, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh position={[0, 0.75, 0]} castShadow material={m.dark}>
                  <cylinderGeometry args={[0.045, 0.045, 2.7, 6]} />
                </mesh>
                {/* bands on the haft, a spike at the butt */}
                {[0.5, 1.15].map((y) => (
                  <mesh key={y} position={[0, y, 0]} castShadow material={m.steel}>
                    <cylinderGeometry args={[0.07, 0.07, 0.08, 6]} />
                  </mesh>
                ))}
                <mesh position={[0, -0.72, 0]} rotation={[Math.PI, 0, 0]} castShadow material={m.steel}>
                  <coneGeometry args={[0.06, 0.22, 5]} />
                </mesh>
                {/* the head: a broad crescent, a smaller beak behind, a spike on top */}
                <mesh position={[0, 1.78, 0]} geometry={axeHead} castShadow material={m.blade} />
                <mesh position={[0, 1.78, 0]} rotation={[0, Math.PI, 0]} scale={[0.6, 0.62, 1]} geometry={axeHead} castShadow material={m.blade} />
                <mesh position={[0, 1.78, 0]} castShadow material={m.steel}>
                  <boxGeometry args={[0.14, 0.42, 0.12]} />
                </mesh>
                <mesh position={[0, 2.3, 0]} castShadow material={m.blade}>
                  <coneGeometry args={[0.07, 0.62, 4]} />
                </mesh>
                <object3D ref={bladeA} position={[0.5, 1.62, 0]} />
                <object3D ref={bladeB} position={[0.05, 2.55, 0]} />
              </group>
            </group>

            {/* second form: a black mass bursting from back and shoulders */}
            <group ref={mass} visible={false}>
              {lumps.map(([x, y, z], i) => (
                <mesh key={i} position={[x, y, z]} castShadow material={m.void}>
                  <icosahedronGeometry args={[1, 0]} />
                </mesh>
              ))}
            </group>
            <group ref={tendrils} position={[0, 1.3, -0.3]} visible={false}>
              {seeds.map((_, i) => (
                <group key={i}>
                  {/* the cone grows from its base, not its middle */}
                  <mesh position={[0, 0.5, 0]} castShadow material={m.void}>
                    <coneGeometry args={[0.2, 1, 4]} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        </group>
      </group>
      {/* cracked, heaved-up earth round the stuck blade */}
      <group ref={debris} visible={false}>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.dark}>
          <circleGeometry args={[0.75, 7]} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const a = (i / 7) * Math.PI * 2 + 0.3;
          const d = 0.45 + (i % 3) * 0.18;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * d, 0.07, Math.sin(a) * d]}
              rotation={[i, i * 1.7, i * 0.6]}
              scale={[1, 0.6, 1]}
              castShadow
              material={m.plate}
            >
              <icosahedronGeometry args={[0.1 + (i % 2) * 0.06, 0]} />
            </mesh>
          );
        })}
      </group>
      <Trail
        base={bladeA}
        tip={bladeB}
        opacity={0.6}
        active={() => an.current.trail}
      />
    </>
  );
}
