import { NextResponse } from 'next/server';

// Lucas's real GitHub contribution calendar (the last year, one level 0–4 per
// day), read from his public profile on the server and cached for a day. The
// About arena raises it as the ring of columns around the fight.
export const revalidate = 86400;

const USER = 'LucasSckenal';

export async function GET() {
  try {
    const res = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { 'User-Agent': 'portfolio-contributions' },
      next: { revalidate },
    });
    if (!res.ok) return NextResponse.json(null);
    const html = await res.text();
    const days: Array<[string, number]> = [];
    for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d)"/g)) {
      days.push([m[1], Number(m[2])]);
    }
    if (!days.length) return NextResponse.json(null);
    days.sort((a, b) => (a[0] < b[0] ? -1 : 1));
    return NextResponse.json({ from: days[0][0], levels: days.map((d) => d[1]) });
  } catch {
    return NextResponse.json(null);
  }
}
