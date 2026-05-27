'use client';

import { useGLTF } from '@react-three/drei';

// ── Global glTF loader setup ──────────────────────────────────
// Configures drei's useGLTF to auto-decode DRACO-compressed meshes via
// Google's hosted decoder. Once the .glb files are compressed with
// gltf-transform (see PERFORMANCE.md), useGLTF picks up automatically.
//
// Without this setup, DRACO-compressed files fail to load with
// "DRACOLoader: No DRACO decoder configured."
//
// Import this file ONCE at app entry (e.g., from a top-level client
// component that mounts before any 3D scene).

let initialized = false;

export function setupGLTFLoader() {
  if (initialized) return;
  initialized = true;

  // Use Google's CDN decoder — fast, cached across origins, no bundle bloat.
  useGLTF.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
}
