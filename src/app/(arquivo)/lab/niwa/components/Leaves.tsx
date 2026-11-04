'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { InstancedMesh, Object3D, DoubleSide, SRGBColorSpace } from 'three';

// ── Leaves — drifting momiji leaves on the pond surface ──────
// Placeholder: small thin quads (planes) representing leaves, instanced
// for performance. Each instance has a unique drift pattern and rotation.
//
// When polished: load a momiji shape (PNG with alpha) or a custom
// procedural maple-leaf shape via SVG → geometry. Add wind variation via
// per-instance phase, slight bobbing on water surface, leaves drifting
// in/out of the pond bounds with looping respawn.
//
// Current setup: 24 leaves, simple planes with warm red-orange color,
// each drifting in a slow circular path with rotation.

const LEAF_COUNT = 24;
const POND_RADIUS = 5; // leaves drift within this radius

type LeafState = {
  cx: number;       // center of orbit
  cz: number;
  radius: number;   // orbit radius
  speed: number;    // orbital angular speed
  phase: number;    // starting phase
  rotationSpeed: number;
  yOffset: number;  // slight vertical jitter
};

export default function Leaves() {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  // Real momiji texture — PNG with alpha. alphaTest discards transparent
  // pixels so the leaf reads as a real shape, not a square. sRGB so the
  // warm reds don't appear muddy after color conversion.
  const leafTexture = useTexture('/lab/niwa/leaf.png');
  leafTexture.colorSpace = SRGBColorSpace;

  // Per-leaf state, deterministic random for stable layout
  const leaves = useMemo<LeafState[]>(() => {
    const arr: LeafState[] = [];
    for (let i = 0; i < LEAF_COUNT; i++) {
      const angleStart = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * POND_RADIUS;
      arr.push({
        cx: Math.cos(angleStart) * r * 0.3,    // bias toward center
        cz: Math.sin(angleStart) * r * 0.3,
        radius: 0.4 + Math.random() * 1.2,
        speed: 0.04 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        yOffset: 0.005 + Math.random() * 0.015,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    leaves.forEach((leaf, i) => {
      const angle = leaf.phase + t * leaf.speed;
      const x = leaf.cx + Math.cos(angle) * leaf.radius;
      const z = leaf.cz + Math.sin(angle) * leaf.radius;
      const y = 0.01 + leaf.yOffset + Math.sin(t * 1.5 + leaf.phase) * 0.005;

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        -Math.PI / 2 + Math.sin(t * 0.5 + leaf.phase) * 0.08,
        angle * 0.3 + t * leaf.rotationSpeed * 0.1,
        Math.cos(t * 0.7 + leaf.phase) * 0.06
      );
      dummy.scale.setScalar(0.15 + (i % 3) * 0.05);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, LEAF_COUNT]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshStandardMaterial
        map={leafTexture}
        transparent
        alphaTest={0.5}        // discards transparent pixels → real leaf silhouette
        side={DoubleSide}      // visible from above + below the water plane
        roughness={0.65}
        // No color override — let the texture's natural reds come through
      />
    </instancedMesh>
  );
}
