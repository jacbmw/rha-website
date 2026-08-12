import { NextResponse } from 'next/server';
import { forwardToRha } from '../../../lib/rha-api';

export async function POST(request) {
  const body = await request.json();
  const { email, name, phone, source, formSource, visitorId, attribution, suburbQuery } = body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
  }

  const tag = source === 'ebook' ? 'Ebook — Top Five Markets'
    : source === 'suburb-miss' ? 'Suburb Widget — Missing Suburb'
    : 'Newsletter';
  const leadSource = source === 'ebook' ? 'rha-website-ebook'
    : source === 'suburb-miss' ? 'rha-website-suburb-widget'
    : 'rha-website-newsletter';
  // Coverage prioritisation: log which suburb the reader wanted and couldn't get.
  if (source === 'suburb-miss' && suburbQuery) {
    console.info('Suburb widget miss:', { query: String(suburbQuery).slice(0, 80), email });
  }

  try {
    const result = await forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
      method: 'POST',
      headers: { 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
      body: JSON.stringify({
        email,
        fullname: name || '',
        phone: phone || undefined,
        tag,
        leadSource,
        form_source: formSource || undefined,
        suburbQuery: source === 'suburb-miss' ? String(suburbQuery || '').slice(0, 80) : undefined,
        vid: visitorId || undefined,
        page_url: attribution?.pageUrl || undefined,
        ref: attribution?.referrer || undefined,
        gclid: attribution?.gclid || undefined,
        fbclid: attribution?.fbclid || undefined,
        // The dashboard's createPublicLead maps the camelCase utm* fields onto
        // the rha_leads utm_* columns — these are what reporting reads.
        utmSource: attribution?.utmSource || undefined,
        utmMedium: attribution?.utmMedium || undefined,
        utmCampaign: attribution?.utmCampaign || undefined,
        utmContent: attribution?.utmContent || undefined,
        utmTerm: attribution?.utmTerm || undefined,
        utmId: attribution?.utmId || undefined,
        // First/last-touch detail for the contact_first_touch_utm_* and
        // last_touch_utm_* lead columns.
        firstTouch: attribution?.firstTouch || undefined,
        lastTouch: attribution?.lastTouch || undefined,
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
