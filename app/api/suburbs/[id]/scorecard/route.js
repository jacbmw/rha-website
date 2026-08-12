import { NextResponse } from 'next/server';
import { findSuburbById, getSuburbScorecard } from '../../../../../lib/suburbs';
import { rateLimited, requestIp } from '../../../../../lib/rateLimit';
import { buildUnlockCookie, readUnlockCookie, UNLOCK_COOKIE_NAME } from '../../../../../lib/suburbGate';
import { forwardToRha } from '../../../../../lib/rha-api';

// Layer 1 payload — the scorecard. Only returned after a verified lead
// create/identify for this visitor (server-checked; the data never ships in
// the initial HTML). Returning identified visitors present the signed unlock
// cookie and skip the form.

const suburbsPerIp = new Map(); // ip -> { day, ids:Set }
const MAX_SUBURBS_PER_IP_PER_DAY = 2;

function suburbCapExceeded(ip, sscId) {
  const day = new Date().toISOString().slice(0, 10);
  let record = suburbsPerIp.get(ip);
  if (!record || record.day !== day) {
    record = { day, ids: new Set() };
    suburbsPerIp.set(ip, record);
  }
  if (record.ids.has(sscId)) return false;
  if (record.ids.size >= MAX_SUBURBS_PER_IP_PER_DAY) return true;
  record.ids.add(sscId);
  if (suburbsPerIp.size > 20000) suburbsPerIp.clear();
  return false;
}

export async function POST(request, { params }) {
  const ip = requestIp(request);
  if (rateLimited(`scorecard:${ip}`, { limit: 10, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  const entry = await findSuburbById(id).catch(() => null);
  if (!entry) return NextResponse.json({ message: 'Suburb not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const existing = readUnlockCookie(request.cookies.get(UNLOCK_COOKIE_NAME)?.value);

  let identity = existing;
  if (!identity) {
    // First unlock: verify the lead with the dashboard before returning data.
    const { email, firstName, qualifier, scoreWatch, visitorId, attribution } = body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
    }
    if (body.company) {
      // Honeypot — pretend success but return nothing useful.
      return NextResponse.json({ message: 'Thanks' }, { status: 202 });
    }
    const tags = ['Suburb Widget', `Suburb Score — ${entry.name}`];
    if (scoreWatch !== false) tags.push('Score Watch');
    try {
      const result = await forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
        method: 'POST',
        headers: { 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
        body: JSON.stringify({
          email,
          fullname: firstName || '',
          leadSource: 'rha-website-suburb-widget',
          form_source: body.formSource || 'website_suburb-score_2026',
          newTags: tags,
          touchExisting: true,
          suburbId: entry.id,
          suburbName: `${entry.name} ${entry.state}`,
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
      // 409/200-touch both mean "this person is a known lead" — unlock.
      if (!result.ok && result.status !== 409) {
        return NextResponse.json(result.payload || { message: 'Registration failed.' }, { status: result.status });
      }
    } catch (error) {
      console.error('Suburb scorecard lead create failed:', error.message);
      return NextResponse.json({ message: 'Registration is temporarily unavailable.' }, { status: 503 });
    }
    identity = { email, firstName: firstName || '' };
  }

  if (suburbCapExceeded(ip, entry.id)) {
    return NextResponse.json(
      { message: 'You have reached the daily scorecard limit. Book a call and we will walk you through as many suburbs as you like.' },
      { status: 429 }
    );
  }

  try {
    const scorecard = await getSuburbScorecard(entry);
    if (!scorecard) return NextResponse.json({ message: 'No data for this suburb yet' }, { status: 404 });
    const response = NextResponse.json({ ...scorecard, firstName: identity.firstName });
    const cookie = buildUnlockCookie(identity);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error('Suburb scorecard failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable' }, { status: 503 });
  }
}
