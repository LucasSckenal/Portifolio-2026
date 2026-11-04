import { NextResponse } from 'next/server';
import { getProject } from '@/content/projects';
import { PROJECT_ORDER } from '@/components/site/panels';

// The most recent push to a public repo that belongs to a showcased project.
// Fetched here (not in the visitor's browser) so visitors never talk to GitHub,
// and cached for an hour so the page never waits on it.
export const revalidate = 3600;

const USER = 'LucasSckenal';

// repo name (lower case) → project slug, from each case's GitHub link
const REPOS = new Map<string, string>();
for (const slug of PROJECT_ORDER) {
  const href = getProject(slug)?.href ?? '';
  const m = href.match(/github\.com\/[^/]+\/([^/?#]+)/i);
  if (m) REPOS.set(m[1].toLowerCase(), slug);
}

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=30`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-activity' },
      next: { revalidate },
    });
    if (!res.ok) return NextResponse.json(null);
    const repos = (await res.json()) as Array<{ name: string; pushed_at: string; fork: boolean }>;
    const hit = repos.find((r) => !r.fork && REPOS.has(r.name.toLowerCase()));
    if (!hit) return NextResponse.json(null);
    return NextResponse.json({ slug: REPOS.get(hit.name.toLowerCase()), at: hit.pushed_at });
  } catch {
    return NextResponse.json(null);
  }
}
