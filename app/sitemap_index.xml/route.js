import { listIndexableSuburbSlugs } from '../../lib/suburbs';
import { countStreetSitemapBatches } from '../../lib/streets';
import { SITE_URL } from '../../lib/seo';

export const revalidate = 86400;

export async function GET() {
  const [{ entries: indexableSuburbs, lastModified }, streetBatches] = await Promise.all([
    listIndexableSuburbSlugs().catch(() => ({ entries: [], lastModified: null })),
    countStreetSitemapBatches(5000).catch(() => 86),
  ]);
  const suburbBatches = Math.max(1, Math.ceil(indexableSuburbs.length / 5000));
  const lastModIso = (lastModified ? new Date(lastModified) : new Date()).toISOString();

  const sitemaps = [
    `${SITE_URL}/sitemap.xml`,
    ...Array.from({ length: suburbBatches }, (_, id) => `${SITE_URL}/suburbs/sitemap/${id}.xml`),
    ...Array.from({ length: streetBatches }, (_, id) => `${SITE_URL}/streets/sitemap/${id}.xml`),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps.map((loc) => `  <sitemap><loc>${loc}</loc><lastmod>${lastModIso}</lastmod></sitemap>`),
    '</sitemapindex>',
  ].join('\n');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
