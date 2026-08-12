import { listBlogItems } from '../lib/webflow';
import { listPublicCaseStudies } from '../lib/case-studies';

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au';

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/discovery-call`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about/approach`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about/story`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/case-studies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/resources/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/five-markets`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/suburbs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    // Individual suburb pages ship in batched sitemaps at /suburbs/sitemap/[id].xml
    ...['qld', 'nsw', 'vic', 'sa', 'wa', 'tas', 'nt', 'act'].map((state) => ({
      url: `${baseUrl}/suburbs/${state}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6,
    })),
    { url: `${baseUrl}/legal/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/legal/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [posts, caseStudies] = await Promise.all([
    listBlogItems({ limit: 100 }).catch((error) => {
      console.error('Sitemap: unable to load blog posts:', error.message);
      return [];
    }),
    listPublicCaseStudies(),
  ]);

  const blogRoutes = posts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${baseUrl}/resources/blog/${post.slug}`,
      lastModified: post.publishedDate ? new Date(post.publishedDate) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const caseStudyRoutes = caseStudies
    .filter((study) => study.slug)
    .map((study) => ({
      url: `${baseUrl}/case-studies/${study.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...blogRoutes, ...caseStudyRoutes];
}
