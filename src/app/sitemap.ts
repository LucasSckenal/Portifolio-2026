import type { MetadataRoute } from 'next';
import { projects, nightProjects } from '@/content/projects';
import { LAB_PIECES } from '@/content/lab';

// Auto-generated sitemap.xml at /sitemap.xml
// Includes the home page + every documented route (work, lab, case studies).
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return [
    // ── Top-level pages ──
    {
      url: base,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${base}/work`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/lab`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },

    // ── Case studies (day + night portfolios) ──
    ...[...projects, ...nightProjects].map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // ── Lab pieces (immersive WebGL experiences) ──
    ...LAB_PIECES.map((p) => ({
      url: `${base}${p.href}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
