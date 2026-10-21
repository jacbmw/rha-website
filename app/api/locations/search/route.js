import { NextResponse } from 'next/server';
import { searchLocationsUnified } from '../../../../lib/locations';
import { rateLimited, requestIp } from '../../../../lib/rateLimit';

export async function GET(request) {
  const ip = requestIp(request);
  if (rateLimited(`loc-search:${ip}`, { limit: 60, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  try {
    const results = await searchLocationsUnified(q, 10);
    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('Location search failed:', error.message);
    return NextResponse.json({ cities: [], lgas: [], suburbs: [] }, { status: 500 });
  }
}
