import { NextResponse } from 'next/server';
import { listBlogItems } from '../../../../lib/blog-store';

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const current = searchParams.get('current') || '';
  const seen = searchParams.getAll('seen');

  try {
    const all = await listBlogItems({ limit: 100 });
    const currentPost = all.find((p) => p.slug === current);
    const exclude = new Set([current, ...seen]);
    const candidates = all.filter((p) => !exclude.has(p.slug));

    if (!candidates.length) {
      return NextResponse.json({ done: true });
    }

    const category = currentPost?.category;
    const scored = candidates.map((p) => {
      const raw = p.publishedDate ? new Date(p.publishedDate).getTime() : 0;
      const ts = Number.isFinite(raw) ? raw : 0;
      const score = ts + (p.category === category ? 1e12 : 0);
      return { ...p, score };
    });
    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      done: false,
      post: scored[0],
    });
  } catch (error) {
    return NextResponse.json({ error: error.message, done: true }, { status: 500 });
  }
}
