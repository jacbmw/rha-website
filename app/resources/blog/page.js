import Link from 'next/link';
import Footer from '../../components/Footer.js';
import MobileNav from '../../components/MobileNav';
import { listBlogItems, listAllBlogItems } from '../../../lib/blog-store';
import StreetHeroPanel from '../../components/panels/StreetHeroPanel';
import BlogGrid from './BlogGrid';
import { resolvePanel } from '../../../lib/panelVariants';
import { pageMetadata } from '../../../lib/seo';

export const metadata = pageMetadata({
  title: 'Market Intel — Australian Property Research, News & Strategy | Ripehouse Advisory',
  description: 'Independent Australian property market intelligence, suburb deep dives, RBA rate analysis, and strategic investment guides from Ripehouse Advisory.',
  path: '/resources/blog',
});

const logoUrl = '/images/rha-logo-dark.png';

function toCardData(post) {
  const words = String(post.body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return {
    id: post.id,
    name: post.name,
    slug: post.slug,
    summary: post.summary,
    category: post.category || 'Market Analysis',
    image: post.image,
    imageAlt: post.imageAlt,
    publishedDate: post.publishedDate,
    readMinutes: Math.max(2, Math.round(words / 220)),
  };
}

// Cap each category to its latest N so high-volume categories (News publishes
// many times daily) can never starve evergreen sections off the interactive top grid.
const PER_CATEGORY_CAP = 12;
const BLOG_CATEGORIES = ['News', 'Market Analysis', 'Suburb Deep Dives', 'Strategy', 'Q&A'];

function capAndDedupe(items) {
  const sorted = [...items].sort(
    (a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0),
  );
  const seenSlugs = new Set();
  const perCategory = new Map();
  const result = [];
  for (const post of sorted) {
    if (!post.slug || seenSlugs.has(post.slug)) continue; // never show a piece twice
    const cat = post.category || 'Uncategorised';
    const used = perCategory.get(cat) || 0;
    if (used >= PER_CATEGORY_CAP) continue;
    seenSlugs.add(post.slug);
    perCategory.set(cat, used + 1);
    result.push(post);
  }
  return result;
}

export default async function BlogPage() {
  let posts = [];
  let allArchiveLinks = [];
  try {
    const [categoryPosts, allPosts] = await Promise.all([
      Promise.all(
        BLOG_CATEGORIES.map((category) => listBlogItems({ category, limit: PER_CATEGORY_CAP })),
      ),
      listAllBlogItems({ pageSize: 100, maxPages: 8 }).catch(() => []),
    ]);
    posts = capAndDedupe(categoryPosts.flat().map(toCardData));
    const shownSlugs = new Set(posts.map((p) => p.slug));
    allArchiveLinks = (allPosts || [])
      .filter((p) => p.slug && !p.isDraft && !p.isArchived && !shownSlugs.has(p.slug))
      .sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0))
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category || 'Market Intel',
      }));
  } catch (error) {
    console.error('Unable to load Market Intel:', error.message);
  }
  const heroPanel = await resolvePanel('panel-street-hero');

  return (
    <main className="blog-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/#story">Our story</Link><Link href="/#approach">Our approach</Link><Link className="active" href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link><MobileNav links={[{ label: 'Our story', href: '/#story' }, { label: 'Our approach', href: '/#approach' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header>
      <section className="blog-hero section-shell">
        <p className="eyebrow"><span /> Ripehouse research &amp; perspective</p>
        <h1>Market <i>Intel.</i></h1>
        <div className="blog-hero-row">
          <p>News decoded, data analysed, suburbs dissected and strategy tested — everything we publish exists to make your next property decision sharper.</p>
          <StreetHeroPanel variant={heroPanel} />
        </div>
      </section>
      <section className="blog-content section-shell"><BlogGrid posts={posts} /></section>

      {allArchiveLinks.length > 0 && (
        <section className="suburb-index-list section-shell" aria-labelledby="blog-archive-heading">
          <div className="section-label">Complete Market Intel Archive ({allArchiveLinks.length + posts.length} Articles)</div>
          <h2 className="loc-section-h2" id="blog-archive-heading">All Market Intel Research &amp; Briefings</h2>
          <p className="suburb-meta" style={{ marginBottom: '18px' }}>
            Browse every published Ripehouse Advisory market analysis, RBA interest rate briefing, tax and negative gearing guide, and suburb deep dive.
          </p>
          <ul className="suburb-plain-list loc-suburb-grid">
            {allArchiveLinks.map((item) => (
              <li key={item.slug} className="loc-suburb-item">
                <Link href={`/resources/blog/${item.slug}`} className="loc-suburb-main" prefetch={false}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="blog-cta section-shell"><div><p className="eyebrow light"><span /> Street Score</p><h2>Strategy starts<br />at <i>street level.</i></h2><p>Every Australian street, scored against its own suburb. Check the one you&rsquo;re thinking about — free, and we show our working.</p><Link className="button button-light" href="/streets?int_ref=blog-index">Check a street <span>↗</span></Link></div></section>

      <Footer />
    </main>
  );
}
