// Read-only smoke test for the Webflow CMS integration.
// Run with: node --env-file=.env scripts/test-webflow.mjs
// Mirrors the endpoints lib/webflow.js uses (which can't be imported here
// because it depends on next/cache).

const API_BASE = 'https://api.webflow.com/v2';
const SITE_ID = process.env.WEBFLOW_SITE_ID || '6784a240509d2ca9e7e38e06';
const BLOG_COLLECTION_ID = process.env.WEBFLOW_BLOG_COLLECTION_ID || '678b03cab43dc836bed9f0bd';
const STAFF_COLLECTION_ID = process.env.WEBFLOW_STAFF_COLLECTION_ID || '6786e1e7f29f7f1a8d017d04';

if (!process.env.WEBFLOW_API_KEY) {
  console.error('FAIL: WEBFLOW_API_KEY is not set (did you run with --env-file=.env?)');
  process.exit(1);
}

async function wf(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`,
      accept: 'application/json',
      'User-Agent': 'rha-website/1.0',
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${body?.message || body?.err || ''}`);
  return body;
}

let failed = false;
async function check(label, fn) {
  try {
    const detail = await fn();
    console.log(`PASS  ${label}${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL  ${label} — ${err.message}`);
  }
}

await check('auth / site access', async () => {
  const site = await wf(`/sites/${SITE_ID}`);
  return `site "${site.displayName || site.shortName}"`;
});

await check('blog collection metadata', async () => {
  const meta = await wf(`/collections/${BLOG_COLLECTION_ID}`);
  const fields = (meta.fields || []).map((f) => f.slug);
  const required = ['name', 'slug', 'post-body'];
  const missing = required.filter((f) => !fields.includes(f));
  if (missing.length) throw new Error(`missing expected fields: ${missing.join(', ')}`);
  return `"${meta.displayName}", ${fields.length} fields`;
});

await check('list blog items', async () => {
  const res = await wf(`/collections/${BLOG_COLLECTION_ID}/items?limit=5`);
  const items = res.items || [];
  if (!items.length) throw new Error('no items returned');
  const first = items[0].fieldData || {};
  return `${res.pagination?.total ?? items.length} total; first: "${first.name}" (slug: ${first.slug})`;
});

await check('staff collection (author lookup)', async () => {
  const res = await wf(`/collections/${STAFF_COLLECTION_ID}/items?limit=5`);
  return `${(res.items || []).length} staff item(s) fetched`;
});

process.exit(failed ? 1 : 0);
