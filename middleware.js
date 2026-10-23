// middleware.js — runs before every non-static request.
// NOTE: uses the deprecated `middleware` convention on purpose. Next 16 renamed
// it to `proxy.js`, but Amplify Hosting only supports Next <= 15 and its
// adapter does not recognise proxy.js — the file compiled but never ran in
// prod (verified: 40 requests to a limited tier, zero 429s). Keep this name.
//
// Two defenses against scraper/bot floods (the rotating-IP SG traffic that
// per-IP limits alone didn't stop):
//
// 1. Per-IP budgets — a per-minute burst cap AND a per-day budget, tiered by
//    request signals. Buckets are in-process per Amplify SSR instance, so the
//    ceiling scales with concurrency but still turns floods into trickles.
//
// 2. Turnstile human challenge — challenged traffic gets 302'd to /challenge;
//    solving sets a signed IP-bound `rha_human` cookie (24h) that skips it.
//    Triggered for: viewers in RHA_CHALLENGE_COUNTRIES (default SG),
//    rate-limit trippers, and failed search-crawler verification. Bots that
//    can't run the puzzle die on the redirect; real humans solve once.
//
// UAs claiming Googlebot/Bing/DuckDuckGo/Applebot are verified by PTR/forward
// DNS over DoH (lib/challenge.js — edge runtime, no node:dns). Verified = never
// challenged + generous caps. A claim whose rDNS resolves but doesn't match is
// a proven fake → challenged immediately. A DoH outage ('error') falls back to
// a bounded bot tier so real crawlers are never locked out by our upstream.
//
// Env:
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY  enable the challenge
//   RHA_CHALLENGE_SECRET    cookie signing (falls back to unlock/leads secrets)
//   RHA_CHALLENGE_COUNTRIES comma-separated ISO codes to challenge (def. SG)
//   RHA_RATE_LIMIT_ALLOWLIST  comma-separated IPs (or "1.2.3." prefixes) to skip
//   RHA_RATE_LIMIT_DISABLED   set "1" to bypass entirely (kill switch)

import { NextResponse } from 'next/server';
import { rateLimited, fixedWindowLimited, requestIp } from './lib/rateLimit';
import {
  CHALLENGE_COOKIE_NAME,
  claimsSearchCrawler,
  verifyChallengeCookie,
  verifyCrawlerIp,
  viewerCountry,
} from './lib/challenge';

// Search crawlers here are rDNS-verified; everything else is trusted-but-capped.
const SEARCH_CRAWLER_UA =
  /googlebot|google-inspectiontool|googleother|adsbot|apis-google|feedfetcher|bingbot|msnbot|bingpreview|duckduckbot|applebot/i;

const OTHER_BOT_UA =
  /slurp|baiduspider|yandex|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|pinterest|uptimerobot|pingdom|gptbot|oai-searchbot|chatgpt-user|claudebot|perplexitybot/i;

const SCRAPER_UA =
  /python|curl|wget|scrapy|httpclient|go-http-client|okhttp|headless|phantom|selenium|playwright|puppeteer|libwww|java\/|axios|node-fetch|undici/i;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

function policyFor({ ua, hasSecFetch, crawlerStatus }) {
  if (crawlerStatus === 'yes') return { perMin: 600, perDay: 30_000 };
  if (crawlerStatus === 'error') return { perMin: 300, perDay: 10_000 }; // DoH down: don't kill real crawlers
  if (!ua) return { perMin: 20, perDay: 300 };
  if (crawlerStatus === 'no' || SEARCH_CRAWLER_UA.test(ua)) return { perMin: 30, perDay: 500 };
  if (OTHER_BOT_UA.test(ua)) return { perMin: 300, perDay: 10_000 };
  if (SCRAPER_UA.test(ua)) return { perMin: 30, perDay: 500 };
  // Modern browsers send Sec-Fetch-* on every nav/fetch; HTTP libs faking a
  // desktop UA usually don't, so spoofers land in the cheaper tier.
  return hasSecFetch ? { perMin: 120, perDay: 5_000 } : { perMin: 60, perDay: 2_000 };
}

const allowlist = (process.env.RHA_RATE_LIMIT_ALLOWLIST || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const challengeCountries = new Set(
  (process.env.RHA_CHALLENGE_COUNTRIES || 'SG')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
);

function isAllowlisted(ip) {
  return allowlist.some((e) => (e.endsWith('.') ? ip.startsWith(e) : ip === e));
}

function tooMany(status = 429) {
  return new NextResponse('Too Many Requests', {
    status,
    headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
  });
}

export async function middleware(request) {
  if (process.env.RHA_RATE_LIMIT_DISABLED === '1') return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname === '/challenge' || pathname.startsWith('/api/challenge')) {
    return NextResponse.next();
  }

  const ip = requestIp(request);
  if (isAllowlisted(ip)) return NextResponse.next();

  // TEMP DIAGNOSTIC: report middleware execution state on every response.
  const country = viewerCountry(request);
  const diag = () =>
    `v1 c=${country || '??'} key=${process.env.TURNSTILE_SECRET_KEY ? 1 : 0} ip=${ip}`;

  const ua = request.headers.get('user-agent') || '';
  const human = await verifyChallengeCookie(request.cookies.get(CHALLENGE_COOKIE_NAME)?.value, ip);
  const crawlerStatus =
    !human && claimsSearchCrawler(ua) ? await verifyCrawlerIp(ip, ua) : 'none';

  const policy = policyFor({
    ua,
    hasSecFetch: !!(request.headers.get('sec-fetch-mode') || request.headers.get('sec-fetch-dest')),
    crawlerStatus,
  });
  const limited =
    rateLimited(`proxy:m:${ip}`, { limit: policy.perMin, windowMs: MINUTE_MS }) ||
    fixedWindowLimited(`proxy:d:${ip}`, { limit: policy.perDay, windowMs: DAY_MS });

  // Verified humans/crawlers get a clean 429 if they somehow still trip the
  // budget — redirecting a solved human back to the challenge would loop.
  if (human || crawlerStatus === 'yes' || crawlerStatus === 'error') {
    const r = limited ? tooMany() : NextResponse.next();
    r.headers.set('x-rha-mw', `${diag()} lim=${limited ? 1 : 0} crawl=${crawlerStatus}`);
    return r;
  }

  const challengeConfigured = !!process.env.TURNSTILE_SECRET_KEY;
  const challenged =
    challengeConfigured &&
    (challengeCountries.has(viewerCountry(request)) || limited || crawlerStatus === 'no');

  if (challenged) {
    if (!rateLimited(`proxy-log:${ip}`, { limit: 1, windowMs: MINUTE_MS })) {
      console.warn(`[proxy] challenge ${ip} ${viewerCountry(request) || '??'} ${ua || '(no ua)'}`);
    }
    // Page navigations can solve; API/RSC/asset traffic gets a plain 429.
    if (request.method === 'GET' && !pathname.startsWith('/api/')) {
      const url = new URL('/challenge', request.url);
      url.searchParams.set('next', pathname + search);
      const r = NextResponse.redirect(url);
      r.headers.set('x-rha-mw', `${diag()} challenged crawl=${crawlerStatus}`);
      return r;
    }
    const r = tooMany();
    r.headers.set('x-rha-mw', `${diag()} challenged-nonget crawl=${crawlerStatus}`);
    return r;
  }

  if (limited) {
    if (!rateLimited(`proxy-log:${ip}`, { limit: 1, windowMs: MINUTE_MS })) {
      console.warn(`[proxy] 429 ${ip} ${ua || '(no ua)'}`);
    }
    const r = tooMany();
    r.headers.set('x-rha-mw', `${diag()} limited`);
    return r;
  }

  const r = NextResponse.next();
  r.headers.set('x-rha-mw', `${diag()} pass crawl=${crawlerStatus}`);
  return r;
}

export const config = {
  matcher: [
    // All paths except Next internals and static-asset file extensions.
    // Sitemaps/robots/feed/llms.txt stay rate-limited — they're prime scrape
    // targets, and verified crawlers sit on the generous tier anyway.
    '/((?!_next/|.*\\.(?:css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|webm|json)).*)',
  ],
};
