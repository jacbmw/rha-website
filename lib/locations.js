// Location hierarchy read layer for City (/locations/cities/[slug]),
// LGA (/locations/lgas/[state]/[slug]), and Master Directory (/locations) pages.
// Aggregates warehouse.ssc_data_dump, warehouse.lga, abs.lga_population,
// ripehouse Picki research tables, and warehouse.street_score_bake.
// Cached in-process for 24h so pages and the global footer render in <5ms after warm-up.

import { getWarehousePool, getRegistry, getLatestMonth, getSuburbScorecard, num, slugifySuburb, verdictForScore } from './suburbs.js';
import { BAKE_TABLE, SUBURB_BAKE_TABLE } from './streets.js';

export const STATE_CODE_BY_ID = {
  1: 'NSW', 2: 'VIC', 3: 'QLD', 4: 'SA', 5: 'WA', 6: 'TAS', 7: 'NT', 8: 'ACT', 9: 'OT',
};

export const STATE_NAMES = {
  nsw: 'New South Wales',
  vic: 'Victoria',
  qld: 'Queensland',
  wa: 'Western Australia',
  sa: 'South Australia',
  tas: 'Tasmania',
  act: 'Australian Capital Territory',
  nt: 'Northern Territory',
};

// Official Top 30 Australian Cities by population (ABS Significant Urban Areas /
// Greater Capital City & Regional City definitions), mapped to constituent LGA IDs.
export const TOP_30_CITIES = [
  {
    slug: 'sydney',
    name: 'Sydney',
    state: 'NSW',
    population: 5450000,
    tagline: 'Australia’s largest property market spanning 33 Greater Sydney council areas.',
    lgaIds: [
      10500, 10750, 10900, 11300, 11450, 11500, 11520, 11570, 12380, 12850, 12930,
      13800, 14000, 14100, 14170, 14500, 14700, 14900, 15350, 15950, 15990, 16260,
      16350, 16550, 16700, 17100, 17150, 17200, 17420, 18050, 18250, 18400, 18500,
    ],
  },
  {
    slug: 'melbourne',
    name: 'Melbourne',
    state: 'VIC',
    population: 5207000,
    tagline: 'Victoria’s capital city market across 31 metropolitan and growth-corridor councils.',
    lgaIds: [
      20660, 20910, 21110, 21180, 21450, 21610, 21890, 22170, 22310, 22670, 23110,
      23270, 23430, 23670, 24210, 24330, 24410, 24600, 24650, 24970, 25060, 25250,
      25340, 25710, 25900, 26350, 26980, 27070, 27260, 27350, 27450,
    ],
  },
  {
    slug: 'brisbane',
    name: 'Brisbane',
    state: 'QLD',
    population: 2706000,
    tagline: 'South East Queensland’s capital growth engine across Greater Brisbane’s 8 LGAs.',
    lgaIds: [31000, 33960, 34580, 34590, 35010, 36250, 36510, 36600],
  },
  {
    slug: 'perth',
    name: 'Perth',
    state: 'WA',
    population: 2309000,
    tagline: 'Western Australia’s capital across 30 metropolitan coastal and corridor councils.',
    lgaIds: [
      50210, 50350, 50420, 50490, 51310, 51330, 51750, 51820, 52170, 53150, 53430,
      53780, 54170, 54200, 54830, 55110, 55320, 55740, 56090, 56230, 56580, 56930,
      57080, 57490, 57700, 57840, 57910, 57980, 58050, 58510, 58570, 58760,
    ],
  },
  {
    slug: 'adelaide',
    name: 'Adelaide',
    state: 'SA',
    population: 1446000,
    tagline: 'South Australia’s capital spanning 19 metropolitan and hills council areas.',
    lgaIds: [
      40070, 40120, 40700, 40910, 41060, 42030, 42600, 44060, 44340, 44550, 45290,
      45340, 45680, 45890, 46510, 47140, 47700, 47980, 48260, 48410,
    ],
  },
  {
    slug: 'gold-coast',
    name: 'Gold Coast',
    state: 'QLD',
    population: 735000,
    tagline: 'Australia’s largest non-capital coastal urban corridor across Gold Coast and Tweed.',
    lgaIds: [33430, 17550],
  },
  {
    slug: 'newcastle',
    name: 'Newcastle',
    state: 'NSW',
    population: 526000,
    tagline: 'The Hunter Region’s coastal and growth-corridor hub across Newcastle, Lake Macquarie and Maitland.',
    lgaIds: [15900, 14650, 15050, 16400, 11720],
  },
  {
    slug: 'canberra',
    name: 'Canberra',
    state: 'ACT',
    population: 473000,
    tagline: 'Australia’s national capital and the surrounding Queanbeyan urban corridor.',
    lgaIds: [89399, 16490],
  },
  {
    slug: 'sunshine-coast',
    name: 'Sunshine Coast',
    state: 'QLD',
    population: 408000,
    tagline: 'High-demand lifestyle and infrastructure corridor spanning Sunshine Coast and Noosa.',
    lgaIds: [36720, 35740],
  },
  {
    slug: 'central-coast',
    name: 'Central Coast',
    state: 'NSW',
    population: 358000,
    tagline: 'Coastal commuter corridor linking Sydney and the Hunter across 150+ suburbs.',
    lgaIds: [11650],
  },
  {
    slug: 'wollongong',
    name: 'Wollongong',
    state: 'NSW',
    population: 315000,
    tagline: 'The Illawarra coastal belt spanning Wollongong, Shellharbour and Kiama.',
    lgaIds: [18450, 16900, 14400],
  },
  {
    slug: 'geelong',
    name: 'Geelong',
    state: 'VIC',
    population: 302000,
    tagline: 'Victoria’s largest regional city and the Bellarine / Surf Coast growth corridor.',
    lgaIds: [22750, 26490, 26080],
  },
  {
    slug: 'hobart',
    name: 'Hobart',
    state: 'TAS',
    population: 254000,
    tagline: 'Tasmania’s capital across Hobart, Clarence, Glenorchy, Kingborough and Brighton.',
    lgaIds: [62810, 61410, 62610, 63610, 60410, 64810, 61510],
  },
  {
    slug: 'townsville',
    name: 'Townsville',
    state: 'QLD',
    population: 206000,
    tagline: 'North Queensland’s economic, defence and port capital.',
    lgaIds: [37010],
  },
  {
    slug: 'toowoomba',
    name: 'Toowoomba',
    state: 'QLD',
    population: 186000,
    tagline: 'The Darling Downs regional logistics, health and agricultural hub.',
    lgaIds: [36910],
  },
  {
    slug: 'cairns',
    name: 'Cairns',
    state: 'QLD',
    population: 179000,
    tagline: 'Far North Queensland’s tropical aviation, tourism and regional centre.',
    lgaIds: [32080, 32810],
  },
  {
    slug: 'darwin',
    name: 'Darwin',
    state: 'NT',
    population: 151000,
    tagline: 'Northern Territory’s capital across Darwin, Palmerston and Litchfield.',
    lgaIds: [71000, 72800, 72300],
  },
  {
    slug: 'mackay',
    name: 'Mackay',
    state: 'QLD',
    population: 129000,
    tagline: 'Central Queensland coastal hub servicing the Bowen Basin and Whitsundays corridor.',
    lgaIds: [34770],
  },
  {
    slug: 'bendigo',
    name: 'Bendigo',
    state: 'VIC',
    population: 127000,
    tagline: 'Central Victoria’s major regional city across the Greater Bendigo municipality.',
    lgaIds: [22620],
  },
  {
    slug: 'ballarat',
    name: 'Ballarat',
    state: 'VIC',
    population: 123000,
    tagline: 'Western Victoria’s major regional growth city on the Melbourne rail corridor.',
    lgaIds: [20570],
  },
  {
    slug: 'hervey-bay',
    name: 'Hervey Bay',
    state: 'QLD',
    population: 123000,
    tagline: 'The Fraser Coast’s coastal lifestyle and healthcare hub.',
    lgaIds: [33220],
  },
  {
    slug: 'launceston',
    name: 'Launceston',
    state: 'TAS',
    population: 119000,
    tagline: 'Northern Tasmania’s commercial hub across Launceston, West Tamar and Meander Valley.',
    lgaIds: [64010, 65810, 64210],
  },
  {
    slug: 'bundaberg',
    name: 'Bundaberg',
    state: 'QLD',
    population: 107000,
    tagline: 'Wide Bay–Burnett’s coastal agricultural, healthcare and lifestyle hub.',
    lgaIds: [31820],
  },
  {
    slug: 'albury-wodonga',
    name: 'Albury-Wodonga',
    state: 'NSW',
    population: 104000,
    tagline: 'Twin border cities straddling the Murray River on the Sydney–Melbourne Hume corridor.',
    lgaIds: [10050, 27170],
  },
  {
    slug: 'bunbury',
    name: 'Bunbury',
    state: 'WA',
    population: 104000,
    tagline: 'Western Australia’s South West port and regional centre across Greater Bunbury.',
    lgaIds: [51190, 53990, 51400, 52660],
  },
  {
    slug: 'rockhampton',
    name: 'Rockhampton',
    state: 'QLD',
    population: 86000,
    tagline: 'Central Queensland’s regional and Capricorn Coast hub across Rockhampton and Livingstone.',
    lgaIds: [36370, 34530],
  },
  {
    slug: 'coffs-harbour',
    name: 'Coffs Harbour',
    state: 'NSW',
    population: 82000,
    tagline: 'Mid North Coast NSW regional centre with hospital, university and airport infrastructure.',
    lgaIds: [11800],
  },
  {
    slug: 'shepparton',
    name: 'Shepparton',
    state: 'VIC',
    population: 70000,
    tagline: 'Goulburn Valley’s primary regional food-bowl and commercial centre.',
    lgaIds: [22830],
  },
  {
    slug: 'wagga-wagga',
    name: 'Wagga Wagga',
    state: 'NSW',
    population: 69000,
    tagline: 'The Riverina’s largest inland city — defence, university, health and logistics hub.',
    lgaIds: [17750],
  },
  {
    slug: 'mildura',
    name: 'Mildura',
    state: 'VIC',
    population: 57000,
    tagline: 'Sunraysia’s Murray River regional centre in north-west Victoria.',
    lgaIds: [24780],
  },
];

export function cleanLgaName(rawName) {
  return String(rawName || '')
    .replace(/\s*\((?:NSW|Vic\.|Qld|SA|WA|Tas\.|NT|ACT)\)\s*$/i, '')
    .replace(/\s*\([A-Z]{1,3}\)\s*$/i, '')
    .replace(/^Unincorporated ACT$/i, 'Canberra (ACT)')
    .trim();
}

function monthLabel(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-AU', { month: 'short', year: 'numeric' }).format(new Date(date));
}

function medianOf(values) {
  const valid = values.filter((v) => v !== null && v !== undefined && Number.isFinite(v)).sort((a, b) => a - b);
  if (!valid.length) return null;
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 ? valid[mid] : (valid[mid - 1] + valid[mid]) / 2;
}

function meanOf(values) {
  const valid = values.filter((v) => v !== null && v !== undefined && Number.isFinite(v));
  if (!valid.length) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function summariseSuburbGroup(suburbs) {
  const scored = suburbs.filter((s) => s.score !== null && s.confidence !== 'low');
  const pool = scored.length ? scored : suburbs.filter((s) => s.score !== null);
  const rScoreAvg = pool.length ? Math.round(meanOf(pool.map((s) => s.score))) : null;
  const rScoreMax = pool.length ? Math.round(Math.max(...pool.map((s) => s.score))) : null;
  const medianPrice = medianOf(suburbs.map((s) => s.medianPrice));
  const medianRent = medianOf(suburbs.map((s) => s.medianRent));
  const grossYield = medianOf(suburbs.map((s) => s.grossYield));
  const vacancy = medianOf(suburbs.map((s) => s.vacancy));
  const daysOnMarket = medianOf(suburbs.map((s) => s.daysOnMarket));
  const demandScore = pool.length ? Math.round(meanOf(pool.map((s) => s.demandScore))) : null;
  const supplyScore = pool.length ? Math.round(meanOf(pool.map((s) => s.supplyScore))) : null;
  const momentumScore = pool.length ? Math.round(meanOf(pool.map((s) => s.momentumScore))) : null;
  const yieldScore = pool.length ? Math.round(meanOf(pool.map((s) => s.yieldScore))) : null;
  const prices = suburbs.map((s) => s.medianPrice).filter((v) => v !== null && v > 0);
  const priceMin = prices.length ? Math.min(...prices) : null;
  const priceMax = prices.length ? Math.max(...prices) : null;

  return {
    suburbCount: suburbs.length,
    scoredSuburbCount: scored.length,
    rScoreAvg,
    rScoreMax,
    verdict: verdictForScore(rScoreAvg),
    medianPrice: medianPrice !== null ? Math.round(medianPrice) : null,
    priceMin,
    priceMax,
    medianRent: medianRent !== null ? Math.round(medianRent) : null,
    grossYield: grossYield !== null ? Math.round(grossYield * 10) / 10 : null,
    vacancy: vacancy !== null ? Math.round(vacancy * 10) / 10 : null,
    daysOnMarket: daysOnMarket !== null ? Math.round(daysOnMarket) : null,
    components: [
      { key: 'demand', label: 'Buyer demand', explain: 'How quickly homes sell and how that pace is changing across suburbs.', score: demandScore },
      { key: 'supply', label: 'Supply & ownership', explain: 'How tightly held the area is — owner-occupiers, rental stock and public housing mix.', score: supplyScore },
      { key: 'momentum', label: 'Price momentum', explain: 'How prices are moving against the state and wider region.', score: momentumScore },
      { key: 'yield', label: 'Yield pressure', explain: 'What the rental market is doing — yields, rents and vacancy.', score: yieldScore },
    ],
    confidence: scored.length >= 2 ? 'high' : pool.length >= 1 ? 'medium' : 'low',
  };
}

let locationCache = { data: null, expires: 0, loading: null };

async function buildLocationRegistry() {
  const db = getWarehousePool();
  const [{ entries: suburbEntries }, latestMonth] = await Promise.all([
    getRegistry(),
    getLatestMonth(),
  ]);

  const suburbById = new Map();
  for (const entry of suburbEntries) {
    if (!suburbById.has(entry.id)) suburbById.set(entry.id, entry);
  }

  const [
    [lgaRows],
    [popRows],
    [popPrevRows],
    [infraRows],
    [empRows],
    [supplyRows],
    [dumpRows],
    [pickiVetRows],
    [pickiMapRows],
    [pickiTargetRows],
  ] = await Promise.all([
    db.query('SELECT id, name, dwellings, type, area_sqkm, ste_fk FROM warehouse.lga'),
    db.query(
      'SELECT id, population FROM abs.lga_population WHERE date = (SELECT MAX(date) FROM abs.lga_population)'
    ).catch(() => [[]]),
    db.query(
      'SELECT id, population FROM abs.lga_population WHERE date = (SELECT DATE_SUB(MAX(date), INTERVAL 3 YEAR) FROM abs.lga_population)'
    ).catch(() => [[]]),
    db.query(
      'SELECT lga_code19, total, percentile, capita_percentile FROM rhi.lga_project_distribution_infra'
    ).catch(() => [[]]),
    db.query(
      'SELECT id, industry, proportion FROM abs.lga_employment WHERE proportion >= 0.05 ORDER BY id, proportion DESC'
    ).catch(() => [[]]),
    db.query(
      'SELECT lga_code, fy, dwellings_approved, dwelling_stock, supply_perc FROM rhi.lga_supply_by_year WHERE fy = (SELECT MAX(fy) FROM rhi.lga_supply_by_year)'
    ).catch(() => [[]]),
    latestMonth
      ? db.query(
          `SELECT ssc_id, ssc_name, lga_id, lga_name, state_id,
                  r_raw, r_perc, ac_raw, ap_raw, ab_raw, au_raw, ae_raw, aa_raw,
                  ae_perc, as_perc, at_perc, aa_perc,
                  aj_perc, ao_perc, ak_perc, aw_perc,
                  af_perc, an_perc, ah_perc, aq_perc,
                  ab_perc, ar_perc, au_perc, av_perc
             FROM warehouse.ssc_data_dump
            WHERE created = ?`,
          [latestMonth]
        )
      : [[]],
    db.query('SELECT ssc_id, COUNT(*) AS cnt FROM ripehouse.ssc_vetting_decisions GROUP BY ssc_id').catch(() => [[]]),
    db.query('SELECT lga_id, COUNT(*) AS cnt FROM ripehouse.lga_map_links WHERE lga_id IS NOT NULL GROUP BY lga_id').catch(() => [[]]),
    db.query('SELECT lga_id, COUNT(*) AS cnt FROM ripehouse.transaction_target_locations GROUP BY lga_id').catch(() => [[]]),
  ]);

  const popByLga = new Map(popRows.map((r) => [Number(r.id), Number(r.population) || null]));
  const popPrevByLga = new Map(popPrevRows.map((r) => [Number(r.id), Number(r.population) || null]));
  const infraByLga = new Map(
    infraRows.map((r) => [
      Number(r.lga_code19),
      {
        spendMillions: Number(r.total) > 0 ? Math.round(Number(r.total)) : null,
        percentile: Number(r.percentile) || null,
        capitaPercentile: Number(r.capita_percentile) || null,
      },
    ])
  );
  const empByLga = new Map();
  for (const r of empRows) {
    const id = Number(r.id);
    if (!empByLga.has(id)) empByLga.set(id, []);
    const list = empByLga.get(id);
    if (list.length < 4 && r.industry) {
      list.push({ industry: r.industry, pct: Math.round(Number(r.proportion) * 100) });
    }
  }
  const supplyByLga = new Map(
    supplyRows.map((r) => [
      Number(r.lga_code),
      {
        fy: Number(r.fy) || null,
        dwellingsApproved: Number(r.dwellings_approved) ? Math.round(Number(r.dwellings_approved)) : null,
        supplyPct: Number(r.supply_perc) ? Math.round(Number(r.supply_perc) * 10) / 10 : null,
      },
    ])
  );
  const vetBySsc = new Map(pickiVetRows.map((r) => [Number(r.ssc_id), Number(r.cnt) || 0]));
  const mapByLga = new Map(pickiMapRows.map((r) => [Number(r.lga_id), Number(r.cnt) || 0]));
  const targetByLga = new Map(pickiTargetRows.map((r) => [Number(r.lga_id), Number(r.cnt) || 0]));

  // Map LGA ID -> primary City (prefer smaller/regional city over capital metro if shared, though sets are disjoint)
  const cityByLgaId = new Map();
  for (const city of TOP_30_CITIES) {
    for (const lgaId of city.lgaIds) {
      cityByLgaId.set(Number(lgaId), city);
    }
  }

  // Group suburbs by LGA ID from ssc_data_dump
  const suburbsByLgaId = new Map();
  const lgaMetaFromDump = new Map();
  const lgaBySscId = new Map();

  for (const row of dumpRows) {
    const sscId = Number(row.ssc_id);
    const lgaId = Number(row.lga_id);
    if (!lgaId) continue;
    const regEntry = suburbById.get(sscId);
    const stateCode = regEntry?.state || STATE_CODE_BY_ID[Number(row.state_id)] || 'NSW';
    if (stateCode === 'OT') continue;

    if (!lgaMetaFromDump.has(lgaId) && row.lga_name) {
      lgaMetaFromDump.set(lgaId, { rawName: row.lga_name, state: stateCode });
    }

    const core = [row.r_perc, row.ac_raw, row.ap_raw, row.au_raw, row.ae_raw];
    const missing = core.filter((v) => num(v) === null).length;
    const score = num(row.r_perc);
    const confidence = missing >= 2 || score === null ? 'low' : missing === 1 || num(row.aa_raw) === null ? 'medium' : 'high';
    const rawYield = num(row.ab_raw);
    const rawVacancy = num(row.au_raw);
    const name = regEntry?.name || String(row.ssc_name || '').replace(/\s*\(.*$/, '').trim();
    const slug = regEntry?.slug || slugifySuburb(name);
    if (!name || !slug) continue;

    const suburbItem = {
      id: sscId,
      name,
      state: stateCode,
      slug,
      path: `/suburbs/${stateCode.toLowerCase()}/${slug}`,
      streetsPath: `/streets/${stateCode.toLowerCase()}/${slug}`,
      postcodes: regEntry?.postcodes || [],
      lgaId,
      score: score !== null ? Math.round(score) : null,
      rRaw: num(row.r_raw),
      confidence,
      medianPrice: num(row.ac_raw) !== null ? Math.round(num(row.ac_raw)) : null,
      medianRent: num(row.ap_raw) !== null ? Math.round(num(row.ap_raw)) : null,
      grossYield: rawYield !== null ? Math.round(rawYield * 1000) / 10 : null,
      vacancy: rawVacancy !== null ? Math.round(rawVacancy * 1000) / 10 : null,
      daysOnMarket: num(row.ae_raw) !== null ? Math.round(num(row.ae_raw)) : null,
      demandScore: meanOf([num(row.ae_perc), num(row.as_perc), num(row.at_perc), num(row.aa_perc)]),
      supplyScore: meanOf([num(row.aj_perc), num(row.ao_perc), num(row.ak_perc), num(row.aw_perc)]),
      momentumScore: meanOf([num(row.af_perc), num(row.an_perc), num(row.ah_perc), num(row.aq_perc)]),
      yieldScore: meanOf([num(row.ab_perc), num(row.ar_perc), num(row.au_perc), num(row.av_perc)]),
      pickiVets: vetBySsc.get(sscId) || 0,
    };

    if (!suburbsByLgaId.has(lgaId)) suburbsByLgaId.set(lgaId, []);
    suburbsByLgaId.get(lgaId).push(suburbItem);
    lgaBySscId.set(sscId, lgaId);
  }

  const asOf = monthLabel(latestMonth);
  const asOfDate = latestMonth ? new Date(latestMonth) : null;

  // Build all LGAs
  const allLgaIds = new Set([
    ...lgaRows.map((r) => Number(r.id)),
    ...suburbsByLgaId.keys(),
  ]);
  const lgaRowById = new Map(lgaRows.map((r) => [Number(r.id), r]));
  const slugCollisions = new Map();
  const lgas = [];
  const lgaById = new Map();
  const lgaByKey = new Map();

  for (const lgaId of allLgaIds) {
    const row = lgaRowById.get(lgaId);
    const dumpMeta = lgaMetaFromDump.get(lgaId);
    const state = dumpMeta?.state || STATE_CODE_BY_ID[Number(row?.ste_fk)] || null;
    if (!state || state === 'OT') continue;
    const rawName = dumpMeta?.rawName || row?.name || '';
    if (!rawName || /no usual address|migratory|offshore/i.test(rawName)) continue;

    const cleanName = cleanLgaName(rawName);
    const baseSlug = slugifySuburb(cleanName);
    if (!baseSlug) continue;
    const stateLower = state.toLowerCase();
    const collisionKey = `${stateLower}|${baseSlug}`;
    const seenCount = slugCollisions.get(collisionKey) || 0;
    slugCollisions.set(collisionKey, seenCount + 1);
    const slug = seenCount > 0 ? `${baseSlug}-${lgaId}` : baseSlug;

    const suburbs = (suburbsByLgaId.get(lgaId) || []).sort((a, b) => {
      if ((b.score ?? -1) !== (a.score ?? -1)) return (b.score ?? -1) - (a.score ?? -1);
      return a.name.localeCompare(b.name);
    });
    if (!suburbs.length) continue;

    const summary = summariseSuburbGroup(suburbs);
    const vetSum = suburbs.reduce((acc, s) => acc + s.pickiVets, 0);
    const mapCnt = mapByLga.get(lgaId) || 0;
    const targetCnt = targetByLga.get(lgaId) || 0;
    // Boost Kingborough (63610) & high-activity Picki councils so key investor LGAs surface in Top 50
    const pickiScore = vetSum + mapCnt * 5 + targetCnt * 15 + (lgaId === 63610 ? 60 : 0);
    const parentCity = cityByLgaId.get(lgaId) || null;

    const popCurrent = popByLga.get(lgaId) || null;
    const popPrev = popPrevByLga.get(lgaId) || null;
    const popGrowth3yr = popCurrent && popPrev && popPrev > 0
      ? Math.round(((popCurrent - popPrev) / popPrev) * 1000) / 10
      : null;
    const infra = infraByLga.get(lgaId) || null;
    const topIndustries = empByLga.get(lgaId) || [];
    const supplyInfo = supplyByLga.get(lgaId) || null;

    const lgaObj = {
      id: lgaId,
      name: cleanName,
      rawName,
      state,
      stateName: STATE_NAMES[stateLower] || state,
      slug,
      path: `/locations/lgas/${stateLower}/${slug}`,
      population: popCurrent,
      popGrowth3yr,
      dwellings: row?.dwellings ? Number(row.dwellings) : null,
      areaSqkm: row?.area_sqkm ? Math.round(Number(row.area_sqkm)) : null,
      remoteness: row?.type || null,
      infraSpendM: infra?.spendMillions || null,
      infraPercentile: infra?.percentile || null,
      topIndustries,
      supplyPct: supplyInfo?.supplyPct ?? null,
      dwellingsApproved: supplyInfo?.dwellingsApproved ?? null,
      pickiScore,
      citySlug: parentCity?.slug || null,
      cityName: parentCity?.name || null,
      cityPath: parentCity ? `/locations/cities/${parentCity.slug}` : null,
      asOf,
      asOfDate,
      ...summary,
      suburbs,
    };

    lgas.push(lgaObj);
    lgaById.set(lgaId, lgaObj);
    lgaByKey.set(`${stateLower}|${slug}`, lgaObj);
  }

  lgas.sort((a, b) => a.name.localeCompare(b.name));

  // Top 50 LGAs by Picki search/view/vetting volume
  const top50PickiLgas = [...lgas]
    .sort((a, b) => (b.pickiScore - a.pickiScore) || ((b.population || 0) - (a.population || 0)))
    .slice(0, 50);

  // Build Top 30 Cities by population
  const cities = [];
  const cityBySlug = new Map();

  for (const cityDef of TOP_30_CITIES) {
    const constituentLgas = cityDef.lgaIds
      .map((id) => lgaById.get(Number(id)))
      .filter(Boolean)
      .sort((a, b) => (b.population || 0) - (a.population || 0));
    const suburbs = constituentLgas
      .flatMap((lga) => lga.suburbs.map((s) => ({ ...s, lgaName: lga.name, lgaPath: lga.path })))
      .sort((a, b) => {
        if ((b.score ?? -1) !== (a.score ?? -1)) return (b.score ?? -1) - (a.score ?? -1);
        return a.name.localeCompare(b.name);
      });
    const summary = summariseSuburbGroup(suburbs);
    const dbPop = constituentLgas.reduce((sum, l) => sum + (l.population || 0), 0);
    const dbPopPrev = constituentLgas.reduce((sum, l) => {
      const prev = popPrevByLga.get(l.id);
      return sum + (prev || 0);
    }, 0);
    const cityPopGrowth3yr = dbPop > 0 && dbPopPrev > 0
      ? Math.round(((dbPop - dbPopPrev) / dbPopPrev) * 1000) / 10
      : null;
    const cityInfraSpendM = constituentLgas.reduce((sum, l) => sum + (l.infraSpendM || 0), 0) || null;
    const cityDwellings = constituentLgas.reduce((sum, l) => sum + (l.dwellings || 0), 0) || null;
    const citySupplyPct = meanOf(constituentLgas.map((l) => l.supplyPct).filter((v) => v !== null));
    const industryTotals = new Map();
    for (const l of constituentLgas) {
      for (const ind of l.topIndustries || []) {
        industryTotals.set(ind.industry, (industryTotals.get(ind.industry) || 0) + ind.pct);
      }
    }
    const cityTopIndustries = [...industryTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([industry, sum]) => ({ industry, pct: Math.round(sum / Math.max(1, constituentLgas.length)) }));

    const cityObj = {
      slug: cityDef.slug,
      name: cityDef.name,
      state: cityDef.state,
      stateName: STATE_NAMES[cityDef.state.toLowerCase()] || cityDef.state,
      path: `/locations/cities/${cityDef.slug}`,
      population: dbPop > 0 ? dbPop : cityDef.population,
      popGrowth3yr: cityPopGrowth3yr,
      dwellings: cityDwellings,
      infraSpendM: cityInfraSpendM,
      supplyPct: citySupplyPct !== null ? Math.round(citySupplyPct * 10) / 10 : null,
      topIndustries: cityTopIndustries,
      tagline: cityDef.tagline,
      lgaCount: constituentLgas.length,
      lgas: constituentLgas.map((l) => ({
        id: l.id,
        name: l.name,
        state: l.state,
        slug: l.slug,
        path: l.path,
        population: l.population,
        suburbCount: l.suburbCount,
        rScoreAvg: l.rScoreAvg,
        rScoreMax: l.rScoreMax,
        medianPrice: l.medianPrice,
        medianRent: l.medianRent,
        grossYield: l.grossYield,
        vacancy: l.vacancy,
      })),
      asOf,
      asOfDate,
      ...summary,
      suburbs,
    };

    cities.push(cityObj);
    cityBySlug.set(cityDef.slug, cityObj);
  }

  cities.sort((a, b) => (b.population || 0) - (a.population || 0));

  return {
    cities,
    cityBySlug,
    lgas,
    lgaById,
    lgaByKey,
    lgaBySscId,
    top50PickiLgas,
    asOf,
    asOfDate,
  };
}

export async function getLocationRegistry() {
  if (locationCache.data && locationCache.expires > Date.now()) return locationCache.data;
  if (!locationCache.loading) {
    locationCache.loading = buildLocationRegistry()
      .then((data) => {
        locationCache = { data, expires: Date.now() + 24 * 3600 * 1000, loading: null };
        return data;
      })
      .catch((error) => {
        locationCache.loading = null;
        throw error;
      });
  }
  if (locationCache.data) return locationCache.data;
  return locationCache.loading;
}

export async function findCityBySlug(slug) {
  const { cityBySlug } = await getLocationRegistry();
  return cityBySlug.get(String(slug || '').toLowerCase()) || null;
}

export async function findLgaBySlug(state, slug) {
  const { lgaByKey } = await getLocationRegistry();
  return lgaByKey.get(`${String(state || '').toLowerCase()}|${String(slug || '').toLowerCase()}`) || null;
}

export async function getSuburbLocationContext(sscId) {
  const { lgaById, lgaBySscId, cityBySlug } = await getLocationRegistry();
  const lgaId = lgaBySscId.get(Number(sscId));
  const lga = lgaId ? lgaById.get(lgaId) : null;
  if (!lga) return { lga: null, city: null, siblingSuburbs: [] };
  const city = lga.citySlug ? cityBySlug.get(lga.citySlug) || null : null;
  const siblingSuburbs = lga.suburbs
    .filter((s) => s.id !== Number(sscId) && s.score !== null && s.confidence !== 'low')
    .slice(0, 6);
  return {
    lga: {
      id: lga.id,
      name: lga.name,
      state: lga.state,
      path: lga.path,
      rScoreAvg: lga.rScoreAvg,
      suburbCount: lga.suburbCount,
      medianPrice: lga.medianPrice,
      grossYield: lga.grossYield,
    },
    city: city
      ? {
          slug: city.slug,
          name: city.name,
          state: city.state,
          path: city.path,
          rScoreAvg: city.rScoreAvg,
          suburbCount: city.suburbCount,
        }
      : null,
    siblingSuburbs,
  };
}

// Fetch top baked streets across a list of suburb ssc_ids (fast indexed IN lookup).
export async function fetchTopStreetsForSuburbs(sscIds, limit = 12) {
  const ids = (sscIds || []).map(Number).filter(Boolean).slice(0, 600);
  if (!ids.length) return [];
  try {
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await getWarehousePool().query(
      `SELECT b.ssc_id, b.slug AS street_slug, b.name AS street_name, b.score, b.gap,
              b.addresses, b.owner_occ, b.public_housing, b.rent, b.yield_rate,
              s.suburb AS suburb_name, LOWER(s.state) AS state, s.slug AS suburb_slug
         FROM ${BAKE_TABLE} b
         JOIN ${SUBURB_BAKE_TABLE} s ON s.ssc_id = b.ssc_id
        WHERE b.ssc_id IN (${placeholders})
          AND b.confidence <> 'low'
          AND b.score IS NOT NULL
          AND b.addresses >= 8
        ORDER BY b.score DESC, b.addresses DESC
        LIMIT ${Number(limit)}`,
      ids
    );
    return rows.map((r) => ({
      key: `${r.ssc_id}~${r.street_slug}`,
      name: r.street_name,
      slug: r.street_slug,
      suburbName: r.suburb_name,
      state: String(r.state || '').toUpperCase(),
      suburbSlug: r.suburb_slug,
      path: `/streets/${r.state}/${r.suburb_slug}/${r.street_slug}`,
      suburbPath: `/suburbs/${r.state}/${r.suburb_slug}`,
      score: Number(r.score),
      gap: num(r.gap),
      addresses: Number(r.addresses) || 0,
      ownerOcc: num(r.owner_occ) !== null ? Math.round(num(r.owner_occ) * 100) : null,
      rent: num(r.rent) !== null ? Math.round(num(r.rent)) : null,
      yieldRate: num(r.yield_rate) !== null ? Math.round(num(r.yield_rate) * 10) / 10 : null,
    }));
  } catch {
    return [];
  }
}

// Layer 1 unlocked scorecard for a City or LGA page.
export async function getLocationScorecard(location, kind = 'lga') {
  const scored = location.suburbs.filter((s) => s.score !== null && s.confidence !== 'low');
  const pool = scored.length >= 3 ? scored : location.suburbs.filter((s) => s.score !== null);

  const topSuburbs = [...pool]
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || (b.rRaw ?? -999) - (a.rRaw ?? -999))
    .slice(0, 10);

  const bottomSuburbs = [...pool]
    .sort((a, b) => (a.score ?? 999) - (b.score ?? 999) || (a.rRaw ?? 999) - (b.rRaw ?? 999))
    .slice(0, 5);

  const topYieldSuburbs = [...pool]
    .filter((s) => s.grossYield !== null && s.grossYield > 0 && s.grossYield < 18)
    .sort((a, b) => b.grossYield - a.grossYield || (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6);

  const fastSellingSuburbs = [...pool]
    .filter((s) => s.daysOnMarket !== null && s.daysOnMarket > 3)
    .sort((a, b) => a.daysOnMarket - b.daysOnMarket || (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6);

  const sscIds = topSuburbs.slice(0, 40).map((s) => s.id);
  const anchorSuburb = topSuburbs[0] || location.suburbs[0] || null;
  const [topStreets, anchorScorecard] = await Promise.all([
    fetchTopStreetsForSuburbs(
      sscIds.length ? sscIds : location.suburbs.slice(0, 40).map((s) => s.id),
      12
    ),
    anchorSuburb ? getSuburbScorecard(anchorSuburb).catch(() => null) : Promise.resolve(null),
  ]);

  const spreadNote = location.priceMin && location.priceMax && location.priceMax > location.priceMin
    ? `Suburb median prices across ${location.name} span from $${Math.round(location.priceMin).toLocaleString('en-AU')} to $${Math.round(location.priceMax).toLocaleString('en-AU')}.`
    : '';
  const topThreeNames = topSuburbs.slice(0, 3).map((s) => `${s.name} (${s.score}/100)`).join(', ');
  const driverParts = [];
  if (location.popGrowth3yr !== null && location.popGrowth3yr > 0) {
    driverParts.push(`3-year population growth of +${location.popGrowth3yr}%`);
  }
  if (location.infraSpendM) {
    driverParts.push(`$${location.infraSpendM >= 1000 ? `${(location.infraSpendM / 1000).toFixed(1)}B` : `${location.infraSpendM}M`} in tracked infrastructure projects`);
  }
  if (location.topIndustries?.length) {
    driverParts.push(`employment anchored by ${location.topIndustries.slice(0, 2).map((i) => i.industry.toLowerCase()).join(' and ')}`);
  }
  const insight = [
    `Across ${location.suburbCount} suburbs in ${location.name}, the average R-Score sits at ${location.rScoreAvg ?? '—'}/100${topThreeNames ? `, led by ${topThreeNames}` : ''}.`,
    spreadNote,
    driverParts.length ? `Underlying demand is supported by ${driverParts.join(', ')}.` : '',
  ].filter(Boolean).join(' ');

  return {
    kind,
    name: location.name,
    state: location.state,
    asOf: location.asOf,
    rScoreAvg: location.rScoreAvg,
    rScoreMax: location.rScoreMax,
    suburbCount: location.suburbCount,
    scoredSuburbCount: location.scoredSuburbCount,
    insight,
    components: location.components || anchorScorecard?.components || [],
    anchorSuburbName: anchorSuburb?.name || null,
    scoreHistory: anchorScorecard?.scoreHistory || [],
    priceHistory: anchorScorecard?.priceHistory || [],
    rentHistory: anchorScorecard?.rentHistory || [],
    domHistory: anchorScorecard?.domHistory || [],
    topSuburbs,
    bottomSuburbs,
    topYieldSuburbs,
    fastSellingSuburbs,
    topStreets,
    lgas: kind === 'city' ? location.lgas : undefined,
  };
}

// Unified multi-tier search across Cities, LGAs, Suburbs (and postcodes).
export async function searchLocationsUnified(query, limit = 12) {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return { cities: [], lgas: [], suburbs: [] };
  const [{ cities, lgas }, { entries: suburbEntries }] = await Promise.all([
    getLocationRegistry(),
    getRegistry(),
  ]);

  const matchedCities = cities
    .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
    .slice(0, 4)
    .map((c) => ({
      type: 'city',
      name: c.name,
      state: c.state,
      path: c.path,
      suburbCount: c.suburbCount,
      rScoreAvg: c.rScoreAvg,
      population: c.population,
    }));

  const lgaStarts = [];
  const lgaContains = [];
  for (const lga of lgas) {
    const n = lga.name.toLowerCase();
    if (n.startsWith(q)) lgaStarts.push(lga);
    else if (n.includes(q)) lgaContains.push(lga);
  }
  const matchedLgas = [...lgaStarts, ...lgaContains].slice(0, 6).map((l) => ({
    type: 'lga',
    id: l.id,
    name: l.name,
    state: l.state,
    path: l.path,
    suburbCount: l.suburbCount,
    rScoreAvg: l.rScoreAvg,
  }));

  const isPostcode = /^\d{2,4}$/.test(q);
  const subStarts = [];
  const subContains = [];
  for (const entry of suburbEntries) {
    if (isPostcode) {
      if (entry.postcodes.some((p) => p.startsWith(q))) subStarts.push(entry);
    } else {
      const n = entry.name.toLowerCase();
      if (n.startsWith(q)) subStarts.push(entry);
      else if (n.includes(` ${q}`) || n.includes(`-${q}`)) subContains.push(entry);
    }
    if (subStarts.length >= limit * 2) break;
  }
  const matchedSuburbs = [...subStarts, ...subContains].slice(0, 8).map((s) => ({
    type: 'suburb',
    id: s.id,
    name: s.name,
    state: s.state,
    postcode: s.postcodes[0] || '',
    slug: `${s.state.toLowerCase()}/${s.slug}`,
    path: `/suburbs/${s.state.toLowerCase()}/${s.slug}`,
    streetsPath: `/streets/${s.state.toLowerCase()}/${s.slug}`,
  }));

  return {
    cities: matchedCities,
    lgas: matchedLgas,
    suburbs: matchedSuburbs,
  };
}

// ── LLM-Optimised FAQ & JSON-LD Generators ───────────────────────────────────

const fmtMoney = (v) => (v === null || v === undefined ? 'not available' : `$${Math.round(v).toLocaleString('en-AU')}`);

export function buildCityFaqs(city, topStreets = []) {
  const topNames = city.suburbs
    .filter((s) => s.score !== null && s.confidence !== 'low')
    .slice(0, 5)
    .map((s) => `${s.name} (R-Score ${s.score}/100${s.medianPrice ? `, median ${fmtMoney(s.medianPrice)}` : ''})`)
    .join(', ');
  const topYield = [...city.suburbs]
    .filter((s) => s.grossYield !== null && s.grossYield > 0 && s.grossYield < 18 && s.confidence !== 'low')
    .sort((a, b) => b.grossYield - a.grossYield)
    .slice(0, 3)
    .map((s) => `${s.name} (${s.grossYield}%)`)
    .join(', ');
  const lgaList = city.lgas.slice(0, 8).map((l) => l.name).join(', ');
  const streetSample = topStreets
    .slice(0, 3)
    .map((st) => `${st.name} in ${st.suburbName} (${st.score}/100)`)
    .join(', ');

  return [
    {
      question: `Is ${city.name} a good place to invest in property in 2026?`,
      answer: `As of ${city.asOf || 'this month'}, Greater ${city.name} (${city.state}) records an average Ripehouse R-Score of ${city.rScoreAvg ?? '—'}/100 across ${city.suburbCount.toLocaleString('en-AU')} suburbs and ${city.lgaCount} council areas, with top-scoring suburbs reaching ${city.rScoreMax ?? '—'}/100. Across ${city.name}, the typical suburb median price sits around ${fmtMoney(city.medianPrice)}, median rent is ${city.medianRent ? `$${city.medianRent}/wk` : 'varied'}, gross rental yield is ${city.grossYield ? `${city.grossYield}%` : 'varied'}, and vacancy averages ${city.vacancy !== null ? `${city.vacancy}%` : 'low'}.`,
    },
    {
      question: `What are the highest-scoring suburbs for property investment in ${city.name}?`,
      answer: topNames
        ? `Based on Ripehouse Advisory’s monthly 27-indicator R-Score model (${city.asOf}), the highest-scoring suburbs in ${city.name} right now include ${topNames}. Within each suburb, street-level performance varies significantly depending on owner-occupier ratio, public housing concentration, and block-level rental yield.`
        : `Ripehouse Advisory scores ${city.suburbCount} suburbs across ${city.name} each month across buyer demand, supply tightness, price momentum, and rental yield pressure.`,
    },
    {
      question: `What is the rental yield and vacancy rate in ${city.name}, ${city.state}?`,
      answer: `Across ${city.name}’s ${city.suburbCount} suburbs, the median gross rental yield is ${city.grossYield !== null ? `${city.grossYield}%` : 'measured per suburb'}, median weekly asking rent is ${city.medianRent !== null ? `$${city.medianRent}/wk` : 'measured per suburb'}, and the median vacancy rate is ${city.vacancy !== null ? `${city.vacancy}%` : 'tracked monthly'}.${topYield ? ` Higher-yielding suburbs in ${city.name} currently include ${topYield}.` : ''}`,
    },
    {
      question: `Which Local Government Areas (LGAs) make up Greater ${city.name}?`,
      answer: `Greater ${city.name} comprises ${city.lgaCount} Local Government Area${city.lgaCount === 1 ? '' : 's'} (${lgaList}${city.lgaCount > 8 ? ` and ${city.lgaCount - 8} more` : ''}), covering an estimated population of ${city.population ? city.population.toLocaleString('en-AU') : 'over 50,000'} residents. You can drill down into each council area on this page to compare suburb R-Scores and street rankings.`,
    },
    {
      question: `How do I find the best streets in ${city.name} suburbs?`,
      answer: `Every G-NAF street in ${city.name} is scored on the Ripehouse Street Score (0–100) using ABS SA1 census owner-occupier ratios (>65%), public housing concentration (≤5%), and block-level rent and yield relative to its suburb.${streetSample ? ` Top-scoring streets in ${city.name} include ${streetSample}.` : ''} Select any suburb in ${city.name} below to inspect its top-scoring and lowest-scoring streets.`,
    },
  ];
}

export function buildLgaFaqs(lga, topStreets = []) {
  const topSuburbs = lga.suburbs
    .filter((s) => s.score !== null && s.confidence !== 'low')
    .slice(0, 5)
    .map((s) => `${s.name} (${s.score}/100${s.medianPrice ? `, median ${fmtMoney(s.medianPrice)}` : ''})`)
    .join(', ');
  const topYield = [...lga.suburbs]
    .filter((s) => s.grossYield !== null && s.grossYield > 0 && s.grossYield < 18)
    .sort((a, b) => b.grossYield - a.grossYield)
    .slice(0, 3)
    .map((s) => `${s.name} (${s.grossYield}%)`)
    .join(', ');
  const streetSample = topStreets
    .slice(0, 3)
    .map((st) => `${st.name}, ${st.suburbName} (${st.score}/100)`)
    .join(', ');

  return [
    {
      question: `Is ${lga.name} (${lga.state}) a good council area for property investment in 2026?`,
      answer: `As of ${lga.asOf || 'this month'}, ${lga.name} (${lga.stateName}) has an average Ripehouse R-Score of ${lga.rScoreAvg ?? '—'}/100 across ${lga.suburbCount} suburbs, with its strongest suburb scoring ${lga.rScoreMax ?? '—'}/100. Across ${lga.name}, the typical suburb median price is ${fmtMoney(lga.medianPrice)}, median weekly rent is ${lga.medianRent ? `$${lga.medianRent}/wk` : 'measured per suburb'}, gross rental yield is ${lga.grossYield ? `${lga.grossYield}%` : 'varied'}, and vacancy sits at ${lga.vacancy !== null ? `${lga.vacancy}%` : 'low'}.`,
    },
    {
      question: `Which suburbs in ${lga.name} have the highest R-Score right now?`,
      answer: topSuburbs
        ? `In the ${lga.asOf} Ripehouse research bake, the highest-scoring suburbs in ${lga.name} (${lga.state}) are ${topSuburbs}. Each suburb is evaluated monthly across 27 demand, supply, momentum, and yield indicators.`
        : `${lga.name} contains ${lga.suburbCount} suburbs (${lga.suburbs.slice(0, 5).map((s) => s.name).join(', ')}), each scored monthly in the Ripehouse research engine.`,
    },
    {
      question: `What is the median house price, rent and rental yield in ${lga.name}?`,
      answer: `Across ${lga.name} (${lga.state}), the median suburb property price is ${fmtMoney(lga.medianPrice)}, median asking rent is ${lga.medianRent !== null ? `$${lga.medianRent}/wk` : 'tracked per suburb'}, and median gross yield is ${lga.grossYield !== null ? `${lga.grossYield}%` : 'tracked per suburb'}, with homes averaging ${lga.daysOnMarket !== null ? `${lga.daysOnMarket} days on market` : 'varied selling times'}.${topYield ? ` The highest-yielding suburbs in ${lga.name} include ${topYield}.` : ''}`,
    },
    {
      question: `What are the demographics and size of the ${lga.name} council area?`,
      answer: `${lga.name} is a Local Government Area in ${lga.stateName}${lga.cityName ? ` (part of Greater ${lga.cityName})` : ''}${lga.population ? ` with an ABS estimated resident population of ${lga.population.toLocaleString('en-AU')}` : ''}${lga.dwellings ? `, approximately ${lga.dwellings.toLocaleString('en-AU')} dwellings` : ''}${lga.areaSqkm ? `, covering ${lga.areaSqkm.toLocaleString('en-AU')} sq km` : ''}.`,
    },
    {
      question: `What are the best streets in ${lga.name} (${lga.state})?`,
      answer: streetSample
        ? `Using the Ripehouse Street Score (which tests census block owner-occupancy >65%, public housing ≤5%, and SA1 rent and yield against the suburb median), top-scoring streets in ${lga.name} include ${streetSample}. Click any suburb in ${lga.name} below to check every street in that suburb.`
        : `Every street across all ${lga.suburbCount} suburbs in ${lga.name} is scored on the Ripehouse Street Score. Select any suburb below to view its street-by-street rankings.`,
    },
  ];
}

export function buildSuburbFaqs(snapshot, locationContext = null, topStreets = []) {
  const { stats } = snapshot;
  const lgaName = locationContext?.lga?.name || snapshot.lga || null;
  const cityName = locationContext?.city?.name || null;
  const streetList = topStreets
    .slice(0, 4)
    .map((s) => `${s.name} (${s.score}/100)`)
    .join(', ');

  return [
    {
      question: `Is ${snapshot.name} ${snapshot.state} a good suburb for property investment in 2026?`,
      answer: snapshot.score !== null
        ? `As of ${snapshot.asOf}, ${snapshot.name} (${snapshot.state}${snapshot.postcodes?.length ? ` ${snapshot.postcodes[0]}` : ''}) scores ${snapshot.score}/100 on the Ripehouse R-Score${snapshot.rank && snapshot.total ? `, ranking #${snapshot.rank.toLocaleString('en-AU')} out of ${snapshot.total.toLocaleString('en-AU')} Australian suburbs` : ''}. ${snapshot.verdict ? `${snapshot.verdict.label}. ` : ''}Key fundamentals include a median price of ${fmtMoney(stats.medianPrice)}, median rent of ${stats.medianRent ? `$${stats.medianRent}/wk` : '—'}, gross yield of ${stats.grossYield !== null ? `${stats.grossYield}%` : '—'}, and vacancy of ${stats.vacancy !== null ? `${stats.vacancy}%` : '—'}.`
        : `${snapshot.name} (${snapshot.state}) is tracked monthly by the Ripehouse research engine across 27 supply, demand, momentum, and yield indicators.`,
    },
    {
      question: `What is the median house price and 12-month growth in ${snapshot.name} ${snapshot.state}?`,
      answer: `The current median property price in ${snapshot.name} (${snapshot.state}) is ${fmtMoney(stats.medianPrice)} (${snapshot.asOf})${stats.priceChange12m !== null ? `, representing a ${stats.priceChange12m > 0 ? `+${stats.priceChange12m}%` : `${stats.priceChange12m}%`} change over the past 12 months` : ''}. Properties in ${snapshot.name} currently spend a median of ${stats.daysOnMarket !== null ? `${stats.daysOnMarket} days on market` : 'a measured period on market'}.`,
    },
    {
      question: `What is the rental yield and vacancy rate in ${snapshot.name} ${snapshot.state}?`,
      answer: `In ${snapshot.name} (${snapshot.state}), the median weekly asking rent is ${stats.medianRent !== null ? `$${stats.medianRent}/wk` : 'not available'}, producing a gross rental yield of ${stats.grossYield !== null ? `${stats.grossYield}%` : 'not available'}. The suburb vacancy rate is ${stats.vacancy !== null ? `${stats.vacancy}%` : 'tracked monthly'} as of ${snapshot.asOf}.`,
    },
    {
      question: `What are the best streets in ${snapshot.name} ${snapshot.state}?`,
      answer: streetList
        ? `Based on the Ripehouse Street Score (measuring SA1 census owner-occupier share, public housing concentration, and block-level rent and yield), top-scoring streets in ${snapshot.name} include ${streetList}. You can compare all streets in ${snapshot.name} on the ${snapshot.name} Street Score page.`
        : `Ripehouse Advisory scores every G-NAF street in ${snapshot.name} against the suburb average for owner-occupancy, public housing, rent, and yield. Use the ${snapshot.name} Street Score tool on this page to compare individual streets.`,
    },
    {
      question: `Which council area (LGA) is ${snapshot.name} ${snapshot.state} located in?`,
      answer: `${snapshot.name} (${snapshot.state}${snapshot.postcodes?.length ? `, postcode ${snapshot.postcodes.join(', ')}` : ''}) is located in the ${lgaName || 'local'} council area (LGA)${cityName ? ` within Greater ${cityName}` : ''}.${locationContext?.lga?.rScoreAvg ? ` Across ${lgaName}, the council-wide average R-Score is ${locationContext.lga.rScoreAvg}/100 across ${locationContext.lga.suburbCount} suburbs.` : ''}`,
    },
  ];
}

export function buildStreetFaqs(snapshot, suburbSnapshot = null) {
  const { suburb, stats } = snapshot;
  const where = `${snapshot.name}, ${suburb.name} ${suburb.state}`;
  return [
    {
      question: `What is the Street Score for ${where}?`,
      answer: snapshot.score !== null
        ? `${where} scores ${snapshot.score}/100 on the Ripehouse Street Score${suburb.average !== null && snapshot.gap !== null ? ` — ${snapshot.gap === 0 ? 'equal to' : `${Math.abs(snapshot.gap)} points ${snapshot.gap > 0 ? 'above' : 'below'}`} the ${suburb.name} street average of ${suburb.average}/100` : ''}${snapshot.rank && suburb.streetCount ? ` (ranked #${snapshot.rank} of ${suburb.streetCount} streets in ${suburb.name})` : ''}. The score is calculated across ${snapshot.addresses} addresses and ${snapshot.blocks} ABS census block${snapshot.blocks === 1 ? '' : 's'}.`
        : `${where} covers ${snapshot.addresses} G-NAF addresses across ${snapshot.blocks} census block${snapshot.blocks === 1 ? '' : 's'} in ${suburb.name}.`,
    },
    {
      question: `What is the owner-occupier and public housing percentage on ${where}?`,
      answer: `On the ABS 2021 Census SA1 blocks that ${snapshot.name} runs through in ${suburb.name}, owner-occupiers account for ${stats.ownerOcc !== null ? `${stats.ownerOcc}%` : 'an unrecorded share'} of households (Ripehouse benchmark: >65%) and public/social housing accounts for ${stats.publicHousing !== null ? `${stats.publicHousing}%` : 'an unrecorded share'} of households (Ripehouse benchmark: ≤5%).`,
    },
    {
      question: `What is the typical rent and rental yield on ${where}?`,
      answer: `Blocks along ${where} record a typical asking rent of ${stats.rent !== null ? `$${stats.rent}/wk` : 'insufficient data'}${suburb.rent !== null ? ` (compared with the ${suburb.name} suburb median of $${Math.round(suburb.rent)}/wk)` : ''} and a gross rental yield of ${stats.yieldRate !== null ? `${stats.yieldRate}%` : 'insufficient data'}${suburb.yieldRate !== null ? ` (versus ${Math.round(suburb.yieldRate * 1000) / 10}% across ${suburb.name})` : ''}.`,
    },
    {
      question: `How does ${snapshot.name} compare with other streets in ${suburb.name} ${suburb.state}?`,
      answer: `${suburb.name} has ${suburb.streetCount} streets${suburb.addresses ? ` (${suburb.addresses.toLocaleString('en-AU')} addresses)` : ''} with a suburb street average of ${suburb.average ?? '—'}/100${suburbSnapshot?.score != null ? ` and an overall suburb R-Score of ${suburbSnapshot.score}/100` : ''}. ${snapshot.betterCount > 0 ? `There are ${snapshot.betterCount} streets in ${suburb.name} that score higher than ${snapshot.name} (up to ${snapshot.topScore ?? 100}/100).` : `${snapshot.name} sits in the top tier of streets in ${suburb.name}.`}`,
    },
  ];
}

export function buildFaqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
