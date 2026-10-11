import { NextResponse } from 'next/server';
import { rateLimited, requestIp } from '../../../../lib/rateLimit';
import { readUnlockCookie, UNLOCK_COOKIE_NAME } from '../../../../lib/suburbGate';
import { forwardStreetLead, segmentTag } from '../../../../lib/streetLead';
import { sanitizeProfileAnswers } from '../../../../lib/streetShared';
import { SEGMENTS } from '../../../../lib/streets';

// Progressive profiling answers ("help us tailor your Street Review"). Only
// for identified visitors. The dashboard stores every answer in
// rha_lead_web_profile and maps goal / risk / why / dream / timeframe into the
// lead's Investor Motivation fields (blanks only, audited as
// source = 'street_score_web').
export async function POST(request) {
  if (rateLimited(`street-profile:${requestIp(request)}`, { limit: 20, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const identity = readUnlockCookie(request.cookies.get(UNLOCK_COOKIE_NAME)?.value);
  if (!identity?.email) return NextResponse.json({ message: 'Unlock the street report first.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const answers = sanitizeProfileAnswers(body.answers);
  if (!Object.keys(answers).length) return NextResponse.json({ message: 'Nothing to save.' }, { status: 400 });
  const segment = SEGMENTS.includes(body.segment) ? body.segment : null;

  try {
    const result = await forwardStreetLead({
      email: identity.email,
      fullname: identity.firstName || '',
      form_source: 'website_street-profile_2026',
      newTags: ['Street Profile', segmentTag(segment)].filter(Boolean),
      vid: body.visitorId || undefined,
      segment: segment || undefined,
      streetKey: typeof body.streetKey === 'string' ? body.streetKey.slice(0, 160) : undefined,
      webProfile: { ...answers, source: 'street_score_web' },
    });
    if (result.ok || result.status === 409) return NextResponse.json({ ok: true });
    return NextResponse.json(result.payload || { message: 'Request failed.' }, { status: result.status });
  } catch (error) {
    console.error('Street profile save failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable.' }, { status: 503 });
  }
}
