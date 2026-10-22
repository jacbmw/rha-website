#!/usr/bin/env node
// Submits Ripehouse Advisory's live sitemaps + /llms.txt to IndexNow
// (Bing, ChatGPT Search, Microsoft Copilot, Perplexity index).
// Usage: npm run seo:indexnow

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au').replace(/\/$/, '');
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'rha8f4e2a9c1b7d3e6f0a5c8b2d4e9f1';

async function fetchSitemapUrls(sitemapUrl) {
  const res = await fetch(sitemapUrl, { headers: { 'User-Agent': 'rha-indexnow/1.0' } });
  if (!res.ok) throw new Error(`${sitemapUrl} returned HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function postBatch(urlList, label) {
  const host = new URL(SITE_URL).host;
  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation, urlList }),
  });
  console.log(`[IndexNow] ${label}: submitted ${urlList.length} URLs -> HTTP ${res.status}`);
}

async function main() {
  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
  const keyCheck = await fetch(keyLocation, { headers: { 'User-Agent': 'rha-indexnow/1.0' } });
  if (!keyCheck.ok) {
    console.error(
      `\n[IndexNow] Hold on! ${keyLocation} returned HTTP ${keyCheck.status} on the live site.\n` +
      `IndexNow requires the verification file (public/${INDEXNOW_KEY}.txt) to be deployed to production first.\n` +
      `-> Commit & push rha-website to deploy, wait ~2 minutes for Amplify to finish, then re-run: npm run seo:indexnow\n`
    );
    process.exit(1);
  }

  const mainUrls = await fetchSitemapUrls(`${SITE_URL}/sitemap.xml`);
  const priorityUrls = [
    `${SITE_URL}/llms.txt`,
    `${SITE_URL}/llms-full.txt`,
    ...mainUrls,
  ];
  await postBatch([...new Set(priorityUrls)].slice(0, 10000), 'Primary Sitemap (Core + Cities + LGAs + Blog + Case Studies)');

  for (const id of [0, 1]) {
    try {
      const subUrls = await fetchSitemapUrls(`${SITE_URL}/suburbs/sitemap/${id}.xml`);
      if (subUrls.length) {
        await postBatch(subUrls.slice(0, 10000), `Suburbs Sitemap #${id}`);
      }
    } catch (err) {
      console.warn(`[IndexNow] Suburbs Sitemap #${id} skipped:`, err.message);
    }
  }

  for (const id of [0, 1, 2, 3]) {
    try {
      const streetUrls = await fetchSitemapUrls(`${SITE_URL}/streets/sitemap/${id}.xml`);
      if (streetUrls.length) {
        await postBatch(streetUrls.slice(0, 10000), `Streets Sitemap #${id}`);
      }
    } catch (err) {
      console.warn(`[IndexNow] Streets Sitemap #${id} skipped:`, err.message);
    }
  }
}

main().catch((err) => {
  console.error('[IndexNow] Fatal:', err);
  process.exit(1);
});
