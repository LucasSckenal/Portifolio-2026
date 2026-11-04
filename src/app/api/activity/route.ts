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
    const slug = REPOS.get(hit.name.toLowerCase());
    // When that push was a release (KERN ships from its own releases repo,
    // so every update there is one), name the version.
    let tag: string | undefined;
    const rel = await fetch(`https://api.github.com/repos/${USER}/${hit.name}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-activity' },
      next: { revalidate },
    });
    if (rel.ok) {
      const r = (await rel.json()) as { tag_name?: string; published_at?: string };
      const gap = Math.abs(new Date(r.published_at ?? 0).getTime() - new Date(hit.pushed_at).getTime());
      if (r.tag_name && gap < 2 * 86400_000) tag = r.tag_name;
    }
    return NextResponse.json({ slug, at: hit.pushed_at, tag });
  } catch {
    return NextResponse.json(null);
  }
}
