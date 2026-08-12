import { NextResponse } from 'next/server';
import { findSuburbById, getSuburbSnapshot } from '../../../../../lib/suburbs';
import { rateLimited, requestIp } from '../../../../../lib/rateLimit';

// Layer 0 payload — public, cached 24h. Same data the ISR page renders.
export async function GET(request, { params }) {
  if (rateLimited(`snapshot:${requestIp(request)}`, { limit: 60, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const { id } = await params;
  try {
    const entry = await findSuburbById(id);
    if (!entry) return NextResponse.json({ message: 'Suburb not found' }, { status: 404 });
    const snapshot = await getSuburbSnapshot(entry);
    if (!snapshot) return NextResponse.json({ message: 'No data for this suburb yet' }, { status: 404 });
    return NextResponse.json(snapshot, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('Suburb snapshot failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable' }, { status: 503 });
  }
}
