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
import { pageMetadata, SITE_URL } from '../../../../lib/seo';

const logoUrl = '/images/rha-logo-dark.png';

function cleanSeoTitle(raw) {
  const base = String(raw || '').replace(/\s*[|–—-]\s*Ripehouse Advisory\s*$/i, '').trim();
  return base ? `${base} | Ripehouse Advisory` : 'Market Intel | Ripehouse Advisory';
}

function isSummaryDuplicateOfBody(summary, bodyHtml) {
  const cleanSum = String(summary || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!cleanSum) return false;
  const firstPMatch = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(String(bodyHtml || ''));
  if (!firstPMatch) return false;
  const firstPText = firstPMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!firstPText) return false;
  const prefixLen = Math.min(60, cleanSum.length, firstPText.length);
  return cleanSum === firstPText || (prefixLen >= 30 && firstPText.startsWith(cleanSum.slice(0, prefixLen)));
}

function buildAtAGlanceBullets(post) {
  const bullets = [];
  const desc = String(post.seoDescription || '').replace(/\s+/g, ' ').trim();
  if (desc && desc.length >= 40) bullets.push(desc);

  if (Array.isArray(post.faq?.items)) {
    for (const item of post.faq.items) {
      if (bullets.length >= 3) break;
      const ans = String(item?.answer || '').replace(/\s+/g, ' ').trim();
      if (!ans) continue;
      const firstSentence = ans.split(/(?<=[.?!])\s+/)[0] || ans;
      if (firstSentence.length >= 35 && !bullets.includes(firstSentence)) {
        bullets.push(firstSentence);
      }
    }
  }
  return bullets.slice(0, 3);
}

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
  const fullTitle = cleanSeoTitle(post.seoTitle || post.name);
  const cleanHeadline = fullTitle.replace(/\s*\|\s*Ripehouse Advisory$/, '');
  return pageMetadata({
    title: fullTitle,
    description: post.seoDescription || post.summary,
    ogTitle: cleanHeadline,
    path: `/resources/blog/${slug}`,
    image: post.image ? { url: post.image, alt: post.imageAlt || post.name } : undefined,
    article: {
      publishedTime: post.publishedDate || undefined,
      authors: post.author ? [post.author] : ['Jacob Field'],
      section: post.category || 'Market Intel',
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
  const showSummaryLead = Boolean(post.summary) && !isSummaryDuplicateOfBody(post.summary, post.body);
  const atAGlanceBullets = buildAtAGlanceBullets(post);
  const fullTitle = cleanSeoTitle(post.seoTitle || post.name);
  const articleUrl = `${SITE_URL}/resources/blog/${post.slug}`;
  const wordCount = String(post.body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': post.category === 'News' ? 'NewsArticle' : 'Article',
        '@id': `${articleUrl}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
        headline: post.name,
        alternativeHeadline: post.seoTitle ? post.seoTitle.replace(/\s*\|\s*Ripehouse Advisory\s*$/i, '') : undefined,
        description: post.seoDescription || post.summary || undefined,
        image: post.image ? [post.image] : [`${SITE_URL}/images/rha-logo-dark.png`],
        datePublished: post.publishedDate || undefined,
        dateModified: post.publishedDate || undefined,
        articleSection: post.category || 'Market Intel',
        wordCount: wordCount || undefined,
        inLanguage: 'en-AU',
        author: [
          {
            '@type': 'Person',
            name: post.author || 'Jacob Field',
            jobTitle: post.author && /anna/i.test(post.author) ? 'Chief Operations Officer' : 'Founder & Chief Executive Officer',
            url: `${SITE_URL}/about/story`,
            worksFor: { '@type': 'Organization', name: 'Ripehouse Advisory', url: SITE_URL },
          },
        ],
        publisher: {
          '@type': 'Organization',
          name: 'Ripehouse Advisory',
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/images/rha-logo-dark.png`,
          },
        },
        ...(mentionedLocations.length > 0
          ? {
              about: mentionedLocations.map((loc) => ({
                '@type': loc.kind === 'City' ? 'City' : 'AdministrativeArea',
                name: loc.label,
                url: `${SITE_URL}${loc.path}`,
              })),
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${articleUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Market Intel', item: `${SITE_URL}/resources/blog` },
          { '@type': 'ListItem', position: 3, name: post.name, item: articleUrl },
        ],
      },
    ],
  };

  return (
    <main className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
            data-title={fullTitle}
          >
            <p className="eyebrow"><span /> {post.category || 'Market Intel'} · {fmtDate(post.publishedDate)} · {readMinutes(post.body)} min read</p>
            <h1>{post.name}</h1>
            {showSummaryLead && <p className="article-summary">{post.summary}</p>}
            {atAGlanceBullets.length >= 2 && (
              <aside className="article-at-a-glance" aria-label="At a glance key takeaways">
                <p className="article-at-a-glance-title">At a glance · Key takeaways</p>
                <ul>
                  {atAGlanceBullets.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                  {mentionedLocations.length > 0 && (
                    <li>
                      Markets referenced:{' '}
                      {mentionedLocations.slice(0, 3).map((loc, i) => (
                        <span key={loc.path}>
                          {i > 0 ? ', ' : ''}
                          <Link href={loc.path}>{loc.label} R-Score &amp; Data</Link>
                        </span>
                      ))}
                      .
                    </li>
                  )}
                </ul>
              </aside>
            )}
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
