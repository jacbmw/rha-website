import { getWarehousePool } from '../../lib/suburbs';
import { BAKE_TABLE, SUBURB_BAKE_TABLE, countIndexableStreets } from '../../lib/streets';
import { SITE_URL } from '../../lib/seo';

// Street sitemaps, batched (Next generateSitemaps) — served at
// /streets/sitemap/[id].xml. Driven by the nightly bake: only streets with a
// reliable score (confidence <> 'low') are listed, matching the pages' own
// noindex rule. ~700k URLs nationally → ~140 batches of 5,000. Until the bake
// has run there are no batches (one empty sitemap).
const BATCH_SIZE = 5000;

export const revalidate = 86400;

export async function generateSitemaps() {
  const total = await countIndexableStreets();
  const batches = Math.max(1, Math.ceil(total / BATCH_SIZE));
  return Array.from({ length: batches }, (_, id) => ({ id }));
}

export default async function sitemap({ id }) {
  const batchId = Number(await id); // Next 16 passes id as a Promise
  try {
    const [rows] = await getWarehousePool().query(
      `SELECT LOWER(s.state) AS state, s.slug AS suburb, b.slug AS street, b.baked_at
         FROM ${BAKE_TABLE} b JOIN ${SUBURB_BAKE_TABLE} s ON s.ssc_id = b.ssc_id
        WHERE b.confidence <> 'low' AND b.score IS NOT NULL
        ORDER BY b.ssc_id, b.slug
        LIMIT ${BATCH_SIZE} OFFSET ${batchId * BATCH_SIZE}`
    );
    return rows.map((row) => ({
      url: `${SITE_URL}/streets/${row.state}/${row.suburb}/${row.street}`,
      lastModified: row.baked_at ? new Date(row.baked_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.4,
    }));
  } catch (error) {
    console.error('Street sitemap unavailable:', error.message);
    return [];
  }
}
