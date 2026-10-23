// proxy.js — Next 16 replacement for the deprecated middleware.js convention.
// Runs on the Node.js runtime before every non-static request.
//
// Per-IP rate limiting to blunt scrapers/bots (e.g. the single-IP floods we've
// seen out of Singapore). Two layers per IP: a per-minute burst cap AND a
// per-day budget — the daily cap is what stops a patient scraper from pulling
// the whole site at 120/min over a few days. Buckets are in-process: each
// Amplify SSR instance keeps its own Maps, so the effective ceiling can scale
// with concurrency — still turns an abusive flood into a trickle without
// adding infra (WAF on the CloudFront distribution remains the stronger fix
// if this isn't enough).
//
// Tiers per request, keyed on the REAL client IP (see lib/rateLimit.js):
//   - self-declared legit crawlers (googlebot, bingbot, social/AI bots the
//     robots.txt already welcomes): generous caps. UA is spoofable, but a
//     spoofed UA now caps at 600/min + 30k/day instead of unlimited.
//   - empty UA / known scraper UAs (curl, python-requests, scrapy, headless):
//     tight caps — real browsers always send a UA.
//   - browser UA WITH Sec-Fetch-* headers: real browsing headroom. Modern
//     browsers send Sec-Fetch-Mode/Dest on every nav and fetch; HTTP libs
//     faking a Chrome UA usually don't, so spoofers land in the cheaper tier.
//   - browser UA WITHOUT Sec-Fetch: middling caps for old browsers/webviews.
//
// Env:
//   RHA_RATE_LIMIT_ALLOWLIST  comma-separated IPs (or "1.2.3." prefixes) to skip
//   RHA_RATE_LIMIT_DISABLED   set "1" to bypass entirely (kill switch)

import { NextResponse } from 'next/server';
import { rateLimited, fixedWindowLimited, requestIp } from './lib/rateLimit';

const BOT_UA =
  /googlebot|google-inspectiontool|googleother|adsbot|apis-google|feedfetcher|bingbot|msnbot|bingpreview|slurp|duckduckbot|baiduspider|yandex|applebot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|pinterest|uptimerobot|pingdom|gptbot|oai-searchbot|chatgpt-user|claudebot|perplexitybot/i;

const SCRAPER_UA =
  /python|curl|wget|scrapy|httpclient|go-http-client|okhttp|headless|phantom|selenium|playwright|puppeteer|libwww|java\/|axios|node-fetch|undici/i;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

function policyFor(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!ua) return { perMin: 20, perDay: 300 };
  if (BOT_UA.test(ua)) return { perMin: 600, perDay: 30_000 };
  if (SCRAPER_UA.test(ua)) return { perMin: 30, perDay: 500 };
  const looksLikeBrowser =
    request.headers.get('sec-fetch-mode') || request.headers.get('sec-fetch-dest');
  return looksLikeBrowser ? { perMin: 120, perDay: 5_000 } : { perMin: 60, perDay: 2_000 };
}

const allowlist = (process.env.RHA_RATE_LIMIT_ALLOWLIST || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowlisted(ip) {
  return allowlist.some((e) => (e.endsWith('.') ? ip.startsWith(e) : ip === e));
}

export function proxy(request) {
  if (process.env.RHA_RATE_LIMIT_DISABLED === '1') return NextResponse.next();

  const ip = requestIp(request);
  const { perMin, perDay } = policyFor(request);
  const limited =
    !isAllowlisted(ip) &&
    (rateLimited(`proxy:m:${ip}`, { limit: perMin, windowMs: MINUTE_MS }) ||
      fixedWindowLimited(`proxy:d:${ip}`, { limit: perDay, windowMs: DAY_MS }));
  if (limited) {
    // Log once per IP per window — a flood shouldn't flood the logs too.
    if (!rateLimited(`proxy-log:${ip}`, { limit: 1, windowMs: MINUTE_MS })) {
      console.warn(`[proxy] 429 ${ip} ${request.headers.get('user-agent') || '(no ua)'}`);
    }
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // All paths except Next internals and static-asset file extensions.
    // Sitemaps/robots/feed/llms.txt stay rate-limited — they're prime scrape
    // targets, and legit crawlers sit on the generous bot tier anyway.
    '/((?!_next/|.*\\.(?:css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|webm|json)).*)',
  ],
};
