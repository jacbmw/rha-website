import { SITE_URL } from './seo.js';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'rha8f4e2a9c1b7d3e6f0a5c8b2d4e9f1';

export async function submitIndexNow(urls = []) {
  const cleanUrls = [...new Set((urls || []).filter(Boolean))];
  if (!cleanUrls.length) return { ok: true, submitted: 0 };

  const host = new URL(SITE_URL).host;
  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation,
        urlList: cleanUrls.slice(0, 10000),
      }),
      signal: AbortSignal.timeout(15000),
    });
    return { ok: response.ok, status: response.status, submitted: Math.min(cleanUrls.length, 10000) };
  } catch (error) {
    console.warn('[IndexNow] submission warning:', error.message);
    return { ok: false, error: error.message, submitted: 0 };
  }
}
