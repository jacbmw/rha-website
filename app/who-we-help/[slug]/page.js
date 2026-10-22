import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import LocationFaqSection from '../../components/LocationFaqSection';
import { CompareBars } from '../../streets/[state]/[suburb]/[street]/StreetVisuals';
import { WHO_WE_HELP_PAGES, findWhoWeHelpPage } from '../../../lib/compare-and-personas';
import { listPublicCaseStudies, displayName } from '../../../lib/case-studies';
import { pageMetadata, SITE_URL } from '../../../lib/seo';

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return WHO_WE_HELP_PAGES.map((page) => ({ slug: page.slug }));
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
  const page = findWhoWeHelpPage(slug);
  if (!page) return { title: 'Who We Help | Ripehouse Advisory', robots: { index: false } };
  return pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: `/who-we-help/${page.slug}`,
  });
}

export default async function WhoWeHelpDetailPage({ params }) {
  const { slug } = await params;
  const page = findWhoWeHelpPage(slug);
  if (!page) notFound();

  const caseStudies = await listPublicCaseStudies().catch(() => []);
  const sampleStudies = (caseStudies || []).slice(0, 3);
  const otherPersonas = WHO_WE_HELP_PAGES.filter((item) => item.slug !== page.slug).slice(0, 3);
  const pageUrl = `${SITE_URL}/who-we-help/${page.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: `${page.persona} — Ripehouse Advisory Buyer’s Agency`,
        description: page.seoDescription,
        url: pageUrl,
        provider: {
          '@type': ['Organization', 'RealEstateAgent'],
          name: 'Ripehouse Advisory',
          url: SITE_URL,
        },
        areaServed: { '@type': 'Country', name: 'Australia' },
        audience: { '@type': 'Audience', audienceType: page.persona },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Who We Help', item: `${SITE_URL}/who-we-help` },
          { '@type': 'ListItem', position: 3, name: page.persona, item: pageUrl },
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
          <Link href="/who-we-help">Who We Help</Link>
          <span>/</span>
          <span aria-current="page">{page.persona}</span>
        </nav>

        <p className="eyebrow"><span /> {page.kicker}</p>
        <h1>{page.title} <i>{page.italicWord}</i></h1>
        <p className="suburb-meta" style={{ maxWidth: '820px' }}>{page.summary}</p>

        <aside className="article-at-a-glance" aria-label="At a glance summary">
          <p className="article-at-a-glance-title">At a glance · Strategy for {page.persona}</p>
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
              Every purchase brief is engineered around your borrowing capacity, cash buffers, and long-term sequence.
            </p>
            <p className="street-note">
              Explore our live data tools:{' '}
              <Link href="/locations">30 Cities &amp; 544 LGAs</Link>,{' '}
              <Link href="/suburbs">15,000 Suburb R-Scores</Link>, and{' '}
              <Link href="/streets">518,400+ Street Scores</Link>.
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
        <div className="section-label">Strategic Blueprint</div>
        <h2 className="loc-section-h2">How We Work With {page.persona}</h2>
        <div className="rha-table-wrap">
          <table className="rha-data-table" aria-label={`${page.persona} strategy table`}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ maxWidth: '820px', marginTop: '34px' }}>
          {page.sections.map((sec) => (
            <div key={sec.heading} style={{ marginBottom: '28px' }}>
              <h3 className="loc-section-h3" style={{ fontSize: '26px', marginBottom: '10px' }}>{sec.heading}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '15.5px', lineHeight: 1.75, margin: 0 }}>{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="rha-advisory-box">
          <div>
            <p className="eyebrow" style={{ marginBottom: '8px' }}><span /> Start With a 15-Minute Discovery Call</p>
            <h3>Ready to map your next property move with clarity?</h3>
            <p>
              Speak with a Ripehouse specialist about where you are now, what your equity or deposit can achieve, and which Australian markets match your brief.
            </p>
          </div>
          <Link className="button button-primary" href="/discovery-call">Book Free Discovery Call <span>↗</span></Link>
        </div>
      </section>

      {sampleStudies.length > 0 && (
        <section className="suburb-index-list section-shell">
          <div className="section-label">Verified Client Outcomes</div>
          <h2 className="loc-section-h2">Measured Client Portfolios</h2>
          <div className="loc-card-grid">
            {sampleStudies.map((study) => (
              <Link key={study.slug} href={`/case-studies/${study.slug}`} className="loc-card">
                <div className="loc-card-top">
                  <span className="loc-card-rank">Client Case Study</span>
                  {study.portfolioCagr != null && (
                    <span className="loc-card-score"><b>+{Number(study.portfolioCagr).toFixed(1)}% CAGR</b></span>
                  )}
                </div>
                <h3>{displayName(study.title)}</h3>
                <p className="loc-card-tagline">{study.subtitle || study.description}</p>
                <div className="loc-card-stats">
                  {Array.isArray(study.properties) && study.properties.length > 0 && (
                    <span><b>{study.properties.length}</b> properties acquired</span>
                  )}
                  {study.totalGrowth > 0 && (
                    <span>Growth <b>${Math.round(study.totalGrowth).toLocaleString('en-AU')}</b></span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="suburb-index-list section-shell">
        <div className="section-label">Other Investor Profiles</div>
        <h2 className="loc-section-h2">Explore More Investor Strategies</h2>
        <div className="loc-card-grid">
          {otherPersonas.map((item) => (
            <Link key={item.slug} href={`/who-we-help/${item.slug}`} className="loc-card">
              <div className="loc-card-top">
                <span className="loc-card-rank">{item.kicker.replace('Who We Help · ', '')}</span>
                <span className="loc-card-score"><b>View →</b></span>
              </div>
              <h3>{item.persona}</h3>
              <p className="loc-card-tagline">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <LocationFaqSection
        eyebrow={`${page.persona} FAQs`}
        heading={`Frequently Asked Questions: ${page.persona}`}
        intro="Answers from Ripehouse Advisory’s quantitative property research and strategy team."
        faqs={page.faqs}
      />

      <Footer backHref="/who-we-help" backLabel="All investor profiles ↑" />
    </main>
  );
}
