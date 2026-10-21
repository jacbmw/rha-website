import { listIndexableSuburbSlugs } from '../../lib/suburbs';
import { SITE_URL } from '../../lib/seo';

// Suburb sitemap, batched (Next generateSitemaps) — served at
// /suburbs/sitemap/[id].xml. Only indexable suburbs (confidence <> 'low',
// matching the page's own noindex rule) are listed in batches of 5,000.
const BATCH_SIZE = 5000;

export const revalidate = 86400;

export async function generateSitemaps() {
  const { entries } = await listIndexableSuburbSlugs().catch(() => ({ entries: [] }));
  const batches = Math.max(1, Math.ceil(entries.length / BATCH_SIZE));
  return Array.from({ length: batches }, (_, id) => ({ id }));
}

export default async function sitemap({ id }) {
  const batchId = Number(await id); // Next 16 passes id as a Promise
  const { entries, lastModified } = await listIndexableSuburbSlugs().catch((error) => {
    console.error('Suburb sitemap: registry unavailable:', error.message);
    return { entries: [], lastModified: null };
  });
  const sorted = [...entries].sort((a, b) => `${a.state}/${a.slug}`.localeCompare(`${b.state}/${b.slug}`));
  return sorted
    .slice(batchId * BATCH_SIZE, (batchId + 1) * BATCH_SIZE)
    .map((entry) => ({
      url: `${SITE_URL}/suburbs/${entry.state}/${entry.slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
}
