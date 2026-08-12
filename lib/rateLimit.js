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

export function requestIp(request) {
  return String(request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}
