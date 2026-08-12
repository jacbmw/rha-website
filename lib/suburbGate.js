// Server-side unlock verification for the Layer 1 scorecard. After a verified
// lead create/identify we set a signed HttpOnly cookie; returning identified
// visitors present it and skip the email form (never re-gate someone who
// already paid an email). The scorecard payload itself is only ever returned
// by the server after this check — it is not shipped in the initial HTML.

import crypto from 'crypto';

const COOKIE_NAME = 'rha_suburb_unlock';
const MAX_AGE_DAYS = 180;

function secret() {
  return process.env.RHA_SUBURB_UNLOCK_SECRET || process.env.RHA_LEADS_API_KEY || '';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function buildUnlockCookie({ email, firstName = '' }) {
  const payload = Buffer.from(JSON.stringify({ e: email, n: firstName, t: Date.now() })).toString('base64url');
  return {
    name: COOKIE_NAME,
    value: `${payload}.${sign(payload)}`,
    options: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_DAYS * 86400,
    },
  };
}

export function readUnlockCookie(cookieValue) {
  if (!cookieValue || !secret()) return null;
  const [payload, signature] = String(cookieValue).split('.');
  if (!payload || !signature) return null;
  try {
    const expected = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.e || Date.now() - data.t > MAX_AGE_DAYS * 86400 * 1000) return null;
    return { email: data.e, firstName: data.n || '' };
  } catch {
    return null;
  }
}

export const UNLOCK_COOKIE_NAME = COOKIE_NAME;
