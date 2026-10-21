import Link from 'next/link';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import { notFound } from 'next/navigation';
import { getBlogItemBySlug, listBlogItems } from '../../../../lib/blog-store';
import StreetRailPanel from '../../../components/panels/StreetRailPanel';
import ArticleAdSlot from '../../../components/ArticleAdSlot';
import ArticleStreetPitch from '../../../components/panels/ArticleStreetPitch';
import { AdMixProvider } from '../../../components/AdMixProvider';
import EndlessScroll from '../../../components/EndlessScroll';
import { splitBody, extractMentionedLocations } from '../../../../lib/blog-body';
import { resolvePanel } from '../../../../lib/panelVariants';
import { pageMetadata } from '../../../../lib/seo';

const logoUrl = '/images/rha-logo-dark.png';

function fmtDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

function readMinutes(body) {
  const words = String(body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}

function hasVideoEmbed(body) {
  return /data-rt-type="video"|<iframe[^>]*(youtube\.com|youtu\.be|vimeo\.com)|<video\b/i.test(String(body || ''));
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

  const [railPanel, inlinePanel, footerPanel, cardPanel, pitchPanel] = await Promise.all([
    resolvePanel('panel-street-rail'),
    resolvePanel('panel-street-inline'),
    resolvePanel('panel-street-footer'),
    resolvePanel('panel-street-card'),
    resolvePanel('panel-street-pitch'),
  ]);

  const [bodyLead, bodyRest] = splitBody(post.body, 0.5);
  const mentionedLocations = extractMentionedLocations(post, 10);

  return (
    <main className="article-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/#story">Our story</Link><Link href="/#approach">Our approach</Link><Link className="active" href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/resources/blog">← All stories</Link><MobileNav links={[{ label: 'Our story', href: '/#story' }, { label: 'Our approach', href: '/#approach' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header>

      <AdMixProvider variants={{
        'panel-street-rail': railPanel,
        'panel-street-inline': inlinePanel,
        'panel-street-footer': footerPanel,
        'panel-street-card': cardPanel,
        'panel-street-pitch': pitchPanel,
      }}
      >
        <div className="article-layout">
          <article
            className="article-content"
            data-feed-article
            data-slug={post.slug}
            data-title={`${post.seoTitle || post.name} | Ripehouse Advisory`}
          >
            <p className="eyebrow"><span /> {post.category || 'Market Intel'} · {fmtDate(post.publishedDate)} · {readMinutes(post.body)} min read</p>
            <h1>{post.name}</h1>
            {post.summary && <p className="article-summary">{post.summary}</p>}
            {post.image && !hasVideoEmbed(post.body) && <img className="article-image" src={post.image} alt={post.imageAlt} />}

            <div className="article-body" dangerouslySetInnerHTML={{ __html: bodyLead }} />
            <ArticleAdSlot excludeWebinarOnDesktop />
            <div className="article-body" dangerouslySetInnerHTML={{ __html: bodyRest }} />
            <ArticleStreetPitch post={post} />
            {mentionedLocations.length > 0 && (
              <section className="article-locations-box" aria-label="Locations mentioned in this article">
                <p className="eyebrow"><span /> Market data &amp; R-Scores for locations in this article</p>
                <h2>Drill Down Into the Markets Mentioned Above</h2>
                <p className="article-locations-copy">
                  Inspect live monthly R-Scores, median prices, rental yields, and street-by-street scores for the cities and council areas referenced in this article:
                </p>
                <div className="article-locations-chips">
                  {mentionedLocations.map((loc) => (
                    <Link key={loc.path} href={loc.path} className="article-location-chip">
                      <span>{loc.kind}</span>
                      <b>Property Investment in {loc.label} →</b>
                    </Link>
                  ))}
                  <Link href="/locations" className="article-location-chip article-location-chip-all">
                    <span>Directory</span>
                    <b>All 30 Cities, 540+ LGAs, Suburbs &amp; Streets →</b>
                  </Link>
                </div>
              </section>
            )}
            {post.faq?.items?.length > 0 && (
              <section className="article-faq" aria-labelledby="article-faq-heading">
                <h2 id="article-faq-heading">Frequently asked questions</h2>
                {/* Collapsed <details> accordion: the full Q&A stays in the
                    server-rendered HTML so search/LLM crawlers index it; the
                    FAQPage JSON-LD below makes the pairs explicit either way. */}
                {post.faq.items.map((item) => (
                  <details className="article-faq-item" key={item.question}>
                    <summary><h3>{item.question}</h3><span aria-hidden="true">+</span></summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@type': 'FAQPage',
                      mainEntity: post.faq.items.map((item) => ({
                        '@type': 'Question',
                        name: item.question,
                        acceptedAnswer: { '@type': 'Answer', text: item.answer },
                      })),
                    }),
                  }}
                />
              </section>
            )}
            <ArticleAdSlot excludeWebinarOnDesktop />

            <p className="article-disclaimer">General information only. It does not take your objectives, financial situation or needs into account, and nothing here is legal, financial, taxation or investment advice specific to your circumstances.</p>
          </article>

          <aside className="article-rail" aria-label="Street Score">
            <StreetRailPanel variant={railPanel} placement="rail" />
          </aside>
        </div>

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

        <EndlessScroll startSlug={post.slug} />
      </AdMixProvider>

      <Footer backHref="/resources/blog" backLabel="All stories ↑" />
    </main>
  );
}
