'use client';

// ── Pond — daytime shallow water with visible floor ──────────
// Daytime variant: warmer-toned floor (gravel/sand), more translucent
// water that picks up the sky color via envMap.
//
// Future polish: caustics, ripple normal map, foam at stone bases. For
// now, dual-plane setup proves the composition.

export default function Pond() {
  return (
    <>
      {/* Floor — tan/sand gravel, visible through the shallow water */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.25, 0]}
        receiveShadow
      >
        <planeGeometry args={[16, 16, 1, 1]} />
        <meshStandardMaterial
          color="#A89878"
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* Water surface — semi-transparent, picks up sky reflection */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[16, 16, 1, 1]} />
        <meshStandardMaterial
          color="#88B8D0"            // warm-cool blue with sky tint
          roughness={0.15}            // smooth — strong sun specular
          metalness={0.7}             // pseudo-mirror via envMap
          envMapIntensity={0.9}       // reflects the Sky shader
          transparent
          opacity={0.78}              // visible enough to see floor below
        />
      </mesh>
    </>
  );
}
