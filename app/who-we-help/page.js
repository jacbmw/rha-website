import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import LocationFaqSection from '../components/LocationFaqSection';
import { WHO_WE_HELP_PAGES } from '../../lib/compare-and-personas';
import { listPublicCaseStudies, displayName } from '../../lib/case-studies';
import { pageMetadata, SITE_URL } from '../../lib/seo';

export const revalidate = 86400;

const logoUrl = '/images/rha-logo-dark.png';

export const metadata = pageMetadata({
  title: 'Who We Help — Property Investment Strategies by Investor Profile | Ripehouse Advisory',
  description: 'Tailored quantitative property investment strategy and buyer’s agency for First-Time Investors, Homeowners Using Equity, Second/Third Property Buyers, SMSFs, Doctors, Business Owners, and Expats.',
  path: '/who-we-help',
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
    question: 'Does Ripehouse Advisory use a one-size-fits-all property list for every client?',
    answer: 'Never. While our research engine evaluates 15,000+ suburbs across 27 indicators and 518,400+ streets on ABS SA1 census blocks, your personal purchase brief is built around your starting position—whether you are buying your first investment property, unlocking $250k of home equity, investing inside an SMSF, or scaling to 4+ properties.',
  },
  {
    question: 'What is the minimum deposit or equity needed to work with Ripehouse Advisory?',
    answer: 'Most clients begin with at least $100,000 to $150,000 in cash savings or usable home equity (or $200,000+ inside an SMSF) alongside borrowing capacity for an established house in the $500,000 to $1,500,000+ range. Book a free 15-minute discovery call to review your position.',
  },
  {
    question: 'Where can I see real client outcomes across different investor profiles?',
    answer: 'Visit ripehouseadvisory.com.au/case-studies and /about/approach to inspect verified multi-property client journeys, purchase timelines, and our +15.0% median 5-year rolling portfolio CAGR chart.',
  },
];

export default async function WhoWeHelpHubPage() {
  const caseStudies = await listPublicCaseStudies().catch(() => []);
  const featuredStudies = (caseStudies || []).slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/who-we-help#webpage`,
        url: `${SITE_URL}/who-we-help`,
        name: 'Who We Help — Property Investment Advisory by Investor Profile',
        description: 'How Ripehouse Advisory tailors quantitative 15,000-suburb and 518,000-street property research to 10 distinct Australian investor profiles.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/who-we-help#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Who We Help', item: `${SITE_URL}/who-we-help` },
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
          <span aria-current="page">Who We Help</span>
        </nav>
        <p className="eyebrow"><span /> Tailored Portfolio Strategy · Since 2011</p>
        <h1>One research engine.<br />Built around <i>your position.</i></h1>
        <p className="suburb-meta">
          Whether you are buying your first investment property, unlocking dormant home equity, scaling past the one-property plateau, or investing via an SMSF or from overseas — select your profile below to see how our 7-step system adapts to your goals.
        </p>
        <div className="loc-quick-jumps">
          <Link href="/case-studies">View Verified Client Case Studies →</Link>
          <Link href="/compare">Compare Buyer’s Agency Models →</Link>
          <Link href="/locations">Explore 30 Cities &amp; 544 LGAs →</Link>
          <Link href="/discovery-call">Book Free 15-Min Discovery Call →</Link>
        </div>
      </section>

      <section className="suburb-index-list section-shell">
        <div className="section-label">10 Investor Profiles</div>
        <h2 className="loc-section-h2">Choose Your Investor Profile</h2>
        <div className="loc-card-grid">
          {WHO_WE_HELP_PAGES.map((item, idx) => (
            <Link key={item.slug} href={`/who-we-help/${item.slug}`} className="loc-card">
              <div className="loc-card-top">
                <span className="loc-card-rank">{String(idx + 1).padStart(2, '0')} · {item.kicker.replace('Who We Help · ', '')}</span>
                <span className="loc-card-score"><b>Explore →</b></span>
              </div>
              <h3>{item.persona}</h3>
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

      {featuredStudies.length > 0 && (
        <section className="suburb-index-list section-shell">
          <div className="section-label">Measured Client Outcomes (+15.0% Median 5yr Rolling CAGR)</div>
          <h2 className="loc-section-h2">Real Investors Who Built With Ripehouse</h2>
          <div className="loc-card-grid">
            {featuredStudies.map((study) => (
              <Link key={study.slug} href={`/case-studies/${study.slug}`} className="loc-card">
                <div className="loc-card-top">
                  <span className="loc-card-rank">Verified Case Study</span>
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

      <LocationFaqSection
        eyebrow="Investor Profile FAQs"
        heading="Frequently Asked Questions: Working with Ripehouse Advisory"
        intro="How we tailor quantitative research, finance structuring, and acquisition execution to your stage of life."
        faqs={hubFaqs}
      />

      <Footer backHref="/" backLabel="Back home ↑" />
    </main>
  );
}
