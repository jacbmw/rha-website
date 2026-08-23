import Link from 'next/link';
import Footer from '../../components/Footer.js';
import MobileNav from '../../components/MobileNav';
import { listBlogItems } from '../../../lib/blog-store';
import BlogHeroPanel from '../../components/panels/BlogHeroPanel';
import BlogGrid from './BlogGrid';
import { resolvePanel } from '../../../lib/panelVariants';
import { pageMetadata } from '../../../lib/seo';

export const metadata = pageMetadata({
  title: 'Market Intel | Ripehouse Advisory',
  description: 'Independent property market intelligence, practical guides and strategic insight from Ripehouse Advisory.',
  path: '/resources/blog',
});

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

function toCardData(post) {
  const words = String(post.body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return {
    id: post.id,
    name: post.name,
    slug: post.slug,
    summary: post.summary,
    category: post.category,
    image: post.image,
    imageAlt: post.imageAlt,
    publishedDate: post.publishedDate,
    readMinutes: Math.max(2, Math.round(words / 220)),
  };
}

// Cap each category to its latest N so high-volume categories (News publishes
// many times daily) can never starve evergreen sections off the index.
// Needs: lead block 3 (any category) + section grids 3 (Q&A 4) + archive strip 6
// + tab depth. 12 per category covers all of that with headroom.
const PER_CATEGORY_CAP = 12;

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
  try {
    // Fetch deep so every category's latest posts are present, then cap.
    posts = capAndDedupe((await listBlogItems({ limit: 500 })).map(toCardData));
  } catch (error) {
    console.error('Unable to load Market Intel:', error.message);
  }
  const heroPanel = await resolvePanel('panel-blog-hero');

  return (
    <main className="blog-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/#story">Our story</Link><Link href="/#approach">Our approach</Link><Link className="active" href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link><MobileNav links={[{ label: 'Our story', href: '/#story' }, { label: 'Our approach', href: '/#approach' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header>
      <section className="blog-hero section-shell">
        <p className="eyebrow"><span /> Ripehouse research &amp; perspective</p>
        <h1>Market <i>Intel.</i></h1>
        <div className="blog-hero-row">
          <p>News decoded, data analysed, suburbs dissected and strategy tested — everything we publish exists to make your next property decision sharper.</p>
          <BlogHeroPanel variant={heroPanel} />
        </div>
      </section>
      <section className="blog-content section-shell"><BlogGrid posts={posts} /></section>
      <section className="blog-cta section-shell"><div><p className="eyebrow light"><span /> Want the bigger picture?</p><h2>Strategy starts<br />with <i>context.</i></h2><p>Talk to our team about what the market means for your next move.</p><Link className="button button-light" href="/discovery-call">Book Discovery Call <span>↗</span></Link></div></section>

      <Footer />
    </main>
  );
}
