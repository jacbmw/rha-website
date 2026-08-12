// Suburb data read layer for the "Your Suburb, Scored" widget + pages.
// Reads the pre-baked monthly per-suburb aggregates in warehouse.ssc_data_dump
// (one row per suburb per month, refreshed monthly by the existing bake) via a
// read-only connection — no hot query load on the big source tables. Results
// are memoised in-module and the pages are ISR'd for 24h, so Aurora sees a
// handful of queries per suburb per day at most.

import mysql from 'mysql2/promise';

const MISSING = -999; // sentinel used by the bake for "no data"

let pool;
function getWarehousePool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.RIPEHOUSE_DB_HOST,
      port: Number(process.env.RIPEHOUSE_DB_PORT || 3306),
      user: process.env.RIPEHOUSE_DB_USER,
      password: process.env.RIPEHOUSE_DB_PASSWORD,
      database: 'warehouse',
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 4,
      connectTimeout: 15000,
    });
  }
  return pool;
}

const num = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n !== MISSING ? n : null;
};

export function slugifySuburb(name) {
  return String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function titleCase(value) {
  return String(value || '').toLowerCase().replace(/(^|[\s-'])[a-z]/g, (c) => c.toUpperCase());
}

// ── Latest bake month ────────────────────────────────────────────────────────
let latestMonthCache = { value: null, expires: 0 };

export async function getLatestMonth() {
  if (latestMonthCache.value && latestMonthCache.expires > Date.now()) return latestMonthCache.value;
  const [rows] = await getWarehousePool().query('SELECT MAX(created) latest FROM ssc_data_dump');
  const latest = rows[0]?.latest || null;
  if (latest) latestMonthCache = { value: latest, expires: Date.now() + 6 * 3600 * 1000 };
  return latest;
}

// ── Suburb registry (search + slug resolution) ──────────────────────────────
// ~19k suburb/postcode rows collapsed to one entry per suburb+state. Loaded
// once per process and refreshed daily — this is what makes autosuggest fast.
let registryCache = { entries: null, byKey: null, expires: 0, loading: null };

async function loadRegistry() {
  const db = getWarehousePool();
  const [rows] = await db.query(
    `SELECT s.suburb, s.postcode, s.state, s.ssc_fk
       FROM suburb_ssc s
      WHERE s.ssc_fk IS NOT NULL AND s.ssc_fk <> '' AND s.suburb <> '' AND s.state <> ''`
  );
  const map = new Map(); // "state|slug" -> entry
  for (const row of rows) {
    const name = titleCase(row.suburb);
    const state = String(row.state || '').toUpperCase();
    const slug = slugifySuburb(name);
    if (!slug || !state) continue;
    const key = `${state.toLowerCase()}|${slug}`;
    let entry = map.get(key);
    if (!entry) {
      entry = { id: Number(row.ssc_fk), name, state, slug, postcodes: [] };
      map.set(key, entry);
    }
    const postcode = String(row.postcode || '').trim();
    if (postcode && !entry.postcodes.includes(postcode)) entry.postcodes.push(postcode);
  }
  const entries = [...map.values()];
  entries.forEach((entry) => entry.postcodes.sort());
  return { entries, byKey: map };
}

export async function getRegistry() {
  if (registryCache.entries && registryCache.expires > Date.now()) return registryCache;
  if (!registryCache.loading) {
    registryCache.loading = loadRegistry()
      .then((data) => {
        registryCache = { ...data, expires: Date.now() + 24 * 3600 * 1000, loading: null };
        return registryCache;
      })
      .catch((error) => {
        registryCache.loading = null;
        throw error;
      });
  }
  // Serve stale registry while a refresh is in flight.
  if (registryCache.entries) return registryCache;
  return registryCache.loading;
}

export async function searchSuburbs(query, limit = 8) {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  const { entries } = await getRegistry();
  const isPostcode = /^\d{2,4}$/.test(q);
  const results = [];
  if (isPostcode) {
    for (const entry of entries) {
      if (entry.postcodes.some((p) => p.startsWith(q))) results.push(entry);
      if (results.length >= limit * 3) break;
    }
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    const starts = [];
    const wordStarts = [];
    for (const entry of entries) {
      const name = entry.name.toLowerCase();
      if (name.startsWith(q)) starts.push(entry);
      else if (name.includes(` ${q}`) || name.includes(`-${q}`)) wordStarts.push(entry);
      if (starts.length >= limit * 3) break;
    }
    starts.sort((a, b) => a.name.localeCompare(b.name));
    results.push(...starts, ...wordStarts);
  }
  return results.slice(0, limit).map((entry) => ({
    id: entry.id,
    name: entry.name,
    state: entry.state,
    postcode: entry.postcodes[0] || '',
    postcodes: entry.postcodes,
    slug: `${entry.state.toLowerCase()}/${entry.slug}`,
  }));
}

export async function findSuburbBySlug(state, slug) {
  const { byKey } = await getRegistry();
  return byKey.get(`${String(state || '').toLowerCase()}|${String(slug || '').toLowerCase()}`) || null;
}

export async function findSuburbById(id) {
  const { entries } = await getRegistry();
  const sscId = Number(id);
  return entries.find((entry) => entry.id === sscId) || null;
}

export async function listSuburbSlugs() {
  const { entries } = await getRegistry();
  return entries.map((entry) => ({ state: entry.state.toLowerCase(), slug: entry.slug }));
}

// ── History + snapshot ───────────────────────────────────────────────────────

const HISTORY_FIELDS = 'created, r_raw, r_perc, ac_raw, ap_raw, ab_raw, au_raw, ae_raw, aa_raw, af_raw, an_raw';

async function fetchHistory(sscId, months = 40) {
  const db = getWarehousePool();
  const [rows] = await db.query(
    `SELECT ${HISTORY_FIELDS} FROM ssc_data_dump WHERE ssc_id = ? ORDER BY created DESC LIMIT ${Number(months) * 2}`,
    [Number(sscId)]
  );
  // The bake occasionally writes duplicate rows for a month — keep the first
  // (latest id wins because of the DESC scan) per calendar month.
  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const monthKey = new Date(row.created).toISOString().slice(0, 7);
    if (seen.has(monthKey)) continue;
    seen.add(monthKey);
    deduped.push(row);
    if (deduped.length >= months) break;
  }
  return deduped.reverse(); // oldest → newest
}

async function fetchLatestRow(sscId) {
  const db = getWarehousePool();
  const [rows] = await db.query(
    'SELECT * FROM ssc_data_dump WHERE ssc_id = ? ORDER BY created DESC LIMIT 1',
    [Number(sscId)]
  );
  return rows[0] || null;
}

async function fetchRank(month, rRaw) {
  if (rRaw === null) return { rank: null, total: null };
  const db = getWarehousePool();
  const [rows] = await db.query(
    `SELECT SUM(r_raw > ?) better, COUNT(*) total FROM ssc_data_dump WHERE created = ? AND r_raw IS NOT NULL AND r_raw <> ${MISSING}`,
    [rRaw, month]
  );
  const total = Number(rows[0]?.total || 0);
  if (!total) return { rank: null, total: null };
  return { rank: Number(rows[0].better) + 1, total };
}

// Verdict bands — calm, factual, and written so a low score never reads as a
// judgement of someone's home. Compliance sentence is rendered alongside on
// every page.
export function verdictForScore(score) {
  if (score === null) return null;
  if (score >= 90) return { band: 'strong', label: 'Among the strongest markets in the country right now', detail: 'Current buyer and rental conditions here rank in the top tier of the 15,000 suburbs we measure this month.' };
  if (score >= 70) return { band: 'solid', label: 'Market conditions here are running warmer than most', detail: 'Most of the demand and supply indicators we track are sitting above the national midpoint this month.' };
  if (score >= 40) return { band: 'mixed', label: 'A mixed market — some indicators warm, others cooling', detail: 'Conditions here are neither running hot nor cold. The detail below shows which indicators are doing the work.' };
  return { band: 'cool', label: 'Current market conditions here are quieter than most', detail: 'A lower score describes measured market conditions right now — not your home, your street, or where this market goes next.' };
}

function confidenceFor(row, salesDelta) {
  // Sparse data guard: if the core reads are missing, or the market is so thin
  // the bake couldn't produce them, we suppress the verdict and say so plainly.
  const core = [row.r_perc, row.ac_raw, row.ap_raw, row.au_raw, row.ae_raw];
  const missing = core.filter((v) => num(v) === null).length;
  if (missing >= 2 || num(row.r_perc) === null) return 'low';
  if (missing === 1 || salesDelta === null) return 'medium';
  return 'high';
}

function monthLabel(date) {
  return new Intl.DateTimeFormat('en-AU', { month: 'short', year: 'numeric' }).format(new Date(date));
}

export async function getSuburbSnapshot(entry) {
  const [latest, history] = await Promise.all([fetchLatestRow(entry.id), fetchHistory(entry.id, 14)]);
  if (!latest) return null;
  const score = num(latest.r_perc);
  const { rank, total } = await fetchRank(latest.created, num(latest.r_raw));

  const price = num(latest.ac_raw);
  const yearAgo = history.find((row) => {
    const diff = (new Date(latest.created) - new Date(row.created)) / (30.44 * 864e5);
    return diff >= 11 && diff <= 13.5;
  });
  const priceYearAgo = yearAgo ? num(yearAgo.ac_raw) : null;
  const priceChange12m = price !== null && priceYearAgo ? ((price - priceYearAgo) / priceYearAgo) * 100 : null;

  const rent = num(latest.ap_raw);
  const grossYield = num(latest.ab_raw);
  const vacancy = num(latest.au_raw);
  const dom = num(latest.ae_raw);
  const salesDelta = num(latest.aa_raw);
  const confidence = confidenceFor(latest, salesDelta);

  return {
    id: entry.id,
    name: entry.name,
    state: entry.state,
    postcodes: entry.postcodes,
    slug: `${entry.state.toLowerCase()}/${entry.slug}`,
    lga: latest.lga_name ? String(latest.lga_name).replace(/\s*\([A-Z]+\)\s*$/, '') : null,
    asOf: monthLabel(latest.created),
    score,
    rank,
    total,
    verdict: confidence === 'low' ? null : verdictForScore(score),
    confidence,
    stats: {
      medianPrice: price,
      priceChange12m: priceChange12m === null ? null : Math.round(priceChange12m * 10) / 10,
      medianRent: rent,
      grossYield: grossYield === null ? null : Math.round(grossYield * 1000) / 10,
      vacancy: vacancy === null ? null : Math.round(vacancy * 1000) / 10,
      daysOnMarket: dom === null ? null : Math.round(dom),
    },
    // Blurred preview shapes for the locked scorecard: real recent score curve
    // values only (no labels/axis served) — proof there's more, not the data.
    previewShape: history.slice(-12).map((row) => num(row.r_perc) ?? 0),
  };
}

// ── Scorecard (Layer 1 — served only after a verified lead) ─────────────────

const COMPONENT_GROUPS = [
  {
    key: 'demand',
    label: 'Buyer demand',
    explain: 'How quickly homes sell and how that pace is changing.',
    fields: ['ae_perc', 'as_perc', 'at_perc', 'aa_perc'],
  },
  {
    key: 'supply',
    label: 'Supply & ownership',
    explain: 'How tightly held the suburb is — owner-occupiers, rental stock and public housing mix.',
    fields: ['aj_perc', 'ao_perc', 'ak_perc', 'aw_perc'],
  },
  {
    key: 'momentum',
    label: 'Price momentum',
    explain: 'How prices here are moving against the state and the wider council area.',
    fields: ['af_perc', 'an_perc', 'ah_perc', 'aq_perc'],
  },
  {
    key: 'yield',
    label: 'Yield pressure',
    explain: 'What the rental market is doing — yields, rents and vacancy.',
    fields: ['ab_perc', 'ar_perc', 'au_perc', 'av_perc'],
  },
];

function componentSummary(row) {
  return COMPONENT_GROUPS.map((group) => {
    const values = group.fields.map((field) => num(row[field])).filter((v) => v !== null);
    return {
      key: group.key,
      label: group.label,
      explain: group.explain,
      score: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null,
    };
  });
}

// Rules engine (not an LLM): pick ONE plain-English insight from the history.
function insightSentence(name, history) {
  const scores = history.map((row) => num(row.r_perc)).filter((v) => v !== null);
  const rents = history.map((row) => num(row.ap_raw)).filter((v) => v !== null);
  const prices = history.map((row) => num(row.ac_raw)).filter((v) => v !== null);
  const vacancy = num(history[history.length - 1]?.au_raw);
  const last = (arr) => arr[arr.length - 1];

  if (rents.length >= 13) {
    const current = last(rents);
    const priorMax = Math.max(...rents.slice(0, -1));
    const flat = new Set(rents.slice(-13, -1)).size <= 2;
    if (current > priorMax && flat) return `After holding flat for the past year, the median asking rent in ${name} has just moved to a new high — the clearest sign of renewed rental pressure.`;
    if (current > priorMax) return `The median asking rent in ${name} is at its highest point in the last ${rents.length} months of our data.`;
  }
  if (scores.length >= 18 && last(scores) >= Math.max(...scores.slice(-18)) && last(scores) >= 70) {
    return `${name}'s R-Score is at an 18-month high — the broad set of conditions we measure is firmer now than at any point in the last year and a half.`;
  }
  if (prices.length >= 13 && scores.length >= 1) {
    const change = (last(prices) - prices[prices.length - 13]) / prices[prices.length - 13];
    if (change < -0.02 && last(scores) >= 70) return `Prices in ${name} have eased over the past 12 months, but the underlying conditions score is holding firm — the kind of divergence we watch closely.`;
  }
  if (vacancy !== null && vacancy < 0.01) return `Vacancy in ${name} is under 1% — in practical terms, renters here are competing for almost every listing.`;
  if (scores.length >= 6) {
    const direction = last(scores) - scores[scores.length - 6];
    if (direction >= 15) return `${name}'s score has climbed ${Math.round(direction)} points over the past six months — conditions here are firming.`;
    if (direction <= -15) return `${name}'s score has come off ${Math.round(Math.abs(direction))} points over the past six months — conditions here are cooling from their recent peak.`;
  }
  return `The full picture for ${name} is in the charts above — the score history is the fastest way to see which way this market is leaning.`;
}

export async function getSuburbScorecard(entry) {
  const [latest, history] = await Promise.all([fetchLatestRow(entry.id), fetchHistory(entry.id, 38)]);
  if (!latest) return null;

  const series = history.map((row) => ({
    month: new Date(row.created).toISOString().slice(0, 7),
    score: num(row.r_perc),
    price: num(row.ac_raw),
    rent: num(row.ap_raw),
    dom: num(row.ae_raw) === null ? null : Math.round(num(row.ae_raw)),
    vacancy: num(row.au_raw),
  }));

  const deltaVsLga = num(latest.an_raw);
  const salesDelta = num(latest.aa_raw);

  return {
    asOf: monthLabel(latest.created),
    scoreHistory: series.slice(-18).map(({ month, score }) => ({ month, score })),
    priceHistory: series.slice(-36).map(({ month, price }) => ({ month, price })),
    rentHistory: series.slice(-36).map(({ month, rent }) => ({ month, rent })),
    domHistory: series.slice(-36).map(({ month, dom }) => ({ month, dom })),
    components: componentSummary(latest),
    supply: {
      salesDelta,
      deltaVsLga,
      note: deltaVsLga === null ? null : deltaVsLga > 0
        ? 'Prices here are running ahead of the wider council area — buyers are paying a premium to get into this suburb specifically.'
        : 'Prices here sit below the wider council area — this suburb is not currently commanding a premium over its neighbours.',
    },
    insight: insightSentence(entry.name, history),
  };
}
