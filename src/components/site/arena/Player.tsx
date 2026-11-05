'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ATK_T, ROLL_T, type Game, type Phase } from './game';
import { AW, CLOSE, DIST } from './timeline';
import Trail from './Trail';
import { hilt } from './shared';

// The wanderer: a hooded, low-poly figure on real joints (hips, spine,
// chest, head, shoulders, elbows, hips, knees), animated by blending poses.
// Every action is a short set of keyframes with anticipation and
// follow-through; joints ease toward them frame-rate independently.

type J = 'spine' | 'chest' | 'head' | 'shL' | 'elL' | 'shR' | 'elR' | 'thL' | 'knL' | 'thR' | 'knR';
type Pose = Partial<Record<J, [number, number, number]>> & { hipsY?: number; fwd?: number };

const IDLE: Pose = {
  hipsY: 0.9,
  thL: [-0.38, 0, 0.06],
  knL: [0.55, 0, 0],
  thR: [0.3, 0, -0.06],
  knR: [0.4, 0, 0],
  spine: [0.12, 0, 0],
  chest: [0, -0.28, 0],
  head: [-0.05, 0.26, 0],
  shR: [-0.75, 0, -0.22],
  elR: [-0.95, 0, 0],
  shL: [-0.45, 0, 0.35],
  elL: [-1.15, 0, 0],
};

// a diagonal cut: coil (anticipation) → whip through → follow-through
const ATTACK: Array<[number, Pose]> = [
  [0, IDLE],
  [
    0.32,
    {
      hipsY: 0.85,
      fwd: -0.12,
      spine: [-0.08, 0, 0],
      chest: [0.0, 0.85, 0],
      head: [0, -0.4, 0],
      shR: [-2.75, 0, -0.55],
      elR: [-0.55, 0, 0],
      shL: [-0.2, 0, 0.55],
      elL: [-0.8, 0, 0],
      thL: [-0.25, 0, 0.06],
      knL: [0.6, 0, 0],
      thR: [0.4, 0, -0.06],
      knR: [0.55, 0, 0],
    },
  ],
  [
    0.42,
    {
      hipsY: 0.78,
      fwd: 0.75,
      spine: [0.32, 0, 0],
      chest: [0.2, -0.95, 0],
      head: [0.1, 0.5, 0],
      shR: [-0.35, 0, 0.75],
      elR: [-0.15, 0, 0],
      shL: [-0.7, 0, 0.2],
      elL: [-1.3, 0, 0],
      thL: [-0.95, 0, 0.06],
      knL: [0.95, 0, 0],
      thR: [0.6, 0, -0.06],
      knR: [0.2, 0, 0],
    },
  ],
  [
    0.62,
    {
      hipsY: 0.8,
      fwd: 0.8,
      spine: [0.28, 0, 0],
      chest: [0.25, -1.1, 0],
      head: [0.1, 0.55, 0],
      shR: [0.15, 0, 0.95],
      elR: [-0.35, 0, 0],
      shL: [-0.6, 0, 0.25],
      elL: [-1.2, 0, 0],
      thL: [-0.85, 0, 0.06],
      knL: [0.9, 0, 0],
      thR: [0.55, 0, -0.06],
      knR: [0.25, 0, 0],
    },
  ],
  [1, IDLE],
];

// tucked into a ball for the roll
const TUCK: Pose = {
  hipsY: 0.58,
  spine: [0.85, 0, 0],
  chest: [0.45, 0, 0],
  head: [0.65, 0, 0],
  shR: [-1.35, 0, -0.25],
  elR: [-1.5, 0, 0],
  shL: [-1.35, 0, 0.25],
  elL: [-1.5, 0, 0],
  thL: [-2.05, 0, 0.1],
  knL: [2.35, 0, 0],
  thR: [-1.95, 0, -0.1],
  knR: [2.35, 0, 0],
};
const CROUCH: Pose = { ...IDLE, hipsY: 0.72, spine: [0.45, 0, 0], thL: [-0.9, 0, 0.06], knL: [1.3, 0, 0], thR: [-0.4, 0, -0.06], knR: [1.2, 0, 0] };
const ROLL: Array<[number, Pose]> = [
  [0, IDLE],
  [0.12, CROUCH],
  [0.24, TUCK],
  [0.72, TUCK],
  [0.86, CROUCH],
  [1, IDLE],
];

const HURT: Pose = {
  ...IDLE,
  hipsY: 0.86,
  fwd: -0.45,
  spine: [-0.3, 0, 0],
  chest: [-0.3, 0.2, 0],
  head: [-0.45, 0, 0],
  shR: [-1.4, 0, -0.9],
  elR: [-0.4, 0, 0],
  shL: [-1.1, 0, 0.9],
  elL: [-0.5, 0, 0],
};
const STAGGER: Pose = { ...IDLE, fwd: -0.15, spine: [-0.15, 0, 0], shR: [-2.2, 0, -0.4], elR: [-0.3, 0, 0], head: [-0.2, 0.2, 0] };
const DEAD: Pose = { hipsY: 0.38, spine: [0.9, 0, 0], chest: [0.4, 0, 0], head: [0.5, 0, 0], thL: [-1.6, 0, 0.1], knL: [2.2, 0, 0], thR: [-1.4, 0, -0.1], knR: [2.1, 0, 0], shR: [-0.2, 0, -0.3], elR: [-0.2, 0, 0], shL: [-0.2, 0, 0.3], elL: [-0.2, 0, 0] };
const REACH: Pose = { ...IDLE, hipsY: 0.88, spine: [0.2, 0, 0], chest: [0.1, 0.1, 0], head: [-0.25, 0, 0], shR: [-2.0, 0, 0.15], elR: [-0.35, 0, 0], shL: [-1.6, 0, -0.1], elL: [-0.5, 0, 0], thL: [-0.5, 0, 0.06], knL: [0.6, 0, 0], thR: [0.35, 0, -0.06], knR: [0.4, 0, 0] };
const PULL: Pose = { ...REACH, hipsY: 0.82, spine: [-0.3, 0, 0], chest: [-0.25, 0.35, 0], head: [-0.1, -0.2, 0], shR: [-1.1, 0, -0.35], elR: [-1.3, 0, 0], shL: [-0.6, 0, 0.5], elL: [-0.9, 0, 0], thL: [-0.2, 0, 0.06], thR: [0.7, 0, -0.06], knR: [0.6, 0, 0] };

const smooth = (t: number) => t * t * (3 - 2 * t);
const a0 = (c: React.RefObject<{ awaken: number }>) => c.current.awaken;
const UPPER = 0.29; // shoulder → elbow
const LOWER = 0.3; // elbow → hand (where the sword sits)
const DOWN = new THREE.Vector3(0, -1, 0);
// held forward and up, not hanging: the blade rises out of the fist
const SWORD_TILT = 2.5;
const SWORD_REST = new THREE.Quaternion().setFromEuler(new THREE.Euler(SWORD_TILT, 0, 0));
const SWORD_AT = new THREE.Vector3(0, -0.3, 0);
const tmp = {
  S: new THREE.Vector3(),
  T: new THREE.Vector3(),
  E: new THREE.Vector3(),
  d: new THREE.Vector3(),
  pole: new THREE.Vector3(),
  q: new THREE.Quaternion(),
  qc: new THREE.Quaternion(),
  qs: new THREE.Quaternion(),
  qe: new THREE.Quaternion(),
  qi: new THREE.Quaternion(),
};
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const JOINTS: J[] = ['spine', 'chest', 'head', 'shL', 'elL', 'shR', 'elR', 'thL', 'knL', 'thR', 'knR'];

function mix(a: Pose, b: Pose, k: number): Pose {
  const out: Pose = { hipsY: (a.hipsY ?? 0.9) + ((b.hipsY ?? 0.9) - (a.hipsY ?? 0.9)) * k, fwd: (a.fwd ?? 0) + ((b.fwd ?? 0) - (a.fwd ?? 0)) * k };
  for (const j of JOINTS) {
    const x = a[j] ?? IDLE[j] ?? [0, 0, 0];
    const y = b[j] ?? IDLE[j] ?? [0, 0, 0];
    out[j] = [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k];
  }
  return out;
}
function at(keys: Array<[number, Pose]>, t: number): Pose {
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0] = keys[i];
    const [t1, p1] = keys[i + 1];
    if (t <= t1) return mix(p0, p1, smooth(clamp01((t - t0) / (t1 - t0))));
  }
  return keys[keys.length - 1][1];
}
function walk(t: number, amt: number): Pose {
  const s = Math.sin(t * 9) * 0.55 * amt;
  return {
    ...IDLE,
    hipsY: 0.92 + Math.abs(Math.cos(t * 9)) * 0.03 * amt,
    thL: [-0.1 - s, 0, 0.04],
    knL: [0.3 + Math.max(0, s) * 0.9, 0, 0],
    thR: [-0.1 + s, 0, -0.04],
    knR: [0.3 + Math.max(0, -s) * 0.9, 0, 0],
    chest: [0.05, 0, 0],
    head: [0, 0, 0],
    shR: [-0.15 + s * 0.4, 0, -0.15],
    elR: [-0.4, 0, 0],
    shL: [-0.15 - s * 0.4, 0, 0.15],
    elL: [-0.4, 0, 0],
  };
}

function cape() {
  const sh = new THREE.Shape();
  sh.moveTo(-0.17, 0);
  sh.lineTo(0.17, 0);
  sh.lineTo(0.24, -0.72);
  sh.lineTo(0.1, -0.64);
  sh.lineTo(0.02, -0.78);
  sh.lineTo(-0.1, -0.66);
  sh.lineTo(-0.24, -0.74);
  sh.closePath();
  return sh;
}

export default function Player({
  game,
  phase,
  cine,
}: {
  game: React.RefObject<Game>;
  phase: React.RefObject<Phase>;
  cine: React.RefObject<{ t: number; skip: boolean; awaken: number }>;
}) {
  const root = useRef<THREE.Group>(null);
  const tumble = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const j = useRef<Partial<Record<J, THREE.Group | null>>>({});
  const sword = useRef<THREE.Group>(null);
  const tipA = useRef<THREE.Object3D>(null);
  const tipB = useRef<THREE.Object3D>(null);
  const cloak = useRef<THREE.Group>(null); // the cape
  const cur = useRef<Pose>(mix(IDLE, IDLE, 0));
  const yaw = useRef(Math.PI);
  const m = useMemo(
    () => ({
      cloth: new THREE.MeshStandardMaterial({ color: '#efefeb', flatShading: true, roughness: 0.85 }),
      cloak: new THREE.MeshStandardMaterial({ color: '#cfcfca', flatShading: true, roughness: 0.9, side: THREE.DoubleSide }),
      dark: new THREE.MeshStandardMaterial({ color: '#1b1c1f', flatShading: true, roughness: 0.7 }),
      blade: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.35, flatShading: true, metalness: 0.6, roughness: 0.25 }),
    }),
    []
  );

  const set = (name: J) => (e: THREE.Group | null) => void (j.current[name] = e);

  useFrame(({ clock }, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const g = game.current;
    const p = g.p;
    const ph = phase.current;
    const t = clock.elapsedTime;
    const r = root.current;
    if (!r || !hips.current || !tumble.current) return;
    r.visible = ph !== 'cine';

    // where you stand: on the circle, facing the armor
    let dist = DIST;
    let target: Pose = IDLE;
    let rate = 14;
    let tumbleX = 0;
    let turn = 0;
    let swordOn = ph !== 'ready' && ph !== 'cine';
    // reaching for the hilt in the armor's chest: 0 = free arm, 1 = hand on it
    let grip = 0;
    let slide = 0; // how far the blade has come out of the chest

    if (ph === 'ready') {
      target = { ...IDLE, shR: [-0.1, 0, -0.1], elR: [-0.2, 0, 0], chest: [0, 0, 0], head: [0, 0, 0] }; // unarmed, waiting
    } else if (ph === 'awaken') {
      const a = cine.current.awaken;
      swordOn = a >= AW.grip;
      grip = smooth(clamp01((a - AW.walkEnd) / (AW.grip - AW.walkEnd))) * (1 - smooth(clamp01((a - AW.pull) / 0.3)));
      if (a < AW.walkEnd) {
        dist = DIST - (DIST - CLOSE) * ease(a / AW.walkEnd);
        target = walk(t, 1);
      } else if (a < AW.grip) {
        dist = CLOSE;
        target = mix(IDLE, REACH, smooth(clamp01((a - AW.walkEnd) / (AW.grip - AW.walkEnd))));
      } else if (a < AW.pull) {
        // strain first (it barely moves), then the yank
        const k = clamp01((a - AW.grip) / (AW.pull - AW.grip));
        slide = k < 0.6 ? 0.1 * smooth(k / 0.6) : 0.1 + 1.0 * Math.pow((k - 0.6) / 0.4, 2);
        dist = CLOSE + slide * 0.85;
        target = mix(REACH, PULL, ease(k));
        rate = 24;
      } else if (a < AW.backEnd) {
        // a hop back, sword in hand
        const k = clamp01((a - AW.pull) / (AW.backEnd - AW.pull));
        slide = 1.1 + k * 0.6;
        const from = CLOSE + 1.1 * 0.85;
        dist = from + (DIST - from) * ease(k);
        target = mix(PULL, IDLE, smooth(k));
      } else target = IDLE;
    } else if (p.hp <= 0) {
      target = DEAD;
      rate = 6;
    } else if (p.roll > 0) {
      const k = 1 - p.roll / ROLL_T;
      target = at(ROLL, k);
      rate = 30;
      // turn toward the way you're rolling, tumble forward once
      const sideBlend = smooth(clamp01(k / 0.14)) * (1 - smooth(clamp01((k - 0.84) / 0.16)));
      turn = sideBlend * (p.rollTo > p.rollFrom ? -1 : 1) * (Math.PI / 2);
      tumbleX = -Math.PI * 2 * ease(clamp01((k - 0.14) / 0.66));
    } else if (p.atk > 0) {
      const k = 1 - p.atk / ATK_T;
      target = at(ATTACK, k);
      rate = k > 0.3 && k < 0.66 ? 55 : 20;
    } else if (p.hurt > 0) {
      target = mix(IDLE, HURT, Math.sin(clamp01(p.hurt / 0.9) * Math.PI * 0.5));
      rate = 22;
    } else if (p.stagger > 0) {
      target = mix(IDLE, STAGGER, Math.sin(clamp01(p.stagger / 0.7) * Math.PI));
      rate = 22;
    } else {
      // guard: breathing, a slow weight shift
      const br = Math.sin(t * 2.2);
      target = { ...IDLE, hipsY: 0.9 + br * 0.012, chest: [br * 0.02, -0.28 + Math.sin(t * 0.7) * 0.05, 0] };
    }

    // ease every joint toward the pose
    const c = cur.current;
    const kd = 1 - Math.exp(-dt * rate);
    c.hipsY = (c.hipsY ?? 0.9) + ((target.hipsY ?? 0.9) - (c.hipsY ?? 0.9)) * kd;
    c.fwd = (c.fwd ?? 0) + ((target.fwd ?? 0) - (c.fwd ?? 0)) * kd;
    for (const name of JOINTS) {
      const a = c[name]!;
      const b = target[name] ?? IDLE[name] ?? [0, 0, 0];
      a[0] += (b[0] - a[0]) * kd;
      a[1] += (b[1] - a[1]) * kd;
      a[2] += (b[2] - a[2]) * kd;
      j.current[name]?.rotation.set(a[0], a[1], a[2]);
    }

    const ang = p.ang;
    const d = dist - (c.fwd ?? 0);
    r.position.set(Math.sin(ang) * d, 0, Math.cos(ang) * d);
    const face = ang + Math.PI + turn;
    yaw.current += Math.atan2(Math.sin(face - yaw.current), Math.cos(face - yaw.current)) * (1 - Math.exp(-dt * 22));
    r.rotation.y = yaw.current;
    hips.current.position.y = c.hipsY ?? 0.9;
    tumble.current.rotation.x = tumbleX;
    if (ph === 'awaken' && a0(cine) >= AW.pull && a0(cine) < AW.backEnd) {
      const k = clamp01((a0(cine) - AW.pull) / (AW.backEnd - AW.pull));
      hips.current.position.y += Math.sin(k * Math.PI) * 0.2;
    }
    const sw = sword.current;
    if (sw) {
      sw.visible = swordOn;
      sw.position.copy(SWORD_AT);
      sw.quaternion.copy(SWORD_REST);
    }
    // the hand meets the hilt: a two-bone reach for the right arm, and the
    // blade takes the exact place of the one in the armor's chest
    const shR = j.current.shR;
    const elR = j.current.elR;
    if (grip > 0.001 && sw && shR && elR && shR.parent) {
      const { S, T, E, d, pole, q, qc, qs, qe, qi } = tmp;
      r.updateMatrixWorld(true);
      shR.getWorldPosition(S);
      T.copy(hilt.pos).addScaledVector(hilt.axis, -slide);
      d.subVectors(T, S);
      const len = Math.min(Math.max(d.length(), 0.05), UPPER + LOWER - 0.002);
      d.normalize();
      // the elbow bends down and out
      pole.set(Math.cos(r.rotation.y), -1.2, -Math.sin(r.rotation.y));
      pole.addScaledVector(d, -pole.dot(d)).normalize();
      const cosA = (UPPER * UPPER + len * len - LOWER * LOWER) / (2 * UPPER * len);
      const A = Math.acos(Math.min(1, Math.max(-1, cosA)));
      E.copy(S).addScaledVector(d, Math.cos(A) * UPPER).addScaledVector(pole, Math.sin(A) * UPPER);
      shR.parent.getWorldQuaternion(qc);
      // shoulder
      q.setFromUnitVectors(DOWN, E.clone().sub(S).normalize().applyQuaternion(qi.copy(qc).invert()));
      shR.quaternion.slerp(q, grip);
      qs.copy(qc).multiply(shR.quaternion);
      // elbow, from where the elbow really is now
      E.set(0, -UPPER, 0).applyQuaternion(qs).add(S);
      q.setFromUnitVectors(DOWN, T.clone().sub(E).normalize().applyQuaternion(qi.copy(qs).invert()));
      elR.quaternion.slerp(q, grip);
      qe.copy(qs).multiply(elR.quaternion);
      // the sword: same place and angle as the one it replaces
      qi.copy(qe).invert();
      sw.position.lerp(T.clone().sub(E).applyQuaternion(qi), grip);
      sw.quaternion.slerp(qi.multiply(hilt.quat), grip);
    }
    if (cloak.current) cloak.current.rotation.x = 0.12 + Math.sin(t * 1.7) * 0.05 + (p.roll > 0 ? 0.5 : 0) + (p.atk > 0 ? 0.25 : 0);
    // blink while you can't be hurt after a hit
    r.visible = r.visible && (p.hurt <= 0 || p.hp <= 0 || Math.floor(t * 18) % 2 === 0);
  });

  return (
    <>
      <group ref={root}>
        {/* the roll tumbles round this pivot, at the height of a tucked body */}
        <group ref={tumble} position={[0, 0.58, 0]}>
          <group position={[0, -0.58, 0]}>
            <group ref={hips} position={[0, 0.9, 0]}>
              <mesh castShadow material={m.dark}>
                <cylinderGeometry args={[0.17, 0.2, 0.14, 6]} />
              </mesh>
              {/* legs */}
              {(['L', 'R'] as const).map((s) => (
                <group key={s} ref={set(`th${s}` as J)} position={[s === 'L' ? -0.1 : 0.1, -0.04, 0]}>
                  <mesh position={[0, -0.22, 0]} castShadow material={m.cloth}>
                    <cylinderGeometry args={[0.075, 0.06, 0.44, 5]} />
                  </mesh>
                  <group ref={set(`kn${s}` as J)} position={[0, -0.44, 0]}>
                    <mesh position={[0, -0.2, 0]} castShadow material={m.dark}>
                      <cylinderGeometry args={[0.06, 0.055, 0.42, 5]} />
                    </mesh>
                    <mesh position={[0, -0.42, 0.05]} castShadow material={m.dark}>
                      <boxGeometry args={[0.1, 0.07, 0.2]} />
                    </mesh>
                  </group>
                </group>
              ))}
              {/* body */}
              <group ref={set('spine')} position={[0, 0.06, 0]}>
                <group ref={set('chest')} position={[0, 0.2, 0]}>
                  <mesh position={[0, 0.12, 0]} castShadow material={m.cloth}>
                    <cylinderGeometry args={[0.2, 0.15, 0.48, 6]} />
                  </mesh>
                  <mesh position={[0, -0.08, 0]} castShadow material={m.dark}>
                    <cylinderGeometry args={[0.16, 0.16, 0.06, 6]} />
                  </mesh>
                  {/* a short cape from the shoulders, ragged at the hem */}
                  <group ref={cloak} position={[0, 0.34, -0.17]}>
                    <mesh position={[0, 0, 0]} castShadow material={m.cloak}>
                      <shapeGeometry args={[cape()]} />
                    </mesh>
                  </group>
                  {/* head in a hood */}
                  <group ref={set('head')} position={[0, 0.46, 0]}>
                    <mesh castShadow material={m.cloth}>
                      <icosahedronGeometry args={[0.13, 0]} />
                    </mesh>
                    {/* hood: a shell over the head, its tip falling back */}
                    <mesh position={[0, 0.02, -0.02]} scale={[1.12, 1.1, 1.15]} castShadow material={m.cloak}>
                      <icosahedronGeometry args={[0.15, 0]} />
                    </mesh>
                    <mesh position={[0, 0.06, -0.14]} rotation={[-1.1, 0, 0]} castShadow material={m.cloak}>
                      <coneGeometry args={[0.09, 0.2, 5]} />
                    </mesh>
                    <mesh position={[0, -0.01, 0.1]} material={m.dark}>
                      <boxGeometry args={[0.15, 0.08, 0.04]} />
                    </mesh>
                  </group>
                  {/* left arm, with a small round shield */}
                  <group ref={set('shL')} position={[-0.25, 0.3, 0]}>
                    <mesh position={[0, -0.14, 0]} castShadow material={m.cloth}>
                      <cylinderGeometry args={[0.055, 0.05, 0.3, 5]} />
                    </mesh>
                    <group ref={set('elL')} position={[0, -0.29, 0]}>
                      <mesh position={[0, -0.13, 0]} castShadow material={m.dark}>
                        <cylinderGeometry args={[0.048, 0.04, 0.27, 5]} />
                      </mesh>
                      <mesh position={[-0.06, -0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={m.cloth}>
                        <cylinderGeometry args={[0.2, 0.2, 0.04, 8]} />
                      </mesh>
                    </group>
                  </group>
                  {/* right arm, with the sword (pulled from the armor) */}
                  <group ref={set('shR')} position={[0.25, 0.3, 0]}>
                    <mesh position={[0, -0.14, 0]} castShadow material={m.cloth}>
                      <cylinderGeometry args={[0.055, 0.05, 0.3, 5]} />
                    </mesh>
                    <group ref={set('elR')} position={[0, -0.29, 0]}>
                      <mesh position={[0, -0.13, 0]} castShadow material={m.dark}>
                        <cylinderGeometry args={[0.048, 0.04, 0.27, 5]} />
                      </mesh>
                      <group ref={sword} position={[0, -0.3, 0]} rotation={[SWORD_TILT, 0, 0]}>
                        <mesh position={[0, 0.0, 0]} castShadow material={m.dark}>
                          <boxGeometry args={[0.24, 0.04, 0.05]} />
                        </mesh>
                        <mesh position={[0, -0.1, 0]} material={m.dark}>
                          <cylinderGeometry args={[0.025, 0.025, 0.16, 5]} />
                        </mesh>
                        <mesh position={[0, 0.55, 0]} castShadow material={m.blade}>
                          <boxGeometry args={[0.07, 1.05, 0.02]} />
                        </mesh>
                        <object3D ref={tipA} position={[0, 0.15, 0]} />
                        <object3D ref={tipB} position={[0, 1.08, 0]} />
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
      <Trail base={tipA} tip={tipB} active={() => game.current.p.atk > 0 && 1 - game.current.p.atk / ATK_T > 0.28 && 1 - game.current.p.atk / ATK_T < 0.7} />
    </>
  );
}
