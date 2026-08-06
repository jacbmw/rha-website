import { NextResponse } from 'next/server';
import { forwardToRha } from '../../../lib/rha-api';

export async function POST(request) {
  const body = await request.json();
  const { url, referrer, title, visitorId } = body || {};

  if (!url) return NextResponse.json({ message: 'URL is required.' }, { status: 400 });

  try {
    const result = await forwardToRha('/api/public/pageview', {
      method: 'POST',
      body: JSON.stringify({ url, ref: referrer, title, vid: visitorId }),
    });
    return NextResponse.json(result.payload, { status: result.status });
  } catch (error) {
    console.error('Unable to forward page view:', error.message);
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
