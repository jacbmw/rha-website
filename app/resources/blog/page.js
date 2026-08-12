import Link from 'next/link';
import Footer from '../../components/Footer.js';
import { listBlogItems } from '../../../lib/webflow';
import BlogHeroPanel from '../../components/panels/BlogHeroPanel';
import BlogGrid from './BlogGrid';
import { resolvePanel } from '../../../lib/panelVariants';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Market Intel | Ripehouse Advisory',
  description: 'Independent property market intelligence, practical guides and strategic insight from Ripehouse Advisory.',
};

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export default async function BlogPage() {
  let posts = [];
  try {
    posts = await listBlogItems({ limit: 100 });
  } catch (error) {
    console.error('Unable to load Market Intel:', error.message);
  }
  const heroPanel = await resolvePanel('panel-blog-hero');

  return (
    <main className="blog-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/#story">Our story</Link><Link href="/#approach">Our approach</Link><Link className="active" href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link></header>
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
