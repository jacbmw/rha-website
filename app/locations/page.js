import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import LocationSearch from '../components/LocationSearch';
import LocationFaqSection from '../components/LocationFaqSection';
import { getLocationRegistry, STATE_NAMES } from '../../lib/locations';
import { pageMetadata } from '../../lib/seo';

export const revalidate = 86400;

const logoUrl = '/images/rha-logo-dark.png';

export const metadata = pageMetadata({
  title: 'Australian Property Investment Locations — 30 Cities, 550+ LGAs, 15,000 Suburbs & Streets | Ripehouse Advisory',
  description: 'Explore Ripehouse Advisory’s Australian property investment research directory across the Top 30 Cities by population, 550+ Local Government Areas (LGAs), 15,000 suburbs and 700,000 streets — scored monthly.',
  path: '/locations',
});

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

const fmtMoney = (v) => (v === null || v === undefined ? '—' : `$${Math.round(v).toLocaleString('en-AU')}`);

const STATE_ORDER = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt'];

export default async function LocationsDirectoryPage() {
  const { cities, lgas, top50PickiLgas, asOf } = await getLocationRegistry();

  const lgasByState = new Map();
  for (const code of STATE_ORDER) lgasByState.set(code, []);
  for (const lga of lgas) {
    const code = lga.state.toLowerCase();
    if (!lgasByState.has(code)) lgasByState.set(code, []);
    lgasByState.get(code).push(lga);
  }

  const directoryFaqs = [
    {
      question: 'How does Ripehouse Advisory score Australian cities, LGAs, suburbs and streets?',
      answer: `Every month (${asOf || 'latest bake'}), the Ripehouse research engine evaluates 15,000+ Australian suburbs across 27 supply, demand, price momentum, and rental yield indicators to produce a 0–100 R-Score. Those suburb scores roll up into all ${lgas.length} Local Government Areas (LGAs) and Australia’s Top 30 Cities by population, and drill down into 700,000+ individual streets scored on ABS SA1 census owner-occupancy (>65%), public housing concentration (≤5%), and block-level rent and yield.`,
    },
    {
      question: 'Should I research by City, Council Area (LGA), Suburb or Street first?',
      answer: 'Start at the City or Council Area (LGA) level to identify markets where macro demand, supply tightness, and yields are working in your favour, then drill down to the highest-scoring Suburbs inside that LGA, and finally use the Street Score to avoid high-public-housing or low-owner-occupier blocks within your chosen suburb.',
    },
    {
      question: 'Which Australian cities and council areas are most researched by property investors right now?',
      answer: `Across Picki and Ripehouse Advisory research activity, the most heavily analysed council areas include ${top50PickiLgas.slice(0, 10).map((l) => `${l.name} (${l.state})`).join(', ')}. Use the unified search bar above to jump straight to any City, LGA, Suburb, or Street.`,
    },
  ];

  return (
    <main className="suburb-index-page loc-directory-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/discovery-call">Book a call</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-index-hero section-shell">
        <p className="eyebrow"><span /> Australian Property Investment Research Directory · {asOf}</p>
        <h1>Every City, Council, Suburb &amp; Street — <i>scored.</i></h1>
        <p className="suburb-meta">
          Search across Australia’s 30 largest cities, {lgas.length} Local Government Areas (LGAs), 15,000 suburbs, and 700,000+ streets — or browse the full directory below to drill down from city to council to suburb to street.
        </p>
        <LocationSearch placeholder="Type a city (Hobart), council/LGA (Kingborough), suburb, or postcode…" />
        <div className="loc-quick-jumps">
          <a href="#top-cities">Top 30 Cities by Population ↓</a>
          <a href="#top-lgas">Top 50 Investor LGAs (Picki Volume) ↓</a>
          <a href="#all-lgas">All {lgas.length} Australian LGAs by State ↓</a>
          <Link href="/suburbs">Browse 15,000 Suburbs →</Link>
          <Link href="/streets">Street Score Search →</Link>
        </div>
      </section>

      {/* ── Top 30 Cities by Population ─────────────────────────────────── */}
      <section className="suburb-index-list section-shell" id="top-cities">
        <div className="section-label">Top 30 Australian Cities by Population</div>
        <h2 className="loc-section-h2">Property Investment by City</h2>
        <p className="suburb-meta" style={{ marginBottom: '20px' }}>
          Australia’s 30 largest urban markets ordered by population. Click any city to view its R-Score breakdown, constituent council areas (LGAs), top-scoring suburbs, and highest-scoring streets.
        </p>
        <div className="loc-card-grid">
          {cities.map((city, idx) => (
            <Link key={city.slug} href={city.path} className="loc-card">
              <div className="loc-card-top">
                <span className="loc-card-rank">#{idx + 1} · {city.state}</span>
                {city.rScoreAvg !== null && (
                  <span className="loc-card-score">R-Score avg <b>{city.rScoreAvg}/100</b></span>
                )}
              </div>
              <h3>Property Investment in {city.name}</h3>
              <p className="loc-card-tagline">{city.tagline}</p>
              <div className="loc-card-stats">
                <span><b>{city.suburbCount}</b> suburbs ({city.lgaCount} {city.lgaCount === 1 ? 'LGA' : 'LGAs'})</span>
                <span>Median <b>{fmtMoney(city.medianPrice)}</b></span>
                <span>Yield <b>{city.grossYield !== null ? `${city.grossYield}%` : '—'}</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Top 50 LGAs by Picki Research Volume ────────────────────────── */}
      <section className="suburb-index-list section-shell" id="top-lgas">
        <div className="section-label">Top 50 Local Government Areas (Picki Research Volume)</div>
        <h2 className="loc-section-h2">Most Researched Council Areas (LGAs)</h2>
        <p className="suburb-meta" style={{ marginBottom: '20px' }}>
          The 50 Australian council areas with the highest investor research, suburb vetting, and acquisition activity in Picki. Click any LGA to drill down into its suburbs and streets.
        </p>
        <div className="loc-card-grid loc-card-grid-compact">
          {top50PickiLgas.map((lga, idx) => (
            <Link key={lga.id} href={lga.path} className="loc-card loc-card-compact">
              <div className="loc-card-top">
                <span className="loc-card-rank">#{idx + 1} · {lga.state}</span>
                {lga.rScoreAvg !== null && (
                  <span className="loc-card-score">Avg <b>{lga.rScoreAvg}/100</b></span>
                )}
              </div>
              <h3>Property Investment in {lga.name}</h3>
              <div className="loc-card-stats">
                <span><b>{lga.suburbCount}</b> suburbs</span>
                <span>Median <b>{fmtMoney(lga.medianPrice)}</b></span>
                <span>Yield <b>{lga.grossYield !== null ? `${lga.grossYield}%` : '—'}</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── All 540+ Australian LGAs by State ───────────────────────────── */}
      <section className="suburb-index-list section-shell" id="all-lgas">
        <div className="section-label">Complete National Directory · {lgas.length} LGAs</div>
        <h2 className="loc-section-h2">All Australian Local Government Areas (LGAs) by State</h2>
        <p className="suburb-meta" style={{ marginBottom: '20px' }}>
          Every Australian council area scored in the Ripehouse warehouse. Select a state jump link or click any LGA to inspect its suburb R-Scores and street rankings.
        </p>
        <div className="loc-state-pills">
          {STATE_ORDER.map((code) => {
            const list = lgasByState.get(code) || [];
            if (!list.length) return null;
            return (
              <a key={code} href={`#state-${code}`} className="loc-state-pill">
                {code.toUpperCase()} <span>({list.length})</span>
              </a>
            );
          })}
        </div>

        {STATE_ORDER.map((code) => {
          const list = lgasByState.get(code) || [];
          if (!list.length) return null;
          return (
            <div key={code} id={`state-${code}`} className="loc-state-group">
              <h3 className="loc-state-heading">
                {STATE_NAMES[code]} <span>({list.length} council areas)</span>
              </h3>
              <ul className="suburb-plain-list loc-lga-list">
                {list.map((lga) => (
                  <li key={lga.id}>
                    <Link href={lga.path}>
                      Property Investment in {lga.name} ({lga.state})
                      <span>
                        {' · '}{lga.suburbCount} {lga.suburbCount === 1 ? 'suburb' : 'suburbs'}
                        {lga.rScoreAvg !== null ? ` · R-Score ${lga.rScoreAvg}/100` : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <LocationFaqSection
        eyebrow="Location Research FAQs"
        heading="How to research Australian property markets from City to Street"
        faqs={directoryFaqs}
      />

      <Footer />
    </main>
  );
}
