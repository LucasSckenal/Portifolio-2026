import type { Metadata } from 'next';
import LabGallery from './LabGallery';

export const metadata: Metadata = {
  title: 'Lab — Experimental pieces',
  description:
    '3D, WebGL, and shader experiments. Standalone immersive pieces with no client brief, no deliverable, no specification.',
  openGraph: {
    title: 'Lab · Lucas Sckenal',
    description: 'Experimental WebGL studies — standalone immersive pieces.',
  },
};

export default function LabIndex() {
  return <LabGallery />;
}
