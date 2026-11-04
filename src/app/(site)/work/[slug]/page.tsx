import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject } from '@/content/projects';
import { PROJECT_ORDER } from '@/components/site/panels';
import CaseView from '@/components/site/CaseView';

// Case studies in the current edition's world. The 2026 versions live on
// at /2026/work/[slug].
export function generateStaticParams() {
  return PROJECT_ORDER.filter((slug) => getProject(slug)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { title: `${project.title} · Lucas Sckenal`, description: project.tagline },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <CaseView project={project} />;
}
