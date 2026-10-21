import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import LocationSearch from '../../../components/LocationSearch';
import LocationExperience from '../../../components/LocationExperience';
import LocationFaqSection from '../../../components/LocationFaqSection';
import { CompareBars } from '../../../streets/[state]/[suburb]/[street]/StreetVisuals';
import {
  TOP_30_CITIES,
  findCityBySlug,
  fetchTopStreetsForSuburbs,
  buildCityFaqs,
} from '../../../../lib/locations';
import { pageMetadata } from '../../../../lib/seo';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return TOP_30_CITIES.map((city) => ({ slug: city.slug }));
}

const logoUrl = '/images/rha-logo-dark.png';

const fmtMoney = (v) => (v === null || v === undefined ? '—' : `$${Math.round(v).toLocaleString('en-AU')}`);

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const city = await findCityBySlug(slug).catch(() => null);
  if (!city) return { title: 'City Property Investment | Ripehouse Advisory', robots: { index: false } };
  const title = `Property Investment in ${city.name} (${city.state}) — Best Suburbs, R-Scores & Yields | Ripehouse Advisory`;
  const description = `Property investment research for ${city.name}, ${city.state}: ${city.suburbCount} suburbs across ${city.lgaCount} council areas scored monthly. Average R-Score ${city.rScoreAvg ?? '—'}/100, median price ${fmtMoney(city.medianPrice)}, gross yield ${city.grossYield ?? '—'}%. Drill down to the best suburbs and streets.`;
  return pageMetadata({
    title,
    description,
    path: city.path,
  });
}

export default async function CityResearchPage({ params }) {
  const { slug } = await params;
  const city = await findCityBySlug(slug).catch(() => null);
  if (!city) notFound();

  const topSscIds = city.suburbs
    .filter((s) => s.score !== null && s.confidence !== 'low')
    .slice(0, 25)
    .map((s) => s.id);
  const topStreets = await fetchTopStreetsForSuburbs(topSscIds, 8);
  const faqs = buildCityFaqs(city, topStreets);

  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: city.name,
    url: `https://www.ripehouseadvisory.com.au${city.path}`,
    description: `Property investment market data, suburb R-Scores, rental yields and street scores for ${city.name}, ${city.stateName}.`,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: city.stateName,
    },
  };

  return (
    <main className="suburb-page loc-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/locations">All cities &amp; LGAs</Link>
        <MobileNav links={navLinks} />
      </header>

      {/* ── Breadcrumb + Hero ───────────────────────────────────────────── */}
      <section className="suburb-hero section-shell">
        <nav className="loc-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/locations">Locations</Link>
          <span>/</span>
          <Link href={`/suburbs/${city.state.toLowerCase()}`}>{city.state}</Link>
          <span>/</span>
          <span aria-current="page">Property Investment in {city.name}</span>
        </nav>

        <p className="eyebrow">
          <span /> Property Investment in {city.name} ({city.state}) · Data as of {city.asOf}
        </p>
        <h1>Property Investment in {city.name}, <i>{city.state}</i></h1>
        <p className="suburb-meta">
          {city.tagline}
          {city.population ? ` · Population ~${city.population.toLocaleString('en-AU')}` : ''}
          {` · ${city.suburbCount.toLocaleString('en-AU')} suburbs across ${city.lgaCount} council area${city.lgaCount === 1 ? '' : 's'} scored monthly`}
        </p>

        <div className="suburb-scoreband">
          <div className="suburb-dial" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="150" height="150">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(20,26,50,.12)" strokeWidth="7" />
              {city.rScoreAvg !== null && (
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#c79810" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={`${(city.rScoreAvg / 100) * 326.7} 326.7`}
                  transform="rotate(-90 60 60)"
                />
              )}
              <text x="60" y="58" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fill="#141a32">{city.rScoreAvg ?? '—'}</text>
              <text x="60" y="78" textAnchor="middle" fontSize="10" fill="#687087">/ 100</text>
            </svg>
          </div>

          <div className="suburb-scorecopy">
            <p className="suburb-scoreline">
              <strong>{city.name} Average R-Score {city.rScoreAvg ?? '—'} / 100</strong>
              {city.rScoreMax !== null ? <> — top suburb in {city.name} scores <b>{city.rScoreMax}/100</b></> : null}
            </p>
            {city.verdict ? (
              <div className={`suburb-verdict verdict-${city.verdict.band}`}>
                <p className="suburb-verdict-label">{city.verdict.label}</p>
                <p className="suburb-verdict-detail">{city.verdict.detail}</p>
              </div>
            ) : (
              <div className="suburb-verdict verdict-thin">
                <p className="suburb-verdict-label">{city.suburbCount} suburbs scored across {city.name}</p>
                <p className="suburb-verdict-detail">Use the search bar or council breakdown below to drill down to individual suburbs and streets in {city.name}.</p>
              </div>
            )}
            <p className="street-hero-cta">
              <a href="#scorecard">
                <b>Unlock the Top 10 &amp; Bottom 5 suburbs + best streets in {city.name} ↓</b>
              </a>
            </p>
            <p className="suburb-compliance">
              Figures reflect Ripehouse Advisory’s monthly 27-indicator suburb bake ({city.asOf}). General information only — not personal financial advice.
            </p>
          </div>
        </div>

        <div className="street-compare" id="compare">
          <CompareBars
            rows={[
              { label: `${city.name} top suburb R-Score`, value: city.rScoreMax, accent: true, note: `Highest-scoring suburb out of ${city.suburbCount} in ${city.name}` },
              { label: `${city.name} suburb average`, value: city.rScoreAvg, note: `Across ${city.scoredSuburbCount} scored suburbs in ${city.lgaCount} LGAs` },
            ]}
          />
          <div className="street-compare-why">
            <p className="street-compare-callout">
              {city.priceMin && city.priceMax && city.priceMax > city.priceMin
                ? `Suburb medians in ${city.name} range from ${fmtMoney(city.priceMin)} to ${fmtMoney(city.priceMax)}.`
                : `Suburb performance across ${city.name} varies materially by council and street.`}
            </p>
            <p className="street-note">
              {city.popGrowth3yr !== null && `3-year population movement: ${city.popGrowth3yr > 0 ? `+${city.popGrowth3yr}%` : `${city.popGrowth3yr}%`}. `}
              {city.infraSpendM ? `Tracked infrastructure pipeline: $${city.infraSpendM >= 1000 ? `${(city.infraSpendM / 1000).toFixed(1)}B` : `${city.infraSpendM}M`}. ` : ''}
              {city.topIndustries?.length ? `Key employment sectors: ${city.topIndustries.map((i) => `${i.industry} (${i.pct}%)`).join(', ')}.` : ''}
            </p>
          </div>
        </div>

        <div className="suburb-teasers">
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Typical suburb median price</span>
            <strong>{fmtMoney(city.medianPrice)}</strong>
            <p>Across {city.suburbCount} suburbs in Greater {city.name} ({city.asOf}).</p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Gross rental yield &amp; rent</span>
            <strong>{city.grossYield !== null ? `${city.grossYield}%` : '—'}</strong>
            <p>
              {city.medianRent ? `Median asking rent ~$${city.medianRent}/wk` : 'Measured across houses'}
              {city.vacancy !== null ? ` · Vacancy ${city.vacancy}%` : ''}.
            </p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Top suburb R-Score in {city.name}</span>
            <strong>{city.rScoreMax !== null ? `${city.rScoreMax}/100` : '—'}</strong>
            <p>
              Highest-scoring suburb out of {city.suburbCount} in {city.name}.{' '}
              <a href="#scorecard">See the top suburbs ↓</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Scoped Suburb & Street Search ───────────────────────────────── */}
      <section className="section-shell" style={{ paddingTop: '8px', paddingBottom: '24px' }}>
        <div className="section-label">Search suburbs &amp; streets in {city.name}</div>
        <h2 className="loc-section-h2">Drill Down Into Any {city.name} Suburb or Street</h2>
        <p className="suburb-meta" style={{ marginBottom: '16px' }}>
          Type a suburb or postcode in {city.name} (or anywhere in Australia) to open its Suburb R-Score report or inspect individual streets.
        </p>
        <LocationSearch
          localSuburbs={city.suburbs}
          scopeName={city.name}
          placeholder={`Search ${city.suburbCount} suburbs in ${city.name} (or any council/suburb)…`}
        />
      </section>

      {/* ── Constituent LGAs in this City ───────────────────────────────── */}
      <section className="suburb-index-list section-shell" id="city-lgas">
        <div className="section-label">Council Areas (LGAs) in {city.name}</div>
        <h2 className="loc-section-h2">
          {city.lgaCount === 1
            ? `Local Government Area for ${city.name}`
            : `Compare all ${city.lgaCount} Council Areas (LGAs) in Greater ${city.name}`}
        </h2>
        <p className="suburb-meta" style={{ marginBottom: '18px' }}>
          Click any council area (LGA) below to view its dedicated LGA investment research page, suburb leaderboard, and street scores.
        </p>
        <div className="loc-card-grid loc-card-grid-compact">
          {city.lgas.map((lga) => (
            <Link key={lga.id} href={lga.path} className="loc-card loc-card-compact">
              <div className="loc-card-top">
                <span className="loc-card-rank">LGA · {lga.state}</span>
                {lga.rScoreAvg !== null && (
                  <span className="loc-card-score">R-Score avg <b>{lga.rScoreAvg}/100</b></span>
                )}
              </div>
              <h3>Property Investment in {lga.name}</h3>
              <div className="loc-card-stats">
                <span><b>{lga.suburbCount}</b> suburbs (top {lga.rScoreMax ?? '—'}/100)</span>
                <span>Median <b>{fmtMoney(lga.medianPrice)}</b></span>
                <span>Yield <b>{lga.grossYield !== null ? `${lga.grossYield}%` : '—'}</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Layer 1 Email Gate + Unlocked Suburb & Street Scorecard ────── */}
      <LocationExperience
        kind="city"
        slug={city.slug}
        state={city.state}
        name={city.name}
        rScoreAvg={city.rScoreAvg}
        rScoreMax={city.rScoreMax}
        suburbCount={city.suburbCount}
        lgaCount={city.lgaCount}
      />

      {/* ── Crawlable Suburb Directory for this City ────────────────────── */}
      <section className="suburb-index-list section-shell" id="city-suburbs">
        <div className="section-label">All {city.suburbCount} Suburbs in {city.name}</div>
        <h2 className="loc-section-h2">Suburbs in {city.name} — Drill Down to Suburb &amp; Best Streets</h2>
        <p className="suburb-meta" style={{ marginBottom: '18px' }}>
          Select any suburb to view its R-Score and market fundamentals, or click <b>Streets</b> to compare every street in that suburb.
        </p>
        <ul className="suburb-plain-list loc-suburb-grid">
          {city.suburbs.slice(0, 180).map((sub) => (
            <li key={sub.id} className="loc-suburb-item">
              <Link href={sub.path} className="loc-suburb-main">
                <b>{sub.name}</b>
                {sub.postcodes?.[0] ? ` (${sub.postcodes[0]})` : ''}
              </Link>
              <span className="loc-suburb-links">
                <Link href={sub.path}>Suburb score</Link>
                {' · '}
                <Link href={sub.streetsPath}>Best streets →</Link>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── LLM-Optimised FAQ Panel ─────────────────────────────────────── */}
      <LocationFaqSection
        eyebrow={`${city.name} Property Investment FAQs`}
        heading={`Frequently Asked Questions: Investing in ${city.name}, ${city.state}`}
        intro={`Key facts and figures from the ${city.asOf} Ripehouse Advisory research bake for ${city.name}.`}
        faqs={faqs}
      />

      <Footer backHref="/locations" backLabel="All cities, LGAs & suburbs ↑" />
    </main>
  );
}
