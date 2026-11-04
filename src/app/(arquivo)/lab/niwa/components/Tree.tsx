'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Group, Mesh, Object3D, Vector3 } from 'three';

// ── Tree — real 3D model + earth island base ──────────────────
// Tree mesh loaded from /lab/niwa/tree.glb (sakura/maple-style sculpted in
// Meshy AI). Auto-normalized so the model's original pivot/scale don't
// matter — guaranteed height + base sits at island top regardless.
//
// Island composition stays here (small cylinder/cone mound) so the tree
// has something to "grow from" instead of floating on water surface.
//
// Subtle wind sway applied to the whole tree group — barely perceptible
// but adds life. Future: per-branch sway via shader or bone manipulation.

const TREE_PATH = '/lab/niwa/tree.glb';
const TREE_TARGET_HEIGHT = 3.2; // world units, top to base

// Normalize: scale to target height, translate so bottom of bbox sits at local y=0
function normalizeScene(scene: Object3D, targetHeight: number) {
  const box = new Box3().setFromObject(scene);
  const size = box.getSize(new Vector3());
  const factor = targetHeight / (size.y || 1);
  scene.scale.setScalar(factor);

  const scaledBox = new Box3().setFromObject(scene);
  scene.position.y -= scaledBox.min.y;

  scene.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Neutralize any baked emissive Meshy might have added
      const mat = mesh.material as { emissiveIntensity?: number };
      if (mat && typeof mat.emissiveIntensity === 'number') {
        mat.emissiveIntensity = 0;
      }
    }
  });
}

export default function Tree() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(TREE_PATH);

  // Normalize once when scene loads
  useEffect(() => {
    normalizeScene(scene, TREE_TARGET_HEIGHT);
  }, [scene]);

  // Subtle wind sway — the whole tree gently rotates around its base
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.012;
    groupRef.current.rotation.x = Math.cos(t * 0.3) * 0.008;
  });

  return (
    <group position={[0, 0, 0]}>
      {/*
        No procedural island — the Meshy tree model already includes its
        own moss/stone base built in. Adding our own underneath was creating
        a "stacked cake" look. Tree base sits directly at water level (y=0).
      */}
      <group ref={groupRef} position={[0, 0, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// Preload — starts streaming when this module is imported
useGLTF.preload(TREE_PATH);
