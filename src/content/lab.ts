// =========================================
// Single source of truth for Lab pieces.
// Imported by:
//   · src/app/lab/page.tsx  → renders the gallery cards
//   · src/app/sitemap.ts    → registers each piece's URL for SEO
//   · (future) opengraph-image.tsx, RSS feed, etc.
//
// As you ship new pieces, append to LAB_PIECES. Both the gallery and the
// sitemap auto-update.
// =========================================

export type LabPiece = {
  slug: string;
  title: string;
  kanji: string;
  kanjiLabel: string;   // "Kanji · Romanization" — used for hover label
  year: string;
  status: string;       // "Live" | "WIP" | "Concept"
  tagline: string;      // one-line poetic
  description: string;  // 2-3 sentence pitch
  tech: string[];       // chip list
  href: string;         // route to enter the piece
  // Optional preview image (1600×1000 JPG, ~150-300KB recommended).
  // When present, renders as background on /lab gallery cards; absent →
  // card uses the kanji-only minimal layout (graceful fallback).
  preview?: string;
};

export const LAB_PIECES: LabPiece[] = [
  {
    slug: 'kagami',
    title: 'Kagami',
    kanji: '鏡',
    kanjiLabel: 'Kagami · Mirror',
    year: '2026',
    status: 'Live',
    tagline: 'A floating torii in an infinite void.',
    description:
      'A 3D study in stillness and disturbance. The torii suspended in pure darkness, the lanterns its only warmth. Mouse moves stir the water; sound enters when you ask.',
    tech: ['Three.js', 'R3F', 'GLSL', 'HDRI', 'Postprocessing'],
    href: '/lab/kagami',
    preview: '/lab/kagami/preview.jpg', // drop a screenshot here when ready
  },
  {
    slug: 'niwa',
    title: 'Niwa',
    kanji: '庭',
    kanjiLabel: 'Niwa · Garden',
    year: '2026',
    status: 'WIP',
    tagline: 'A shallow pond, weathered stones, a leaf drifting.',
    description:
      'A karesansui garden translated to WebGL — three stones arranged by the rule of five, momiji leaves rotating on the water surface, the same night sky reflected below. Companion piece to Kagami.',
    tech: ['Three.js', 'R3F', 'InstancedMesh', 'Custom water shader'],
    href: '/lab/niwa',
    preview: '/lab/niwa/preview.jpg', // drop a screenshot here when ready
  },
];

// Returns slugs only — convenient for sitemap and static path generation.
export function getLabSlugs(): string[] {
  return LAB_PIECES.map((p) => p.slug);
}
