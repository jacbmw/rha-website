import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import LocationSearch from '../../../components/LocationSearch';
import LocationFaqSection from '../../../components/LocationFaqSection';
import { CompareBars } from '../../../streets/[state]/[suburb]/[street]/StreetVisuals';
import { getLocationRegistry, STATE_NAMES } from '../../../../lib/locations';
import { pageMetadata, SITE_URL } from '../../../../lib/seo';

export const revalidate = 86400;
export const dynamicParams = false;

const STATE_ORDER = ['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt'];

export function generateStaticParams() {
  return STATE_ORDER.map((state) => ({ state }));
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
  const { state } = await params;
  const code = String(state || '').toLowerCase();
  const stateName = STATE_NAMES[code];
  if (!stateName) return { title: 'Best Suburbs | Ripehouse Advisory', robots: { index: false } };
  const upper = code.toUpperCase();
  return pageMetadata({
    title: `Best Suburbs to Invest in ${stateName} (${upper}) in 2026 — Top R-Scores & Yields | Ripehouse Advisory`,
    description: `Monthly quantitative leaderboard of the best suburbs to invest in ${stateName} (${upper}): Top 25 Highest R-Score Suburbs, High-Yield ${upper} Suburbs Under $750k, and Tightest Rental Vacancy Markets.`,
    path: `/suburbs/best/${code}`,
  });
}

export default async function BestSuburbsByStatePage({ params }) {
  const { state } = await params;
  const code = String(state || '').toLowerCase();
  const stateName = STATE_NAMES[code];
  if (!stateName) notFound();
  const upper = code.toUpperCase();

  const { lgas = [], asOf = 'latest month' } = await getLocationRegistry();
  const stateLgas = lgas.filter((l) => l.state.toLowerCase() === code);

  const stateSuburbs = stateLgas
    .flatMap((lga) => (lga.suburbs || []).map((s) => ({
      ...s,
      lgaName: lga.name,
      lgaPath: lga.path,
      state: lga.state,
    })))
    .filter((s) => s.score !== null && s.confidence !== 'low' && s.medianPrice >= 200000);

  const topRScore = [...stateSuburbs]
    .sort((a, b) => (b.score - a.score) || ((b.grossYield || 0) - (a.grossYield || 0)) || a.name.localeCompare(b.name))
    .slice(0, 25);

  const topYieldUnder750k = [...stateSuburbs]
    .filter((s) => s.score >= 60 && s.medianPrice >= 250000 && s.medianPrice <= 750000 && s.grossYield !== null && s.grossYield <= 12)
    .sort((a, b) => (b.grossYield - a.grossYield) || (b.score - a.score))
    .slice(0, 20);

  const lowestVacancy = [...stateSuburbs]
    .filter((s) => s.score >= 65 && s.vacancy !== null && s.vacancy >= 0.1 && s.vacancy <= 1.8 && s.medianPrice >= 250000)
    .sort((a, b) => (a.vacancy - b.vacancy) || (b.score - a.score))
    .slice(0, 20);

  const count85Plus = stateSuburbs.filter((s) => s.score >= 85).length;
  const stateMeanScore = stateSuburbs.length
    ? Math.round(stateSuburbs.reduce((sum, s) => sum + s.score, 0) / stateSuburbs.length)
    : 50;
  const maxScore = topRScore[0]?.score ?? null;

  const faqs = [
    {
      question: `What are the best suburbs to invest in ${stateName} (${upper}) in 2026?`,
      answer: topRScore.length > 0
        ? `Based on the ${asOf} Ripehouse 27-indicator suburb bake across ${stateSuburbs.length.toLocaleString('en-AU')} scored suburbs in ${stateName}, highest-ranking suburbs include ${topRScore.slice(0, 6).map((s) => `${s.name} (R-Score ${s.score}/100, median ${fmtMoney(s.medianPrice)}, yield ${s.grossYield ?? '—'}%)`).join('; ')}.`
        : `Ripehouse Advisory scores every suburb in ${stateName} monthly across 27 indicators.`,
    },
    {
      question: `Which ${stateName} suburbs under $750,000 have the highest rental yield?`,
      answer: topYieldUnder750k.length > 0
        ? `Among ${stateName} suburbs with a median price under $750,000 and an R-Score of 60+/100 (${asOf}), top gross rental yields include ${topYieldUnder750k.slice(0, 5).map((s) => `${s.name} (${s.grossYield}% yield, median ${fmtMoney(s.medianPrice)}, R-Score ${s.score}/100)`).join(', ')}.`
        : `Compare ${stateName} suburbs by rental yield and median price in the leaderboard tables above.`,
    },
    {
      question: `How do I check the best streets inside a ${stateName} suburb?`,
      answer: `Click "Streets →" next to any ${stateName} suburb in the tables above (or search at ripehouseadvisory.com.au/streets) to see how every residential street in that suburb scores on ABS 2021 Census SA1 owner-occupancy (>65%), public housing concentration (≤5%), and block-level rent and yield.`,
    },
  ];

  const pageUrl = `${SITE_URL}/suburbs/best/${code}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        '@id': `${pageUrl}#dataset`,
        name: `Best Suburbs to Invest in ${stateName} (${upper}) — ${asOf} R-Score Leaderboard`,
        description: `Monthly quantitative ranking of the highest R-Score suburbs, highest rental yield suburbs under $750k, and tightest vacancy suburbs across ${stateSuburbs.length} markets in ${stateName}.`,
        url: pageUrl,
        creator: { '@type': 'Organization', name: 'Ripehouse Advisory', url: SITE_URL },
        spatialCoverage: { '@type': 'AdministrativeArea', name: stateName },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Locations', item: `${SITE_URL}/locations` },
          { '@type': 'ListItem', position: 2, name: 'Best Suburbs in Australia', item: `${SITE_URL}/suburbs/best` },
          { '@type': 'ListItem', position: 3, name: `Best Suburbs in ${stateName} (${upper})`, item: pageUrl },
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
          <Link href="/suburbs/best">Best Suburbs</Link>
          <span>/</span>
          <Link href={`/suburbs/${code}`}>{upper}</Link>
          <span>/</span>
          <span aria-current="page">Best Suburbs in {stateName}</span>
        </nav>

        <p className="eyebrow"><span /> {stateName} ({upper}) Suburb Leaderboard · Data as of {asOf}</p>
        <h1>Best Suburbs in {stateName}, <i>Ranked.</i></h1>
        <p className="suburb-meta">
          {stateSuburbs.length.toLocaleString('en-AU')} high-confidence suburbs across {stateLgas.length} council areas in {stateName} ({upper}) scored across 27 supply, demand, momentum, and rental yield indicators ({asOf}).
        </p>

        <div className="loc-state-pills" style={{ marginTop: '20px' }}>
          <Link href="/suburbs/best" className="loc-state-pill">
            National Leaderboard
          </Link>
          {STATE_ORDER.map((stCode) => (
            <Link
              key={stCode}
              href={`/suburbs/best/${stCode}`}
              className="loc-state-pill"
              style={stCode === code ? { background: 'var(--ink)', color: '#fff' } : undefined}
            >
              {stCode.toUpperCase()} <span>({STATE_NAMES[stCode]})</span>
            </Link>
          ))}
        </div>

        <aside className="article-at-a-glance" aria-label="At a glance summary">
          <p className="article-at-a-glance-title">At a glance · {stateName} ({upper}) {asOf} Summary</p>
          <ul>
            <li><b>{stateSuburbs.length.toLocaleString('en-AU')} scored suburbs</b> across <b>{stateLgas.length} Local Government Areas</b> in {stateName} (average R-Score: <b>{stateMeanScore}/100</b>).</li>
            <li><b>{count85Plus.toLocaleString('en-AU')} suburbs in {upper} score 85+/100</b> this month, led by <b>{topRScore[0]?.name || upper} ({maxScore ?? '—'}/100)</b>.</li>
            <li>Browse the full A–Z directory at <Link href={`/suburbs/${code}`}>All {stateName} Suburbs</Link> or compare <Link href={`/locations#state-${code}`}>All {stateLgas.length} {upper} Council Areas</Link>.</li>
          </ul>
        </aside>

        <div className="street-compare" id="compare">
          <CompareBars
            rows={[
              { label: `Top ${upper} Suburb R-Score (${topRScore[0]?.name || upper})`, value: maxScore, accent: true, note: `Highest-scoring suburb in ${stateName} (${asOf})` },
              { label: `${stateName} Suburb Average R-Score`, value: stateMeanScore, note: `Across ${stateSuburbs.length.toLocaleString('en-AU')} scored suburbs in ${stateLgas.length} LGAs` },
            ]}
          />
          <div className="street-compare-why">
            <p className="street-compare-callout">
              Jump to: <a href="#top-rscore"><b>Top 25 {upper} R-Score Suburbs ↓</b></a> · <a href="#top-yield"><b>High-Yield {upper} Under $750k ↓</b></a> · <a href="#lowest-vacancy"><b>Tightest {upper} Vacancy ↓</b></a>
            </p>
            <p className="street-note">
              Click <b>Streets →</b> on any suburb to check its ABS SA1 block-level owner-occupier % and public housing %.
            </p>
          </div>
        </div>

        <LocationSearch
          localSuburbs={topRScore}
          scopeName={stateName}
          placeholder={`Search suburbs in ${stateName} (or any Australian city, council or postcode)…`}
        />
      </section>

      <section className="suburb-index-list section-shell" id="top-rscore">
        <div className="section-label">Leaderboard 01 · {stateName} Overall Market Strength ({asOf})</div>
        <h2 className="loc-section-h2">Top {topRScore.length} Highest R-Score Suburbs in {stateName} ({upper})</h2>
        <div className="rha-table-wrap">
          <table className="rha-data-table" aria-label={`Top highest R-Score suburbs in ${stateName}`}>
            <thead>
              <tr>
                <th>Rank &amp; Suburb</th>
                <th>Council Area (LGA)</th>
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
                  <td><Link href={s.lgaPath}>{s.lgaName}</Link></td>
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

      {topYieldUnder750k.length > 0 && (
        <section className="suburb-index-list section-shell" id="top-yield">
          <div className="section-label">Leaderboard 02 · Affordable Cashflow + Growth in {upper} ({asOf})</div>
          <h2 className="loc-section-h2">Highest Rental Yield Suburbs Under $750k in {stateName}</h2>
          <div className="rha-table-wrap">
            <table className="rha-data-table" aria-label={`Highest rental yield suburbs under $750k in ${stateName}`}>
              <thead>
                <tr>
                  <th>Rank &amp; Suburb</th>
                  <th>Council Area (LGA)</th>
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
                    <td><Link href={s.lgaPath}>{s.lgaName}</Link></td>
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
      )}

      {lowestVacancy.length > 0 && (
        <section className="suburb-index-list section-shell" id="lowest-vacancy">
          <div className="section-label">Leaderboard 03 · Tightest Rental Supply in {upper} ({asOf})</div>
          <h2 className="loc-section-h2">Lowest Vacancy Rate Suburbs in {stateName} ({upper})</h2>
          <div className="rha-table-wrap">
            <table className="rha-data-table" aria-label={`Lowest vacancy rate suburbs in ${stateName}`}>
              <thead>
                <tr>
                  <th>Rank &amp; Suburb</th>
                  <th>Council Area (LGA)</th>
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
                    <td><Link href={s.lgaPath}>{s.lgaName}</Link></td>
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
        </section>
      )}

      <section className="suburb-index-list section-shell">
        <div className="rha-advisory-box">
          <div>
            <p className="eyebrow" style={{ marginBottom: '8px' }}><span /> {stateName} Buyer&apos;s Agent &amp; Street Due Diligence</p>
            <h3>Investing in {stateName}? Screen the Council, Suburb &amp; Street Together.</h3>
            <p>
              Book a free 15-minute discovery call with Ripehouse Advisory to see how our 27-indicator suburb engine and SA1 street-level screening identify high-performing established houses across {stateName} and nationwide.
            </p>
          </div>
          <Link className="button button-primary" href="/discovery-call">Book Free Discovery Call <span>↗</span></Link>
        </div>
      </section>

      <LocationFaqSection
        eyebrow={`${stateName} (${upper}) Leaderboard FAQs`}
        heading={`Frequently Asked Questions: Best Suburbs in ${stateName}`}
        intro={`Key answers from the ${asOf} Ripehouse Advisory research bake for ${stateName}.`}
        faqs={faqs}
      />

      <Footer backHref="/suburbs/best" backLabel="National Suburb Leaderboard ↑" />
    </main>
  );
}
