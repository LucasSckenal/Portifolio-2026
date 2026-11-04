'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  InstancedMesh,
  Object3D,
  DoubleSide,
  SRGBColorSpace,
  Color,
} from 'three';

// ── FallingPetals — pétals shed from the tree canopy, falling onto water ──
// Each petal has its own physics state (position, fall velocity, rotation,
// sway phase). When it reaches the water surface (y < 0.05), it transitions
// to "floating" — keeps drifting horizontally but stops falling.
// Eventually, after a long enough float lifetime, it respawns at the canopy.
//
// This is the "magic" of the Niwa concept — leaves visibly come from
// somewhere (the tree) and accumulate on the water organically. Not
// random sprites floating in midair.

const PETAL_COUNT = 90;
const CANOPY_SPAWN_Y = 3.0;
const CANOPY_SPAWN_RADIUS = 1.7;
const WATER_Y = 0.02; // settle slightly above the water surface
const FALL_SPEED = 0.35;
const FLOAT_LIFETIME = 18; // seconds petal stays on water before respawning

type PetalState = {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number; // velocity
  rotX: number; rotY: number; rotZ: number;
  rotVx: number; rotVy: number; rotVz: number; // rotation velocity
  scale: number;
  phase: number;
  state: 'falling' | 'floating';
  floatAge: number;
  colorMix: number;
};

function makePetal(): PetalState {
  // Spawn around canopy area
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * CANOPY_SPAWN_RADIUS;
  return {
    x: Math.cos(angle) * r,
    y: CANOPY_SPAWN_Y - Math.random() * 1.0,
    z: Math.sin(angle) * r,
    vx: (Math.random() - 0.5) * 0.05,
    vy: -FALL_SPEED * (0.7 + Math.random() * 0.6),
    vz: (Math.random() - 0.5) * 0.05,
    rotX: Math.random() * Math.PI,
    rotY: Math.random() * Math.PI,
    rotZ: Math.random() * Math.PI,
    rotVx: (Math.random() - 0.5) * 1.5,
    rotVy: (Math.random() - 0.5) * 1.5,
    rotVz: (Math.random() - 0.5) * 1.5,
    scale: 0.12 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
    state: 'falling',
    floatAge: 0,
    colorMix: Math.random(),
  };
}

export default function FallingPetals() {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const tmpColor = useMemo(() => new Color(), []);

  const leafTexture = useTexture('/lab/niwa/leaf.png');
  leafTexture.colorSpace = SRGBColorSpace;

  // Stagger initial petal states so they don't all fall at once
  const petals = useRef<PetalState[]>(
    Array.from({ length: PETAL_COUNT }, () => {
      const p = makePetal();
      // Distribute initial y across the full fall range for staggered start
      p.y = Math.random() * 3.0;
      if (p.y < WATER_Y) {
        p.state = 'floating';
        p.y = WATER_Y;
        p.vy = 0;
        p.floatAge = Math.random() * FLOAT_LIFETIME;
      }
      return p;
    })
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.05); // clamp to avoid huge jumps on tab refocus

    petals.current.forEach((p, i) => {
      if (p.state === 'falling') {
        // Apply velocity + slight horizontal sway (wind)
        const sway = Math.sin(performance.now() * 0.001 * 1.5 + p.phase) * 0.08;
        p.x += (p.vx + sway * dt) * dt * 60;
        p.y += p.vy * dt;
        p.z += p.vz * dt * 60;

        // Tumble rotation
        p.rotX += p.rotVx * dt;
        p.rotY += p.rotVy * dt;
        p.rotZ += p.rotVz * dt;

        // Hit water → transition to floating
        if (p.y <= WATER_Y) {
          p.y = WATER_Y;
          p.vy = 0;
          p.state = 'floating';
          p.floatAge = 0;
        }
      } else {
        // Floating — gentle drift + slow rotation, no fall
        const driftAngle = p.phase + performance.now() * 0.0002;
        p.x += Math.cos(driftAngle) * 0.04 * dt;
        p.z += Math.sin(driftAngle) * 0.04 * dt;
        p.rotZ += p.rotVz * dt * 0.2;

        p.floatAge += dt;
        // Respawn after lifetime — back to canopy
        if (p.floatAge > FLOAT_LIFETIME) {
          Object.assign(p, makePetal());
        }
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Color: pinks matching canopy
      tmpColor.set('#FFC0CB').lerp(new Color('#FF7090'), p.colorMix);
      meshRef.current!.setColorAt(i, tmpColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PETAL_COUNT]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshStandardMaterial
        map={leafTexture}
        transparent
        alphaTest={0.4}
        side={DoubleSide}
        roughness={0.7}
      />
    </instancedMesh>
  );
}
