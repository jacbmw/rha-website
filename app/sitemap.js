export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au';
  return [{ url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
