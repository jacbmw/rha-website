import { listAllBlogItems } from '../lib/blog-store';
import { listPublicCaseStudies } from '../lib/case-studies';
import { listSuburbSlugs, getLatestMonth } from '../lib/suburbs';
import { getLocationRegistry } from '../lib/locations';

export const revalidate = 3600;

// Next's static export kills any route that takes >60s, and a hung dashboard
// (nginx 504s at 60s) has failed whole deploys via this route. Race the
// upstream calls against a hard deadline: on timeout we ship the static
// routes and let the next ISR revalidation fill the rest in.
function withDeadline(promise, label, ms = 20000) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => {
      console.error(`Sitemap: ${label} timed out after ${ms}ms`);
      resolve([]);
    }, ms)),
  ]);
}

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au';

  const [posts, caseStudies, suburbSlugs, latestSuburbMonth, locationReg] = await Promise.all([
    withDeadline(listAllBlogItems().catch((error) => {
      console.error('Sitemap: unable to load blog posts:', error.message);
      return [];
    }), 'blog posts'),
    withDeadline(listPublicCaseStudies(), 'case studies'),
    withDeadline(listSuburbSlugs().catch(() => []), 'suburb slugs'),
    withDeadline(getLatestMonth().catch(() => null), 'suburb month'),
    withDeadline(getLocationRegistry().catch(() => ({ cities: [], lgas: [] })), 'locations'),
  ]);

  const suburbLastMod = latestSuburbMonth ? new Date(latestSuburbMonth) : undefined;
  const latestBlogDate = posts.reduce((max, post) => {
    const t = post.publishedDate ? Date.parse(post.publishedDate) : NaN;
    return Number.isFinite(t) && t > max ? t : max;
  }, 0);
  const latestCaseStudyDate = caseStudies.reduce((max, study) => {
    const t = study.updatedAt ? Date.parse(study.updatedAt) : NaN;
    return Number.isFinite(t) && t > max ? t : max;
  }, 0);

  // Per-state letter browse pages (/suburbs/[state]/browse/[letter]) provide the
  // crawlable HTML index into the suburb pages without exceeding the 100KB budget.
  const validStates = new Set(['qld', 'nsw', 'vic', 'sa', 'wa', 'tas', 'nt', 'act']);
  const stateLetters = new Set();
  for (const entry of suburbSlugs || []) {
    const stateCode = String(entry.state || '').toLowerCase();
    const letter = String(entry.slug || '')[0]?.toLowerCase();
    if (validStates.has(stateCode) && letter && /[a-z]/.test(letter)) {
      stateLetters.add(`${stateCode}/browse/${letter}`);
    }
  }
  const letterBrowseRoutes = [...stateLetters].sort().map((path) => ({
    url: `${baseUrl}/suburbs/${path}`,
    ...(suburbLastMod ? { lastModified: suburbLastMod } : {}),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const staticRoutes = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/discovery-call`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about/approach`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about/story`, changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${baseUrl}/case-studies`,
      ...(latestCaseStudyDate ? { lastModified: new Date(latestCaseStudyDate) } : {}),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources/blog`,
      ...(latestBlogDate ? { lastModified: new Date(latestBlogDate) } : {}),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    { url: `${baseUrl}/five-markets`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/worksheet-budget`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/bell-family`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/facebook-group`, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${baseUrl}/suburbs`,
      ...(suburbLastMod ? { lastModified: suburbLastMod } : {}),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Individual suburb pages ship in batched sitemaps at /suburbs/sitemap/[id].xml
    ...['qld', 'nsw', 'vic', 'sa', 'wa', 'tas', 'nt', 'act'].map((state) => ({
      url: `${baseUrl}/suburbs/${state}`,
      ...(suburbLastMod ? { lastModified: suburbLastMod } : {}),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...letterBrowseRoutes,
    // Individual suburb street hubs & street pages ship in batched sitemaps at /streets/sitemap/[id].xml
    { url: `${baseUrl}/streets`, changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${baseUrl}/locations`,
      ...(suburbLastMod ? { lastModified: suburbLastMod } : {}),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...(locationReg?.cities || []).map((city) => ({
      url: `${baseUrl}${city.path}`,
      ...(suburbLastMod ? { lastModified: suburbLastMod } : {}),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
    ...(locationReg?.lgas || []).map((lga) => ({
      url: `${baseUrl}${lga.path}`,
      ...(suburbLastMod ? { lastModified: suburbLastMod } : {}),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    { url: `${baseUrl}/legal/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/legal/terms-and-conditions`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const blogRoutes = posts
    .filter((post) => post.slug && !post.isDraft && !post.isArchived)
    .map((post) => ({
      url: `${baseUrl}/resources/blog/${post.slug}`,
      ...(post.publishedDate ? { lastModified: new Date(post.publishedDate) } : {}),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const caseStudyRoutes = caseStudies
    .filter((study) => study.slug)
    .map((study) => ({
      url: `${baseUrl}/case-studies/${study.slug}`,
      ...(study.updatedAt ? { lastModified: new Date(study.updatedAt) } : {}),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...blogRoutes, ...caseStudyRoutes];
}
