import { NextResponse } from 'next/server';

const source = process.env.RHA_CASE_STUDIES_API_URL || 'https://dashboard.picki.com.au/api/public/case-studies';

export async function GET() {
  try {
    const response = await fetch(source, { headers: { Accept: 'application/json' }, next: { revalidate: 900, tags: ['case-studies'] } });
    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ status: 'unavailable', caseStudies: [] }, { status: 200 });
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } });
  } catch (error) {
    console.error('Unable to load public case studies:', error.message);
    return NextResponse.json({ status: 'unavailable', caseStudies: [] }, { status: 200 });
  }
}
