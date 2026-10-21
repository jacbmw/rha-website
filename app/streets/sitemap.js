import { getWarehousePool } from '../../lib/suburbs';
import {
  BAKE_TABLE,
  SUBURB_BAKE_TABLE,
  countIndexableStreetSuburbs,
  countStreetSitemapBatches,
} from '../../lib/streets';
import { SITE_URL } from '../../lib/seo';

// Street sitemaps, batched (Next generateSitemaps) — served at
// /streets/sitemap/[id].xml. Driven by the nightly bake:
//   - First batches list indexable per-suburb street hubs (/streets/[state]/[suburb],
//     where scored_streets >= 3, matching the page's noindex rule).
//   - Remaining batches list indexable streets (/streets/[state]/[suburb]/[street],
//     where confidence <> 'low' and score IS NOT NULL).
const BATCH_SIZE = 5000;

export const revalidate = 86400;

export async function generateSitemaps() {
  const batches = Math.max(1, await countStreetSitemapBatches(BATCH_SIZE));
  return Array.from({ length: batches }, (_, id) => ({ id }));
}

export default async function sitemap({ id }) {
  const batchId = Number(await id); // Next 16 passes id as a Promise
  try {
    const suburbTotal = await countIndexableStreetSuburbs();
    const suburbBatches = Math.ceil(suburbTotal / BATCH_SIZE);

    if (batchId < suburbBatches) {
      const [rows] = await getWarehousePool().query(
        `SELECT LOWER(state) AS state, slug AS suburb, baked_at
           FROM ${SUBURB_BAKE_TABLE}
          WHERE scored_streets >= 3 AND error IS NULL
          ORDER BY ssc_id
          LIMIT ${BATCH_SIZE} OFFSET ${batchId * BATCH_SIZE}`
      );
      return rows.map((row) => ({
        url: `${SITE_URL}/streets/${row.state}/${row.suburb}`,
        lastModified: row.baked_at ? new Date(row.baked_at) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    }

    const streetBatchId = batchId - suburbBatches;
    const [rows] = await getWarehousePool().query(
      `SELECT LOWER(s.state) AS state, s.slug AS suburb, b.slug AS street, b.baked_at
         FROM ${BAKE_TABLE} b JOIN ${SUBURB_BAKE_TABLE} s ON s.ssc_id = b.ssc_id
        WHERE b.confidence <> 'low' AND b.score IS NOT NULL AND s.error IS NULL
        ORDER BY b.ssc_id, b.slug
        LIMIT ${BATCH_SIZE} OFFSET ${streetBatchId * BATCH_SIZE}`
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
