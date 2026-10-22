import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import LocationFaqSection from '../../../components/LocationFaqSection';
import SuburbExperience from './SuburbExperience';
import { findSuburbBySlug, getSuburbSnapshot } from '../../../../lib/suburbs';
import {
  getSuburbLocationContext,
  fetchTopStreetsForSuburbs,
  buildSuburbFaqs,
} from '../../../../lib/locations';
import { pageMetadata, SITE_URL } from '../../../../lib/seo';

// One template, ~15,000 pages. ISR with 24h revalidate — the underlying data
// updates monthly. Pages render on-demand and are cached, so no build blowout.
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return []; // all pages on-demand
}

const logoUrl = '/images/rha-logo-dark.png';

const fmtMoney = (value) => (value === null ? '—' : `$${Math.round(value).toLocaleString('en-AU')}`);

async function loadPage(params) {
  const { state, slug } = await params;
  const entry = await findSuburbBySlug(state, slug).catch(() => null);
  if (!entry) return null;
  const snapshot = await getSuburbSnapshot(entry).catch(() => null);
  return snapshot ? { entry, snapshot } : null;
}

export async function generateMetadata({ params }) {
  const data = await loadPage(params);
  if (!data) return { title: 'Suburb data | Ripehouse Advisory', robots: { index: false } };
  const { snapshot } = data;
  const postcode = snapshot.postcodes?.[0] ? ` ${snapshot.postcodes[0]}` : '';
  const priceBit = snapshot.stats.medianPrice ? `${fmtMoney(snapshot.stats.medianPrice)} Median` : 'Property Market Data';
  const yieldBit = snapshot.stats.grossYield !== null ? `, ${snapshot.stats.grossYield}% Yield` : '';
  const scoreBit = snapshot.score !== null ? ` & R-Score ${snapshot.score}/100` : ' & R-Score';
  const title = `${snapshot.name} ${snapshot.state}${postcode} Property Market Data (2026): ${priceBit}${yieldBit}${scoreBit} | Ripehouse Advisory`;
  const description = snapshot.score !== null
    ? `${snapshot.name} ${snapshot.state}${postcode} scores ${snapshot.score}/100 on the Ripehouse R-Score (${snapshot.asOf}) — median house price ${fmtMoney(snapshot.stats.medianPrice)}, weekly rent ${snapshot.stats.medianRent ? `$${Math.round(snapshot.stats.medianRent)}/wk` : '—'}, gross yield ${snapshot.stats.grossYield ?? '—'}%, vacancy ${snapshot.stats.vacancy ?? '—'}%. Compare streets & market data.`
    : `Current property market data for ${snapshot.name} ${snapshot.state}${postcode} from the Ripehouse research engine — 15,000 suburbs scored across 27 indicators, updated monthly.`;
  return pageMetadata({
    title,
    description,
    path: `/suburbs/${snapshot.slug}`,
    image: { url: `${SITE_URL}/api/og/suburb/${snapshot.id}`, alt: `${snapshot.name} ${snapshot.state} R-Score` },
    // Thin/no-confidence pages stay out of the index rather than shipping a
    // page that looks complete but isn't.
    ...(snapshot.confidence === 'low' ? { robots: { index: false, follow: true } } : {}),
  });
}

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export default async function SuburbPage({ params }) {
  const data = await loadPage(params);
  if (!data) notFound();
  const { entry, snapshot } = data;
  const { stats } = snapshot;

  const [locationContext, topStreets] = await Promise.all([
    getSuburbLocationContext(entry.id).catch(() => ({ lga: null, city: null, siblingSuburbs: [] })),
    fetchTopStreetsForSuburbs([entry.id], 6).catch(() => []),
  ]);
  const faqs = buildSuburbFaqs(snapshot, locationContext, topStreets);
  const suburbUrl = `${SITE_URL}/suburbs/${snapshot.slug}`;
  const postcode = snapshot.postcodes?.[0] || '';

  const suburbJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Place',
        '@id': `${suburbUrl}#place`,
        name: `${snapshot.name}, ${snapshot.state}${postcode ? ` ${postcode}` : ''}`,
        url: suburbUrl,
        description: `Property investment market data, monthly 27-indicator R-Score (${snapshot.score ?? '—'}/100), median house price (${fmtMoney(stats.medianPrice)}), gross rental yield (${stats.grossYield ?? '—'}%), and street scores for ${snapshot.name}, ${snapshot.state}.`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: snapshot.name,
          addressRegion: snapshot.state,
          ...(postcode ? { postalCode: postcode } : {}),
          addressCountry: 'AU',
        },
        ...(locationContext.lga
          ? {
              containedInPlace: {
                '@type': 'AdministrativeArea',
                name: `${locationContext.lga.name} (${locationContext.lga.state})`,
                url: `${SITE_URL}${locationContext.lga.path}`,
              },
            }
          : {}),
      },
      {
        '@type': 'Dataset',
        '@id': `${suburbUrl}#dataset`,
        name: `${snapshot.name} ${snapshot.state} Property Market Data & R-Score (${snapshot.asOf})`,
        description: `Monthly Ripehouse Advisory suburb research dataset for ${snapshot.name} (${snapshot.state}): R-Score ${snapshot.score ?? '—'}/100, median price ${fmtMoney(stats.medianPrice)}, median rent ${stats.medianRent ? `$${Math.round(stats.medianRent)}/wk` : '—'}, gross yield ${stats.grossYield ?? '—'}%, vacancy ${stats.vacancy ?? '—'}%.`,
        url: suburbUrl,
        creator: { '@type': 'Organization', name: 'Ripehouse Advisory', url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${suburbUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Locations', item: `${SITE_URL}/locations` },
          { '@type': 'ListItem', position: 2, name: snapshot.state, item: `${SITE_URL}/suburbs/${snapshot.state.toLowerCase()}` },
          ...(locationContext.city
            ? [{ '@type': 'ListItem', position: 3, name: locationContext.city.name, item: `${SITE_URL}${locationContext.city.path}` }]
            : []),
          ...(locationContext.lga
            ? [{ '@type': 'ListItem', position: locationContext.city ? 4 : 3, name: `${locationContext.lga.name} LGA`, item: `${SITE_URL}${locationContext.lga.path}` }]
            : []),
          {
            '@type': 'ListItem',
            position: (locationContext.city ? 1 : 0) + (locationContext.lga ? 1 : 0) + 3,
            name: `${snapshot.name} ${snapshot.state}`,
            item: suburbUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="suburb-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(suburbJsonLd) }}
      />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/suburbs">Check another suburb</Link>
        <MobileNav links={navLinks} />
      </header>

      {/* ── Layer 0 — free snapshot ─────────────────────────────────────── */}
      <section className="suburb-hero section-shell">
        <nav className="loc-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/locations">Locations</Link>
          <span>/</span>
          <Link href={`/suburbs/${snapshot.state.toLowerCase()}`}>{snapshot.state}</Link>
          {locationContext.city && (
            <>
              <span>/</span>
              <Link href={locationContext.city.path}>{locationContext.city.name}</Link>
            </>
          )}
          {locationContext.lga && (
            <>
              <span>/</span>
              <Link href={locationContext.lga.path}>{locationContext.lga.name} LGA</Link>
            </>
          )}
          <span>/</span>
          <span aria-current="page">{snapshot.name}</span>
        </nav>

        <p className="eyebrow"><span /> Your suburb, scored · Data as of {snapshot.asOf}</p>
        <h1>{snapshot.name}, <i>{snapshot.state}</i></h1>
        <p className="suburb-meta">
          {snapshot.postcodes.length ? `Postcode ${snapshot.postcodes.join(', ')}` : ''}
          {locationContext.lga ? (
            <> · <Link href={locationContext.lga.path}>{locationContext.lga.name} council area</Link></>
          ) : snapshot.lga ? (
            ` · ${snapshot.lga} council area`
          ) : ''}
          {locationContext.city ? (
            <> · <Link href={locationContext.city.path}>Greater {locationContext.city.name}</Link></>
          ) : null}
          {` · One of 15,000 suburbs we score across 27 indicators, updated monthly`}
        </p>

        <div className="suburb-scoreband">
          <div className="suburb-dial" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="150" height="150">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(20,26,50,.12)" strokeWidth="7" />
              {snapshot.score !== null && (
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#c79810" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={`${(snapshot.score / 100) * 326.7} 326.7`}
                  transform="rotate(-90 60 60)"
                />
              )}
              <text x="60" y="58" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fill="#141a32">{snapshot.score ?? '—'}</text>
              <text x="60" y="78" textAnchor="middle" fontSize="10" fill="#687087">/ 100</text>
            </svg>
          </div>
          <div className="suburb-scorecopy">
            <p className="suburb-scoreline">
              <strong>R-Score {snapshot.score ?? '—'} / 100</strong>
              {snapshot.rank && snapshot.total ? <> — ranked <b>#{snapshot.rank.toLocaleString('en-AU')}</b> of {snapshot.total.toLocaleString('en-AU')} suburbs this month</> : null}
            </p>
            {snapshot.verdict ? (
              <div className={`suburb-verdict verdict-${snapshot.verdict.band}`}>
                <p className="suburb-verdict-label">{snapshot.verdict.label}</p>
                <p className="suburb-verdict-detail">{snapshot.verdict.detail}</p>
              </div>
            ) : (
              <div className="suburb-verdict verdict-thin">
                <p className="suburb-verdict-label">Not enough recent activity for a reliable read</p>
                <p className="suburb-verdict-detail">Markets this thin are exactly the kind we research manually rather than score automatically. If this suburb matters to you, ask us — we&apos;ll do it properly.</p>
              </div>
            )}
            <p className="suburb-compliance">Scores describe measured market conditions — not personal advice, and not a forecast.</p>
          </div>
        </div>

        <div className="suburb-teasers">
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Median house price</span>
            <strong>{fmtMoney(stats.medianPrice)}</strong>
            <p>
              {stats.priceChange12m === null
                ? 'Not enough recent sales for a reliable 12-month comparison.'
                : stats.priceChange12m >= 0
                  ? `Up ${stats.priceChange12m}% over the past 12 months of settled sales.`
                  : `Down ${Math.abs(stats.priceChange12m)}% over the past 12 months of settled sales.`}
            </p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Median weekly rent</span>
            <strong>{stats.medianRent === null ? '—' : `$${Math.round(stats.medianRent)}/wk`}</strong>
            <p>{stats.grossYield === null ? 'Rental data is thin here this month.' : `That's a gross yield of ${stats.grossYield}% at the current median price.`}</p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Vacancy rate</span>
            <strong>{stats.vacancy === null ? '—' : `${stats.vacancy}%`}</strong>
            <p>{stats.vacancy === null ? 'Not enough rental listings to measure vacancy reliably.' : stats.vacancy < 1.5 ? 'Anything under 1.5% means renters are competing for what little is available.' : 'Above the 1.5% line where the rental market starts to loosen.'}</p>
          </div>
        </div>
        <p className="suburb-street-link">
          Suburb averages hide a lot. <Link href={`/streets/${snapshot.slug}`}>Check how your street compares with the rest of {snapshot.name} →</Link>
        </p>
      </section>

      {/* ── Layers 1 + 2 (client) ───────────────────────────────────────── */}
      <SuburbExperience snapshot={snapshot} />

      {/* ── Street-level drill-down + Council context ───────────────────── */}
      <section className="suburb-index-list section-shell" id="best-streets">
        <div className="section-label">Street-Level Research in {snapshot.name}</div>
        <h2 className="loc-section-h2">Best Streets in {snapshot.name}, {snapshot.state}</h2>
        <p className="suburb-meta" style={{ marginBottom: '18px' }}>
          Two streets in the same suburb can sit in completely different census blocks for owner-occupiers, public housing, and rental yield. Drill down into {snapshot.name}&apos;s streets below.
        </p>
        {topStreets.length > 0 ? (
          <div className="loc-card-grid loc-card-grid-compact" style={{ marginBottom: '18px' }}>
            {topStreets.map((st) => (
              <Link key={st.key} href={st.path} className="loc-card loc-card-compact">
                <div className="loc-card-top">
                  <span className="loc-card-rank">{snapshot.name} · {st.addresses} addresses</span>
                  <span className="loc-card-score">Street Score <b>{st.score}/100</b></span>
                </div>
                <h3>{st.name}</h3>
                <div className="loc-card-stats">
                  {st.rent ? <span>Rent <b>${st.rent}/wk</b></span> : null}
                  {st.yieldRate !== null ? <span>Yield <b>{st.yieldRate}%</b></span> : null}
                  <span>View street report →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
        <p className="suburb-street-link" style={{ marginTop: '8px' }}>
          <Link href={`/streets/${snapshot.slug}`}>
            Compare every street in {snapshot.name} ({snapshot.state}) on the Street Score →
          </Link>
        </p>

        {locationContext.lga && locationContext.siblingSuburbs.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div className="section-label">Nearby in {locationContext.lga.name} Council</div>
            <h3 className="loc-section-h3">
              Other High-Scoring Suburbs in{' '}
              <Link href={locationContext.lga.path}>{locationContext.lga.name} ({locationContext.lga.state})</Link>
            </h3>
            <ul className="suburb-plain-list loc-suburb-grid" style={{ marginTop: '12px' }}>
              {locationContext.siblingSuburbs.map((sub) => (
                <li key={sub.id} className="loc-suburb-item">
                  <Link href={sub.path} className="loc-suburb-main">
                    <b>{sub.name}</b>
                  </Link>
                  <span className="loc-suburb-links">
                    R-Score <b>{sub.score}/100</b> · <Link href={sub.streetsPath}>Streets →</Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rha-table-wrap" style={{ marginTop: '36px' }}>
          <div className="section-label">{snapshot.name} ({snapshot.state}) Market Snapshot ({snapshot.asOf})</div>
          <table className="rha-data-table" aria-label={`${snapshot.name} ${snapshot.state} property market data table`}>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>{snapshot.name} Reading</th>
                <th>Context &amp; Benchmark</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ripehouse R-Score</td>
                <td><b>{snapshot.score !== null ? `${snapshot.score} / 100` : '—'}</b></td>
                <td>{snapshot.rank && snapshot.total ? `Ranked #${snapshot.rank.toLocaleString('en-AU')} of ${snapshot.total.toLocaleString('en-AU')} Australian suburbs (${snapshot.asOf})` : 'Measured across 27 supply, demand, momentum & yield indicators'}</td>
              </tr>
              <tr>
                <td>Median House Price</td>
                <td><b>{fmtMoney(stats.medianPrice)}</b></td>
                <td>{stats.priceChange12m !== null ? `${stats.priceChange12m >= 0 ? `+${stats.priceChange12m}%` : `${stats.priceChange12m}%`} over the past 12 months of settled sales` : 'Settled house sales benchmark'}</td>
              </tr>
              <tr>
                <td>Median Weekly Asking Rent</td>
                <td><b>{stats.medianRent !== null ? `$${Math.round(stats.medianRent)}/wk` : '—'}</b></td>
                <td>{stats.grossYield !== null ? `Implies a ${stats.grossYield}% gross rental yield at the current median price` : 'Measured across residential rental listings'}</td>
              </tr>
              <tr>
                <td>Rental Vacancy Rate</td>
                <td><b>{stats.vacancy !== null ? `${stats.vacancy}%` : '—'}</b></td>
                <td>{stats.vacancy !== null ? (stats.vacancy < 1.5 ? 'Tight rental supply (below the 1.5% equilibrium threshold)' : 'Above the 1.5% tight-supply threshold') : 'Suburb rental vacancy reading'}</td>
              </tr>
              <tr>
                <td>Median Days on Market</td>
                <td><b>{stats.daysOnMarket !== null ? `${stats.daysOnMarket} days` : '—'}</b></td>
                <td>{locationContext.lga ? `Part of ${locationContext.lga.name} (${locationContext.lga.state}) council area (LGA avg R-Score ${locationContext.lga.rScoreAvg ?? '—'}/100)` : 'Selling speed across recent residential listings'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rha-advisory-box">
          <div>
            <p className="eyebrow" style={{ marginBottom: '8px' }}><span /> Buyer&apos;s Agent &amp; Quantitative Due Diligence</p>
            <h3>Considering buying an investment property in {snapshot.name}, {snapshot.state}?</h3>
            <p>
              Since 2011, Ripehouse Advisory has helped Australian investors screen 15,000 suburbs and 518,000+ streets to avoid high-public-housing blocks, flood/overlay traps, and underperforming pockets. Speak with our team before you make an offer.
            </p>
          </div>
          <Link className="button button-primary" href="/discovery-call">Book a Free Discovery Call <span>↗</span></Link>
        </div>
      </section>

      {/* ── LLM-Optimised FAQ Panel ─────────────────────────────────────── */}
      <LocationFaqSection
        eyebrow={`${snapshot.name} ${snapshot.state} FAQs`}
        heading={`Frequently Asked Questions: Investing in ${snapshot.name}, ${snapshot.state}`}
        intro={`Key answers from the ${snapshot.asOf} Ripehouse Advisory suburb and street research bake for ${snapshot.name}.`}
        faqs={faqs}
      />

      <section className="suburb-footnote section-shell">
        <p>
          R-Score and all figures are drawn from Ripehouse&apos;s research engine — 15,000 suburbs measured across 27 indicators, refreshed monthly (data as of {snapshot.asOf}). Scores describe past and current measured market conditions only. Past performance is not a reliable indicator of future performance. Nothing on this page is personal financial advice.
        </p>
      </section>

      <Footer backHref="/suburbs" backLabel="Check another suburb ↑" />
    </main>
  );
}
