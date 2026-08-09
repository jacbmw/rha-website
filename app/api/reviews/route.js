import { NextResponse } from 'next/server';

const source = process.env.RHA_REVIEWS_API_URL || 'https://dashboard.picki.com.au/api/public/reviews';

export async function GET() {
  try {
    const response = await fetch(`${source}?limit=18`, { headers: { Accept: 'application/json' }, next: { revalidate: 900 } });
    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ status: 'unavailable', reviews: [] }, { status: 200 });
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } });
  } catch (error) {
    console.error('Unable to load public reviews:', error.message);
    return NextResponse.json({ status: 'unavailable', reviews: [] }, { status: 200 });
  }
}
