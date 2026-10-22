import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import LocationFaqSection from '../../../components/LocationFaqSection';
import { CompareBars } from '../../../streets/[state]/[suburb]/[street]/StreetVisuals';
import { GLOSSARY_TERMS, findGlossaryTerm } from '../../../../lib/glossary';
import { getLocationRegistry } from '../../../../lib/locations';
import { pageMetadata, SITE_URL } from '../../../../lib/seo';

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY_TERMS.map((item) => ({ slug: item.slug }));
}

const logoUrl = '/images/rha-logo-dark.png';
const fmtMoney = (v) => (v === null || v === undefined ? '—' : `$${Math.round(v).toLocaleString('en-AU')}`);

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Case studies', href: '/case-studies' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = findGlossaryTerm(slug);
  if (!item) return { title: 'Property Glossary | Ripehouse Advisory', robots: { index: false } };
  return pageMetadata({
    title: `${item.questionTitle} Formula, Benchmarks & Suburb Data (2026) | Ripehouse Advisory`,
    description: item.definition.slice(0, 160),
    path: `/resources/glossary/${item.slug}`,
  });
}

export default async function GlossaryTermPage({ params }) {
  const { slug } = await params;
  const item = findGlossaryTerm(slug);
  if (!item) notFound();

  const { lgas = [], asOf = 'latest month' } = await getLocationRegistry().catch(() => ({ lgas: [], asOf: 'latest month' }));
  const allSuburbs = lgas
    .flatMap((lga) => (lga.suburbs || []).map((s) => ({
      ...s,
      lgaName: lga.name,
      lgaPath: lga.path,
      state: lga.state,
    })))
    .filter((s) => s.score !== null && s.confidence !== 'low' && s.medianPrice >= 250000);

  let liveSuburbs = [];
  if (item.liveRankType === 'yield') {
    liveSuburbs = [...allSuburbs]
      .filter((s) => s.score >= 70 && s.medianPrice <= 750000 && s.grossYield !== null && s.grossYield <= 12)
      .sort((a, b) => (b.grossYield - a.grossYield) || (b.score - a.score))
      .slice(0, 8);
  } else if (item.liveRankType === 'vacancy') {
    liveSuburbs = [...allSuburbs]
      .filter((s) => s.score >= 75 && s.vacancy !== null && s.vacancy >= 0.1 && s.vacancy <= 1.5 && s.medianPrice >= 350000)
      .sort((a, b) => (a.vacancy - b.vacancy) || (b.score - a.score))
      .slice(0, 8);
  } else {
    liveSuburbs = [...allSuburbs]
      .sort((a, b) => (b.score - a.score) || ((b.grossYield || 0) - (a.grossYield || 0)))
      .slice(0, 8);
  }

  const relatedTerms = GLOSSARY_TERMS.filter((t) => t.slug !== item.slug).slice(0, 6);
  const pageUrl = `${SITE_URL}/resources/glossary/${item.slug}`;

  const faqs = [
    {
      question: item.questionTitle,
      answer: item.definition,
    },
    {
      question: `How is ${item.term} calculated or measured in Australia?`,
      answer: `${item.term} is measured using the formula: ${item.formula}. Ripehouse Advisory’s target benchmark band is: ${item.benchmarkBand}.`,
    },
    {
      question: `How can I check ${item.term} for any Australian suburb or street?`,
      answer: `You can inspect live monthly R-Scores, median prices, weekly rents, gross yields, vacancy rates, and ABS SA1 Street Scores across 15,000+ suburbs and 518,400+ streets for free at ripehouseadvisory.com.au/suburbs and /streets.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${pageUrl}#term`,
        name: item.term,
        description: item.definition,
        url: pageUrl,
        inDefinedTermSet: `${SITE_URL}/resources/glossary`,
      },
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        headline: item.questionTitle,
        description: item.definition,
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
          { '@type': 'ListItem', position: 2, name: 'Property Glossary', item: `${SITE_URL}/resources/glossary` },
          { '@type': 'ListItem', position: 3, name: item.term, item: pageUrl },
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
          <Link href="/resources/glossary">Property Glossary</Link>
          <span>/</span>
          <span aria-current="page">{item.term}</span>
        </nav>

        <p className="eyebrow"><span /> {item.category} · Updated {asOf}</p>
        <h1>{item.questionTitle}</h1>
        <p className="suburb-meta" style={{ maxWidth: '840px', fontSize: '16.5px', lineHeight: 1.7, color: 'var(--ink)' }}>
          {item.definition}
        </p>

        <aside className="article-at-a-glance" aria-label="At a glance summary">
          <p className="article-at-a-glance-title">At a glance · {item.term}</p>
          <ul>
            {item.atAGlance.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        </aside>

        <div className="street-compare" id="compare">
          <CompareBars rows={item.compareBars} />
          <div className="street-compare-why">
            <p className="street-compare-callout">
              <b>Formula / Rule:</b> {item.formula}
            </p>
            <p className="street-note">
              <b>Ripehouse Benchmark:</b> {item.benchmarkBand}. Check any market live in our{' '}
              <Link href="/suburbs">Suburb R-Score tool</Link> or <Link href="/streets">Street Score tool</Link>.
            </p>
          </div>
        </div>

        <div className="suburb-teasers">
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Category</span>
            <strong>{item.category}</strong>
            <p>Part of the Ripehouse Advisory quantitative property investment framework.</p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Ripehouse Benchmark</span>
            <strong>{item.benchmarkBand.split('(')[0].trim()}</strong>
            <p>{item.formula}</p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">National Coverage</span>
            <strong>15,000+ Suburbs</strong>
            <p>Measured monthly across 30 Cities, 544 LGAs, and 518,400+ Australian streets.</p>
          </div>
        </div>
      </section>

      <section className="suburb-index-list section-shell">
        <div className="section-label">Benchmark Bands &amp; Interpretation</div>
        <h2 className="loc-section-h2">How to Read {item.term} in Australian Property</h2>
        <div className="rha-table-wrap">
          <table className="rha-data-table" aria-label={`${item.term} benchmark bands`}>
            <thead>
              <tr>
                <th>Reading / Tier</th>
                <th>Market Interpretation</th>
                <th>What It Means for Property Investors</th>
              </tr>
            </thead>
            <tbody>
              {item.tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row[0]}</td>
                  <td><b>{row[1]}</b></td>
                  <td>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ maxWidth: '820px', marginTop: '34px' }}>
          {item.sections.map((sec) => (
            <div key={sec.heading} style={{ marginBottom: '28px' }}>
              <h2 className="loc-section-h3" style={{ fontSize: '26px', marginBottom: '10px' }}>{sec.heading}</h2>
              <p style={{ color: 'var(--muted)', fontSize: '15.5px', lineHeight: 1.75, margin: 0 }}>{sec.body}</p>
            </div>
          ))}
        </div>
      </section>

      {liveSuburbs.length > 0 && (
        <section className="suburb-index-list section-shell">
          <div className="section-label">Live Australian Market Data ({asOf})</div>
          <h2 className="loc-section-h2">Top Australian Suburbs Measured this Month ({asOf})</h2>
          <p className="suburb-meta" style={{ marginBottom: '18px' }}>
            Live snapshot from Ripehouse Advisory’s monthly 15,000-suburb warehouse bake. Click any suburb to inspect its full R-Score report or drill down to its street-level scores.
          </p>
          <div className="rha-table-wrap">
            <table className="rha-data-table" aria-label={`Live Australian suburbs for ${item.term}`}>
              <thead>
                <tr>
                  <th>Suburb</th>
                  <th>State &amp; Council (LGA)</th>
                  <th>R-Score</th>
                  <th>Median Price</th>
                  <th>Gross Yield</th>
                  <th>Vacancy</th>
                  <th>Drill Down</th>
                </tr>
              </thead>
              <tbody>
                {liveSuburbs.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={s.path}><b>{s.name}</b></Link>
                      {s.postcodes?.[0] ? ` (${s.postcodes[0]})` : ''}
                    </td>
                    <td>{s.state} · <Link href={s.lgaPath}>{s.lgaName}</Link></td>
                    <td><b>{s.score}/100</b></td>
                    <td>{fmtMoney(s.medianPrice)}</td>
                    <td>{s.grossYield !== null ? `${s.grossYield}%` : '—'}</td>
                    <td>{s.vacancy !== null ? `${s.vacancy}%` : '—'}</td>
                    <td>
                      <Link href={s.path}><b>Suburb</b></Link> · <Link href={s.streetsPath}>Streets →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="footer-seo-more" style={{ marginTop: '16px' }}>
            Want to see the full national and state rankings?{' '}
            <Link href="/suburbs/best">Explore the Complete Top Suburbs Leaderboard →</Link>
          </p>
        </section>
      )}

      <section className="suburb-index-list section-shell">
        <div className="rha-advisory-box">
          <div>
            <p className="eyebrow" style={{ marginBottom: '8px' }}><span /> Apply the Data to Your Portfolio</p>
            <h3>Want our research team to apply these 27 indicators to your next property purchase?</h3>
            <p>
              Book a free 15-minute discovery call with Ripehouse Advisory. We will review your equity, borrowing capacity, and show you how our suburb and street screening works in practice.
            </p>
          </div>
          <Link className="button button-primary" href="/discovery-call">Book Free Discovery Call <span>↗</span></Link>
        </div>
      </section>

      <section className="suburb-index-list section-shell">
        <div className="section-label">Related Property Terms</div>
        <h2 className="loc-section-h2">Keep Exploring the Glossary</h2>
        <div className="loc-card-grid">
          {relatedTerms.map((rel) => (
            <Link key={rel.slug} href={`/resources/glossary/${rel.slug}`} className="loc-card loc-card-compact">
              <div className="loc-card-top">
                <span className="loc-card-rank">{rel.category}</span>
                <span className="loc-card-score"><b>Read →</b></span>
              </div>
              <h3>{rel.term}</h3>
              <div className="loc-card-stats">
                <span><b>{rel.benchmarkBand}</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LocationFaqSection
        eyebrow={`${item.term} FAQs`}
        heading={`Frequently Asked Questions: ${item.term}`}
        intro={`Key answers from Ripehouse Advisory’s quantitative research team (${asOf}).`}
        faqs={faqs}
      />

      <Footer backHref="/resources/glossary" backLabel="All glossary terms ↑" />
    </main>
  );
}
