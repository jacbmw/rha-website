import Link from 'next/link';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import { notFound } from 'next/navigation';
import { getBlogItemBySlug, listBlogItems } from '../../../../lib/webflow';
import ArticleFooterPanel from '../../../components/panels/ArticleFooterPanel';
import ArticleEbookPanel from '../../../components/panels/ArticleEbookPanel';
import SuburbScoreWidget from '../../../components/SuburbScoreWidget';
import { resolvePanel } from '../../../../lib/panelVariants';
import { pageMetadata } from '../../../../lib/seo';

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
  const slug = (await params).slug;
  const post = await getBlogItemBySlug(slug).catch(() => null);
  if (!post) return { title: 'Market Intel | Ripehouse Advisory' };
  return pageMetadata({
    title: `${post.seoTitle || post.name} | Ripehouse Advisory`,
    description: post.seoDescription || post.summary,
    ogTitle: post.seoTitle || post.name,
    path: `/resources/blog/${slug}`,
    image: post.image ? { url: post.image, alt: post.imageAlt || post.name } : undefined,
    article: {
      publishedTime: post.publishedDate || undefined,
      authors: post.author ? [post.author] : undefined,
      section: post.category || undefined,
    },
  });
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

  const [footerPanel, ebookPanel] = await Promise.all([
    resolvePanel('panel-article-footer'),
    resolvePanel('panel-article-ebook'),
  ]);

  return (
    <main className="article-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/#story">Our story</Link><Link href="/#approach">Our approach</Link><Link className="active" href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/resources/blog">← All stories</Link><MobileNav links={[{ label: 'Our story', href: '/#story' }, { label: 'Our approach', href: '/#approach' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header>

      <article className="article-content">
        <p className="eyebrow"><span /> {post.category || 'Market Intel'} · {fmtDate(post.publishedDate)} · {readMinutes(post.body)} min read</p>
        <h1>{post.name}</h1>
        {post.summary && <p className="article-summary">{post.summary}</p>}
        {post.image && <img className="article-image" src={post.image} alt={post.imageAlt} />}

        {/* Suburb widget owns the mid-article slot; the dark footer panel is
            the sole end-of-article newsletter CTA (inline panel retired —
            it doubled up with the footer panel). */}
        <SuburbScoreWidget variant="article" />

        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.body }} />

        <ArticleFooterPanel variant={footerPanel} />

        <ArticleEbookPanel variant={ebookPanel} />
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

      <Footer backHref="/resources/blog" backLabel="All stories ↑" />
    </main>
  );
}
