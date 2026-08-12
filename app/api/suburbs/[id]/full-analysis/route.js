import { NextResponse } from 'next/server';
import { findSuburbById } from '../../../../../lib/suburbs';
import { rateLimited, requestIp } from '../../../../../lib/rateLimit';
import { readUnlockCookie, UNLOCK_COOKIE_NAME } from '../../../../../lib/suburbGate';
import { forwardToRha } from '../../../../../lib/rha-api';

// Layer 2 — phone capture for the Suburb Strategy Session. Updates the
// existing lead (phone + "Suburb Analysis Requested" tag + score bump) so it
// surfaces in the dashboard power-dialer queue.
export async function POST(request, { params }) {
  if (rateLimited(`analysis:${requestIp(request)}`, { limit: 5, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  const entry = await findSuburbById(id).catch(() => null);
  if (!entry) return NextResponse.json({ message: 'Suburb not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const identity = readUnlockCookie(request.cookies.get(UNLOCK_COOKIE_NAME)?.value);
  const email = identity?.email || body.email;
  const phone = String(body.phone || '').trim();
  if (!email) return NextResponse.json({ message: 'Unlock the scorecard first.' }, { status: 401 });
  if (!/^[\d\s()+-]{8,}$/.test(phone)) {
    return NextResponse.json({ message: 'A valid phone number is required.' }, { status: 400 });
  }

  try {
    const result = await forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
      method: 'POST',
      headers: { 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
      body: JSON.stringify({
        email,
        phone,
        fullname: identity?.firstName || body.firstName || '',
        leadSource: 'rha-website-suburb-widget',
        form_source: 'website_suburb-analysis_2026',
        newTags: ['Suburb Analysis Requested', `Suburb Score — ${entry.name}`],
        touchExisting: true,
        suburbId: entry.id,
        suburbName: `${entry.name} ${entry.state}`,
        qualifier: body.qualifier || undefined,
        vid: body.visitorId || undefined,
      }),
    });
    if (result.ok || result.status === 409) return NextResponse.json({ ok: true });
    return NextResponse.json(result.payload || { message: 'Request failed.' }, { status: result.status });
  } catch (error) {
    console.error('Suburb full-analysis request failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable.' }, { status: 503 });
  }
}
