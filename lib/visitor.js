// Client-side visitor identity + attribution helpers shared by the funnel
// surfaces (Calendly embed, ebook opt-in). Mirrors the legacy RHA funnel
// script so IDs stay continuous across the old and new sites.

const COOKIE_NAME = 'rha_vid';
const STORAGE_KEY = 'rha_visitor_id';
const COOKIE_DAYS = 90;
const COOKIE_DOMAIN = '.ripehouseadvisory.com.au';

const BOT_UA_RE = /bot|spider|crawl|slurp|facebookexternalhit|bytespider|headlesschrome|prerender|lighthouse|applebot|semrush|ahrefs|mj12bot|dotbot|petalbot|yandex|baiduspider|bingpreview/i;

export function isBotBrowser() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  if (navigator.webdriver) return true;
  if (BOT_UA_RE.test(navigator.userAgent || '')) return true;
  return false;
}

const generateId = () => {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const getCookie = (name) => document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';

const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax;Secure`;
  if (window.location.hostname.endsWith(COOKIE_DOMAIN.slice(1))) {
    document.cookie = `${name}=${value};expires=${expires};path=/;domain=${COOKIE_DOMAIN};SameSite=None;Secure`;
  }
};

export function getVisitorId() {
  let vid;
  try {
    vid = getCookie(COOKIE_NAME) || localStorage.getItem(STORAGE_KEY);
  } catch {
    vid = getCookie(COOKIE_NAME);
  }
  if (!vid) vid = generateId();
  setCookie(COOKIE_NAME, vid, COOKIE_DAYS);
  try { localStorage.setItem(STORAGE_KEY, vid); } catch {}
  return vid;
}

// Meta browser cookies, mirroring the legacy "ir" tracking script: generate
// _fbp ourselves if the pixel hasn't (e.g. blocked), and build _fbc from a
// fbclid landing param so ad-click identity survives for CAPI matching.
export function setFbCookies() {
  const days = 90;
  if (!getCookie('_fbp')) {
    setCookie('_fbp', `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e10)}`, days);
  }
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (fbclid && !getCookie('_fbc')) {
    setCookie('_fbc', `fb.1.${Date.now()}.${fbclid}`, days);
  }
}

// First/last-touch UTM attribution, mirroring the legacy rha-funnel.js and
// rha_attribution_v1 scripts (same localStorage keys and 30-day TTL so
// attribution survives the old-site -> new-site transition).
const UTM_FIRST_KEY = 'rha_utm_first';
const UTM_LAST_KEY = 'rha_utm_last';
const ATTRIBUTION_V1_KEY = 'rha_attribution_v1';
const UTM_TTL = 30 * 24 * 60 * 60 * 1000;
// rha_src / rha_ref are our own entry identifiers, set by the /go/* campaign
// links (rha_src = yt | facebook | blog | other, rha_ref = video id / post
// code) — they ride first/last touch alongside the UTMs.
const PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'fbclid', 'rha_src', 'rha_ref'];

const readStored = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (data && data.expires > Date.now()) return data.params;
  } catch {}
  return null;
};

const currentParams = () => {
  const sp = new URLSearchParams(window.location.search);
  const params = {};
  PARAM_KEYS.forEach((key) => {
    const value = sp.get(key);
    if (value) params[key] = value;
  });
  return params;
};

// Call on every page load / route change. Stores first-touch once
// (first-touch wins) and refreshes last-touch whenever new params arrive.
export function captureTouches() {
  const params = currentParams();
  if (!Object.keys(params).length) return;
  const record = JSON.stringify({ params, expires: Date.now() + UTM_TTL, captured: Date.now() });
  try {
    if (!readStored(UTM_FIRST_KEY)) localStorage.setItem(UTM_FIRST_KEY, record);
    localStorage.setItem(UTM_LAST_KEY, record);
    // Legacy store kept in sync (first-touch wins) for continuity with the
    // old site's rha_attribution_v1 script and anything reading it.
    const legacy = JSON.parse(localStorage.getItem(ATTRIBUTION_V1_KEY) || 'null');
    if (!legacy || legacy.expiresAt <= Date.now()) {
      localStorage.setItem(ATTRIBUTION_V1_KEY, JSON.stringify({ params, expiresAt: Date.now() + UTM_TTL, updatedAt: Date.now() }));
    }
  } catch {}
}

const readLegacyAttribution = () => {
  try {
    const data = JSON.parse(localStorage.getItem(ATTRIBUTION_V1_KEY));
    if (data && data.expiresAt > Date.now()) return data.params;
  } catch {}
  return null;
};

export function getAttribution() {
  captureTouches();
  // First-touch: prefer rha_utm_first, fall back to the legacy
  // rha_attribution_v1 store written by the old site on this domain.
  const firstTouch = readStored(UTM_FIRST_KEY) || readLegacyAttribution() || {};
  const lastTouch = { ...(readStored(UTM_LAST_KEY) || {}), ...currentParams() };
  // Merged view: first-touch wins, last-touch fills the gaps (legacy behaviour).
  const merged = { ...lastTouch, ...firstTouch };
  return {
    pageUrl: window.location.href,
    referrer: document.referrer || undefined,
    gclid: merged.gclid,
    fbclid: merged.fbclid,
    utmSource: merged.utm_source,
    utmMedium: merged.utm_medium,
    utmCampaign: merged.utm_campaign,
    utmContent: merged.utm_content,
    utmTerm: merged.utm_term,
    utmId: merged.utm_id,
    entrySource: merged.rha_src,
    entryRef: merged.rha_ref,
    lastEntrySource: lastTouch.rha_src,
    lastEntryRef: lastTouch.rha_ref,
    firstTouch,
    lastTouch,
  };
}

// Distinct streets / suburbs this browser has checked in the last 30 days —
// feeds the hot-lead rule (3+ streets or 2+ suburbs) on the dashboard.
const CHECKS_KEY = 'rha_street_checks';
const CHECKS_TTL = 30 * 864e5;

export function recordStreetCheck(streetKey, suburbId) {
  try {
    const now = Date.now();
    const checks = JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]').filter((c) => now - c.t < CHECKS_TTL && c.k !== streetKey);
    checks.push({ k: streetKey, s: suburbId, t: now });
    localStorage.setItem(CHECKS_KEY, JSON.stringify(checks.slice(-50)));
  } catch {}
  return getStreetChecks();
}

export function getStreetChecks() {
  try {
    const now = Date.now();
    const checks = JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]').filter((c) => now - c.t < CHECKS_TTL);
    return { streetsChecked: new Set(checks.map((c) => c.k)).size, suburbsChecked: new Set(checks.map((c) => c.s)).size, streetKeys: checks.map((c) => c.k).slice(-10) };
  } catch {
    return { streetsChecked: 0, suburbsChecked: 0, streetKeys: [] };
  }
}
