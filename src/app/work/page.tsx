import type { Metadata } from 'next';
import { getFilmography } from '@/content/projects';
import WorkArchive from './WorkArchive';

export const metadata: Metadata = {
  title: 'All work',
  description: 'Filmography — every piece shipped. Commercial, personal, academic.',
};

// Server component: pull the filmography at build time. The client
// component handles filtering and interaction.
export default function WorkPage() {
  return <WorkArchive entries={getFilmography()} />;
}
