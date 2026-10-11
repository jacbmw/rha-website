import { NextResponse } from 'next/server';
import { findSuburbById } from '../../../../../lib/suburbs';
import { listStreetNames } from '../../../../../lib/streets';
import { rateLimited, requestIp } from '../../../../../lib/rateLimit';

// Street autosuggest source for one suburb — names + slugs only (scores are
// served per street page, never in bulk).
export async function GET(request, { params }) {
  if (rateLimited(`streets:${requestIp(request)}`, { limit: 60, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const { id } = await params;
  const entry = await findSuburbById(id).catch(() => null);
  if (!entry) return NextResponse.json({ message: 'Suburb not found' }, { status: 404 });
  try {
    const streets = await listStreetNames(entry);
    return NextResponse.json(
      { suburb: { id: entry.id, name: entry.name, state: entry.state, slug: `${entry.state.toLowerCase()}/${entry.slug}` }, streets },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('Street list failed for suburb %s:', id, error.message);
    return NextResponse.json({ message: 'Temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
