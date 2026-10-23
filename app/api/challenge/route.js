import { NextResponse } from 'next/server';
import { buildChallengeCookie } from '../../../lib/challenge';
import { rateLimited, requestIp } from '../../../lib/rateLimit';

export async function POST(request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'challenge not configured' }, { status: 503 });
  }

  const ip = requestIp(request);
  if (rateLimited(`challenge:${ip}`, { limit: 20, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let token = '';
  try {
    ({ token } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!token) return NextResponse.json({ ok: false }, { status: 400 });

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.success) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const cookie = await buildChallengeCookie(ip);
  const out = NextResponse.json({ ok: true });
  out.cookies.set(cookie.name, cookie.value, cookie.options);
  return out;
}
