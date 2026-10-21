import { listIndexableSuburbSlugs } from '../lib/suburbs';
import { countStreetSitemapBatches } from '../lib/streets';

export const revalidate = 86400;

export default async function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au';
  const [{ entries: indexableSuburbs }, streetBatches] = await Promise.all([
    listIndexableSuburbSlugs().catch(() => ({ entries: [] })),
    countStreetSitemapBatches(5000),
  ]);
  const suburbBatches = Math.max(1, Math.ceil(indexableSuburbs.length / 5000));

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og/'],
        disallow: [
          '/go/',
          '/api/panel-preview',
          '/five-markets/on-its-way',
          '/worksheet-budget/on-its-way',
          '/webinar/registered',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      // Batched suburb sitemaps (generateSitemaps in app/suburbs/sitemap.js).
      ...Array.from({ length: suburbBatches }, (_, id) => `${baseUrl}/suburbs/sitemap/${id}.xml`),
      // Batched street sitemaps (generateSitemaps in app/streets/sitemap.js).
      ...Array.from({ length: streetBatches }, (_, id) => `${baseUrl}/streets/sitemap/${id}.xml`),
    ],
  };
}
