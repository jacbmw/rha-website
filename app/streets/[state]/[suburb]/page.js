import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import StreetSearch from '../../../components/StreetSearch';
import LocationFaqSection from '../../../components/LocationFaqSection';
import SuburbStreetsUnlock from './SuburbStreetsUnlock';
import { findSuburbBySlug } from '../../../../lib/suburbs';
import { getSuburbStreets } from '../../../../lib/streets';
import { getSuburbLocationContext } from '../../../../lib/locations';
import { pageMetadata, SITE_URL } from '../../../../lib/seo';

// Every street in one suburb (Top 3 + suburb street distribution in SSR HTML,
// full #1–#N comparison leaderboard & bottom 5 unlocked in the report).
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

const logoUrl = '/images/rha-logo-dark.png';

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

async function loadPage(params) {
  const { state, suburb } = await params;
  const entry = await findSuburbBySlug(state, suburb).catch(() => null);
  if (!entry) return null;
  const data = await getSuburbStreets(entry).catch((error) => {
    console.error('Suburb streets failed:', error.message);
    return null;
  });
  return data ? { entry, data } : null;
}

export async function generateMetadata({ params }) {
  const page = await loadPage(params);
  if (!page) return { title: 'Street Score | Ripehouse Advisory', robots: { index: false } };
  const { entry, data } = page;
  const { suburb } = data;
  const postcode = entry.postcodes?.[0] ? ` ${entry.postcodes[0]}` : '';
  return pageMetadata({
    title: `Best & Worst Streets in ${suburb.name} ${suburb.state}${postcode} (2026) — ${suburb.streetCount} Streets Scored | Ripehouse Advisory`,
    description: `Compare all ${suburb.streetCount} streets in ${suburb.name} ${suburb.state}${postcode} on the Ripehouse Street Score (suburb average ${suburb.average ?? '—'}/100 across ${suburb.addresses.toLocaleString('en-AU')} addresses). Inspect ABS SA1 owner-occupier %, public housing concentration, and block-level rent & yield.`,
    path: `/streets/${suburb.state.toLowerCase()}/${suburb.slug}`,
    ...(suburb.scoredStreets < 3 ? { robots: { index: false, follow: true } } : {}),
  });
}

export default async function SuburbStreetsPage({ params }) {
  const page = await loadPage(params);
  if (!page) notFound();
  const { entry, data } = page;
  const { suburb, streets } = data;
  const suburbPath = `${suburb.state.toLowerCase()}/${suburb.slug}`;
  const locationContext = await getSuburbLocationContext(entry.id).catch(() => ({ lga: null, city: null }));

  const reliableStreets = streets.filter((s) => s.score !== null && s.confidence !== 'low');
  const anchorStreet = reliableStreets[0] || streets[0] || null;
  const top3Streets = [...reliableStreets]
    .sort((a, b) => (b.score - a.score) || (b.addresses - a.addresses) || a.name.localeCompare(b.name))
    .slice(0, 3);
  const strongCount = reliableStreets.filter((s) => s.score >= 75).length;
  const solidCount = reliableStreets.filter((s) => s.score >= 50 && s.score < 75).length;
  const weakerCount = reliableStreets.filter((s) => s.score < 50).length;
  const postcode = entry.postcodes?.[0] || '';
  const hubUrl = `${SITE_URL}/streets/${suburbPath}`;

  const faqs = [
    {
      question: `What are the highest-scoring streets in ${suburb.name} ${suburb.state}?`,
      answer: top3Streets.length > 0
        ? `Based on Ripehouse Advisory’s ABS 2021 Census SA1 tenure and ${suburb.asOf || 'latest'} rental yield data across ${suburb.streetCount} streets in ${suburb.name} (${suburb.state}${postcode ? ` ${postcode}` : ''}), top-scoring streets include ${top3Streets.map((s) => `${s.name} (Street Score ${s.score}/100 across ${s.addresses} addresses)`).join(', ')}. Across ${suburb.name}, ${strongCount} streets score 75–100/100 against a suburb street average of ${suburb.average ?? '—'}/100.`
        : `Ripehouse Advisory tracks ${suburb.streetCount} residential streets (${suburb.addresses.toLocaleString('en-AU')} addresses) in ${suburb.name} ${suburb.state}. Select any street above to inspect its block-by-block census tenure, rent and yield profile.`,
    },
    {
      question: `How does Ripehouse score streets in ${suburb.name} (${suburb.state})?`,
      answer: `Every address on ${suburb.name}’s ${suburb.streetCount} streets is matched via G-NAF to its ABS 2021 Mesh Block and SA1 area. Each block is tested for owner-occupiers above 65%, public/social housing at 5% or less, median weekly rent at or above the ${suburb.name} median (${suburb.rent ? `$${Math.round(suburb.rent)}/wk` : 'suburb benchmark'}), and gross rental yield at or above the ${suburb.name} benchmark (${suburb.yieldRate ? `${Math.round(suburb.yieldRate * 1000) / 10}%` : 'suburb median'}).`,
    },
    {
      question: `Why do street scores vary inside ${suburb.name}?`,
      answer: `Suburb-wide medians blend every pocket together. Within ${suburb.name}, ${strongCount} streets score in the Strong band (75–100), ${solidCount} sit in the Solid/Mixed band (50–74), and ${weakerCount} score below 50 due to lower owner-occupation, higher public housing concentration, or softer block-level rents and yields.`,
    },
  ];

  const hubJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        '@id': `${hubUrl}#dataset`,
        name: `Street Scores & Block-Level Property Data for ${suburb.name}, ${suburb.state}`,
        description: `Street-by-street ABS SA1 owner-occupancy, public housing concentration, median rent, and gross rental yield rankings across ${suburb.streetCount} streets (${suburb.addresses} addresses) in ${suburb.name} ${suburb.state}.`,
        url: hubUrl,
        creator: { '@type': 'Organization', name: 'Ripehouse Advisory', url: SITE_URL },
        spatialCoverage: {
          '@type': 'Place',
          name: `${suburb.name}, ${suburb.state}${postcode ? ` ${postcode}` : ''}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${hubUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Locations', item: `${SITE_URL}/locations` },
          ...(locationContext.city
            ? [{ '@type': 'ListItem', position: 2, name: locationContext.city.name, item: `${SITE_URL}${locationContext.city.path}` }]
            : []),
          ...(locationContext.lga
            ? [{ '@type': 'ListItem', position: locationContext.city ? 3 : 2, name: `${locationContext.lga.name} LGA`, item: `${SITE_URL}${locationContext.lga.path}` }]
            : []),
          {
            '@type': 'ListItem',
            position: (locationContext.city ? 1 : 0) + (locationContext.lga ? 1 : 0) + 2,
            name: `${suburb.name} ${suburb.state}`,
            item: `${SITE_URL}/suburbs/${suburbPath}`,
          },
          {
            '@type': 'ListItem',
            position: (locationContext.city ? 1 : 0) + (locationContext.lga ? 1 : 0) + 3,
            name: `Streets in ${suburb.name}`,
            item: hubUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="suburb-index-page street-index-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd) }}
      />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/streets">Check another suburb</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-index-hero section-shell">
        <nav className="loc-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/locations">Locations</Link>
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
          <Link href={`/suburbs/${suburbPath}`}>{suburb.name}</Link>
          <span>/</span>
          <span aria-current="page">Streets</span>
        </nav>

        <p className="eyebrow"><span /> Street Score · {suburb.name} {suburb.state}{postcode ? ` ${postcode}` : ''}{suburb.asOf ? ` · Data as of ${suburb.asOf}` : ''}</p>
        <h1>Every street in {suburb.name}, <i>scored.</i></h1>
        <p className="suburb-meta">
          {suburb.streetCount} streets · {suburb.addresses.toLocaleString('en-AU')} addresses
          {suburb.average !== null ? ` · ${suburb.name} street average ${suburb.average}/100` : ''}
          {' · '}<Link href={`/suburbs/${suburbPath}`}>See the {suburb.name} suburb R-Score report</Link>
          {locationContext.lga ? (
            <> · <Link href={locationContext.lga.path}>{locationContext.lga.name} council area</Link></>
          ) : null}
        </p>
        <StreetSearch suburb={{ id: entry.id, name: entry.name, state: entry.state, slug: suburbPath }} />

        <div className="suburb-teasers" style={{ marginTop: '28px' }}>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">{suburb.name} street average</span>
            <strong>{suburb.average !== null ? `${suburb.average}/100` : '—'}</strong>
            <p>Address-weighted Street Score across {suburb.scoredStreets} scored streets ({suburb.addresses.toLocaleString('en-AU')} addresses).</p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Strong-profile streets (75–100)</span>
            <strong>{strongCount} {strongCount === 1 ? 'street' : 'streets'}</strong>
            <p>Pass both ABS 2021 Census tenure tests (&gt;65% owner-occupiers, ≤5% public housing) plus rent or yield.</p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">{suburb.name} rent &amp; yield benchmark</span>
            <strong>{suburb.rent !== null ? `$${Math.round(suburb.rent)}/wk` : '—'}</strong>
            <p>{suburb.yieldRate !== null ? `Suburb gross yield benchmark ${Math.round(suburb.yieldRate * 1000) / 10}% (${suburb.asOf || 'latest'}).` : 'Suburb rental benchmark used to test each SA1 block.'}</p>
          </div>
        </div>
      </section>

      {top3Streets.length > 0 && (
        <section className="suburb-index-list section-shell" id="top-streets-preview">
          <div className="section-label">Highest-Scoring Streets in {suburb.name} (Sample)</div>
          <h2 className="loc-section-h2">Top-Scoring Streets in {suburb.name}, {suburb.state}</h2>
          <p className="suburb-meta" style={{ marginBottom: '18px' }}>
            Below are {top3Streets.length} of the highest-scoring streets in {suburb.name} based on ABS SA1 census owner-occupancy, public housing concentration, and block-level rent and yield. Unlock the full leaderboard below to see all {suburb.scoredStreets} ranked streets and the lowest-scoring streets to avoid.
          </p>
          <div className="loc-card-grid">
            {top3Streets.map((st, idx) => (
              <Link key={st.slug} href={`/streets/${suburbPath}/${st.slug}`} className="loc-card">
                <div className="loc-card-top">
                  <span className="loc-card-rank">Top Street #{idx + 1} · {st.addresses} addresses</span>
                  <span className="loc-card-score">Street Score <b>{st.score}/100</b></span>
                </div>
                <h3>{st.name}, {suburb.name}</h3>
                <div className="loc-card-stats">
                  {st.ownerOcc !== null && <span>Owner-occ <b>{Math.round(st.ownerOcc * 100)}%</b></span>}
                  {st.rent !== null && <span>Rent <b>${Math.round(st.rent)}/wk</b></span>}
                  {st.yieldRate !== null && <span>Yield <b>{Math.round(st.yieldRate * 1000) / 10}%</b></span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {suburb.scoredStreets >= 3 && anchorStreet && (
        <SuburbStreetsUnlock suburb={suburb} suburbPath={suburbPath} anchorKey={anchorStreet.key} />
      )}

      <section className="suburb-index-list section-shell">
        <div className="section-label">All {suburb.streetCount} streets in {suburb.name}</div>
        <h2 className="loc-section-h2">Complete A–Z Street Directory for {suburb.name} ({suburb.state})</h2>
        <ul className="suburb-plain-list">
          {streets.map((street) => (
            <li key={street.slug}><Link href={`/streets/${suburbPath}/${street.slug}`} prefetch={false}>{street.name}</Link></li>
          ))}
        </ul>
      </section>

      <LocationFaqSection
        eyebrow={`${suburb.name} ${suburb.state} Street Score FAQs`}
        heading={`Frequently Asked Questions: Best & Worst Streets in ${suburb.name}, ${suburb.state}`}
        intro={`Block-level census tenure, rent and yield answers across ${suburb.streetCount} streets in ${suburb.name}.`}
        faqs={faqs}
      />

      <Footer backHref={`/suburbs/${suburbPath}`} backLabel={`Back to ${suburb.name} ↑`} />
    </main>
  );
}
