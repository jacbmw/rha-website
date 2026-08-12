export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au';
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      // Batched suburb sitemaps (generateSitemaps in app/suburbs/sitemap.js).
      ...[0, 1, 2, 3].map((id) => `${baseUrl}/suburbs/sitemap/${id}.xml`),
    ],
  };
}
