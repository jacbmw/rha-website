import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogItemBySlug, listBlogItems } from '../../../../lib/webflow';
import NewsletterSignup from '../../../components/NewsletterSignup';

export const dynamic = 'force-dynamic';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

function fmtDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

function readMinutes(body) {
  const words = String(body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}

export async function generateMetadata({ params }) {
  const post = await getBlogItemBySlug((await params).slug).catch(() => null);
  if (!post) return { title: 'Market Intel | Ripehouse Advisory' };
  return {
    title: `${post.seoTitle || post.name} | Ripehouse Advisory`,
    description: post.seoDescription || post.summary,
  };
}

export default async function BlogArticle({ params }) {
  const post = await getBlogItemBySlug((await params).slug);
  if (!post) notFound();

  let related = [];
  try {
    const all = await listBlogItems({ limit: 100 });
    related = all.filter((item) => item.id !== post.id && item.category === post.category).slice(0, 3);
    if (related.length < 3) {
      related = [...related, ...all.filter((item) => item.id !== post.id && !related.includes(item))].slice(0, 3);
    }
  } catch { /* related content is optional */ }

  return (
    <main className="article-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/#story">Our story</Link><Link href="/#approach">Our approach</Link><Link className="active" href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/resources/blog">← All stories</Link></header>

      <article className="article-content">
        <p className="eyebrow"><span /> {post.category || 'Market Intel'} · {fmtDate(post.publishedDate)} · {readMinutes(post.body)} min read</p>
        <h1>{post.name}</h1>
        {post.summary && <p className="article-summary">{post.summary}</p>}
        {post.image && <img className="article-image" src={post.image} alt={post.imageAlt} />}

        <aside className="inline-signup">
          <div>
            <p className="inline-signup-label">Market Intel, weekly</p>
            <p>The analysis behind stories like this one, in your inbox every week. Free, unsubscribe anytime.</p>
          </div>
          <NewsletterSignup source="article-inline" cta="Subscribe free" />
        </aside>

        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.body }} />

        <section className="article-cta-primary">
          <p className="eyebrow light"><span /> Don&apos;t stop at one story</p>
          <h2>Get every edition of <i>Market Intel.</i></h2>
          <p>Join thousands of Australian investors reading our research-first weekly briefing — the data, the suburbs and the strategy behind them.</p>
          <NewsletterSignup source="article-footer" cta="Join the briefing" />
        </section>

        <a className="article-cta-ebook" href="https://ripe.house/five-shorts?utm_source=rha-website&utm_medium=blog&utm_campaign=five_markets_report" target="_blank" rel="noreferrer">
          <div>
            <p className="ebook-flag">Free report</p>
            <h3>Top Five Markets Report 2026</h3>
            <p>The five Australian markets our research database says are quietly outperforming — and why.</p>
          </div>
          <span className="ebook-arrow">Download ↗</span>
        </a>
      </article>

      {related.length > 0 && (
        <section className="article-related section-shell">
          <p className="section-label">Keep reading</p>
          <div className="blog-grid">
            {related.map((item) => (
              <article className="intel-card" key={item.id}>
                <Link className="blog-image" href={`/resources/blog/${item.slug}`}>{item.image ? <img src={item.image} alt={item.imageAlt} loading="lazy" /> : <div className="blog-image-placeholder" />}</Link>
                <div className="intel-card-copy">
                  <p className="blog-kicker"><span className="kicker-cat">{item.category || 'Market Intel'}</span></p>
                  <h3><Link href={`/resources/blog/${item.slug}`}>{item.name}</Link></h3>
                  <Link className="blog-read-link" href={`/resources/blog/${item.slug}`}>Read the full story <span>↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="site-footer"><Link className="brand footer-brand" href="/"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><p>© 2026 Ripehouse Advisory. All rights reserved.</p><div><a href="#">Privacy</a><a href="#">Terms</a><Link href="/resources/blog">All stories ↑</Link></div></footer>
    </main>
  );
}
