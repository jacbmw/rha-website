import Link from 'next/link';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import LocationFaqSection from '../../components/LocationFaqSection';
import { GLOSSARY_TERMS } from '../../../lib/glossary';
import { pageMetadata, SITE_URL } from '../../../lib/seo';

export const revalidate = 86400;

const logoUrl = '/images/rha-logo-dark.png';

export const metadata = pageMetadata({
  title: 'Australian Property Investment Glossary — R-Score, Street Score, Yields, LVR & Tax Terms | Ripehouse Advisory',
  description: 'Clear, data-backed definitions of 25 core Australian property investment metrics and terms — including Gross Rental Yield, Vacancy Rate, Suburb R-Score, SA1 Street Score, LVR, Usable Equity, Debt Recycling, and CGT.',
  path: '/resources/glossary',
});

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Case studies', href: '/case-studies' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

const hubFaqs = [
  {
    question: 'What is the difference between a standard property glossary and Ripehouse Advisory’s glossary?',
    answer: 'Every definition in the Ripehouse Property Investment Glossary includes the exact mathematical formula, the quantitative benchmark band used by our research analysts, and a live monthly leaderboard of Australian suburbs and cities measured on that indicator.',
  },
  {
    question: 'Which indicators make up the Ripehouse Suburb R-Score and Street Score?',
    answer: 'The monthly Suburb R-Score synthesises 27 indicators across Buyer Demand (Days on Market, Vendor Discounting, Sales Velocity), Supply & Ownership (Building Approvals, Stock on Market, Owner-Occupier Share), Price Momentum, and Yield Pressure (Gross Rental Yield, Weekly Rent Growth, Vacancy Rate). The Street Score tests every ABS SA1 census block for owner-occupiers (>65%), public housing (≤5%), and block-level rent and yield.',
  },
];

export default function GlossaryHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTermSet',
        '@id': `${SITE_URL}/resources/glossary#termset`,
        name: 'Ripehouse Advisory Australian Property Investment Glossary',
        description: 'Quantitative definitions, formulas, and Australian suburb benchmarks for 25 core property investment terms and R-Score indicators.',
        url: `${SITE_URL}/resources/glossary`,
        hasDefinedTerm: GLOSSARY_TERMS.map((item) => ({
          '@type': 'DefinedTerm',
          name: item.term,
          description: item.definition,
          url: `${SITE_URL}/resources/glossary/${item.slug}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/resources/glossary#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Market Intel', item: `${SITE_URL}/resources/blog` },
          { '@type': 'ListItem', position: 3, name: 'Property Investment Glossary', item: `${SITE_URL}/resources/glossary` },
        ],
      },
    ],
  };

  return (
    <main className="suburb-index-page loc-directory-page">
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

      <section className="suburb-index-hero section-shell">
        <nav className="loc-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/resources/blog">Market Intel</Link>
          <span>/</span>
          <span aria-current="page">Property Investment Glossary</span>
        </nav>
        <p className="eyebrow"><span /> Australian Property Investment Glossary &amp; Metrics</p>
        <h1>The language of property, <i>measured.</i></h1>
        <p className="suburb-meta">
          Plain-English definitions, exact formulas, quantitative benchmark bands, and live Australian suburb rankings for the core metrics behind our 15,000-suburb R-Score and 518,400+ Street Score engine.
        </p>
        <div className="loc-quick-jumps">
          <Link href="/suburbs/best">Best Suburbs Leaderboard →</Link>
          <Link href="/locations">All 30 Cities &amp; 544 LGAs →</Link>
          <Link href="/compare">Compare Buyer’s Agency Models →</Link>
          <Link href="/who-we-help">Who We Help →</Link>
        </div>
      </section>

      <section className="suburb-index-list section-shell">
        <div className="section-label">{GLOSSARY_TERMS.length} Quantitative Definitions &amp; Benchmarks</div>
        <h2 className="loc-section-h2">Property Investment Metrics, Finance &amp; Research Terms</h2>
        <div className="loc-card-grid">
          {GLOSSARY_TERMS.map((item) => (
            <Link key={item.slug} href={`/resources/glossary/${item.slug}`} className="loc-card">
              <div className="loc-card-top">
                <span className="loc-card-rank">{item.category}</span>
                <span className="loc-card-score"><b>Definition →</b></span>
              </div>
              <h3>{item.term}</h3>
              <p className="loc-card-tagline">{item.definition.split(/(?<=\.)\s+/)[0]}</p>
              <div className="loc-card-stats">
                <span>Benchmark: <b>{item.benchmarkBand}</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LocationFaqSection
        eyebrow="Glossary FAQs"
        heading="Frequently Asked Questions: Property Investment Metrics"
        intro="How Ripehouse Advisory defines and measures Australian property market fundamentals."
        faqs={hubFaqs}
      />

      <Footer backHref="/resources/blog" backLabel="Market Intel ↑" />
    </main>
  );
}
