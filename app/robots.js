import { countIndexableStreets } from '../lib/streets';

export const revalidate = 86400;

export default async function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au';
  // Street sitemap batch count comes from the nightly bake (0 batches until it has run).
  const streetBatches = Math.ceil((await countIndexableStreets()) / 5000);
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/go/'] }],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      // Batched suburb sitemaps (generateSitemaps in app/suburbs/sitemap.js).
      ...[0, 1, 2, 3].map((id) => `${baseUrl}/suburbs/sitemap/${id}.xml`),
      // Batched street sitemaps (generateSitemaps in app/streets/sitemap.js).
      ...Array.from({ length: streetBatches }, (_, id) => `${baseUrl}/streets/sitemap/${id}.xml`),
    ],
  };
}
