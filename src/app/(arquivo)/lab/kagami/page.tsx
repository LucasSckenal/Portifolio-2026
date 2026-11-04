import type { Metadata } from 'next';
import KagamiClient from './KagamiClient';

// Server Component — preserves the metadata export for SEO.
// The actual page composition (mobile fallback OR immersive scene + overlay)
// is decided by KagamiClient based on viewport.

export const metadata: Metadata = {
  title: '鏡 Kagami — Lab',
  description:
    'A floating torii on still water. Cursor ripples disturb the reflection; scroll moves the sun. A 3D study in stillness and disturbance.',
  openGraph: {
    title: '鏡 · Kagami',
    description: 'A floating torii on still water — interactive 3D piece.',
  },
};

export default function KagamiPage() {
  return <KagamiClient />;
}
