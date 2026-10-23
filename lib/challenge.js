// Server-side helpers for the Turnstile human challenge. A visitor who solves
// the puzzle gets a signed HttpOnly cookie bound to their client IP, so a
// rotating botnet has to solve once per IP per day instead of sharing one
// token across the fleet. Cookie format mirrors suburbGate.js.

import crypto from 'crypto';
import dns from 'dns/promises';

const COOKIE_NAME = 'rha_human';
const MAX_AGE_SEC = 86400; // 24h

function secret() {
  return (
    process.env.RHA_CHALLENGE_SECRET ||
    process.env.RHA_SUBURB_UNLOCK_SECRET ||
    process.env.RHA_LEADS_API_KEY ||
    ''
  );
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function buildChallengeCookie(ip) {
  const payload = Buffer.from(JSON.stringify({ ip, t: Date.now() })).toString('base64url');
  return {
    name: COOKIE_NAME,
    value: `${payload}.${sign(payload)}`,
    options: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SEC,
    },
  };
}

export function verifyChallengeCookie(cookieValue, ip) {
  if (!cookieValue || !secret()) return false;
  const [payload, signature] = String(cookieValue).split('.');
  if (!payload || !signature) return false;
  try {
    const expected = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.ip === ip && Date.now() - data.t < MAX_AGE_SEC * 1000;
  } catch {
    return false;
  }
}

export const CHALLENGE_COOKIE_NAME = COOKIE_NAME;

// Amplify forwards CloudFront-Viewer-Country to SSR; the alternates cover
// Vercel/Cloudflare if the site is ever moved.
export function viewerCountry(request) {
  return (
    request.headers.get('cloudfront-viewer-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    ''
  ).toUpperCase();
}

// UAs that claim to be a major search crawler get reverse-DNS verified:
// PTR must end in the engine's domain and forward-resolve back to the IP.
// Real Googlebot passes and is never challenged; a faked UA gets treated as
// a scraper. Result is cached per IP — verification only runs on crawler
// claims, so it's a handful of lookups a day.
const CRAWLER_RULES = [
  { ua: /googlebot|google-inspectiontool|googleother|adsbot|apis-google|feedfetcher/i, suffixes: ['.googlebot.com', '.google.com'] },
  { ua: /bingbot|msnbot|bingpreview/i, suffixes: ['.search.msn.com'] },
  { ua: /duckduckbot/i, suffixes: ['.duckduckgo.com'] },
  { ua: /applebot/i, suffixes: ['.applebot.apple.com'] },
];

const verifyCache = new Map(); // ip -> { ok, until }

export function claimsSearchCrawler(ua) {
  return CRAWLER_RULES.some((r) => r.ua.test(ua));
}

export async function verifyCrawlerIp(ip, ua) {
  const rule = CRAWLER_RULES.find((r) => r.ua.test(ua));
  if (!rule || ip === 'unknown') return false;
  const cached = verifyCache.get(ip);
  if (cached && cached.until > Date.now()) return cached.ok;
  let ok = false;
  try {
    const hosts = await dns.reverse(ip);
    for (const host of hosts.map((h) => h.toLowerCase())) {
      if (!rule.suffixes.some((s) => host.endsWith(s))) continue;
      const addrs = await dns
        .resolve4(host)
        .catch(() => dns.resolve6(host))
        .catch(() => []);
      if (addrs.includes(ip)) {
        ok = true;
        break;
      }
    }
  } catch {
    // PTR lookup failed — unverified.
  }
  verifyCache.set(ip, { ok, until: Date.now() + 86400_000 });
  if (verifyCache.size > 5000) {
    const now = Date.now();
    for (const [k, v] of verifyCache) if (v.until <= now) verifyCache.delete(k);
    if (verifyCache.size > 5000) verifyCache.clear();
  }
  return ok;
}
