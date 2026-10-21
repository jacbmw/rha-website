import { NextResponse } from 'next/server';
import { findCityBySlug, findLgaBySlug, getLocationScorecard } from '../../../../lib/locations';
import { rateLimited, requestIp } from '../../../../lib/rateLimit';
import { buildUnlockCookie, readUnlockCookie, UNLOCK_COOKIE_NAME } from '../../../../lib/suburbGate';
import { forwardToRha } from '../../../../lib/rha-api';
import { postActivityServer } from '../../../../lib/activityServer';

export async function POST(request) {
  const ip = requestIp(request);
  if (rateLimited(`loc-unlock:${ip}`, { limit: 15, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { kind, slug, state } = body || {};
  const location = kind === 'city'
    ? await findCityBySlug(slug).catch(() => null)
    : await findLgaBySlug(state, slug).catch(() => null);

  if (!location) {
    return NextResponse.json({ message: 'Location not found' }, { status: 404 });
  }

  const existing = readUnlockCookie(request.cookies.get(UNLOCK_COOKIE_NAME)?.value);
  let identity = existing;

  if (!identity) {
    const { email, firstName, qualifier, scoreWatch, visitorId, attribution } = body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
    }
    if (body.company) {
      return NextResponse.json({ message: 'Thanks' }, { status: 202 });
    }
    const label = `${location.name} ${location.state}`;
    const tags = [
      kind === 'city' ? 'City Research' : 'LGA Research',
      `${kind === 'city' ? 'City' : 'LGA'} Scorecard — ${label}`,
    ];
    if (scoreWatch !== false) tags.push('Score Watch');

    try {
      const result = await forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
        method: 'POST',
        headers: { 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
        body: JSON.stringify({
          email,
          fullname: firstName || '',
          leadSource: 'rha-website-suburb-widget',
          form_source: kind === 'city' ? 'website_city-scorecard_2026' : 'website_lga-scorecard_2026',
          newTags: tags,
          touchExisting: true,
          suburbName: label,
          qualifier: qualifier || undefined,
          scoreWatch: scoreWatch !== false,
          vid: visitorId || undefined,
          page_url: attribution?.pageUrl || undefined,
          ref: attribution?.referrer || undefined,
          gclid: attribution?.gclid || undefined,
          fbclid: attribution?.fbclid || undefined,
          utmSource: attribution?.utmSource || undefined,
          utmMedium: attribution?.utmMedium || undefined,
          utmCampaign: attribution?.utmCampaign || undefined,
          utmContent: attribution?.utmContent || undefined,
          utmTerm: attribution?.utmTerm || undefined,
          utmId: attribution?.utmId || undefined,
          firstTouch: attribution?.firstTouch || undefined,
          lastTouch: attribution?.lastTouch || undefined,
        }),
      });
      if (!result.ok && result.status !== 409) {
        return NextResponse.json(result.payload || { message: 'Registration failed.' }, { status: result.status });
      }
    } catch (error) {
      console.error('Location scorecard lead create failed:', error.message);
      return NextResponse.json({ message: 'Registration is temporarily unavailable.' }, { status: 503 });
    }

    postActivityServer(
      {
        visitor_id: visitorId || null,
        event_type: 'location_unlock_server',
        page_key: kind === 'city' ? 'city-research' : 'lga-research',
        props: { kind, slug, state: location.state, name: location.name },
      },
      request
    );
    identity = { email, firstName: firstName || '' };
  }

  try {
    const scorecard = await getLocationScorecard(location, kind);
    const response = NextResponse.json({ ...scorecard, firstName: identity.firstName });
    const cookie = buildUnlockCookie(identity);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error('Location scorecard failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable' }, { status: 503 });
  }
}
