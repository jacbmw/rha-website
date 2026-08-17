// Strip trailing "general information / not financial advice" disclaimers
// (plus trailing <hr>, empty paragraphs and whitespace) from blog post bodies
// in Webflow CMS and legacy_dev.blog_posts.
//
// Usage:
//   node --env-file=.env scripts/strip-disclaimers.mjs           # dry run
//   node --env-file=.env scripts/strip-disclaimers.mjs --apply   # write changes
//
// A JSON backup of every modified post's original body is written to
// .disclaimer-strip-backup.json before any change is applied.

import { writeFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

const APPLY = process.argv.includes('--apply');
const API = 'https://api.webflow.com/v2';
const COLL = process.env.WEBFLOW_BLOG_COLLECTION_ID || '678b03cab43dc836bed9f0bd';
const HEADERS = {
  Authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`,
  accept: 'application/json',
  'Content-Type': 'application/json',
};

const DISC_RE = /(general information|informational purposes|not\s+(financial|legal|taxation|tax|investment|building|planning)\b[^]{0,120}?advice|does not constitute (financial|legal|tax)|does not take (into account your|your personal)|nothing here is (legal|financial))/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Remove, from the very end of the HTML: whitespace, <hr>, empty/br-only
// paragraphs, and paragraph blocks whose text matches DISC_RE. Stops at the
// first real content block.
function stripTail(html) {
  let s = String(html || '');
  for (;;) {
    const t = s.replace(/(\s|&nbsp;)+$/g, '');
    if (t !== s) { s = t; continue; }
    // trailing <hr> or empty <p> (possibly containing only <br>/&nbsp;/whitespace)
    let m = s.match(/(<hr[^>]*\/?>|<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>)$/i);
    if (m) { s = s.slice(0, s.length - m[1].length); continue; }
    // trailing paragraph — take the last <p ...> ... </p> block
    if (!/<\/p>$/i.test(s)) break;
    const idx = s.toLowerCase().lastIndexOf('<p');
    if (idx < 0) break;
    const block = s.slice(idx);
    // Only treat as a block if it's a single paragraph (no nested closing </p> before the end)
    if ((block.match(/<\/p>/gi) || []).length !== 1) break;
    const text = block.replace(/<[^>]+>/g, ' ');
    if (!DISC_RE.test(text)) break;
    s = s.slice(0, idx);
  }
  return s.replace(/(\s|&nbsp;)+$/g, '');
}

async function webflowItems() {
  let items = [];
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`${API}/collections/${COLL}/items?limit=100&offset=${offset}`, { headers: HEADERS });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.message || `list failed (${res.status})`);
    items = items.concat(body.items || []);
    if (items.length >= (body.pagination?.total || 0)) return items;
  }
}

async function patchWebflowItem(id, postBody, attempt = 0) {
  const res = await fetch(`${API}/collections/${COLL}/items/${id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ fieldData: { 'post-body': postBody } }),
  });
  if (res.status === 429 && attempt < 5) {
    const wait = Number(res.headers.get('retry-after') || 15) * 1000;
    await sleep(wait);
    return patchWebflowItem(id, postBody, attempt + 1);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message || `patch failed (${res.status})`);
}

const backup = { createdAt: new Date().toISOString(), webflow: [], db: [] };

// ---- Webflow ----
const items = await webflowItems();
const wfChanges = [];
for (const item of items) {
  const body = item.fieldData?.['post-body'] || '';
  const stripped = stripTail(body);
  if (stripped !== body) {
    wfChanges.push({ id: item.id, slug: item.fieldData?.slug, name: item.fieldData?.name, body, stripped });
  }
}
console.log(`Webflow: ${wfChanges.length}/${items.length} posts need changes`);
for (const c of wfChanges.slice(0, 5)) {
  console.log(`  - ${String(c.name).slice(0, 60)}`);
  console.log(`    removed: ${c.body.slice(c.stripped.length).replace(/\s+/g, ' ').slice(0, 160)}...`);
}

// ---- DB ----
const conn = await mysql.createConnection({
  host: process.env.RIPEHOUSE_DB_HOST,
  port: Number(process.env.RIPEHOUSE_DB_PORT || 3306),
  user: process.env.RIPEHOUSE_DB_USER,
  password: process.env.RIPEHOUSE_DB_PASSWORD,
  database: 'legacy_dev',
});
const [rows] = await conn.query('SELECT id, title, content FROM blog_posts');
const dbChanges = [];
for (const row of rows) {
  const stripped = stripTail(row.content);
  if (stripped !== row.content) dbChanges.push({ id: row.id, title: row.title, content: row.content, stripped });
}
console.log(`DB (legacy_dev.blog_posts): ${dbChanges.length}/${rows.length} posts need changes`);
for (const c of dbChanges) console.log(`  - ${String(c.title).slice(0, 60)}`);

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to write changes.');
  await conn.end();
  process.exit(0);
}

// ---- Backup, then apply ----
backup.webflow = wfChanges.map(({ id, slug, body }) => ({ id, slug, 'post-body': body }));
backup.db = dbChanges.map(({ id, content }) => ({ id, content }));
writeFileSync('.disclaimer-strip-backup.json', JSON.stringify(backup, null, 2));
console.log(`\nBackup written to .disclaimer-strip-backup.json (${backup.webflow.length} webflow, ${backup.db.length} db)`);

let done = 0;
for (const c of wfChanges) {
  await patchWebflowItem(c.id, c.stripped);
  done++;
  if (done % 10 === 0) console.log(`  webflow: ${done}/${wfChanges.length}`);
  await sleep(1100); // stay under Webflow's 60 req/min
}
console.log(`Webflow: updated ${done} items`);

for (const c of dbChanges) {
  await conn.execute('UPDATE blog_posts SET content = ? WHERE id = ?', [c.stripped, c.id]);
}
console.log(`DB: updated ${dbChanges.length} rows`);
await conn.end();
