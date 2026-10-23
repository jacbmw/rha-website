// Minimal in-process sliding-window rate limiter for the public suburb
// endpoints. Per-instance (not distributed) — good enough to blunt scraping
// and abuse without adding infrastructure; Layer 1 payloads are additionally
// gated behind a verified lead.

const buckets = new Map(); // key -> number[] (ms timestamps)

export function rateLimited(key, { limit = 60, windowMs = 60000 } = {}) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 20000) {
    // Bounded memory: drop the oldest half when the map balloons.
    const keys = [...buckets.keys()].slice(0, 10000);
    keys.forEach((k) => buckets.delete(k));
  }
  return false;
}

// Counter-based fixed window — O(1) memory per key, so it's cheap enough for
// long windows (e.g. a per-day cap) where a timestamp array would balloon.
const windows = new Map(); // key -> { reset: ms, n: number }

export function fixedWindowLimited(key, { limit, windowMs }) {
  const now = Date.now();
  let w = windows.get(key);
  if (!w || now >= w.reset) {
    w = { reset: now + windowMs, n: 0 };
    windows.set(key, w);
  }
  if (w.n >= limit) return true;
  w.n++;
  if (windows.size > 20000) {
    for (const [k, v] of windows) if (now >= v.reset) windows.delete(k);
    if (windows.size > 20000) {
      [...windows.keys()].slice(0, 10000).forEach((k) => windows.delete(k));
    }
  }
  return false;
}

export function requestIp(request) {
  // On Amplify the real client IP is NOT the last x-forwarded-for entry —
  // Amplify's internal reverse proxy appends its own rotating egress IP after
  // it, so naive rightmost parsing buckets every request under a shared proxy
  // IP (verified in prod). CloudFront-Viewer-Address ("ip:port") is set by
  // CloudFront itself and can't be spoofed — prefer it. Fallback: the entry
  // before Amplify's proxy (second-to-last), since client-supplied XFF
  // entries all sit before the real client.
  const cva = request.headers.get('cloudfront-viewer-address');
  if (cva) {
    const i = cva.lastIndexOf(':');
    if (i > 0) return cva.slice(0, i);
  }
  const ips = String(request.headers.get('x-forwarded-for') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ips[ips.length - 2] || ips[ips.length - 1] || 'unknown';
}
