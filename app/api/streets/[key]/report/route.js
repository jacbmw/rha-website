import { NextResponse } from 'next/server';
import { getSuburbSnapshot } from '../../../../../lib/suburbs';
import { getStreetReport, resolveStreetKey, SEGMENTS } from '../../../../../lib/streets';
import { rateLimited, requestIp } from '../../../../../lib/rateLimit';
import { buildUnlockCookie, readUnlockCookie, UNLOCK_COOKIE_NAME } from '../../../../../lib/suburbGate';
import { attributionFields, forwardStreetLead, segmentTag, streetFields } from '../../../../../lib/streetLead';
import { postActivityServer } from '../../../../../lib/activityServer';

// Layer 1 — the segment-tailored street report. Only returned after a
// verified lead create/touch (server-checked; never in the initial HTML).
// The signed unlock cookie is shared with the suburb widget, so anyone who
// has already given an email (suburb or street) is never re-gated.
//
// Identified visitors checking a NEW street (recordCheck) or changing segment
// are touched on the dashboard too, so every street a lead looks at is stored
// against the lead (rha_lead_street_checks) and feeds the hot-lead rule.

const streetsPerIp = new Map(); // ip -> { day, keys:Set }
const MAX_STREETS_PER_IP_PER_DAY = 8;

function streetCapExceeded(ip, key) {
  const day = new Date().toISOString().slice(0, 10);
  let record = streetsPerIp.get(ip);
  if (!record || record.day !== day) {
    record = { day, keys: new Set() };
    streetsPerIp.set(ip, record);
  }
  if (record.keys.has(key)) return false;
  if (record.keys.size >= MAX_STREETS_PER_IP_PER_DAY) return true;
  record.keys.add(key);
  if (streetsPerIp.size > 20000) streetsPerIp.clear();
  return false;
}

export async function POST(request, { params }) {
  const ip = requestIp(request);
  if (rateLimited(`street-report:${ip}`, { limit: 10, windowMs: 60000 })) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const { key } = await params;
  const resolved = await resolveStreetKey(key).catch(() => null);
  if (!resolved) return NextResponse.json({ message: 'Street not found' }, { status: 404 });
  const { entry, snapshot } = resolved;

  const body = await request.json().catch(() => ({}));
  if (body.company) return NextResponse.json({ message: 'Thanks' }, { status: 202 }); // honeypot
  const segment = SEGMENTS.includes(body.segment) ? body.segment : null;
  const existing = readUnlockCookie(request.cookies.get(UNLOCK_COOKIE_NAME)?.value);
  let identity = existing;

  if (!identity || body.recordCheck) {
    const email = identity?.email || body.email;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
    }
    const tags = ['Street Score', `Street Score — ${snapshot.suburb.name}`, segmentTag(segment)].filter(Boolean);
    if (!identity && body.streetWatch !== false) tags.push('Street Watch');
    try {
      const result = await forwardStreetLead({
        email,
        fullname: identity?.firstName || body.firstName || '',
        form_source: identity ? 'website_street-check_2026' : 'website_street-score_2026',
        newTags: tags,
        streetWatch: identity ? undefined : body.streetWatch !== false,
        vid: body.visitorId || undefined,
        ...streetFields(snapshot, segment, body.checks),
        ...attributionFields(body.attribution),
      });
      if (!result.ok && result.status !== 409) {
        if (!identity) return NextResponse.json(result.payload || { message: 'Registration failed.' }, { status: result.status });
        console.warn('Street check touch failed (non-fatal):', result.status);
      }
    } catch (error) {
      console.error('Street report lead forward failed:', error.message);
      if (!identity) return NextResponse.json({ message: 'Registration is temporarily unavailable.' }, { status: 503 });
    }
    if (!identity) {
      identity = { email, firstName: body.firstName || '' };
      postActivityServer({ visitor_id: body.visitorId || null, event_type: 'report_unlock_server', page_key: 'street-score', street_key: snapshot.key, suburb_id: snapshot.suburb.id, segment, props: { returning: false } }, request);
    }
  }

  if (streetCapExceeded(ip, snapshot.key)) {
    return NextResponse.json(
      { message: 'You have reached the daily street report limit. Book a Street Review and we will walk you through as many streets as you like.' },
      { status: 429 }
    );
  }

  try {
    const suburbSnapshot = await getSuburbSnapshot(entry).catch(() => null);
    const report = await getStreetReport(entry, snapshot.slug, segment, { medianPrice: suburbSnapshot?.stats?.medianPrice ?? null });
    if (!report) return NextResponse.json({ message: 'No data for this street yet' }, { status: 404 });
    const response = NextResponse.json({
      ...report,
      firstName: identity.firstName,
      suburbScore: suburbSnapshot ? { score: suburbSnapshot.score, rank: suburbSnapshot.rank, total: suburbSnapshot.total, verdict: suburbSnapshot.verdict, previewShape: suburbSnapshot.previewShape } : null,
    });
    const cookie = buildUnlockCookie(identity);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error('Street report failed:', error.message);
    return NextResponse.json({ message: 'Temporarily unavailable' }, { status: 503 });
  }
}
