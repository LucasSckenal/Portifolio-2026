import type { Metadata } from 'next';
import NiwaClient from './NiwaClient';

// Server Component — preserves the metadata export for SEO.
// Mobile/desktop split lives in NiwaClient.

export const metadata: Metadata = {
  title: '庭 Niwa — Lab',
  description:
    'A shallow pond, weathered stones, leaves drifting on the water surface. A karesansui garden translated to WebGL. Companion piece to Kagami.',
  openGraph: {
    title: '庭 · Niwa',
    description: 'A karesansui garden translated to WebGL — interactive 3D piece.',
  },
};

export default function NiwaPage() {
  return <NiwaClient />;
}
