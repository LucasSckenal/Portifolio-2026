import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects, getProject } from '@/content/projects';
import { creativeWorkSchema } from '@/lib/structured-data';
import CaseStudy from '@/components/case-study/CaseStudy';

// Pre-render every case study at build time
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// Resolves the canonical site URL across environments (mirrors layout.tsx).
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
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

  return (
    <>
      {/* Schema.org CreativeWork — improves rich snippets for case studies */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(creativeWorkSchema(getSiteUrl(), project)),
        }}
      />

      <CaseStudy project={project} />
    </>
  );
}
