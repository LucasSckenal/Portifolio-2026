'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { windup, type Game, type Phase, type Pose } from './game';
import { AW } from './timeline';
import Trail from './Trail';
import { halberdTip, hilt } from './shared';

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
const G: P = { ax: -0.55, ay: 0.2, az: 0, wr: 1.6, reach: 0, stepZ: 0, lean: 0.1, twist: -0.18, lift: 0, crouch: 0.08, lash: 0, turn: 0, lax: -0.75 };
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
const BLOWS: Record<Pose, { W: P; S: P; F: P; tS: number; tF: number }> = {
  slam: {
    // both hands high, leaning back on its heels; then it falls with the whole body
    W: P_({ ax: -2.95, wr: 0.75, lean: -0.3, twist: 0.12, crouch: -0.08, stepZ: -0.2, lax: -2.75 }),
    S: P_({ ax: -1.1, wr: 3.45, lean: 0.45, twist: -0.05, crouch: 0.34, stepZ: 0.8, lax: -1.25 }),
    F: P_({ ax: -0.98, wr: 3.42, lean: 0.52, twist: -0.08, crouch: 0.4, stepZ: 0.85, lax: -1.15 }),
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
    W: P_({ ax: -0.75, wr: 2.3, reach: -0.5, twist: 0.55, turn: 0.25, crouch: 0.32, lean: -0.05, stepZ: -0.35, lax: -1.2 }),
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
    S: P_({ ax: -1.1, wr: 3.45, lean: 0.5, lift: 0, stepZ: 1.4, crouch: 0.48, lax: -1.2 }),
    F: P_({ ax: -1.0, wr: 3.42, lean: 0.55, lift: 0, stepZ: 1.4, crouch: 0.5, lax: -1.1 }),
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
};
const LEAP_CROUCH = P_({ ax: -1.3, wr: 2.2, crouch: 0.5, lean: 0.3, lax: -1.4 });
const ROAR = P_({ ax: -2.6, wr: 1.0, lean: -0.42, crouch: -0.05, lax: -2.3, twist: 0 });
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn2 = (t: number) => t * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

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
  const thighL = useRef<THREE.Group>(null);
  const thighR = useRef<THREE.Group>(null);
  const shinL = useRef<THREE.Group>(null);
  const shinR = useRef<THREE.Group>(null);
  const impaled = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const mass = useRef<THREE.Group>(null);
  const bladeA = useRef<THREE.Object3D>(null);
  const bladeB = useRef<THREE.Object3D>(null);
  const s = useRef<P & { form: number; face: number }>({ ...G, ax: -0.15, wr: 1.57, lax: 0.15, form: 0, face: 0 });
  // which part of which blow we're in, since when, and the pose it started from
  const an = useRef({ key: '', t: 0, from: { ...G } as P, trail: false });

  const m = useMemo(
    () => ({
      steel: flat('#8d9097'),
      plate: flat('#55575e'),
      dark: flat('#1c1d21', { metalness: 0.2, roughness: 0.7 }),
      cloth: flat('#2a2b2f', { metalness: 0, roughness: 0.9, side: THREE.DoubleSide }),
      void: new THREE.MeshStandardMaterial({ color: '#050506', flatShading: true, roughness: 1, metalness: 0 }),
      eye: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      blade: flat('#d9dadc', { metalness: 0.7, roughness: 0.25 }),
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
      if (b.blow === 'leap') {
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
      if (b.state === 'open' && t >= B.tF) {
        // buried, then hauled back to guard in the second half of the opening
        const F = { ...B.F, turn: wrap(B.F.turn) };
        const r = smooth(clamp01((b.st - b.dur * 0.45) / (b.dur * 0.55)));
        target = mixP(F, G, r);
        // a wrench as it tears the blade out of the floor
        if (r > 0 && r < 0.35 && (b.blow === 'slam' || b.blow === 'leap')) target.lean -= Math.sin((r / 0.35) * Math.PI) * 0.12;
      }
      rate = t < B.tF ? 60 : 9;
    } else {
      // idle: it circles, weight rolling from foot to foot
      target = { ...G, turn: Math.sin(time * 0.9) * 0.06, crouch: G.crouch + Math.abs(Math.sin(time * 1.8)) * 0.03 };
      rate = 5;
    }
    A.trail = live && hitting && A.t < B.tF + 0.04 && b.blow !== 'lash';

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
    arm.current.position.z = 0.05 + st.reach;
    if (haft.current) haft.current.rotation.x = st.wr;
    if (armL.current) armL.current.rotation.set(st.lax, 0, -0.1 + Math.max(0, st.lax) * 0.4);

    // ── live points for the rest of the scene ──
    if (impaled.current) {
      impaled.current.updateWorldMatrix(true, false);
      impaled.current.getWorldPosition(hilt.pos);
      impaled.current.getWorldQuaternion(hilt.quat);
      hilt.axis.set(0, 1, 0).applyQuaternion(hilt.quat);
    }
    if (bladeB.current && A.trail) {
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
                <mesh position={[0, -0.92, 0.1]} castShadow material={m.dark}>
                  <boxGeometry args={[0.32, 0.14, 0.56]} />
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
            {[-1, 1].map((sx) => (
              <group key={sx} position={[sx * 0.8, 1.16, 0]}>
                <mesh scale={[1, 0.62, 1.05]} castShadow material={m.steel}>
                  <icosahedronGeometry args={[0.42, 0]} />
                </mesh>
                <mesh position={[sx * 0.08, -0.22, 0]} scale={[1, 0.4, 1]} castShadow material={m.plate}>
                  <icosahedronGeometry args={[0.38, 0]} />
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
            </group>
            {/* tattered cloak */}
            <mesh position={[0, 0.25, -0.62]} rotation={[0.16, 0, 0]} castShadow material={m.cloth}>
              <planeGeometry args={[1.5, 2.3, 2, 4]} />
            </mesh>
            {/* the other arm, hanging */}
            <group ref={armL} position={[-0.9, 1.0, 0.1]}>
              <mesh position={[0, -0.45, 0]} castShadow material={m.dark}>
                <boxGeometry args={[0.24, 0.95, 0.26]} />
              </mesh>
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

            {/* the halberd, from the shoulder */}
            <group ref={arm} position={[0.9, 1.0, 0.05]} rotation-order="YXZ">
              <mesh position={[0, -0.42, 0]} castShadow material={m.dark}>
                <boxGeometry args={[0.24, 0.9, 0.26]} />
              </mesh>
              <group ref={haft} position={[0, -0.88, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh position={[0, 0.9, 0]} castShadow material={m.dark}>
                  <cylinderGeometry args={[0.05, 0.05, 3.6, 5]} />
                </mesh>
                <mesh position={[0.26, 2.45, 0]} castShadow material={m.blade}>
                  <boxGeometry args={[0.5, 0.62, 0.04]} />
                </mesh>
                <mesh position={[-0.16, 2.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={m.blade}>
                  <coneGeometry args={[0.08, 0.32, 4]} />
                </mesh>
                <mesh position={[0, 2.95, 0]} castShadow material={m.blade}>
                  <coneGeometry args={[0.07, 0.55, 4]} />
                </mesh>
                <object3D ref={bladeA} position={[0.4, 2.2, 0]} />
                <object3D ref={bladeB} position={[0, 3.2, 0]} />
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
      <Trail
        base={bladeA}
        tip={bladeB}
        opacity={0.6}
        active={() => an.current.trail}
      />
    </>
  );
}
