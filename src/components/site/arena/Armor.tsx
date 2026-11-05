'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STRIKE_T, windup, type Game, type Phase } from './game';
import { AW } from './timeline';
import Trail from './Trail';

// The Empty Armor, low poly. A nod to a certain first boss, in its own form:
// it waits on its knees with a sword through its chest and wakes when you
// pull it out. First form: halberd work (overhead slam, sweeps both ways, a
// thrust, a three-blow string). At half strength it breaks open: a black
// mass bursts from its back and shoulders, tendrils lash, it leaps.

const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.45, metalness: 0.45, ...extra });
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const damp = (cur: number, to: number, rate: number, dt: number) => cur + (to - cur) * (1 - Math.exp(-dt * rate));

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
  const arm = useRef<THREE.Group>(null);
  const thighL = useRef<THREE.Group>(null);
  const thighR = useRef<THREE.Group>(null);
  const shinL = useRef<THREE.Group>(null);
  const shinR = useRef<THREE.Group>(null);
  const impaled = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const mass = useRef<THREE.Group>(null);
  const bladeA = useRef<THREE.Object3D>(null);
  const bladeB = useRef<THREE.Object3D>(null);
  // eased state: arm angles, arm reach, step, lean, twist, height, form
  const s = useRef({ ax: -0.15, ay: 0, az: 0, reach: 0, stepZ: 0, lean: 0, twist: 0, lift: 0, crouch: 0, form: 0, lash: 0, face: 0 });

  const m = useMemo(
    () => ({
      steel: flat('#8d9097'),
      plate: flat('#55575e'),
      dark: flat('#1c1d21', { metalness: 0.2, roughness: 0.7 }),
      cloth: flat('#2a2b2f', { metalness: 0, roughness: 0.9, side: THREE.DoubleSide }),
      void: new THREE.MeshStandardMaterial({ color: '#050506', flatShading: true, roughness: 1, metalness: 0 }),
      eye: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      blade: flat('#d9dadc', { metalness: 0.7, roughness: 0.25 }),
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
    if (impaled.current) impaled.current.visible = ph === 'cine' || ph === 'ready' || (ph === 'awaken' && a < AW.pull);
    const shudder = ph === 'awaken' && a > AW.pull && a < AW.rise + 0.3 ? 1 : 0;

    // ── the blow being thrown ──
    const w = windup(g);
    const live = kneel < 0.5 && b.state !== 'down';
    const winding = live && (b.state === 'wind' || b.state === 'hold');
    const striking = live && (b.state === 'strike' || b.state === 'open');
    const k = striking ? clamp01(b.state === 'strike' ? b.st / STRIKE_T : 1) : 0;
    let ax = -0.4, ay = 0, az = 0, reach = 0, stepZ = 0, lean = 0, twist = 0, lift = 0, crouch = 0, lash = 0;
    if (!live) {
      ax = kneel > 0.5 ? -0.15 : -0.4;
    } else if (b.state === 'roar') {
      ax = -2.7;
      lean = -0.35;
    } else if (winding || striking) {
      const wk = easeIn(w); // windups start slow and heavy
      switch (b.blow) {
        case 'slam':
          if (winding) ((ax = -0.4 - wk * 2.65), (lean = -0.22 * wk), (crouch = 0.12 * wk));
          else ((ax = -1.35), (lean = 0.32), (stepZ = 0.55), (crouch = 0.2));
          break;
        case 'sweepR':
          if (winding) ((ax = -1.45), (ay = wk * 1.75), (twist = 0.45 * wk));
          else ((ax = -1.45), (ay = -1.55), (twist = -0.5), (stepZ = 0.35), (lean = 0.12));
          break;
        case 'sweepL':
          if (winding) ((ax = -1.45), (ay = -1.55 + 0 * wk), (twist = -0.45 * wk), (az = 0.2 * wk));
          else ((ax = -1.45), (ay = 1.75), (twist = 0.5), (stepZ = 0.35), (lean = 0.12));
          break;
        case 'thrust':
          if (winding) ((ax = -1.5), (reach = -0.4 * wk), (twist = 0.35 * wk), (stepZ = -0.3 * wk), (crouch = 0.15 * wk));
          else ((ax = -1.55), (reach = 0.6), (twist = -0.15), (stepZ = 1.1), (lean = 0.25));
          break;
        case 'leap': {
          if (winding) {
            // crouch, then spring up and hang
            const up = clamp01((w - 0.45) / 0.55);
            crouch = up > 0 ? 0 : 0.45 * (w / 0.45);
            lift = b.state === 'hold' ? 3.2 : Math.sin(up * Math.PI * 0.5) * 3.2;
            ax = -0.4 - w * 2.6;
            lean = -0.2;
          } else {
            lift = b.state === 'strike' ? 3.2 * (1 - clamp01(b.st / 0.08)) : 0;
            ((ax = -1.35), (lean = 0.4), (crouch = 0.35));
          }
          break;
        }
        case 'lash':
          lash = winding ? -wk : 1;
          ax = -0.6;
          twist = winding ? 0.25 * wk : -0.2;
          break;
      }
      void k;
    }
    // windups ease in; the blow itself snaps
    const rate = b.state === 'strike' ? 40 : winding ? 9 : 6;
    st.ax = damp(st.ax, ax, rate, dt);
    st.ay = damp(st.ay, ay, rate, dt);
    st.az = damp(st.az, az, rate, dt);
    st.reach = damp(st.reach, reach, rate, dt);
    st.stepZ = damp(st.stepZ, stepZ, b.state === 'strike' ? 30 : 5, dt);
    st.lean = damp(st.lean, lean - b.flash * 0.18, b.state === 'strike' ? 30 : 8, dt);
    st.twist = damp(st.twist, twist, rate, dt);
    st.lift = b.blow === 'leap' && b.state === 'strike' ? lift : damp(st.lift, lift, 10, dt);
    st.crouch = damp(st.crouch, crouch, 14, dt);
    st.lash = damp(st.lash, lash, b.state === 'strike' ? 45 : 8, dt);

    // facing: it turns to you
    st.face += Math.atan2(Math.sin(b.face - st.face), Math.cos(b.face - st.face)) * (1 - Math.exp(-dt * 12));
    root.current.rotation.y = st.face;
    root.current.position.set(
      Math.sin(st.face) * st.stepZ + (shudder ? (Math.random() - 0.5) * 0.06 : 0),
      st.lift + Math.sin(time * 1.6) * 0.02 * (1 - kneel),
      Math.cos(st.face) * st.stepZ
    );

    hips.current.position.y = lerp(1.9, 1.05, kneel) - st.crouch;
    torso.current.rotation.set(lerp(0, 0.42, kneel) + st.lean + (b.state === 'roar' ? Math.sin(time * 30) * 0.03 : 0), st.twist, 0);
    if (thighL.current && thighR.current && shinL.current && shinR.current) {
      // one knee down, one foot planted; bends with the crouch
      const c = st.crouch * 1.4;
      thighL.current.rotation.x = lerp(-c, -1.45, kneel);
      shinL.current.rotation.x = lerp(c * 1.6, 1.5, kneel);
      thighR.current.rotation.x = lerp(-c * 0.6 + st.stepZ * 0.2, 0.4, kneel);
      shinR.current.rotation.x = lerp(c * 1.2, 1.55, kneel);
    }
    arm.current.rotation.set(st.ax, st.ay, st.az);
    arm.current.position.z = 0.05 + st.reach;

    // ── materials ──
    m.steel.emissive.set('#ffffff');
    m.steel.emissiveIntensity = b.flash * 0.7;
    m.plate.emissive.set('#ffffff');
    m.plate.emissiveIntensity = b.flash * 0.5 + b.blocked * 0.25;
    const eyeOn = ph === 'cine' || ph === 'ready' ? 0.15 : ph === 'awaken' ? clamp01((a - AW.pull) / 1.0) : 1;
    m.eye.color.setScalar(0.15 + eyeOn * 0.85 * (b.state === 'down' ? Math.max(0, 1 - b.st) : 1));

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
              <mesh position={[0, 0.04, 0.29]} material={m.eye}>
                <boxGeometry args={[0.34, 0.045, 0.04]} />
              </mesh>
            </group>
            {/* tattered cloak */}
            <mesh position={[0, 0.25, -0.62]} rotation={[0.16, 0, 0]} castShadow material={m.cloth}>
              <planeGeometry args={[1.5, 2.3, 2, 4]} />
            </mesh>
            {/* the other arm, hanging */}
            <mesh position={[-0.92, 0.55, 0.1]} rotation={[0.2, 0, 0.08]} castShadow material={m.dark}>
              <boxGeometry args={[0.24, 0.95, 0.26]} />
            </mesh>

            {/* the sword through its chest, hilt toward whoever comes */}
            <group ref={impaled} position={[0.05, 0.8, 0.1]} rotation={[1.05, 0.15, 0.25]}>
              <mesh position={[0, 0.0, 0]} material={m.blade}>
                <boxGeometry args={[0.1, 2.1, 0.03]} />
              </mesh>
              <mesh position={[0, 1.1, 0]} material={m.dark}>
                <boxGeometry args={[0.42, 0.07, 0.08]} />
              </mesh>
              <mesh position={[0, 1.33, 0]} material={m.dark}>
                <cylinderGeometry args={[0.035, 0.035, 0.4, 5]} />
              </mesh>
            </group>

            {/* the halberd, from the shoulder */}
            <group ref={arm} position={[0.9, 1.0, 0.05]}>
              <mesh position={[0, -0.42, 0]} castShadow material={m.dark}>
                <boxGeometry args={[0.24, 0.9, 0.26]} />
              </mesh>
              <group position={[0, -0.88, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
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
        active={() => {
          const b = game.current.b;
          return b.state === 'strike' && b.blow !== 'lash';
        }}
      />
    </>
  );
}
