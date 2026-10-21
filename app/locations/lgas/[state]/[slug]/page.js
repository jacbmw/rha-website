import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../../components/Footer';
import MobileNav from '../../../../components/MobileNav';
import LocationSearch from '../../../../components/LocationSearch';
import LocationExperience from '../../../../components/LocationExperience';
import LocationFaqSection from '../../../../components/LocationFaqSection';
import { CompareBars } from '../../../../streets/[state]/[suburb]/[street]/StreetVisuals';
import {
  findLgaBySlug,
  fetchTopStreetsForSuburbs,
  buildLgaFaqs,
} from '../../../../../lib/locations';
import { pageMetadata } from '../../../../../lib/seo';

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return []; // ISR on-demand across all 540+ LGAs
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
  const { state, slug } = await params;
  const lga = await findLgaBySlug(state, slug).catch(() => null);
  if (!lga) return { title: 'LGA Property Investment | Ripehouse Advisory', robots: { index: false } };
  const title = `Property Investment in ${lga.name} (${lga.state}) — Suburb R-Scores, Yields & Streets | Ripehouse Advisory`;
  const description = `Property investment research for ${lga.name} (${lga.state} LGA): ${lga.suburbCount} suburbs scored monthly. Council average R-Score ${lga.rScoreAvg ?? '—'}/100, median price ${fmtMoney(lga.medianPrice)}, gross yield ${lga.grossYield ?? '—'}%. Compare every suburb and street in ${lga.name}.`;
  return pageMetadata({
    title,
    description,
    path: lga.path,
  });
}

export default async function LgaResearchPage({ params }) {
  const { state, slug } = await params;
  const lga = await findLgaBySlug(state, slug).catch(() => null);
  if (!lga) notFound();

  const topSscIds = lga.suburbs
    .filter((s) => s.score !== null && s.confidence !== 'low')
    .slice(0, 20)
    .map((s) => s.id);
  const topStreets = await fetchTopStreetsForSuburbs(
    topSscIds.length ? topSscIds : lga.suburbs.slice(0, 20).map((s) => s.id),
    8
  );
  const faqs = buildLgaFaqs(lga, topStreets);

  const areaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: `${lga.name} (${lga.state})`,
    url: `https://www.ripehouseadvisory.com.au${lga.path}`,
    description: `Property investment market data, suburb R-Scores, rental yields and street scores for ${lga.name} Local Government Area in ${lga.stateName}.`,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: lga.stateName,
    },
  };

  return (
    <main className="suburb-page loc-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(areaJsonLd) }}
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
          <Link href={`/locations#state-${lga.state.toLowerCase()}`}>{lga.state} LGAs</Link>
          {lga.cityName && lga.cityPath && (
            <>
              <span>/</span>
              <Link href={lga.cityPath}>{lga.cityName}</Link>
            </>
          )}
          <span>/</span>
          <span aria-current="page">Property Investment in {lga.name}</span>
        </nav>

        <p className="eyebrow">
          <span /> Local Government Area (LGA) Research · Data as of {lga.asOf}
        </p>
        <h1>Property Investment in {lga.name}, <i>{lga.state}</i></h1>
        <p className="suburb-meta">
          {`${lga.suburbCount} suburbs in ${lga.name} council area`}
          {lga.cityName && lga.cityPath ? (
            <> · Part of <Link href={lga.cityPath}>Greater {lga.cityName}</Link></>
          ) : null}
          {lga.population ? ` · Population ~${lga.population.toLocaleString('en-AU')}` : ''}
          {lga.dwellings ? ` · ${lga.dwellings.toLocaleString('en-AU')} dwellings` : ''}
          {lga.areaSqkm ? ` · ${lga.areaSqkm.toLocaleString('en-AU')} km²` : ''}
        </p>

        <div className="suburb-scoreband">
          <div className="suburb-dial" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="150" height="150">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(20,26,50,.12)" strokeWidth="7" />
              {lga.rScoreAvg !== null && (
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#c79810" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={`${(lga.rScoreAvg / 100) * 326.7} 326.7`}
                  transform="rotate(-90 60 60)"
                />
              )}
              <text x="60" y="58" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fill="#141a32">{lga.rScoreAvg ?? '—'}</text>
              <text x="60" y="78" textAnchor="middle" fontSize="10" fill="#687087">/ 100</text>
            </svg>
          </div>

          <div className="suburb-scorecopy">
            <p className="suburb-scoreline">
              <strong>{lga.name} Council Average R-Score {lga.rScoreAvg ?? '—'} / 100</strong>
              {lga.rScoreMax !== null ? <> — top suburb in {lga.name} scores <b>{lga.rScoreMax}/100</b></> : null}
            </p>
            {lga.verdict ? (
              <div className={`suburb-verdict verdict-${lga.verdict.band}`}>
                <p className="suburb-verdict-label">{lga.verdict.label}</p>
                <p className="suburb-verdict-detail">{lga.verdict.detail}</p>
              </div>
            ) : (
              <div className="suburb-verdict verdict-thin">
                <p className="suburb-verdict-label">{lga.suburbCount} suburbs tracked in {lga.name}</p>
                <p className="suburb-verdict-detail">Select any suburb below to inspect its R-Score, price and rent trends, and street-level rankings.</p>
              </div>
            )}
            <p className="street-hero-cta">
              <a href="#scorecard">
                <b>Unlock all {lga.name} suburb rankings &amp; highest-scoring streets ↓</b>
              </a>
            </p>
            <p className="suburb-compliance">
              Figures reflect Ripehouse Advisory’s monthly 27-indicator suburb bake ({lga.asOf}). General information only — not personal financial advice.
            </p>
          </div>
        </div>

        <div className="street-compare" id="compare">
          <CompareBars
            rows={[
              { label: `Top suburb in ${lga.name}`, value: lga.rScoreMax, accent: true, note: `Highest R-Score out of ${lga.suburbCount} suburbs in ${lga.name}` },
              { label: `${lga.name} council average`, value: lga.rScoreAvg, note: `Across ${lga.scoredSuburbCount} scored suburbs in ${lga.name}` },
            ]}
          />
          <div className="street-compare-why">
            <p className="street-compare-callout">
              {lga.priceMin && lga.priceMax && lga.priceMax > lga.priceMin
                ? `Suburb medians in ${lga.name} range from ${fmtMoney(lga.priceMin)} to ${fmtMoney(lga.priceMax)}.`
                : `Suburb and street selection inside ${lga.name} drives investment outcomes.`}
            </p>
            <p className="street-note">
              {lga.popGrowth3yr !== null && `3-year population movement: ${lga.popGrowth3yr > 0 ? `+${lga.popGrowth3yr}%` : `${lga.popGrowth3yr}%`}. `}
              {lga.supplyPct !== null && `Annual new dwelling approvals: ${lga.supplyPct}% of stock${lga.dwellingsApproved ? ` (~${lga.dwellingsApproved.toLocaleString('en-AU')} dwellings)` : ''}. `}
              {lga.infraSpendM ? `Tracked infrastructure pipeline: $${lga.infraSpendM >= 1000 ? `${(lga.infraSpendM / 1000).toFixed(1)}B` : `${lga.infraSpendM}M`}. ` : ''}
              {lga.topIndustries?.length ? `Key employment sectors: ${lga.topIndustries.map((i) => `${i.industry} (${i.pct}%)`).join(', ')}.` : ''}
            </p>
          </div>
        </div>

        <div className="suburb-teasers">
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Typical suburb median price</span>
            <strong>{fmtMoney(lga.medianPrice)}</strong>
            <p>
              Across {lga.suburbCount} suburbs in {lga.name} ({lga.asOf})
              {lga.daysOnMarket !== null ? ` · ~${lga.daysOnMarket} days on market` : ''}.
            </p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Gross rental yield &amp; rent</span>
            <strong>{lga.grossYield !== null ? `${lga.grossYield}%` : '—'}</strong>
            <p>
              {lga.medianRent ? `Median asking rent ~$${lga.medianRent}/wk` : 'Measured across houses'}
              {lga.vacancy !== null ? ` · Vacancy ${lga.vacancy}%` : ''}.
            </p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Top suburb R-Score in {lga.name}</span>
            <strong>{lga.rScoreMax !== null ? `${lga.rScoreMax}/100` : '—'}</strong>
            <p>
              Highest-scoring suburb out of {lga.suburbCount} in {lga.name}.{' '}
              <a href="#scorecard">Unlock the top suburbs ↓</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Scoped Suburb & Street Search ───────────────────────────────── */}
      <section className="section-shell" style={{ paddingTop: '8px', paddingBottom: '24px' }}>
        <div className="section-label">Search suburbs &amp; streets in {lga.name}</div>
        <h2 className="loc-section-h2">Find a Suburb or Street in {lga.name}</h2>
        <p className="suburb-meta" style={{ marginBottom: '16px' }}>
          Filter the {lga.suburbCount} suburbs in {lga.name} or click <b>Check streets</b> on any suburb to inspect its individual streets.
        </p>
        <LocationSearch
          localSuburbs={lga.suburbs}
          scopeName={lga.name}
          placeholder={`Search suburbs in ${lga.name} (or any Australian city, LGA or postcode)…`}
        />
      </section>

      {/* ── Layer 1 Email Gate + Unlocked Suburb & Street Scorecard ────── */}
      <LocationExperience
        kind="lga"
        slug={lga.slug}
        state={lga.state}
        name={lga.name}
        rScoreAvg={lga.rScoreAvg}
        rScoreMax={lga.rScoreMax}
        suburbCount={lga.suburbCount}
      />

      {/* ── All Suburbs in this LGA (Drill-Down to Suburb & Streets) ────── */}
      <section className="suburb-index-list section-shell" id="lga-suburbs">
        <div className="section-label">All {lga.suburbCount} Suburbs in {lga.name} ({lga.state})</div>
        <h2 className="loc-section-h2">Suburbs in {lga.name} — Suburb Research &amp; Street Scores</h2>
        <p className="suburb-meta" style={{ marginBottom: '18px' }}>
          Every suburb in the {lga.name} council area. Click a suburb name to view its Suburb R-Score report, or click <b>Best streets</b> to see how every street in that suburb ranks.
        </p>
        <ul className="suburb-plain-list loc-suburb-grid">
          {lga.suburbs.map((sub) => (
            <li key={sub.id} className="loc-suburb-item">
              <Link href={sub.path} className="loc-suburb-main">
                <b>{sub.name}</b>
                {sub.postcodes?.[0] ? ` (${sub.postcodes[0]})` : ''}
              </Link>
              <span className="loc-suburb-links">
                <Link href={sub.path}>Suburb report</Link>
                {' · '}
                <Link href={sub.streetsPath}>Best streets →</Link>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── LLM-Optimised FAQ Panel ─────────────────────────────────────── */}
      <LocationFaqSection
        eyebrow={`${lga.name} (${lga.state}) FAQs`}
        heading={`Frequently Asked Questions: Property Investment in ${lga.name}`}
        intro={`Key facts and market data from the ${lga.asOf} Ripehouse Advisory research bake for ${lga.name} (${lga.stateName}).`}
        faqs={faqs}
      />

      <Footer
        backHref={lga.cityPath || '/locations'}
        backLabel={lga.cityName ? `Back to Property Investment in ${lga.cityName} ↑` : 'All cities & LGAs ↑'}
      />
    </main>
  );
}
