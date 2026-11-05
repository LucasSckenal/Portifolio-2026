'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { windup, type Game, type Phase } from './game';

// The Empty Armor, low poly. A nod to a certain first boss, in its own form:
// it waits on its knees with a sword through its chest, wakes when that
// sword is pulled, swings a halberd, and at half strength the emptiness
// inside spills out as black tendrils.

const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.45, metalness: 0.45, ...extra });
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export default function Armor({
  game,
  phase,
  cine,
  awakenT,
}: {
  game: React.RefObject<Game>;
  phase: React.RefObject<Phase>;
  cine: React.RefObject<{ t: number; skip: boolean; awaken: number }>;
  awakenT: number;
}) {
  const root = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const thighL = useRef<THREE.Group>(null);
  const thighR = useRef<THREE.Group>(null);
  const shinL = useRef<THREE.Group>(null);
  const shinR = useRef<THREE.Group>(null);
  const impaled = useRef<THREE.Group>(null);
  const tendrils = useRef<THREE.Group>(null);
  const k = useRef({ kneel: 1, rage: 0, ax: -0.4, ay: 0, lean: 0 });

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

  // tendrils: fixed seeds so they look grown, not random each frame
  const seeds = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        ry: (i / 9) * Math.PI * 2,
        tilt: 0.5 + ((i * 37) % 10) / 22,
        len: 2.2 + ((i * 53) % 10) / 5,
        ph: i * 1.7,
      })),
    []
  );

  useFrame(({ clock }, dt) => {
    const g = game.current;
    const b = g.b;
    const ph = phase.current;
    const s = k.current;
    if (!root.current || !torso.current || !arm.current || !hips.current) return;
    const time = clock.elapsedTime;

    // ── kneeling ↔ standing ──
    let kneel = 0;
    if (ph === 'cine' || ph === 'ready') kneel = 1;
    else if (ph === 'awaken') kneel = 1 - ease(Math.min(1, Math.max(0, (cine.current.awaken - 0.5) / (awakenT - 0.7))));
    else if (b.state === 'down') kneel = Math.min(1, b.st / 1.4);
    s.kneel = kneel;
    // the sword through its chest: there until you pull it
    if (impaled.current) impaled.current.visible = ph === 'cine' || ph === 'ready' || (ph === 'awaken' && cine.current.awaken < 0.35);

    hips.current.position.y = lerp(1.9, 1.05, kneel);
    torso.current.rotation.x = lerp(0, 0.42, kneel) + (b.state === 'roar' ? -0.35 + Math.sin(time * 30) * 0.03 : 0);
    if (thighL.current && thighR.current && shinL.current && shinR.current) {
      // one knee down, one foot planted
      thighL.current.rotation.x = lerp(0, -1.45, kneel);
      shinL.current.rotation.x = lerp(0, 1.5, kneel);
      thighR.current.rotation.x = lerp(0, 0.4, kneel);
      shinR.current.rotation.x = lerp(0, 1.55, kneel);
    }
    // breathing, and the awakening shudder
    root.current.position.y = Math.sin(time * 1.6) * 0.02 * (1 - kneel);
    if (ph === 'awaken' && cine.current.awaken < 0.6) root.current.position.x = (Math.random() - 0.5) * 0.06;
    else root.current.position.x = 0;

    // ── the halberd arm ──
    const w = windup(g);
    let ax = -0.4;
    let ay = 0;
    if (kneel > 0.5) {
      ax = -0.15; // resting on the planted halberd
    } else if (b.state === 'wind' || b.state === 'hold') {
      if (b.blow === 'slam') ax = -0.4 - w * 2.75 + (b.state === 'hold' ? Math.sin(time * 40) * 0.03 : 0);
      else ((ax = -1.45), (ay = w * 1.7));
    } else if (b.state === 'strike' || b.state === 'open') {
      // the blow lands, and the blade stays down: the opening
      if (b.blow === 'slam') ax = -1.35;
      else ((ax = -1.45), (ay = -1.5));
    } else if (b.state === 'roar') {
      ax = -2.6;
    }
    // windups ease in slow and heavy; the blow itself snaps
    const rate = b.state === 'strike' ? 42 : b.state === 'wind' ? 6 : 7;
    const kd = 1 - Math.exp(-dt * rate);
    s.ax += (ax - s.ax) * kd;
    s.ay += (ay - s.ay) * kd;
    arm.current.rotation.set(s.ax, s.ay, 0);
    // the body follows the weapon: coils back in the windup, lunges into
    // the blow, and rocks back when you land a hit
    let lean = 0;
    if (kneel < 0.5) {
      if (b.state === 'wind' || b.state === 'hold') lean = -0.12 * w;
      else if (b.state === 'strike' || b.state === 'open') lean = b.blow === 'slam' ? 0.28 : 0.14;
      lean -= b.flash * 0.18;
      torso.current.rotation.y = b.state === 'wind' && b.blow === 'sweep' ? w * 0.35 : b.state === 'open' && b.blow === 'sweep' ? -0.3 : 0;
    }
    s.lean += (lean - s.lean) * (1 - Math.exp(-dt * (b.state === 'strike' ? 30 : 8)));
    torso.current.rotation.x += s.lean;

    // ── materials: hit flash, the eye waking ──
    m.steel.emissive.set('#ffffff');
    m.steel.emissiveIntensity = b.flash * 0.7;
    m.plate.emissive.set('#ffffff');
    m.plate.emissiveIntensity = b.flash * 0.5 + (b.blocked > 0 ? b.blocked * 0.25 : 0);
    const eyeOn = ph === 'cine' || ph === 'ready' ? 0.25 : ph === 'awaken' ? Math.min(1, cine.current.awaken / 1.2) : 1;
    m.eye.color.setScalar(0.2 + eyeOn * 0.8 * (b.state === 'down' ? Math.max(0, 1 - b.st) : 1));

    // ── phase two: the emptiness spills out ──
    s.rage += ((b.raged && b.state !== 'down' ? 1 : 0) - s.rage) * Math.min(1, dt * (b.state === 'roar' ? 1.6 : 3));
    const tg = tendrils.current;
    if (tg) {
      tg.visible = s.rage > 0.02;
      tg.children.forEach((c, i) => {
        const sd = seeds[i];
        c.rotation.set(sd.tilt + Math.sin(time * 2.2 + sd.ph) * 0.25, sd.ry + Math.sin(time * 1.3 + sd.ph) * 0.2, 0);
        c.scale.set(1, s.rage * sd.len * (1 + Math.sin(time * 3 + sd.ph) * 0.08), 1);
      });
    }
  });

  return (
    <group ref={root}>
      <group ref={hips} position={[0, 1.9, 0]}>
        {/* legs: thigh and shin on joints, so it can kneel */}
        <group ref={thighL} position={[-0.3, 0, 0]}>
          <mesh position={[0, -0.45, 0]} castShadow material={m.plate}>
            <boxGeometry args={[0.34, 0.9, 0.4]} />
          </mesh>
          <group ref={shinL} position={[0, -0.9, 0]}>
            <mesh position={[0, -0.45, 0]} castShadow material={m.steel}>
              <boxGeometry args={[0.3, 0.9, 0.36]} />
            </mesh>
            <mesh position={[0, -0.92, 0.1]} castShadow material={m.dark}>
              <boxGeometry args={[0.32, 0.14, 0.56]} />
            </mesh>
          </group>
        </group>
        <group ref={thighR} position={[0.3, 0, 0]}>
          <mesh position={[0, -0.45, 0]} castShadow material={m.plate}>
            <boxGeometry args={[0.34, 0.9, 0.4]} />
          </mesh>
          <group ref={shinR} position={[0, -0.9, 0]}>
            <mesh position={[0, -0.45, 0]} castShadow material={m.steel}>
              <boxGeometry args={[0.3, 0.9, 0.36]} />
            </mesh>
            <mesh position={[0, -0.92, 0.1]} castShadow material={m.dark}>
              <boxGeometry args={[0.32, 0.14, 0.56]} />
            </mesh>
          </group>
        </group>

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
          {/* pauldrons, layered */}
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
          <group position={[0, 1.66, 0.02]}>
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

          {/* the sword through its chest */}
          <group ref={impaled} position={[0.05, 0.85, 0]} rotation={[0.9, 0.2, 0.35]}>
            <mesh position={[0, 0.2, 0]} material={m.blade}>
              <boxGeometry args={[0.1, 2.1, 0.03]} />
            </mesh>
            <mesh position={[0, 1.3, 0]} material={m.dark}>
              <boxGeometry args={[0.42, 0.07, 0.08]} />
            </mesh>
            <mesh position={[0, 1.55, 0]} material={m.dark}>
              <cylinderGeometry args={[0.035, 0.035, 0.45, 5]} />
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
              {/* axe head and spike at the far end */}
              <mesh position={[0.26, 2.45, 0]} castShadow material={m.blade}>
                <boxGeometry args={[0.5, 0.62, 0.04]} />
              </mesh>
              <mesh position={[-0.16, 2.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={m.blade}>
                <coneGeometry args={[0.08, 0.32, 4]} />
              </mesh>
              <mesh position={[0, 2.95, 0]} castShadow material={m.blade}>
                <coneGeometry args={[0.07, 0.55, 4]} />
              </mesh>
            </group>
          </group>

          {/* phase two: what's inside */}
          <group ref={tendrils} position={[0, 1.2, -0.15]} visible={false}>
            {seeds.map((_, i) => (
              <mesh key={i} castShadow material={m.void}>
                <coneGeometry args={[0.22, 1, 4]} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
