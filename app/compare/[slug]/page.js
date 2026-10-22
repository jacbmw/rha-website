import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import LocationFaqSection from '../../components/LocationFaqSection';
import { CompareBars } from '../../streets/[state]/[suburb]/[street]/StreetVisuals';
import { COMPARE_PAGES, findComparePage } from '../../../lib/compare-and-personas';
import { getLocationRegistry } from '../../../lib/locations';
import { pageMetadata, SITE_URL } from '../../../lib/seo';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

const logoUrl = '/images/rha-logo-dark.png';

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Case studies', href: '/case-studies' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = findComparePage(slug);
  if (!page) return { title: 'Compare | Ripehouse Advisory', robots: { index: false } };
  return pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: `/compare/${page.slug}`,
  });
}

export default async function CompareDetailPage({ params }) {
  const { slug } = await params;
  const page = findComparePage(slug);
  if (!page) notFound();

  const locationReg = await getLocationRegistry().catch(() => ({ cities: [], top50PickiLgas: [], asOf: 'latest month' }));
  const topCities = (locationReg?.cities || []).slice(0, 6);
  const otherComparisons = COMPARE_PAGES.filter((item) => item.slug !== page.slug).slice(0, 3);
  const pageUrl = `${SITE_URL}/compare/${page.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        headline: page.seoTitle.replace(/\s*\|\s*Ripehouse Advisory$/, ''),
        description: page.seoDescription,
        url: pageUrl,
        inLanguage: 'en-AU',
        author: {
          '@type': 'Person',
          name: 'Jacob Field',
          jobTitle: 'Founder & Chief Executive Officer',
          url: `${SITE_URL}/about/story`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Ripehouse Advisory',
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/rha-logo-dark.png` },
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
          { '@type': 'ListItem', position: 3, name: page.shortLabel, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="suburb-page loc-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-hero section-shell">
        <nav className="loc-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/compare">Compare</Link>
          <span>/</span>
          <span aria-current="page">{page.shortLabel}</span>
        </nav>

        <p className="eyebrow"><span /> {page.kicker} · Updated {locationReg?.asOf || '2026'}</p>
        <h1>{page.title} <i>{page.italicWord}</i></h1>
        <p className="suburb-meta" style={{ maxWidth: '820px' }}>{page.summary}</p>

        <aside className="article-at-a-glance" aria-label="At a glance summary">
          <p className="article-at-a-glance-title">At a glance · Key takeaways</p>
          <ul>
            {page.atAGlance.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        </aside>

        <div className="street-compare" id="compare">
          <CompareBars rows={page.compareBars} />
          <div className="street-compare-why">
            <p className="street-compare-callout">
              Quantitative screening across 15,000 suburbs and 518,400+ streets removes geographic and emotional blind spots.
            </p>
            <p className="street-note">
              Verify any market yourself in our free{' '}
              <Link href="/locations">30-City &amp; 544-LGA Directory</Link>,{' '}
              <Link href="/suburbs">Suburb R-Score tool</Link>, or{' '}
              <Link href="/streets">Street Score tool</Link>.
            </p>
          </div>
        </div>

        <div className="suburb-teasers">
          {page.teasers.map((t) => (
            <div className="suburb-teaser" key={t.label}>
              <span className="suburb-teaser-label">{t.label}</span>
              <strong>{t.value}</strong>
              <p>{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="suburb-index-list section-shell">
        <div className="section-label">Side-by-Side Comparison Matrix</div>
        <h2 className="loc-section-h2">{page.shortLabel}: Full Breakdown</h2>
        <div className="rha-table-wrap">
          <table className="rha-data-table" aria-label={`${page.shortLabel} comparison table`}>
            <thead>
              <tr>
                {page.tableHeaders.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row[0]}</td>
                  <td><b>{row[1]}</b></td>
                  <td>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="suburb-index-list section-shell">
        <div className="section-label">Deep-Dive Analysis</div>
        <div style={{ maxWidth: '820px' }}>
          {page.sections.map((sec) => (
            <div key={sec.heading} style={{ marginBottom: '34px' }}>
              <h2 className="loc-section-h3" style={{ fontSize: '28px', marginBottom: '12px' }}>{sec.heading}</h2>
              <p style={{ color: 'var(--muted)', fontSize: '15.5px', lineHeight: 1.75, margin: 0 }}>{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="rha-advisory-box">
          <div>
            <p className="eyebrow" style={{ marginBottom: '8px' }}><span /> Put the Ripehouse System to Work</p>
            <h3>Want to see how our 27-indicator R-Score applies to your next move?</h3>
            <p>
              Book a free 15-minute discovery call with a Ripehouse specialist. We will listen to where you are now, review your equity and borrowing position, and show you how our national research engine works.
            </p>
          </div>
          <Link className="button button-primary" href="/discovery-call">Book Free Discovery Call <span>↗</span></Link>
        </div>
      </section>

      {topCities.length > 0 && (
        <section className="suburb-index-list section-shell">
          <div className="section-label">Live Research Across Australia ({locationReg.asOf})</div>
          <h2 className="loc-section-h2">Inspect Live City, LGA, Suburb &amp; Street Data</h2>
          <div className="loc-card-grid">
            {topCities.map((city, idx) => (
              <Link key={city.slug} href={city.path} className="loc-card loc-card-compact">
                <div className="loc-card-top">
                  <span className="loc-card-rank">City #{idx + 1} · {city.state}</span>
                  {city.rScoreAvg !== null && <span className="loc-card-score">R-Score avg <b>{city.rScoreAvg}/100</b></span>}
                </div>
                <h3>Property Investment in {city.name}</h3>
                <div className="loc-card-stats">
                  <span><b>{city.suburbCount}</b> suburbs</span>
                  <span>Top R-Score <b>{city.rScoreMax ?? '—'}/100</b></span>
                  <span>Yield <b>{city.grossYield ?? '—'}%</b></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="suburb-index-list section-shell">
        <div className="section-label">More Comparisons</div>
        <h2 className="loc-section-h2">Compare Other Strategies</h2>
        <div className="loc-card-grid">
          {otherComparisons.map((item) => (
            <Link key={item.slug} href={`/compare/${item.slug}`} className="loc-card">
              <div className="loc-card-top">
                <span className="loc-card-rank">{item.kicker}</span>
                <span className="loc-card-score"><b>Read →</b></span>
              </div>
              <h3>{item.shortLabel}</h3>
              <p className="loc-card-tagline">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <LocationFaqSection
        eyebrow={`${page.shortLabel} FAQs`}
        heading={`Frequently Asked Questions: ${page.shortLabel}`}
        intro="Key answers from Ripehouse Advisory’s quantitative research and acquisitions team."
        faqs={page.faqs}
      />

      <Footer backHref="/compare" backLabel="All comparisons ↑" />
    </main>
  );
}
