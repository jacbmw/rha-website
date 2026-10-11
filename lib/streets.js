// Street Score data layer. Every G-NAF street in a suburb is scored with the
// rhi "street score" (sweetspot) method — the same rules the daily property
// bake applies to listed properties (rhi SearchController::
// helperCalculateScoreSweetspot + AbsHelpers::buildOutArea), so streets with
// no listing history still get a real, reproducible number:
//
//   Each address -> 2021 mesh block -> SA1. Per SA1:
//     owner-occupier share (ABS 2021 G37) > 65%   AND public housing <= 5%
//       + SA1 median rent  >= suburb median rent  AND SA1 yield >= suburb yield -> 100
//       + either rent or yield test passes                                     ->  75
//       + neither                                                              ->  50
//     only one of the two tenure tests passes                                  ->  25
//     neither tenure test passes                                               ->   0
//   Street score = address-weighted mean of its SA1 scores.
//   Suburb street average = address-weighted mean across every address.
//
// Listed-property scores from real_estate.daily_property_bake are attached as
// supporting evidence where a street has listing history. One suburb is
// computed per request and memoised in-process for 24h (pages are ISR'd).

import { findSuburbById, getWarehousePool, num, slugifySuburb } from './suburbs.js';

const CACHE_MS = 24 * 3600 * 1000;
const MIN_ADDRESSES = 5; // fewer than this = low confidence, noindex
const OWNER_OCC_LINE = 0.65;
const PUBLIC_HOUSING_LINE = 0.05;
const RENT_VS_OWN = { depositShare: 0.2, rate: 0.0625, years: 30, ownerCostsShare: 0.01 };

const STREET_TYPE_ALIASES = {
  ST: 'STREET', RD: 'ROAD', AVE: 'AVENUE', AV: 'AVENUE', DR: 'DRIVE', DRV: 'DRIVE', CT: 'COURT', CRT: 'COURT',
  PL: 'PLACE', CRES: 'CRESCENT', CR: 'CRESCENT', CRS: 'CRESCENT', TCE: 'TERRACE', PDE: 'PARADE', HWY: 'HIGHWAY',
  LN: 'LANE', CL: 'CLOSE', BVD: 'BOULEVARD', BLVD: 'BOULEVARD', CCT: 'CIRCUIT', GR: 'GROVE', GRV: 'GROVE',
  ESP: 'ESPLANADE', SQ: 'SQUARE', PKWY: 'PARKWAY', WY: 'WAY', CIR: 'CIRCLE', HTS: 'HEIGHTS', MWS: 'MEWS',
  PROM: 'PROMENADE', RDGE: 'RIDGE', RTT: 'RETREAT', TRL: 'TRAIL', VW: 'VIEW', WK: 'WALK', GDNS: 'GARDENS',
};

const titleCase = (value) => String(value || '').toLowerCase().replace(/(^|[\s-'])[a-z]/g, (c) => c.toUpperCase());
const round1 = (value) => (value === null ? null : Math.round(value * 10) / 10);
const median = (values) => {
  const sorted = values.filter((v) => v !== null && Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const weighted = (items, pick) => {
  let total = 0;
  let weight = 0;
  for (const item of items) {
    const value = pick(item);
    if (value === null || !Number.isFinite(value)) continue;
    total += value * item.addresses;
    weight += item.addresses;
  }
  return weight ? total / weight : null;
};

export function streetKey(sscId, slug) {
  return `${Number(sscId)}~${slug}`;
}

export function parseStreetKey(key) {
  const match = /^(\d+)~([a-z0-9-]{1,120})$/.exec(String(key || ''));
  return match ? { sscId: Number(match[1]), slug: match[2] } : null;
}

// Normalise a listing address ("12/3 Newcastle St") to the G-NAF street form
// ("NEWCASTLE STREET") so listing evidence can be matched to streets.
export function streetFromAddress(address) {
  const tail = String(address || '').split(',')[0].trim().toUpperCase()
    .replace(/^(UNIT|APT|APARTMENT|SHOP|LOT|VILLA|SUITE)\s+\S+\s*/, '')
    .replace(/^[\dA-Z]*\d[\dA-Z]*\s*[/-]\s*/, '')
    .replace(/^\d+[A-Z]?(\s*-\s*\d+[A-Z]?)?\s+/, '');
  const words = tail.split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const last = words[words.length - 1].replace(/\.$/, '');
  words[words.length - 1] = STREET_TYPE_ALIASES[last] || last;
  return words.join(' ');
}

// rhi helperCalculateScoreSweetspot, verbatim rules.
export function sweetspotScore({ ownerOcc, publicHousing, rent, yieldRate }, suburb) {
  if (ownerOcc === null || publicHousing === null) return null;
  const oo = ownerOcc > OWNER_OCC_LINE;
  const ph = publicHousing <= PUBLIC_HOUSING_LINE;
  if (oo && ph) {
    if (suburb.rent !== null && suburb.yieldRate !== null) {
      const rentPass = rent !== null && rent >= suburb.rent;
      const yieldPass = yieldRate !== null && yieldRate >= suburb.yieldRate;
      if (rentPass && yieldPass) return 100;
      if (rentPass || yieldPass) return 75;
    }
    return 50;
  }
  return oo || ph ? 25 : 0;
}

export function verdictForStreet(score, gap) {
  if (score === null) return null;
  const relative = gap === null ? '' : gap >= 10
    ? ' It is running ahead of most of the suburb around it.'
    : gap <= -10
      ? ' It sits below the suburb average — which is exactly the kind of thing worth knowing before you buy.'
      : ' It sits roughly in line with the rest of the suburb.';
  if (score >= 85) return { band: 'strong', label: 'A street with the profile we look for', detail: `High owner-occupation, little public housing, and rents and yields at or above the suburb median.${relative}` };
  if (score >= 60) return { band: 'solid', label: 'A solid street profile', detail: `Most of the street-level tests we apply are passing here.${relative}` };
  if (score >= 30) return { band: 'mixed', label: 'A mixed street profile', detail: `Some of the street-level tests pass, others don't — the detail shows which.${relative}` };
  return { band: 'cool', label: 'This street profile is weaker than most', detail: `A low street score describes the tenure and rental profile of the blocks this street runs through — not your home.${relative}` };
}

// ── Suburb street table (memoised) ──────────────────────────────────────────

const cache = new Map(); // sscId -> { data, expires, loading }

async function fetchStreetSa1Rows(db, entry) {
  const locality = String(entry.name || '').replace(/\s*\(.*\)\s*$/, '').toUpperCase();
  const [rows] = await db.query(
    `SELECT /*+ MAX_EXECUTION_TIME(30000) */ sl.street_name, sl.street_type_code, m.sa1_code21 AS sa1, COUNT(*) AS addresses
       FROM gnaf_aug_2024.LOCALITY l
       JOIN gnaf_aug_2024.STATE s ON s.state_pid = l.state_pid AND s.state_abbreviation = ?
       JOIN gnaf_aug_2024.STREET_LOCALITY sl ON sl.locality_pid = l.locality_pid
       JOIN gnaf_aug_2024.ADDRESS_DETAIL ad ON ad.street_locality_pid = sl.street_locality_pid
       JOIN gnaf_aug_2024.ADDRESS_MESH_BLOCK_2021 amb ON amb.address_detail_pid = ad.address_detail_pid
       JOIN gnaf_aug_2024.MB_2021 mb ON mb.mb_2021_pid = amb.mb_2021_pid
       JOIN abs.mb_2021_aust_gda2020 m ON m.mb_code21 = mb.mb_2021_code
      WHERE l.locality_name = ?
      GROUP BY sl.street_name, sl.street_type_code, m.sa1_code21`,
    [entry.state, locality]
  );
  return rows;
}

async function fetchSa1Data(db, sa1s) {
  if (!sa1s.length) return { tenure: new Map(), market: new Map() };
  const [tenureRows] = await db.query(
    `SELECT SA1_CODE_2021 AS sa1, O_OR_Total + O_MTG_Total AS owners, R_ST_h_auth_Total + R_Com_Hp_Total AS public_renters, Total_Total AS total
       FROM rhi.\`2021Census_G37_AUST_SA1\` WHERE SA1_CODE_2021 IN (?)`,
    [sa1s]
  );
  const [marketRows] = await db.query(
    'SELECT sa1, rent, rent_yield, sold_price, sold_count, rent_count FROM warehouse.Production_sa1_yield WHERE sa1 IN (?)',
    [sa1s]
  );
  const tenure = new Map();
  for (const row of tenureRows) {
    const total = num(row.total);
    if (!total || tenure.has(String(row.sa1))) continue;
    tenure.set(String(row.sa1), { ownerOcc: num(row.owners) / total, publicHousing: num(row.public_renters) / total, residents: total });
  }
  const market = new Map();
  for (const row of marketRows) {
    if (market.has(String(row.sa1))) continue;
    market.set(String(row.sa1), {
      rent: num(row.rent) || null,
      yieldRate: num(row.rent_yield) || null,
      soldPrice: num(row.sold_price) || null,
      soldCount: num(row.sold_count) || 0,
      rentCount: num(row.rent_count) || 0,
    });
  }
  return { tenure, market };
}

async function fetchSuburbMarket(db, sscId) {
  const [[rent]] = await db.query(
    "SELECT median, lower_quantile, upper_quantile, date FROM warehouse.hpc_rent WHERE type = 'ssc' AND property_category = 'all' AND id = ? ORDER BY date DESC LIMIT 1",
    [String(sscId)]
  );
  const [[yieldRow]] = await db.query(
    "SELECT mid_yield, date FROM warehouse.hpc_yield WHERE type = 'ssc' AND property_category = 'all' AND id = ? ORDER BY date DESC LIMIT 1",
    [String(sscId)]
  );
  return {
    rent: num(rent?.median),
    rentLower: num(rent?.lower_quantile),
    rentUpper: num(rent?.upper_quantile),
    yieldRate: num(yieldRow?.mid_yield),
    asOf: rent?.date || yieldRow?.date || null,
  };
}

// Listed-property evidence from the daily bake (one row per listing per day,
// ~154M rows). A full 3-year range scan is far too heavy for a page request,
// so sample the bake on the 1st of each of the last 36 months (catches ~75%
// of listed properties) and keep the latest row per property. ssc_id is a
// VARCHAR — it MUST be bound as a string or MySQL drops the index and scans
// the whole table.
const LISTING_MONTHS = 36;

async function fetchListingEvidence(db, sscId) {
  const now = new Date();
  const days = Array.from({ length: LISTING_MONTHS }, (_, i) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)).toISOString().slice(0, 10));
  const [rows] = await db.query(
    `SELECT /*+ MAX_EXECUTION_TIME(15000) */ u_id, address, overall_perc, created
       FROM real_estate.daily_property_bake FORCE INDEX (idx_dp_ssc_created_agent_phone_uid)
      WHERE ssc_id = ? AND (${days.map(() => '(created >= ? AND created < DATE_ADD(?, INTERVAL 1 DAY))').join(' OR ')})`,
    [String(sscId), ...days.flatMap((d) => [d, d])]
  );
  const latest = new Map(); // u_id -> row
  for (const row of rows) {
    const prior = latest.get(row.u_id);
    if (!prior || new Date(row.created) > new Date(prior.created)) latest.set(row.u_id, row);
  }
  const byStreet = new Map();
  for (const row of latest.values()) {
    const street = streetFromAddress(row.address);
    if (!street) continue;
    const bucket = byStreet.get(street) || { scores: [], count: 0, lastListed: null };
    bucket.count += 1;
    const perc = num(row.overall_perc);
    if (perc !== null) bucket.scores.push(perc);
    const created = row.created ? new Date(row.created) : null;
    if (created && (!bucket.lastListed || created > bucket.lastListed)) bucket.lastListed = created;
    byStreet.set(street, bucket);
  }
  return byStreet;
}

function monthLabel(date) {
  return date ? new Intl.DateTimeFormat('en-AU', { month: 'short', year: 'numeric' }).format(new Date(date)) : null;
}

// Full live computation for one suburb. Used by the nightly bake
// (scripts/bake-streets.mjs) and as the fallback when a suburb has no fresh
// baked rows yet.
export async function computeSuburbStreets(entry) {
  const db = getWarehousePool();
  const [rows, suburbMarket, listings] = await Promise.all([
    fetchStreetSa1Rows(db, entry),
    fetchSuburbMarket(db, entry.id),
    fetchListingEvidence(db, entry.id).catch((error) => {
      console.warn('[streets] listing evidence unavailable:', error.message);
      return new Map();
    }),
  ]);
  const sa1s = [...new Set(rows.map((row) => String(row.sa1)).filter(Boolean))];
  const { tenure, market } = await fetchSa1Data(db, sa1s);

  const sa1Profiles = new Map();
  for (const sa1 of sa1s) {
    const t = tenure.get(sa1) || { ownerOcc: null, publicHousing: null };
    const m = market.get(sa1) || { rent: null, yieldRate: null, soldPrice: null };
    sa1Profiles.set(sa1, { sa1, ...t, ...m, score: sweetspotScore({ ...t, ...m }, suburbMarket) });
  }

  const streets = new Map(); // gnaf "NAME TYPE" -> street
  for (const row of rows) {
    const gnafName = [row.street_name, row.street_type_code].filter(Boolean).join(' ').toUpperCase();
    const slug = slugifySuburb(gnafName);
    if (!slug) continue;
    const street = streets.get(slug) || { slug, gnafName, name: titleCase(gnafName), addresses: 0, scoredAddresses: 0, sa1s: [] };
    const profile = sa1Profiles.get(String(row.sa1));
    const addresses = Number(row.addresses) || 0;
    street.addresses += addresses;
    if (profile) {
      street.sa1s.push({ ...profile, addresses });
      if (profile.score !== null) street.scoredAddresses += addresses;
    }
    streets.set(slug, street);
  }

  const list = [];
  let suburbWeight = 0;
  let suburbTotal = 0;
  for (const street of streets.values()) {
    const scored = street.sa1s.filter((s) => s.score !== null);
    const score = scored.length ? Math.round(weighted(scored, (s) => s.score)) : null;
    if (score !== null) {
      suburbWeight += street.scoredAddresses;
      suburbTotal += score * street.scoredAddresses;
    }
    const listing = listings.get(street.gnafName);
    const coverage = street.addresses ? street.scoredAddresses / street.addresses : 0;
    list.push({
      key: streetKey(entry.id, street.slug),
      slug: street.slug,
      name: street.name,
      addresses: street.addresses,
      score,
      ownerOcc: weighted(scored, (s) => s.ownerOcc),
      publicHousing: weighted(scored, (s) => s.publicHousing),
      rent: weighted(street.sa1s, (s) => s.rent),
      yieldRate: weighted(street.sa1s, (s) => s.yieldRate),
      soldPrice: weighted(street.sa1s, (s) => s.soldPrice),
      soldPriceRange: (() => {
        const prices = street.sa1s.map((s) => s.soldPrice).filter((v) => v);
        return prices.length ? [Math.min(...prices), Math.max(...prices)] : null;
      })(),
      sa1Count: street.sa1s.length,
      confidence: score === null || street.addresses < MIN_ADDRESSES || coverage < 0.5
        ? 'low'
        : suburbMarket.rent === null || suburbMarket.yieldRate === null ? 'medium' : 'high',
      listings: listing ? {
        count: listing.count,
        medianPropertyScore: median(listing.scores),
        lastListed: monthLabel(listing.lastListed),
      } : { count: 0, medianPropertyScore: null, lastListed: null },
      sa1Breakdown: street.sa1s.map((s) => ({
        sa1: s.sa1, addresses: s.addresses, score: s.score,
        ownerOcc: s.ownerOcc, publicHousing: s.publicHousing, rent: s.rent, yieldRate: s.yieldRate,
      })),
    });
  }

  const average = suburbWeight ? Math.round(suburbTotal / suburbWeight) : null;
  const ranked = list.filter((s) => s.score !== null);
  for (const street of list) {
    street.gap = street.score === null || average === null ? null : street.score - average;
    street.rank = street.score === null ? null : 1 + ranked.filter((s) => s.score > street.score).length;
    // Scores are a 5-step scale, so ties are the norm — "#1 of 37" when 36
    // streets share the score is misleading. Carry the tie count so the page
    // can say so.
    street.tied = street.score === null ? 0 : ranked.filter((s) => s.score === street.score).length - 1;
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  console.log('[streets] suburb computed live:', entry.id, entry.name, list.length, 'streets');
  return {
    suburb: {
      id: entry.id,
      name: entry.name,
      state: entry.state,
      slug: entry.slug,
      average,
      streetCount: list.length,
      scoredStreets: ranked.length,
      addresses: list.reduce((sum, s) => sum + s.addresses, 0),
      rent: suburbMarket.rent,
      rentLower: suburbMarket.rentLower,
      rentUpper: suburbMarket.rentUpper,
      yieldRate: suburbMarket.yieldRate,
      asOf: monthLabel(suburbMarket.asOf),
      asOfDate: suburbMarket.asOf,
      source: 'live',
    },
    streets: list,
    bySlug: new Map(list.map((s) => [s.slug, s])),
  };
}

// ── Baked read path ─────────────────────────────────────────────────────────
// scripts/bake-streets.mjs writes warehouse.street_score_bake (one row per
// street) + street_score_suburb_bake nightly. Reading those is ~10ms vs 1-6s
// for a live computation, and it is what makes national percentiles and the
// street sitemaps possible.

export const BAKE_TABLE = 'street_score_bake';
export const SUBURB_BAKE_TABLE = 'street_score_suburb_bake';
const BAKE_MAX_AGE_DAYS = 45;

export async function loadBakedSuburb(entry) {
  const db = getWarehousePool();
  const [[suburbRow]] = await db.query(
    `SELECT * FROM ${SUBURB_BAKE_TABLE} WHERE ssc_id = ? AND error IS NULL AND baked_at >= DATE_SUB(NOW(), INTERVAL ${BAKE_MAX_AGE_DAYS} DAY) LIMIT 1`,
    [entry.id]
  ).catch((error) => {
    if (/doesn't exist/i.test(error.message)) return [[null]];
    throw error;
  });
  if (!suburbRow) return null;
  const [rows] = await db.query(`SELECT * FROM ${BAKE_TABLE} WHERE ssc_id = ? ORDER BY name`, [entry.id]);
  if (!rows.length) return null;
  const list = rows.map((r) => {
    const sa1s = typeof r.sa1_json === 'string' ? JSON.parse(r.sa1_json) : (r.sa1_json || []);
    return {
      key: streetKey(entry.id, r.slug),
      slug: r.slug,
      name: r.name,
      addresses: Number(r.addresses) || 0,
      score: num(r.score),
      gap: num(r.gap),
      rank: num(r.rank),
      tied: Number(r.tied) || 0,
      ownerOcc: num(r.owner_occ),
      publicHousing: num(r.public_housing),
      rent: num(r.rent),
      yieldRate: num(r.yield_rate),
      soldPrice: num(r.sold_price),
      soldPriceRange: r.sold_min !== null && r.sold_max !== null ? [Number(r.sold_min), Number(r.sold_max)] : null,
      sa1Count: Number(r.sa1_count) || 0,
      confidence: r.confidence || 'low',
      listings: { count: Number(r.listings_count) || 0, medianPropertyScore: num(r.listings_median), lastListed: r.listings_last || null },
      sa1Breakdown: sa1s,
    };
  });
  return {
    suburb: {
      id: entry.id,
      name: entry.name,
      state: entry.state,
      slug: entry.slug,
      average: num(suburbRow.average),
      streetCount: Number(suburbRow.street_count) || list.length,
      scoredStreets: Number(suburbRow.scored_streets) || 0,
      addresses: Number(suburbRow.addresses) || 0,
      rent: num(suburbRow.rent),
      rentLower: num(suburbRow.rent_lower),
      rentUpper: num(suburbRow.rent_upper),
      yieldRate: num(suburbRow.yield_rate),
      asOf: suburbRow.as_of || null,
      asOfDate: suburbRow.as_of_date || null,
      source: 'bake',
      bakedAt: suburbRow.baked_at,
    },
    streets: list,
    bySlug: new Map(list.map((s) => [s.slug, s])),
  };
}

async function buildSuburbStreets(entry) {
  const baked = await loadBakedSuburb(entry).catch((error) => {
    console.warn('[streets] bake read failed, computing live:', error.message);
    return null;
  });
  return baked || computeSuburbStreets(entry);
}

// Reliable (indexable) streets in the bake — drives the street sitemap batch count.
export async function countIndexableStreets() {
  try {
    const [[row]] = await getWarehousePool().query(`SELECT COUNT(*) AS n FROM ${BAKE_TABLE} WHERE confidence <> 'low' AND score IS NOT NULL`);
    return Number(row?.n || 0);
  } catch {
    return 0;
  }
}

// National / state distribution of street scores (reliable streets only),
// from the bake. Null until the first bake has run.
let distributionCache = { value: null, expires: 0 };

export async function getScoreDistribution() {
  if (distributionCache.expires > Date.now()) return distributionCache.value;
  let value = null;
  try {
    const [rows] = await getWarehousePool().query(
      `SELECT state, score, COUNT(*) AS streets FROM ${BAKE_TABLE} WHERE score IS NOT NULL AND confidence <> 'low' GROUP BY state, score`
    );
    if (rows.length) {
      const national = {};
      const byState = {};
      for (const row of rows) {
        const score = Number(row.score);
        const n = Number(row.streets);
        national[score] = (national[score] || 0) + n;
        (byState[row.state] ??= {})[score] = ((byState[row.state] || {})[score] || 0) + n;
      }
      value = { national, byState };
    }
  } catch (error) {
    if (!/doesn't exist/i.test(error.message)) console.warn('[streets] distribution unavailable:', error.message);
  }
  distributionCache = { value, expires: Date.now() + (value ? 6 : 0.5) * 3600 * 1000 };
  return value;
}

function summarise(counts, score) {
  const entries = Object.entries(counts).map(([s, n]) => [Number(s), n]);
  const total = entries.reduce((sum, [, n]) => sum + n, 0);
  if (!total) return null;
  const below = entries.filter(([s]) => s < score).reduce((sum, [, n]) => sum + n, 0);
  const equal = entries.filter(([s]) => s === score).reduce((sum, [, n]) => sum + n, 0);
  const strong = entries.filter(([s]) => s >= 75).reduce((sum, [, n]) => sum + n, 0);
  return {
    streets: total,
    percentile: Math.round(((below + equal / 2) / total) * 100),
    shareBelow: Math.round((below / total) * 100),
    shareStrong: Math.round((strong / total) * 100),
  };
}

export async function getStreetContext(score, state) {
  if (score === null) return null;
  const distribution = await getScoreDistribution();
  if (!distribution) return null;
  return {
    national: summarise(distribution.national, score),
    state: distribution.byState[state] ? summarise(distribution.byState[state], score) : null,
  };
}

export async function getSuburbStreets(entry) {
  const hit = cache.get(entry.id);
  if (hit?.data && hit.expires > Date.now()) return hit.data;
  if (hit?.loading) return hit.data || hit.loading;
  const loading = buildSuburbStreets(entry)
    .then((data) => {
      cache.set(entry.id, { data, expires: Date.now() + CACHE_MS, loading: null });
      if (cache.size > 400) cache.delete(cache.keys().next().value);
      return data;
    })
    .catch((error) => {
      cache.set(entry.id, { ...(cache.get(entry.id) || {}), loading: null });
      throw error;
    });
  cache.set(entry.id, { ...(hit || {}), loading });
  return hit?.data || loading;
}

export async function listStreetNames(entry) {
  const { streets } = await getSuburbStreets(entry);
  return streets.map((s) => ({ name: s.name, slug: s.slug, addresses: s.addresses }));
}

// ── Layer 0 (free) ──────────────────────────────────────────────────────────

export async function getStreetSnapshot(entry, slug) {
  const data = await getSuburbStreets(entry);
  const street = data.bySlug.get(String(slug || '').toLowerCase());
  if (!street) return null;
  const { suburb } = data;
  const tests = {
    ownerOcc: street.ownerOcc === null ? null : street.ownerOcc > OWNER_OCC_LINE,
    publicHousing: street.publicHousing === null ? null : street.publicHousing <= PUBLIC_HOUSING_LINE,
    rent: street.rent === null || suburb.rent === null ? null : street.rent >= suburb.rent,
    yieldRate: street.yieldRate === null || suburb.yieldRate === null ? null : street.yieldRate >= suburb.yieldRate,
  };
  const testValues = Object.values(tests);
  const context = await getStreetContext(street.score, suburb.state).catch(() => null);
  return {
    context, // national / state distribution from the bake (null until baked)
    dataSource: suburb.source,
    key: street.key,
    slug: street.slug,
    name: street.name,
    suburb: { id: suburb.id, name: suburb.name, state: suburb.state, slug: `${suburb.state.toLowerCase()}/${suburb.slug}`, average: suburb.average, streetCount: suburb.scoredStreets, rent: suburb.rent, yieldRate: suburb.yieldRate },
    path: `/streets/${suburb.state.toLowerCase()}/${suburb.slug}/${street.slug}`,
    asOf: suburb.asOf,
    // The two data vintages behind the score — shown on the page, never buried.
    sources: { tenure: '2021 Census', market: suburb.asOf },
    score: street.score,
    gap: street.gap,
    rank: street.rank,
    tied: street.tied,
    addresses: street.addresses,
    blocks: street.sa1Count,
    confidence: street.confidence,
    verdict: street.confidence === 'low' ? null : verdictForStreet(street.score, street.gap),
    tests,
    testsPassed: testValues.filter((v) => v === true).length,
    testsKnown: testValues.filter((v) => v !== null).length,
    stats: {
      ownerOcc: street.ownerOcc === null ? null : Math.round(street.ownerOcc * 100),
      publicHousing: street.publicHousing === null ? null : round1(street.publicHousing * 100),
      rent: street.rent === null ? null : Math.round(street.rent),
      yieldRate: street.yieldRate === null ? null : round1(street.yieldRate * 100),
    },
  };
}

export async function resolveStreetKey(key) {
  const parsed = parseStreetKey(key);
  if (!parsed) return null;
  const entry = await findSuburbById(parsed.sscId);
  if (!entry) return null;
  const snapshot = await getStreetSnapshot(entry, parsed.slug);
  return snapshot ? { entry, snapshot, slug: parsed.slug } : null;
}

// ── Layer 1 (email-gated, segment-branched) ─────────────────────────────────

export const SEGMENTS = ['buying', 'own', 'rent', 'curious'];

const pickPublic = (s) => ({ name: s.name, slug: s.slug, score: s.score, gap: s.gap, addresses: s.addresses, soldPrice: s.soldPrice === null ? null : Math.round(s.soldPrice) });

function betterStreets(street, streets) {
  const better = streets.filter((s) => s.slug !== street.slug && s.score !== null && street.score !== null && s.score > street.score && s.confidence !== 'low');
  const priceMatched = street.soldPrice
    ? better.filter((s) => s.soldPrice && Math.abs(s.soldPrice - street.soldPrice) / street.soldPrice <= 0.2)
    : [];
  const order = (a, b) => b.score - a.score || b.addresses - a.addresses;
  const picks = priceMatched.sort(order).slice(0, 3).map((s) => ({ ...pickPublic(s), priceMatched: true }));
  for (const s of better.sort(order)) {
    if (picks.length >= 3) break;
    if (!picks.some((p) => p.slug === s.slug)) picks.push({ ...pickPublic(s), priceMatched: false });
  }
  return picks;
}

function rentVsOwn(weeklyRent, price) {
  if (!weeklyRent || !price) return null;
  const { depositShare, rate, years, ownerCostsShare } = RENT_VS_OWN;
  const loan = price * (1 - depositShare);
  const r = rate / 12;
  const n = years * 12;
  const monthly = (loan * r) / (1 - (1 + r) ** -n);
  const weeklyRepayment = (monthly * 12) / 52;
  const weeklyOwnerCosts = (price * ownerCostsShare) / 52;
  return {
    price: Math.round(price),
    deposit: Math.round(price * depositShare),
    weeklyRent: Math.round(weeklyRent),
    weeklyRepayment: Math.round(weeklyRepayment),
    weeklyOwnerCosts: Math.round(weeklyOwnerCosts),
    weeklyGap: Math.round(weeklyRepayment + weeklyOwnerCosts - weeklyRent),
    assumptions: `${Math.round(depositShare * 100)}% deposit, ${(rate * 100).toFixed(2)}% p.a. over ${years} years principal & interest, plus ~${Math.round(ownerCostsShare * 100)}% of value a year in rates, insurance and maintenance.`,
  };
}

export async function getStreetReport(entry, slug, segment, { medianPrice = null } = {}) {
  const data = await getSuburbStreets(entry);
  const street = data.bySlug.get(String(slug || '').toLowerCase());
  if (!street) return null;
  const { suburb, streets } = data;
  const seg = SEGMENTS.includes(segment) ? segment : 'curious';
  const reliable = streets.filter((s) => s.score !== null && s.confidence !== 'low');
  const byScore = [...reliable].sort((a, b) => b.score - a.score || b.addresses - a.addresses);

  const report = {
    segment: seg,
    asOf: suburb.asOf,
    drivers: [
      { key: 'ownerOcc', label: 'Owner-occupiers', value: street.ownerOcc === null ? null : `${Math.round(street.ownerOcc * 100)}%`, line: 'above 65%', pass: street.ownerOcc === null ? null : street.ownerOcc > OWNER_OCC_LINE, explain: 'Streets dominated by owner-occupiers tend to be better kept and more tightly held.' },
      { key: 'publicHousing', label: 'Public housing', value: street.publicHousing === null ? null : `${round1(street.publicHousing * 100)}%`, line: '5% or less', pass: street.publicHousing === null ? null : street.publicHousing <= PUBLIC_HOUSING_LINE, explain: 'A high share of public housing changes how a street trades and who it appeals to.' },
      { key: 'rent', label: 'Rent vs suburb median', value: street.rent === null ? null : `$${Math.round(street.rent)}/wk`, line: suburb.rent === null ? 'suburb median n/a' : `≥ $${Math.round(suburb.rent)}/wk`, pass: street.rent === null || suburb.rent === null ? null : street.rent >= suburb.rent, explain: 'Rents at or above the suburb median show tenants will pay a premium to live here.' },
      { key: 'yieldRate', label: 'Yield vs suburb', value: street.yieldRate === null ? null : `${round1(street.yieldRate * 100)}%`, line: suburb.yieldRate === null ? 'suburb yield n/a' : `≥ ${round1(suburb.yieldRate * 100)}%`, pass: street.yieldRate === null || suburb.yieldRate === null ? null : street.yieldRate >= suburb.yieldRate, explain: 'Yield at or above the suburb shows the rent stacks up against what properties cost here.' },
    ],
    blocks: street.sa1Breakdown.map((b) => ({
      addresses: b.addresses,
      score: b.score,
      ownerOcc: b.ownerOcc === null ? null : Math.round(b.ownerOcc * 100),
      publicHousing: b.publicHousing === null ? null : round1(b.publicHousing * 100),
      rent: b.rent === null ? null : Math.round(b.rent),
    })),
    listings: street.listings,
    distribution: [0, 25, 50, 75, 100].map((bucket) => ({ score: bucket, streets: reliable.filter((s) => Math.round(s.score / 25) * 25 === bucket).length })),
  };

  if (seg === 'buying') {
    report.betterStreets = betterStreets(street, streets);
  } else if (seg === 'own') {
    report.valueGuide = {
      soldPrice: street.soldPrice === null ? null : Math.round(street.soldPrice),
      range: street.soldPriceRange,
      suburbMedian: medianPrice,
    };
    report.drag = street.gap === null ? null : street.gap <= -10
      ? `${street.name} scores ${Math.abs(street.gap)} points below the ${suburb.name} street average. If this is part of a portfolio, it is worth understanding whether the street — not the suburb — is what's holding the asset back.`
      : street.gap >= 10
        ? `${street.name} scores ${street.gap} points above the ${suburb.name} street average — on these measures the street is pulling its weight relative to the suburb.`
        : `${street.name} tracks the ${suburb.name} street average closely, so the asset's performance is likely to follow the suburb's.`;
  } else if (seg === 'rent') {
    const rent = street.rent;
    report.rentCheck = rent === null || suburb.rent === null ? null : {
      streetRent: Math.round(rent),
      suburbMedian: Math.round(suburb.rent),
      suburbLower: suburb.rentLower === null ? null : Math.round(suburb.rentLower),
      suburbUpper: suburb.rentUpper === null ? null : Math.round(suburb.rentUpper),
      verdict: suburb.rentLower !== null && rent < suburb.rentLower
        ? 'Rents on this street run below the cheapest quarter of the suburb.'
        : suburb.rentUpper !== null && rent > suburb.rentUpper
          ? 'Rents on this street sit in the most expensive quarter of the suburb.'
          : rent >= suburb.rent ? 'Rents here sit at or a little above the suburb median.' : 'Rents here sit a little under the suburb median.',
    };
    report.rentVsOwn = rentVsOwn(rent, street.soldPrice || medianPrice);
  } else {
    report.best = byScore.slice(0, 5).map(pickPublic);
    report.worst = byScore.slice(-5).reverse().map(pickPublic);
  }
  return report;
}
