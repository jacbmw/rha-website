import Link from 'next/link';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import LocationSearch from '../../components/LocationSearch';
import LocationFaqSection from '../../components/LocationFaqSection';
import { CompareBars } from '../../streets/[state]/[suburb]/[street]/StreetVisuals';
import { getLocationRegistry, STATE_NAMES } from '../../../lib/locations';
import { pageMetadata, SITE_URL } from '../../../lib/seo';

export const revalidate = 86400;

const logoUrl = '/images/rha-logo-dark.png';
const fmtMoney = (v) => (v === null || v === undefined ? '—' : `$${Math.round(v).toLocaleString('en-AU')}`);

const STATE_ORDER = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt'];

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Case studies', href: '/case-studies' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export const metadata = pageMetadata({
  title: 'Best Suburbs to Invest in Australia (2026) — Top R-Scores, Highest Yields & Tightest Vacancy | Ripehouse Advisory',
  description: 'Monthly leaderboard of the highest-scoring Australian suburbs across 15,000 markets: Top 25 R-Score Suburbs, Top 20 High-Yield Suburbs Under $750k, and Lowest Vacancy Suburbs.',
  path: '/suburbs/best',
});

export default async function BestSuburbsNationalPage() {
  const { lgas = [], asOf = 'latest month' } = await getLocationRegistry();

  const allSuburbs = lgas
    .flatMap((lga) => (lga.suburbs || []).map((s) => ({
      ...s,
      lgaName: lga.name,
      lgaPath: lga.path,
      state: lga.state,
    })))
    .filter((s) => s.score !== null && s.confidence !== 'low' && s.medianPrice >= 250000);

  const topRScore = [...allSuburbs]
    .sort((a, b) => (b.score - a.score) || ((b.grossYield || 0) - (a.grossYield || 0)) || a.name.localeCompare(b.name))
    .slice(0, 25);

  const topYieldUnder750k = [...allSuburbs]
    .filter((s) => s.score >= 70 && s.medianPrice >= 300000 && s.medianPrice <= 750000 && s.grossYield !== null && s.grossYield <= 12)
    .sort((a, b) => (b.grossYield - a.grossYield) || (b.score - a.score))
    .slice(0, 20);

  const lowestVacancy = [...allSuburbs]
    .filter((s) => s.score >= 75 && s.vacancy !== null && s.vacancy >= 0.1 && s.vacancy <= 1.5 && s.medianPrice >= 350000)
    .sort((a, b) => (a.vacancy - b.vacancy) || (b.score - a.score))
    .slice(0, 20);

  const count90Plus = allSuburbs.filter((s) => s.score >= 90).length;
  const nationalMeanScore = allSuburbs.length
    ? Math.round(allSuburbs.reduce((sum, s) => sum + s.score, 0) / allSuburbs.length)
    : 50;

  const faqs = [
    {
      question: 'What are the highest-scoring suburbs for property investment in Australia right now?',
      answer: topRScore.length > 0
        ? `As of ${asOf}, top-scoring Australian suburbs on the 27-indicator Ripehouse R-Score include ${topRScore.slice(0, 6).map((s) => `${s.name} (${s.state}, R-Score ${s.score}/100, median ${fmtMoney(s.medianPrice)}, yield ${s.grossYield ?? '—'}%)`).join('; ')}. Across Australia, ${count90Plus.toLocaleString('en-AU')} suburbs currently score 90/100 or higher.`
        : 'Ripehouse Advisory scores 15,000+ Australian suburbs monthly across 27 supply, demand, momentum, and yield indicators.',
    },
    {
      question: 'Which Australian suburbs under $750,000 have the highest rental yields and strong R-Scores?',
      answer: topYieldUnder750k.length > 0
        ? `Among suburbs with an R-Score of 70+/100 and a median house price under $750,000 (${asOf}), leading rental yield markets include ${topYieldUnder750k.slice(0, 5).map((s) => `${s.name} ${s.state} (${s.grossYield}% yield, median ${fmtMoney(s.medianPrice)}, R-Score ${s.score}/100)`).join(', ')}.`
        : 'Use the High-Yield Suburbs Under $750k table above to compare affordable high-yielding suburbs.',
    },
    {
      question: 'Does a 95+ Suburb R-Score mean every street in that suburb is a good investment?',
      answer: 'No. Suburb-level R-Scores measure macro demand, supply tightness, price momentum, and rental yield across the whole suburb. Inside any high-scoring suburb, individual streets can still fail on public housing concentration (>5%) or low owner-occupancy (≤65%). Always click "Streets" next to any suburb in the leaderboard to check its ABS SA1 Street Scores.',
    },
  ];

  const pageUrl = `${SITE_URL}/suburbs/best`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        '@id': `${pageUrl}#dataset`,
        name: `Best Suburbs to Invest in Australia (${asOf}) — Ripehouse R-Score Leaderboard`,
        description: `Monthly quantitative ranking of Australia’s highest R-Score suburbs, highest rental yield suburbs under $750,000, and lowest vacancy rate suburbs across ${allSuburbs.length} scored markets.`,
        url: pageUrl,
        creator: { '@type': 'Organization', name: 'Ripehouse Advisory', url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Locations', item: `${SITE_URL}/locations` },
          { '@type': 'ListItem', position: 2, name: 'Suburbs', item: `${SITE_URL}/suburbs` },
          { '@type': 'ListItem', position: 3, name: 'Best Suburbs in Australia', item: pageUrl },
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
          <Link href="/locations">Locations</Link>
          <span>/</span>
          <Link href="/suburbs">Suburbs</Link>
          <span>/</span>
          <span aria-current="page">Best Suburbs in Australia ({asOf})</span>
        </nav>

        <p className="eyebrow"><span /> National Suburb Leaderboard · Data as of {asOf}</p>
        <h1>Best Suburbs in Australia, <i>Ranked by Data.</i></h1>
        <p className="suburb-meta">
          Every month, the Ripehouse research engine evaluates 15,000+ Australian suburbs across 27 supply, demand, price momentum, and rental yield indicators. Below are the highest-scoring suburbs nationally for {asOf} — drill down by state or click into any suburb’s street-level scores.
        </p>

        <div className="loc-state-pills" style={{ marginTop: '20px' }}>
          <Link href="/suburbs/best" className="loc-state-pill" style={{ background: 'var(--ink)', color: '#fff' }}>
            National Top Suburbs
          </Link>
          {STATE_ORDER.map((code) => (
            <Link key={code} href={`/suburbs/best/${code}`} className="loc-state-pill">
              Best in {code.toUpperCase()} <span>({STATE_NAMES[code]})</span>
            </Link>
          ))}
        </div>

        <aside className="article-at-a-glance" aria-label="At a glance summary">
          <p className="article-at-a-glance-title">At a glance · {asOf} National Suburb Bake</p>
          <ul>
            <li><b>{allSuburbs.length.toLocaleString('en-AU')} high-confidence suburbs</b> scored this month across all 8 Australian states and territories.</li>
            <li><b>{count90Plus.toLocaleString('en-AU')} suburbs score 90+/100</b> (top tier for combined buyer demand, tight supply, price momentum, and rental yield pressure).</li>
            <li>Always pair a high Suburb R-Score with our <Link href="/streets">ABS SA1 Street Score</Link> to avoid high-public-housing or low-owner-occupier blocks inside a top suburb.</li>
          </ul>
        </aside>

        <div className="street-compare" id="compare">
          <CompareBars
            rows={[
              { label: 'Top-Tier Australian Suburbs (R-Score 90–100)', value: 96, accent: true, note: `${count90Plus.toLocaleString('en-AU')} suburbs currently in the strongest national band` },
              { label: 'National Suburb Average R-Score', value: nationalMeanScore, note: `Across ${allSuburbs.length.toLocaleString('en-AU')} high-confidence suburbs (${asOf})` },
            ]}
          />
          <div className="street-compare-why">
            <p className="street-compare-callout">
              Jump to a leaderboard below: <a href="#top-rscore"><b>Top 25 R-Score Suburbs ↓</b></a> · <a href="#top-yield"><b>High-Yield Under $750k ↓</b></a> · <a href="#lowest-vacancy"><b>Tightest Vacancy (&lt;1.5%) ↓</b></a>
            </p>
            <p className="street-note">
              Scores describe measured market conditions as of {asOf} — not personal financial advice or a forecast.
            </p>
          </div>
        </div>

        <LocationSearch placeholder="Search any Australian city, council (LGA), suburb, or postcode…" />
      </section>

      {/* 1. Top 25 Highest R-Score Suburbs */}
      <section className="suburb-index-list section-shell" id="top-rscore">
        <div className="section-label">Leaderboard 01 · Overall Market Strength ({asOf})</div>
        <h2 className="loc-section-h2">Top 25 Highest R-Score Suburbs in Australia</h2>
        <p className="suburb-meta" style={{ marginBottom: '18px' }}>
          Australian suburbs with the strongest combined 27-indicator R-Score this month. Click any suburb to inspect its full report, or click <b>Streets</b> to check its individual streets.
        </p>
        <div className="rha-table-wrap">
          <table className="rha-data-table" aria-label="Top 25 highest R-Score suburbs in Australia">
            <thead>
              <tr>
                <th>Rank &amp; Suburb</th>
                <th>State &amp; Council (LGA)</th>
                <th>R-Score</th>
                <th>Median Price</th>
                <th>Gross Yield</th>
                <th>Vacancy</th>
                <th>Drill Down</th>
              </tr>
            </thead>
            <tbody>
              {topRScore.map((s, idx) => (
                <tr key={s.id}>
                  <td>
                    #{idx + 1}{' '}
                    <Link href={s.path}><b>{s.name}</b></Link>
                    {s.postcodes?.[0] ? ` (${s.postcodes[0]})` : ''}
                  </td>
                  <td>
                    {s.state} · <Link href={s.lgaPath}>{s.lgaName}</Link>
                  </td>
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
      </section>

      {/* 2. Top 20 High-Yield Suburbs Under $750k */}
      <section className="suburb-index-list section-shell" id="top-yield">
        <div className="section-label">Leaderboard 02 · Cashflow + Momentum ({asOf})</div>
        <h2 className="loc-section-h2">Top 20 High-Yield Suburbs Under $750,000 (R-Score 70+)</h2>
        <p className="suburb-meta" style={{ marginBottom: '18px' }}>
          High rental yield alone can be a mining-town trap unless macro demand and supply indicators also pass. Every suburb below combines a median house price under $750,000 with an R-Score of 70+/100.
        </p>
        <div className="rha-table-wrap">
          <table className="rha-data-table" aria-label="Top 20 high rental yield suburbs under $750k in Australia">
            <thead>
              <tr>
                <th>Rank &amp; Suburb</th>
                <th>State &amp; Council (LGA)</th>
                <th>Gross Yield</th>
                <th>Median Price</th>
                <th>R-Score</th>
                <th>Vacancy</th>
                <th>Drill Down</th>
              </tr>
            </thead>
            <tbody>
              {topYieldUnder750k.map((s, idx) => (
                <tr key={s.id}>
                  <td>
                    #{idx + 1}{' '}
                    <Link href={s.path}><b>{s.name}</b></Link>
                    {s.postcodes?.[0] ? ` (${s.postcodes[0]})` : ''}
                  </td>
                  <td>
                    {s.state} · <Link href={s.lgaPath}>{s.lgaName}</Link>
                  </td>
                  <td><b>{s.grossYield}%</b>{s.medianRent ? ` ($${Math.round(s.medianRent)}/wk)` : ''}</td>
                  <td>{fmtMoney(s.medianPrice)}</td>
                  <td><b>{s.score}/100</b></td>
                  <td>{s.vacancy !== null ? `${s.vacancy}%` : '—'}</td>
                  <td>
                    <Link href={s.path}><b>Suburb</b></Link> · <Link href={s.streetsPath}>Streets →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Lowest Vacancy Suburbs */}
      <section className="suburb-index-list section-shell" id="lowest-vacancy">
        <div className="section-label">Leaderboard 03 · Tightest Rental Markets ({asOf})</div>
        <h2 className="loc-section-h2">Top 20 Tightest Rental Vacancy Suburbs (Vacancy ≤ 1.5%, R-Score 75+)</h2>
        <p className="suburb-meta" style={{ marginBottom: '18px' }}>
          Suburbs where rental vacancy sits well below the 1.5% equilibrium line while overall R-Score sits at 75/100 or above.
        </p>
        <div className="rha-table-wrap">
          <table className="rha-data-table" aria-label="Lowest rental vacancy suburbs in Australia">
            <thead>
              <tr>
                <th>Rank &amp; Suburb</th>
                <th>State &amp; Council (LGA)</th>
                <th>Vacancy Rate</th>
                <th>R-Score</th>
                <th>Median Price</th>
                <th>Gross Yield</th>
                <th>Drill Down</th>
              </tr>
            </thead>
            <tbody>
              {lowestVacancy.map((s, idx) => (
                <tr key={s.id}>
                  <td>
                    #{idx + 1}{' '}
                    <Link href={s.path}><b>{s.name}</b></Link>
                    {s.postcodes?.[0] ? ` (${s.postcodes[0]})` : ''}
                  </td>
                  <td>
                    {s.state} · <Link href={s.lgaPath}>{s.lgaName}</Link>
                  </td>
                  <td><b>{s.vacancy}%</b></td>
                  <td><b>{s.score}/100</b></td>
                  <td>{fmtMoney(s.medianPrice)}</td>
                  <td>{s.grossYield !== null ? `${s.grossYield}%` : '—'}</td>
                  <td>
                    <Link href={s.path}><b>Suburb</b></Link> · <Link href={s.streetsPath}>Streets →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rha-advisory-box">
          <div>
            <p className="eyebrow" style={{ marginBottom: '8px' }}><span /> From Leaderboard to Shortlist</p>
            <h3>Want to know which of these suburbs and streets fit your budget and borrowing capacity?</h3>
            <p>
              Our acquisitions team goes beyond the monthly bake — checking flood overlays, lot slope, floorplans, and off-market comparables to match the right asset to your long-term portfolio sequence.
            </p>
          </div>
          <Link className="button button-primary" href="/discovery-call">Book Free Discovery Call <span>↗</span></Link>
        </div>
      </section>

      <LocationFaqSection
        eyebrow="National Suburb Leaderboard FAQs"
        heading="Frequently Asked Questions: Best Suburbs to Invest in Australia"
        intro={`Key answers from the ${asOf} Ripehouse Advisory 15,000-suburb research bake.`}
        faqs={faqs}
      />

      <Footer backHref="/suburbs" backLabel="All suburbs ↑" />
    </main>
  );
}
