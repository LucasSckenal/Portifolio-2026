'use client';

// ── Ishidōrō (石灯籠) — stone lantern, procedural ────────────
// Iconic Japanese garden element. Traditionally 6-part construction:
//   1. Kiso (基礎)    — wide base stone
//   2. Sao  (竿)      — pole/column
//   3. Chudai (中台)  — middle platform
//   4. Hibukuro (火袋) — light chamber (where flame would go)
//   5. Kasa (笠)      — umbrella roof
//   6. Hōju (宝珠)    — jewel finial on top
//
// Built from primitives — no glb asset needed, ~0 file weight.
// Standard total height: ~1.5 units. Adjust scale prop to fit composition.

type IshidoroProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export default function Ishidoro({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: IshidoroProps) {
  // Slightly different stone tones per part for visual variation
  const baseColor = '#7B7670';
  const poleColor = '#857F78';
  const chamberColor = '#6A6560';

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1 — Kiso (base) */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.1, 12]} />
        <meshStandardMaterial color={baseColor} roughness={0.95} metalness={0} />
      </mesh>

      {/* 2 — Sao (pole) */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.8, 16]} />
        <meshStandardMaterial color={poleColor} roughness={0.9} metalness={0} />
      </mesh>

      {/* 3 — Chudai (middle platform) */}
      <mesh position={[0, 0.94, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.08, 12]} />
        <meshStandardMaterial color={baseColor} roughness={0.95} />
      </mesh>

      {/* 4 — Hibukuro (light chamber) — hexagonal, the most "lantern"-looking part */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.34, 6]} />
        <meshStandardMaterial color={chamberColor} roughness={0.92} />
      </mesh>

      {/* 5 — Kasa (umbrella roof) — wider than chamber, conical */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.38, 0.2, 8]} />
        <meshStandardMaterial color={baseColor} roughness={0.95} />
      </mesh>

      {/* 6 — Hōju (jewel finial) — small sphere on top */}
      <mesh position={[0, 1.58, 0]} castShadow>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={chamberColor} roughness={0.85} />
      </mesh>
    </group>
  );
}
