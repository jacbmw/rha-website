import { NextResponse } from 'next/server';
import { searchSuburbs } from '../../../../lib/suburbs';
import { rateLimited, requestIp } from '../../../../lib/rateLimit';

// Public autosuggest for the suburb widget. Served from the in-memory suburb
// registry (one Aurora query per day per instance) — responds well under the
// 100ms budget. Accepts suburb names AND postcodes ("4817").
export async function GET(request) {
  if (rateLimited(`search:${requestIp(request)}`, { limit: 60, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const q = new URL(request.url).searchParams.get('q') || '';
  try {
    const results = await searchSuburbs(q, 8);
    return NextResponse.json(
      { results },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('Suburb search failed for query "%s":', q, error.message);
    return NextResponse.json(
      { message: 'Temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
