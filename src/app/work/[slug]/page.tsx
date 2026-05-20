import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects, getProject } from '@/content/projects';
import CaseStudy from '@/components/case-study/CaseStudy';

// Pre-render every case study at build time
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// Per-page metadata + OG title/description
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: `${project.title} · Case study`,
      description: project.tagline,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
