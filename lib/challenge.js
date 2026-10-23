// Runtime-agnostic helpers for the Turnstile human challenge. This module is
// imported by middleware.js, which Next builds for the edge runtime when the
// (deprecated, Amplify-required) middleware filename is used — so NO node:*
// imports are allowed here. HMAC uses Web Crypto and the crawler rDNS check
// uses DNS-over-HTTPS via fetch; both also work under Node, so the API route
// shares the same code.
//
// A visitor who solves the puzzle gets a signed HttpOnly cookie bound to their
// client IP, so a rotating botnet has to solve once per IP per day instead of
// sharing one token across the fleet. Cookie format mirrors suburbGate.js.

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

const encoder = new TextEncoder();

function b64url(input) {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input;
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload))));
}

// Constant-time-ish string compare (edge runtime has no timingSafeEqual).
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function buildChallengeCookie(ip) {
  const payload = b64url(JSON.stringify({ ip, t: Date.now() }));
  return {
    name: COOKIE_NAME,
    value: `${payload}.${await hmac(payload)}`,
    options: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SEC,
    },
  };
}

export async function verifyChallengeCookie(cookieValue, ip) {
  if (!cookieValue || !secret()) return false;
  const [payload, signature] = String(cookieValue).split('.');
  if (!payload || !signature) return false;
  try {
    const expected = await hmac(payload);
    if (!safeEqual(signature, expected)) return false;
    const data = JSON.parse(new TextDecoder().decode(
      Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
    ));
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

// UAs that claim to be a major search crawler get reverse-DNS verified over
// DoH: PTR must end in the engine's domain and forward-resolve back to the IP.
// Real Googlebot passes and is never challenged; a faked UA gets treated as a
// scraper. Returns 'yes' | 'no' | 'error' — 'error' (DoH unreachable) falls
// back to a bounded bot tier instead of challenging, so an outage can't lock
// out a real crawler. Cached per IP.
const CRAWLER_RULES = [
  { ua: /googlebot|google-inspectiontool|googleother|adsbot|apis-google|feedfetcher/i, suffixes: ['.googlebot.com', '.google.com'] },
  { ua: /bingbot|msnbot|bingpreview/i, suffixes: ['.search.msn.com'] },
  { ua: /duckduckbot/i, suffixes: ['.duckduckgo.com'] },
  { ua: /applebot/i, suffixes: ['.applebot.apple.com'] },
];

const verifyCache = new Map(); // ip -> { status, until }

export function claimsSearchCrawler(ua) {
  return CRAWLER_RULES.some((r) => r.ua.test(ua));
}

function expandIPv6(ip) {
  if (ip.includes('.')) return null; // v4-mapped: skip
  const [left, right] = ip.split('::');
  const l = left ? left.split(':') : [];
  const r = right ? right.split(':') : [];
  if (l.length + r.length > 8) return null;
  const mid = Array(8 - l.length - r.length).fill('0000');
  return [...l, ...mid, ...r].map((s) => s.padStart(4, '0')).join('');
}

function ptrName(ip) {
  if (!ip.includes(':')) return `${ip.split('.').reverse().join('.')}.in-addr.arpa`;
  const full = expandIPv6(ip.toLowerCase());
  return full ? `${full.split('').reverse().join('.')}.ip6.arpa` : null;
}

async function doh(name, type) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { accept: 'application/dns-json' } }
  );
  if (!res.ok) throw new Error(`doh ${res.status}`);
  return (await res.json()).Answer || [];
}

export async function verifyCrawlerIp(ip, ua) {
  const rule = CRAWLER_RULES.find((r) => r.ua.test(ua));
  const ptr = rule ? ptrName(ip) : null;
  if (!rule || !ptr) return 'no';

  const cached = verifyCache.get(ip);
  if (cached && cached.until > Date.now()) return cached.status;

  let status = 'no';
  try {
    const answers = await doh(ptr, 'PTR');
    for (const answer of answers) {
      const host = String(answer.data || '').toLowerCase().replace(/\.$/, '');
      if (!rule.suffixes.some((s) => host.endsWith(s))) continue;
      const fwd = await doh(host, ip.includes(':') ? 'AAAA' : 'A');
      const match = ip.includes(':')
        ? fwd.some((a) => expandIPv6(String(a.data || '').toLowerCase()) === expandIPv6(ip.toLowerCase()))
        : fwd.some((a) => a.data === ip);
      if (match) {
        status = 'yes';
        break;
      }
    }
  } catch {
    status = 'error';
  }

  verifyCache.set(ip, {
    status,
    until: Date.now() + (status === 'error' ? 5 * 60_000 : 86_400_000),
  });
  if (verifyCache.size > 5000) {
    const now = Date.now();
    for (const [k, v] of verifyCache) if (v.until <= now) verifyCache.delete(k);
    if (verifyCache.size > 5000) verifyCache.clear();
  }
  return status;
}
