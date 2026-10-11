#!/usr/bin/env node
// Nightly Street Score bake.
//
// Computes every street in every suburb with lib/streets.js (the single
// source of the formula — the pages fall back to the same function live) and
// writes the results to warehouse.street_score_bake / street_score_suburb_bake.
// The pages read the bake first (~10ms) and only compute live for suburbs not
// yet baked. The bake also powers national/state percentiles and the street
// sitemaps.
//
// Usage:
//   node scripts/bake-streets.mjs                     # stalest suburbs first, 180-minute budget
//   node scripts/bake-streets.mjs --budget-minutes 60
//   node scripts/bake-streets.mjs --suburb tas/battery-point [--suburb vic/frankston]
//   node scripts/bake-streets.mjs --all               # ignore freshness, re-bake everything in budget
//   node scripts/bake-streets.mjs --max-age-days 25   # re-bake suburbs older than this (default 25)
//
// Env: RIPEHOUSE_DB_HOST / USER / PASSWORD / PORT (same as the site). Reads
// .env from the repo root when present. Safe to interrupt — each suburb is
// written in its own transaction and the run resumes from the stalest suburb.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['.env.local', '.env']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const { getRegistry, findSuburbBySlug, getWarehousePool } = await import('../lib/suburbs.js');
const { computeSuburbStreets, BAKE_TABLE, SUBURB_BAKE_TABLE } = await import('../lib/streets.js');

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const budgetMs = Number(flag('budget-minutes', 180)) * 60000;
const maxAgeDays = Number(flag('max-age-days', 25));
const all = args.includes('--all');
const onlySuburbs = args.flatMap((a, i) => (a === '--suburb' ? [args[i + 1]] : []));

const db = getWarehousePool();

async function ensureTables() {
  await db.query(`CREATE TABLE IF NOT EXISTS ${SUBURB_BAKE_TABLE} (
    ssc_id INT NOT NULL PRIMARY KEY,
    name VARCHAR(128) NOT NULL, state CHAR(3) NOT NULL, slug VARCHAR(160) NOT NULL,
    average INT NULL, street_count INT NOT NULL DEFAULT 0, scored_streets INT NOT NULL DEFAULT 0, addresses INT NOT NULL DEFAULT 0,
    rent DECIMAL(9,2) NULL, rent_lower DECIMAL(9,2) NULL, rent_upper DECIMAL(9,2) NULL, yield_rate DECIMAL(8,5) NULL,
    as_of VARCHAR(16) NULL, as_of_date DATE NULL,
    duration_ms INT NULL, error TEXT NULL,
    baked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_baked_at (baked_at), KEY idx_state_slug (state, slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await db.query(`CREATE TABLE IF NOT EXISTS ${BAKE_TABLE} (
    ssc_id INT NOT NULL, slug VARCHAR(120) NOT NULL,
    name VARCHAR(160) NOT NULL, state CHAR(3) NOT NULL,
    addresses INT NOT NULL DEFAULT 0, scored_addresses INT NOT NULL DEFAULT 0,
    score INT NULL, gap INT NULL, \`rank\` INT NULL, tied INT NOT NULL DEFAULT 0,
    owner_occ DECIMAL(6,4) NULL, public_housing DECIMAL(6,4) NULL, rent DECIMAL(9,2) NULL, yield_rate DECIMAL(8,5) NULL,
    sold_price INT NULL, sold_min INT NULL, sold_max INT NULL, sa1_count INT NOT NULL DEFAULT 0,
    confidence VARCHAR(8) NOT NULL DEFAULT 'low',
    listings_count INT NOT NULL DEFAULT 0, listings_median INT NULL, listings_last VARCHAR(16) NULL,
    sa1_json JSON NULL,
    baked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ssc_id, slug),
    KEY idx_score (score), KEY idx_state_score (state, score), KEY idx_confidence (confidence), KEY idx_baked_at (baked_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

const round = (v, places = 4) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 10 ** places) / 10 ** places);

async function bakeSuburb(entry) {
  const started = Date.now();
  const conn = await db.getConnection();
  try {
    const data = await computeSuburbStreets(entry);
    const { suburb, streets } = data;
    await conn.beginTransaction();
    await conn.query(`DELETE FROM ${BAKE_TABLE} WHERE ssc_id = ?`, [entry.id]);
    const cols = ['ssc_id', 'slug', 'name', 'state', 'addresses', 'scored_addresses', 'score', 'gap', 'rank', 'tied', 'owner_occ', 'public_housing', 'rent', 'yield_rate', 'sold_price', 'sold_min', 'sold_max', 'sa1_count', 'confidence', 'listings_count', 'listings_median', 'listings_last', 'sa1_json', 'baked_at'];
    for (let i = 0; i < streets.length; i += 200) {
      const chunk = streets.slice(i, i + 200);
      const values = chunk.map((s) => [
        entry.id, s.slug, s.name.slice(0, 160), entry.state,
        s.addresses, s.sa1Breakdown.filter((b) => b.score !== null).reduce((sum, b) => sum + b.addresses, 0),
        s.score, s.gap, s.rank, s.tied || 0,
        round(s.ownerOcc), round(s.publicHousing), round(s.rent, 2), round(s.yieldRate, 5),
        s.soldPrice === null ? null : Math.round(s.soldPrice), s.soldPriceRange ? Math.round(s.soldPriceRange[0]) : null, s.soldPriceRange ? Math.round(s.soldPriceRange[1]) : null,
        s.sa1Count, s.confidence,
        s.listings.count, s.listings.medianPropertyScore === null ? null : Math.round(s.listings.medianPropertyScore), s.listings.lastListed,
        JSON.stringify(s.sa1Breakdown), new Date(),
      ]);
      await conn.query(`INSERT INTO ${BAKE_TABLE} (${cols.map((c) => `\`${c}\``).join(',')}) VALUES ?`, [values]);
    }
    await conn.query(
      `REPLACE INTO ${SUBURB_BAKE_TABLE} (ssc_id, name, state, slug, average, street_count, scored_streets, addresses, rent, rent_lower, rent_upper, yield_rate, as_of, as_of_date, duration_ms, error, baked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NOW())`,
      [entry.id, entry.name, entry.state, entry.slug, suburb.average, suburb.streetCount, suburb.scoredStreets, suburb.addresses,
        round(suburb.rent, 2), round(suburb.rentLower, 2), round(suburb.rentUpper, 2), round(suburb.yieldRate, 5), suburb.asOf, suburb.asOfDate ? new Date(suburb.asOfDate) : null, Date.now() - started]
    );
    await conn.commit();
    return { streets: streets.length, ms: Date.now() - started };
  } catch (error) {
    await conn.rollback().catch(() => {});
    await db.query(
      `INSERT INTO ${SUBURB_BAKE_TABLE} (ssc_id, name, state, slug, duration_ms, error, baked_at) VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE error = VALUES(error), duration_ms = VALUES(duration_ms), baked_at = VALUES(baked_at)`,
      [entry.id, entry.name, entry.state, entry.slug, Date.now() - started, String(error.message).slice(0, 2000)]
    ).catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

async function main() {
  await ensureTables();
  let targets;
  if (onlySuburbs.length) {
    targets = [];
    for (const path of onlySuburbs) {
      const [state, slug] = path.split('/');
      const entry = await findSuburbBySlug(state, slug);
      if (!entry) console.error('Unknown suburb:', path);
      else targets.push(entry);
    }
  } else {
    const { entries } = await getRegistry();
    const [baked] = await db.query(`SELECT ssc_id, baked_at, error FROM ${SUBURB_BAKE_TABLE}`);
    const bakedAt = new Map(baked.map((r) => [Number(r.ssc_id), { at: new Date(r.baked_at).getTime(), error: r.error }]));
    const cutoff = Date.now() - maxAgeDays * 864e5;
    targets = entries
      .filter((e) => all || !bakedAt.has(e.id) || bakedAt.get(e.id).at < cutoff)
      // never baked → oldest → most recent; errored suburbs retry after the others
      .sort((a, b) => ((bakedAt.get(a.id)?.error ? 1 : 0) - (bakedAt.get(b.id)?.error ? 1 : 0)) || ((bakedAt.get(a.id)?.at || 0) - (bakedAt.get(b.id)?.at || 0)));
  }
  console.log(`[bake] ${targets.length} suburbs to bake · budget ${Math.round(budgetMs / 60000)} min`);
  const started = Date.now();
  let done = 0;
  let failed = 0;
  let streets = 0;
  for (const entry of targets) {
    if (Date.now() - started > budgetMs) { console.log('[bake] budget reached'); break; }
    try {
      const result = await bakeSuburb(entry);
      done += 1;
      streets += result.streets;
      if (done % 25 === 0 || result.ms > 10000) console.log(`[bake] ${done}/${targets.length} ${entry.state}/${entry.slug} ${result.streets} streets ${result.ms}ms`);
    } catch (error) {
      failed += 1;
      console.error(`[bake] FAILED ${entry.state}/${entry.slug}: ${error.message}`);
    }
  }
  console.log(`[bake] finished: ${done} suburbs, ${streets} streets, ${failed} failed, ${Math.round((Date.now() - started) / 60000)} min`);
  await db.end();
  process.exit(failed && !done ? 1 : 0);
}

main().catch((error) => { console.error('[bake] fatal:', error); process.exit(1); });
