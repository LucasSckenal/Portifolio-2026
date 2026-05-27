'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Mesh, Object3D, Vector3 } from 'three';

// ── Stones — karesansui arrangement (rule of 5 / gosan-seki) ──
// Two distinct stone shapes (loaded from /lab/niwa/stones/) instanced
// 5 times total with varied scale + rotation, in the canonical asymmetric
// composition of a Japanese zen garden.
//
// Per-stone normalization (auto-scale + auto-center bottom at y=0) makes
// the model's original pivot/scale irrelevant — same approach used in
// Kagami's Torii.tsx.

// Target world-space height for the base/un-scaled stone (the per-instance
// `scale` then multiplies). Tune to balance with pond size (~14×14).
const STONE_A_HEIGHT = 1.1;  // elongated boulder
const STONE_B_HEIGHT = 0.85; // smooth pebble

const STONE_A_PATH = '/lab/niwa/stones/stone_01.glb';
const STONE_B_PATH = '/lab/niwa/stones/stone_02.glb';

// Normalize a loaded GLB scene in place: uniform-scale to target height,
// then translate so the bottom of the bounding box sits at local y=0.
function normalizeScene(scene: Object3D, targetHeight: number) {
  const box = new Box3().setFromObject(scene);
  const size = box.getSize(new Vector3());
  const factor = targetHeight / (size.y || 1);
  scene.scale.setScalar(factor);

  const scaledBox = new Box3().setFromObject(scene);
  scene.position.y -= scaledBox.min.y;

  // Shadows on every mesh
  scene.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Neutralize Meshy AI's tendency to ship emissive on rocks
      const mat = mesh.material as { emissiveIntensity?: number };
      if (mat && typeof mat.emissiveIntensity === 'number') {
        mat.emissiveIntensity = 0;
      }
    }
  });
}

type StoneInstanceProps = {
  scene: Object3D;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

// Each rendered stone is a CLONE of the normalized source scene so multiple
// instances don't share/conflict transforms. Three.js Object3D.clone(true)
// = deep clone (geometry + materials reused, transform tree copied).
function StoneInstance({ scene, position, rotation = [0, 0, 0], scale = 1 }: StoneInstanceProps) {
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}

// ── Karesansui arrangement (rule of 5) ─────────────────
// Composition principles:
//   · Asymmetric — center of mass off the geometric center
//   · Triangular rhythm — hero + two flankers + two accents form triangles
//   · Variety in scale — 1.0 / 0.85 / 0.7 / 0.5 / 0.45
//   · Rotation variety — no two stones face same direction
//
// Y positions are 0 because normalizeScene already puts each model's
// bottom at local y=0. They sit on the pond surface naturally.

type Arrangement = {
  shape: 'A' | 'B';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

const ARRANGEMENT: Arrangement[] = [
  // Hero — large elongated stone, foreground-right, slight forward tilt
  { shape: 'A', position: [1.3, 0, 0.6],   rotation: [0, 0.25, 0],   scale: 1.0  },
  // Secondary — pebble, back-left, twisted away
  { shape: 'B', position: [-1.0, 0, 1.0],  rotation: [0, -0.9, 0],   scale: 0.85 },
  // Distant accent — elongated, far back, angular
  { shape: 'A', position: [-1.7, 0, -1.5], rotation: [0, 1.4, 0.1],  scale: 0.7  },
  // Foreground pebble — small, mid-front
  { shape: 'B', position: [0.2, 0, 1.9],   rotation: [0, 0.5, 0],    scale: 0.5  },
  // Back-right tiny — completes the triangle
  { shape: 'B', position: [2.0, 0, -0.9],  rotation: [0, -0.4, 0],   scale: 0.45 },
];

export default function Stones() {
  const { scene: sceneA } = useGLTF(STONE_A_PATH);
  const { scene: sceneB } = useGLTF(STONE_B_PATH);

  // Normalize each source scene once when loaded. The clones in each
  // StoneInstance inherit the normalized scale + position offset.
  useEffect(() => {
    normalizeScene(sceneA, STONE_A_HEIGHT);
  }, [sceneA]);

  useEffect(() => {
    normalizeScene(sceneB, STONE_B_HEIGHT);
  }, [sceneB]);

  return (
    <>
      {ARRANGEMENT.map((s, i) => (
        <StoneInstance
          key={i}
          scene={s.shape === 'A' ? sceneA : sceneB}
          position={s.position}
          rotation={s.rotation}
          scale={s.scale}
        />
      ))}
    </>
  );
}

// Preload — start streaming immediately when the Niwa route module imports.
// Saves ~300-500ms of perceived load time when user reaches the scene.
useGLTF.preload(STONE_A_PATH);
useGLTF.preload(STONE_B_PATH);
