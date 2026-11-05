'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// A white ribbon left by a blade: samples the edge (base → tip) in world
// space every frame and draws the last few as a fading strip. Shown while
// `active()` says the weapon is swinging; it fades out on its own after.
const N = 16;
const a = new THREE.Vector3();
const b = new THREE.Vector3();

export default function Trail({
  base,
  tip,
  active,
  opacity = 0.75,
}: {
  base: React.RefObject<THREE.Object3D | null>;
  tip: React.RefObject<THREE.Object3D | null>;
  active: () => boolean;
  opacity?: number;
}) {
  const hist = useRef<Array<[THREE.Vector3, THREE.Vector3]>>([]);
  const level = useRef(0);
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 2 * 4), 4));
    const idx: number[] = [];
    for (let i = 0; i < N - 1; i++) {
      const o = i * 2;
      idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
    }
    g.setIndex(idx);
    const m = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
    return { geo: g, mat: m };
  }, []);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 20);
    if (!base.current || !tip.current || !mesh.current) return;
    base.current.getWorldPosition(a);
    tip.current.getWorldPosition(b);
    const on = active();
    level.current += ((on ? 1 : 0) - level.current) * (1 - Math.exp(-dt * (on ? 30 : 9)));
    const h = hist.current;
    h.unshift([a.clone(), b.clone()]);
    if (h.length > N) h.length = N;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = geo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const s = h[Math.min(i, h.length - 1)];
      pos.setXYZ(i * 2, s[0].x, s[0].y, s[0].z);
      pos.setXYZ(i * 2 + 1, s[1].x, s[1].y, s[1].z);
      const f = Math.pow(1 - i / (N - 1), 1.6) * level.current * opacity;
      col.setXYZW(i * 2, 1, 1, 1, f * 0.25); // the inner edge stays faint
      col.setXYZW(i * 2 + 1, 1, 1, 1, f);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.computeBoundingSphere();
    mesh.current.visible = level.current > 0.02;
  });

  return <mesh ref={mesh} geometry={geo} material={mat} frustumCulled={false} renderOrder={5} />;
}
