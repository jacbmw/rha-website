import { NextResponse } from 'next/server';
import { forwardToRha } from '../../../lib/rha-api';

export async function POST(request) {
  const body = await request.json();
  const { email, name, source } = body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
  }

  try {
    const result = await forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
      method: 'POST',
      headers: { 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
      body: JSON.stringify({
        email,
        fullname: name || '',
        tag: source === 'ebook' ? 'Ebook — Top Five Markets' : 'Newsletter',
        leadSource: source === 'ebook' ? 'rha-website-ebook' : 'rha-website-newsletter',
      }),
    });
    // A duplicate email (409) still means the reader is subscribed — treat as success.
    if (result.ok || result.status === 409) return NextResponse.json({ ok: true });
    return NextResponse.json(result.payload, { status: result.status });
  } catch (error) {
    console.error('Unable to forward newsletter registration:', error.message);
    return NextResponse.json({ message: 'Registration is temporarily unavailable.' }, { status: 503 });
  }
}
