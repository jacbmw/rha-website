import { NextResponse } from 'next/server';
import { forwardToRha } from '../../../../lib/rha-api';

// Registers an attendee into the Demio webinar, then mirrors the lead into the
// RHA dashboard (same path as the newsletter/ebook forms) so attribution and
// Brevo sync happen automatically. Demio remains the source of truth for the
// webinar itself (confirmation email, reminders, join link).

const DEMIO_BASE = 'https://my.demio.com/api/v1';

function normalisePhone(raw) {
  const digits = String(raw || '').replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('04') && digits.length === 10) return `+61${digits.slice(1)}`;
  if (digits.startsWith('61')) return `+${digits}`;
  return digits;
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { firstName, email, phone, visitorId, attribution } = body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
  }
  if (!firstName || !String(firstName).trim()) {
    return NextResponse.json({ message: 'Please tell us your first name.' }, { status: 400 });
  }
  const phoneNumber = normalisePhone(phone);
  if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ message: 'A valid mobile number is required.' }, { status: 400 });
  }

  const eventId = Number(process.env.DEMIO_WEBINAR_EVENT_ID);
  const apiKey = process.env.DEMIO_API_KEY;
  const apiSecret = process.env.DEMIO_API_SECRET;
  if (!eventId || !apiKey || !apiSecret) {
    console.error('Demio webinar registration is not configured.');
    return NextResponse.json({ message: 'Registration is temporarily unavailable.' }, { status: 503 });
  }

  // 1) Register into Demio — this is the call that must succeed.
  let joinLink = null;
  try {
    const payload = {
      id: eventId,
      name: String(firstName).trim().slice(0, 80),
      email: String(email).trim(),
      phone_number: phoneNumber,
    };
    if (process.env.DEMIO_WEBINAR_DATE_ID) payload.date_id = Number(process.env.DEMIO_WEBINAR_DATE_ID);
    const response = await fetch(`${DEMIO_BASE}/event/register`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'Api-Secret': apiSecret,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.join_link) {
      console.error('Demio registration failed:', response.status, JSON.stringify(result).slice(0, 300));
      return NextResponse.json({ message: 'Registration failed. Please try again.' }, { status: 502 });
    }
    joinLink = result.join_link;
  } catch (error) {
    console.error('Demio registration error:', error.message);
    return NextResponse.json({ message: 'Registration is temporarily unavailable.' }, { status: 503 });
  }

  // 2) Mirror the lead into the dashboard — best effort, never blocks the registration.
  try {
    await forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
      method: 'POST',
      headers: { 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
      body: JSON.stringify({
        email,
        fullname: String(firstName).trim(),
        phone: phoneNumber,
        tag: 'Webinar — How I\u2019d Buy Today (Aug 2026)',
        leadSource: 'rha-website-webinar',
        form_source: 'website_webinar_how-id-buy_2026-09',
        touchExisting: true,
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
  } catch (error) {
    console.error('Webinar lead mirror failed (non-fatal):', error.message);
  }

  return NextResponse.json({ ok: true, joinLink });
}
