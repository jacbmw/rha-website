import { NextResponse } from 'next/server';
import { findCityBySlug, findLgaBySlug } from '../../../../lib/locations';
import { rateLimited, requestIp } from '../../../../lib/rateLimit';
import { readUnlockCookie, UNLOCK_COOKIE_NAME } from '../../../../lib/suburbGate';
import { attributionFields, forwardStreetLead } from '../../../../lib/streetLead';
import { CONSENT_TEXT, CONSENT_VERSION } from '../../../../lib/streetShared';
import { postActivityServer } from '../../../../lib/activityServer';

// Layer 2 — phone + SMS/AI-call consent capture for City & LGA pages before
// Calendly IDR booking. Mirrors /api/streets/[key]/review so every unlocked
// location lead gets phone + explicit consent recorded on their rha_leads row.
export async function POST(request) {
  if (rateLimited(`loc-review:${requestIp(request)}`, { limit: 5, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.company) return NextResponse.json({ ok: true });

  const { kind, slug, state } = body || {};
  const location = kind === 'city'
    ? await findCityBySlug(slug).catch(() => null)
    : await findLgaBySlug(state, slug).catch(() => null);
  if (!location) return NextResponse.json({ message: 'Location not found' }, { status: 404 });

  const identity = readUnlockCookie(request.cookies.get(UNLOCK_COOKIE_NAME)?.value);
  if (!identity?.email) {
    return NextResponse.json({ message: 'Unlock the scorecard first.' }, { status: 401 });
  }

  const phone = String(body.phone || '').trim();
  if (!/^[\d\s()+-]{8,}$/.test(phone)) {
    return NextResponse.json({ message: 'A valid phone number is required.' }, { status: 400 });
  }

  const capturedAt = new Date().toISOString();
  const smsConsent = body.smsConsent === true;
  const aiCallConsent = body.aiCallConsent === true;
  const label = `${location.name} ${location.state}`;
  const tags = [
    kind === 'city' ? 'City Analysis Requested' : 'LGA Analysis Requested',
    `${kind === 'city' ? 'City' : 'LGA'} Scorecard — ${label}`,
  ];
  if (smsConsent) tags.push('SMS Consent — Street Score');
  if (aiCallConsent) tags.push('Call Consent — Street Score');

  try {
    const result = await forwardStreetLead({
      email: identity.email,
      phone,
      fullname: identity.firstName || '',
      form_source: kind === 'city' ? 'website_city-review_2026' : 'website_lga-review_2026',
      newTags: tags,
      vid: body.visitorId || undefined,
      suburbName: label,
      qualifier: body.qualifier || undefined,
      consents: {
        version: CONSENT_VERSION,
        capturedAt,
        pageUrl: location.path,
        sms: smsConsent,
        smsText: CONSENT_TEXT.sms,
        aiCall: aiCallConsent,
        aiCallText: CONSENT_TEXT.aiCall,
      },
      ...attributionFields(body.attribution),
    });
    postActivityServer(
      {
        visitor_id: body.visitorId || null,
        event_type: 'review_submit',
        page_key: `${kind}-research`,
        props: { kind, slug, state: location.state, name: location.name, smsConsent, aiCallConsent },
      },
      request
    );
    if (result.ok || result.status === 409) return NextResponse.json({ ok: true });
    return NextResponse.json(result.payload || { message: 'Request failed.' }, { status: result.status });
  } catch (error) {
    console.error('Location review request failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable.' }, { status: 503 });
  }
}
