import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import LocationFaqSection from '../components/LocationFaqSection';
import { COMPARE_PAGES } from '../../lib/compare-and-personas';
import { pageMetadata, SITE_URL } from '../../lib/seo';

export const revalidate = 86400;

const logoUrl = '/images/rha-logo-dark.png';

export const metadata = pageMetadata({
  title: 'Compare Property Investment Strategies & Buyer’s Agents in Australia (2026) | Ripehouse Advisory',
  description: 'Side-by-side quantitative comparisons: Data-Driven vs Traditional Buyer’s Agents, Street Score vs Suburb Medians, Ripehouse vs DIY Investing, Established Houses vs Off-the-Plan, and Property vs ETFs.',
  path: '/compare',
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
    question: 'Why does Ripehouse Advisory publish open data comparisons?',
    answer: 'Since 2011, Ripehouse Advisory has operated on a simple principle: you can only optimise what you can measure. Publishing side-by-side comparisons backed by our 15,000-suburb R-Score and 518,000-street ABS SA1 research engine helps Australian investors evaluate buyer’s agents, asset classes, and market strategies with objective evidence.',
  },
  {
    question: 'How is Ripehouse Advisory different from single-city buyer’s agents or DIY portals?',
    answer: 'Single-city buyer’s agents are locked into one metro market regardless of where it sits in the property cycle, while DIY listing portals only show lagging suburb medians. Ripehouse screens all 30 Australian cities, 544 Local Government Areas, 15,000 suburbs (27 indicators monthly), and 518,400+ streets (ABS SA1 owner-occupancy, public housing, rent, and yield) before recommending an acquisition.',
  },
  {
    question: 'Can I verify Ripehouse Advisory’s suburb and street scores myself?',
    answer: 'Yes. Every Australian city (/locations), suburb (/suburbs), and residential street (/streets) can be searched for free on our website.',
  },
];

export default function CompareHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/compare#webpage`,
        url: `${SITE_URL}/compare`,
        name: 'Compare Property Investment Strategies & Buyer’s Agents in Australia (2026)',
        description: 'Quantitative side-by-side comparisons of Australian property investment models, buyer’s agencies, street-level vs suburb-median research, and asset classes.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/compare#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Compare Strategies & Buyer’s Agents', item: `${SITE_URL}/compare` },
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
          <span aria-current="page">Compare</span>
        </nav>
        <p className="eyebrow"><span /> Evidence-First Property Comparisons · 2026</p>
        <h1>Compare the models, the data &amp; the <i>trade-offs.</i></h1>
        <p className="suburb-meta">
          Side-by-side quantitative comparisons of buyer’s agency models, street-level versus suburb-median research, asset selection, and wealth vehicles — backed by 15,000 scored suburbs and 518,400+ scored Australian streets.
        </p>
        <div className="loc-quick-jumps">
          <Link href="/locations">Explore 30 Cities &amp; 544 LGAs →</Link>
          <Link href="/suburbs">Check a Suburb R-Score →</Link>
          <Link href="/streets">Check a Street Score →</Link>
          <Link href="/who-we-help">Who We Help (Investor Profiles) →</Link>
        </div>
      </section>

      <section className="suburb-index-list section-shell">
        <div className="section-label">8 Quantitative Comparisons</div>
        <h2 className="loc-section-h2">Head-to-Head Property Investment Comparisons</h2>
        <div className="loc-card-grid">
          {COMPARE_PAGES.map((item, idx) => (
            <Link key={item.slug} href={`/compare/${item.slug}`} className="loc-card">
              <div className="loc-card-top">
                <span className="loc-card-rank">0{idx + 1} · {item.kicker}</span>
                <span className="loc-card-score"><b>Compare →</b></span>
              </div>
              <h3>{item.shortLabel}</h3>
              <p className="loc-card-tagline">{item.summary}</p>
              <div className="loc-card-stats">
                {item.teasers.slice(0, 2).map((t) => (
                  <span key={t.label}>{t.label}: <b>{t.value}</b></span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LocationFaqSection
        eyebrow="Comparison FAQs"
        heading="Frequently Asked Questions: Evaluating Buyer’s Agents & Property Research"
        intro="Key distinctions between quantitative national property advisory, single-city buyer’s agents, and DIY portal research."
        faqs={hubFaqs}
      />

      <Footer backHref="/" backLabel="Back home ↑" />
    </main>
  );
}
