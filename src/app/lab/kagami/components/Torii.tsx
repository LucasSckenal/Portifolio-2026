'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Group, Mesh, Vector3 } from 'three';

// ── Torii — real model from Meshy AI ────────────────────
// 9.5k tris, 8.6MB .glb at /public/lab/kagami/torii.glb. Meshy AI exports
// often come at arbitrary scale + arbitrary pivot — INITIAL_SCALE and
// position prop are starting guesses; tune by eye while watching the scene.
//
// All meshes inside the glTF graph are tagged for shadows on mount so the
// torii silhouette shows up on the water surface (cinematic depth cue).

type ToriiProps = {
  position?: [number, number, number];
};

// Target world-space height for the torii (in scene units). Adjusted via
// scale calculation below — independent of whatever scale the model
// shipped with. 5 units = roughly the placeholder dimensions.
const TARGET_HEIGHT = 5;

export default function Torii({ position = [0, 0, 0] }: ToriiProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/lab/kagami/torii.glb');

  // One-time setup on the GLB scene:
  //   1. Tag every mesh for shadows
  //   2. Neutralize any baked-in emissive (Meshy ships with these on)
  //   3. Compute bounding box → derive a uniform scale that gives the model
  //      a known world-space height (TARGET_HEIGHT)
  //   4. Translate the model internally so its lowest point sits at y=0,
  //      independent of where the original pivot was. This means the
  //      `position` prop now reliably places the torii's BASE at that point.
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const mat = mesh.material as { emissiveIntensity?: number };
        if (mat && typeof mat.emissiveIntensity === 'number') {
          mat.emissiveIntensity = 0;
        }
      }
    });

    // Measure → scale → re-center
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const currentHeight = size.y || 1;
    const scaleFactor = TARGET_HEIGHT / currentHeight;
    scene.scale.setScalar(scaleFactor);

    // Re-measure post-scale to find where the new bottom is, then translate
    // the model upward so bottom sits at y=0 in local group space.
    const scaledBox = new Box3().setFromObject(scene);
    scene.position.y -= scaledBox.min.y;
  }, [scene]);

  // Subtle idle sway — same as the placeholder had, keeps the gate "alive"
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.01;
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the model so it starts streaming as soon as this module is
// imported, not when the component first mounts. Saves ~300-500ms of
// perceived load time.
useGLTF.preload('/lab/kagami/torii.glb');
