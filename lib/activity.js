// Client-side guest activity tracker. Every meaningful interaction on the
// Street Score funnel (views, scroll depth, time on page, segment taps, gate
// focus/submit, consent ticks, profile answers, CTA clicks, searches) is
// queued and posted in batches straight to the dashboard's
// POST /api/ir/activity (browser-direct, like the IR pageview, so the server
// sees the visitor's real IP). Rows land in rha_ir_activity keyed by
// visitor_id and are linked to the rha_lead the moment the visitor is
// identified — so the full anonymous journey is analysable per lead.

import { getVisitorId, getAttribution, isBotBrowser } from './visitor';

const IR_BASE = process.env.NEXT_PUBLIC_RHA_IR_URL || 'https://dashboard.picki.com.au';
const FLUSH_MS = 4000;
const MAX_BATCH = 25;

let queue = [];
let timer = null;
let listening = false;

function sessionId() {
  try {
    let sid = sessionStorage.getItem('rha_sid');
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem('rha_sid', sid);
    }
    return sid;
  } catch {
    return null;
  }
}

function flush() {
  clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const events = queue.splice(0, MAX_BATCH);
  try {
    fetch(`${IR_BASE}/api/ir/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
  if (queue.length) flush();
}

function listen() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
}

// context: { pageKey, streetKey, suburbId, segment, ...props }
export function trackActivity(eventType, context = {}) {
  if (typeof window === 'undefined' || isBotBrowser()) return;
  listen();
  const { pageKey, streetKey, suburbId, segment, ...props } = context;
  const attribution = getAttribution();
  queue.push({
    visitor_id: getVisitorId(),
    session_id: sessionId(),
    event_type: String(eventType).slice(0, 60),
    page_key: pageKey || null,
    page_url: window.location.href.split('?')[0],
    street_key: streetKey || null,
    suburb_id: suburbId || null,
    segment: segment || null,
    utm_source: attribution.utmSource || null,
    utm_medium: attribution.utmMedium || null,
    utm_campaign: attribution.utmCampaign || null,
    utm_content: attribution.utmContent || null,
    rha_src: attribution.entrySource || null,
    rha_ref: attribution.entryRef || null,
    props: Object.keys(props).length ? props : null,
    occurred_at: new Date().toISOString(),
  });
  if (queue.length >= MAX_BATCH) flush();
  else if (!timer) timer = setTimeout(flush, FLUSH_MS);
}

// Scroll-depth (25/50/75/100) + engaged-time tracking for a page. Returns a
// cleanup function. Engaged time only counts while the tab is visible.
export function trackEngagement(context) {
  if (typeof window === 'undefined' || isBotBrowser()) return () => {};
  const marks = new Set();
  let visibleSince = document.visibilityState === 'visible' ? Date.now() : null;
  let engagedMs = 0;
  const onScroll = () => {
    const doc = document.documentElement;
    const depth = Math.round(((window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight)) * 100);
    for (const mark of [25, 50, 75, 100]) {
      if (depth >= mark && !marks.has(mark)) {
        marks.add(mark);
        trackActivity('scroll_depth', { ...context, depth: mark });
      }
    }
  };
  const report = () => {
    if (visibleSince) engagedMs += Date.now() - visibleSince;
    visibleSince = null;
    if (engagedMs >= 1000) trackActivity('engaged_time', { ...context, seconds: Math.round(engagedMs / 1000), maxDepth: Math.max(0, ...marks) });
    engagedMs = 0;
  };
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') report();
    else visibleSince = Date.now();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    report();
    flush();
  };
}
