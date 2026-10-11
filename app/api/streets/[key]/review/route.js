import { NextResponse } from 'next/server';
import { resolveStreetKey, SEGMENTS } from '../../../../../lib/streets';
import { rateLimited, requestIp } from '../../../../../lib/rateLimit';
import { readUnlockCookie, UNLOCK_COOKIE_NAME } from '../../../../../lib/suburbGate';
import { attributionFields, forwardStreetLead, segmentTag, streetFields } from '../../../../../lib/streetLead';
import { CONSENT_TEXT, CONSENT_VERSION } from '../../../../../lib/streetShared';

// Layer 2 — phone capture for the 15-minute Street Review. Requires the
// email identity from Layer 1. SMS consent and call consent (including
// automated/AI calls) are two SEPARATE, unticked-by-default opt-ins; each is
// stored with its exact wording, version, timestamp and page so the record
// stands on its own. Ticking neither is allowed — the phone is still captured
// for the booked human Review, but no SMS/automated contact is consented.
export async function POST(request, { params }) {
  if (rateLimited(`street-review:${requestIp(request)}`, { limit: 5, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const { key } = await params;
  const resolved = await resolveStreetKey(key).catch(() => null);
  if (!resolved) return NextResponse.json({ message: 'Street not found' }, { status: 404 });
  const { snapshot } = resolved;

  const body = await request.json().catch(() => ({}));
  if (body.company) return NextResponse.json({ ok: true }); // honeypot
  const identity = readUnlockCookie(request.cookies.get(UNLOCK_COOKIE_NAME)?.value);
  if (!identity?.email) return NextResponse.json({ message: 'Unlock the street report first.' }, { status: 401 });
  const phone = String(body.phone || '').trim();
  if (!/^[\d\s()+-]{8,}$/.test(phone)) return NextResponse.json({ message: 'A valid phone number is required.' }, { status: 400 });

  const segment = SEGMENTS.includes(body.segment) ? body.segment : null;
  const capturedAt = new Date().toISOString();
  const smsConsent = body.smsConsent === true;
  const aiCallConsent = body.aiCallConsent === true;
  const tags = ['Street Analysis Requested', `Street Score — ${snapshot.suburb.name}`, segmentTag(segment)].filter(Boolean);
  if (smsConsent) tags.push('SMS Consent — Street Score');
  if (aiCallConsent) tags.push('Call Consent — Street Score');

  try {
    const result = await forwardStreetLead({
      email: identity.email,
      phone,
      fullname: identity.firstName || '',
      form_source: 'website_street-review_2026',
      newTags: tags,
      vid: body.visitorId || undefined,
      consents: {
        version: CONSENT_VERSION,
        capturedAt,
        pageUrl: snapshot.path,
        sms: smsConsent,
        smsText: CONSENT_TEXT.sms,
        aiCall: aiCallConsent,
        aiCallText: CONSENT_TEXT.aiCall,
      },
      ...streetFields(snapshot, segment, body.checks),
      ...attributionFields(body.attribution),
    });
    if (result.ok || result.status === 409) return NextResponse.json({ ok: true });
    return NextResponse.json(result.payload || { message: 'Request failed.' }, { status: result.status });
  } catch (error) {
    console.error('Street review request failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable.' }, { status: 503 });
  }
}
