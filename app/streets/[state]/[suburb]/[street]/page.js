import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../../components/Footer';
import MobileNav from '../../../../components/MobileNav';
import StreetExperience from './StreetExperience';
import { StreetDial, CompareBars } from './StreetVisuals';
import { findSuburbBySlug, getSuburbSnapshot } from '../../../../../lib/suburbs';
import { getStreetSnapshot } from '../../../../../lib/streets';
import { pageMetadata, SITE_URL } from '../../../../../lib/seo';

// One template, every G-NAF street. ISR 24h, rendered on demand — the street
// table for a suburb is computed once per instance per day (lib/streets.js).
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
  const { state, suburb, street } = await params;
  const entry = await findSuburbBySlug(state, suburb).catch(() => null);
  if (!entry) return null;
  const [snapshot, suburbSnapshot] = await Promise.all([
    getStreetSnapshot(entry, street).catch((error) => {
      console.error('Street snapshot failed:', error.message);
      return null;
    }),
    getSuburbSnapshot(entry).catch(() => null),
  ]);
  return snapshot ? { entry, snapshot, suburbSnapshot } : null;
}

export async function generateMetadata({ params }) {
  const data = await loadPage(params);
  if (!data) return { title: 'Street Score | Ripehouse Advisory', robots: { index: false } };
  const { snapshot } = data;
  const where = `${snapshot.name}, ${snapshot.suburb.name} ${snapshot.suburb.state}`;
  return pageMetadata({
    title: `${where} — Street Score${snapshot.score !== null ? ` ${snapshot.score}/100` : ''} | Ripehouse Advisory`,
    description: snapshot.score !== null && snapshot.gap !== null
      ? `${where} scores ${snapshot.score}/100 on the Ripehouse Street Score — ${snapshot.gap === 0 ? 'right on' : `${Math.abs(snapshot.gap)} points ${snapshot.gap > 0 ? 'above' : 'below'}`} the ${snapshot.suburb.name} street average. See how it compares, free.`
      : `How ${where} compares with the rest of ${snapshot.suburb.name} on the Ripehouse Street Score.`,
    path: snapshot.path,
    image: { url: `${SITE_URL}/api/og/street/${encodeURIComponent(snapshot.key)}`, alt: `${where} Street Score` },
    ...(snapshot.confidence === 'low' ? { robots: { index: false, follow: true } } : {}),
  });
}

const TEST_LABELS = {
  ownerOcc: 'Owner-occupiers above 65%',
  publicHousing: 'Public housing 5% or less',
  rent: 'Rent at or above suburb median',
  yieldRate: 'Yield at or above suburb',
};

// Honest ranking copy: the score is a 5-step scale, so most streets share a
// score with others. Never claim "#1" for a street that ties with half the suburb.
function rankWords(snapshot, suburb) {
  const total = suburb.streetCount;
  if (snapshot.tied >= Math.max(1, (total - 1) * 0.5)) {
    return `scores the same as ${snapshot.tied} of the other ${total - 1} streets in ${suburb.name}`;
  }
  if (snapshot.tied > 0) return `ranked #${snapshot.rank} of ${total} streets in ${suburb.name} (shared with ${snapshot.tied} other${snapshot.tied === 1 ? '' : 's'})`;
  return `ranked #${snapshot.rank} of ${total} streets in ${suburb.name}`;
}

// Banded headline — the number is a summary of the four tests, so lead with
// the band and the test count rather than implying 1-point precision.
const BAND_WORDS = { strong: 'Strong street profile', solid: 'Solid street profile', mixed: 'Mixed street profile', cool: 'Weaker street profile' };

function headlineWords(snapshot) {
  if (snapshot.score === null) return 'Street profile not yet scored';
  const band = snapshot.verdict ? BAND_WORDS[snapshot.verdict.band] : 'Street profile';
  const tests = snapshot.testsKnown ? ` · ${snapshot.testsPassed} of ${snapshot.testsKnown} tests pass` : '';
  return `${band}${tests}`;
}

const CONFIDENCE_WORDS = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };
// Only claim a national frame once the bake actually covers most of the country.
const MIN_NATIONAL_STREETS = 300000;

export default async function StreetPage({ params }) {
  const data = await loadPage(params);
  if (!data) notFound();
  const { snapshot, suburbSnapshot } = data;
  const { stats, suburb } = snapshot;
  const gapWords = snapshot.gap === null
    ? null
    : snapshot.gap === 0
      ? `${snapshot.name} scores right on the ${suburb.name} street average.`
      : `${snapshot.name} scores ${Math.abs(snapshot.gap)} point${Math.abs(snapshot.gap) === 1 ? '' : 's'} ${snapshot.gap > 0 ? 'above' : 'below'} the ${suburb.name} street average.`;
  // When the whole suburb ties, the suburb — not the street — is the story.
  const flatSuburb = snapshot.tied >= Math.max(1, (suburb.streetCount - 1) * 0.5) && snapshot.gap === 0;
  const clientSnapshot = {
    key: snapshot.key,
    slug: snapshot.slug,
    name: snapshot.name,
    path: snapshot.path,
    score: snapshot.score,
    gap: snapshot.gap,
    rank: snapshot.rank,
    betterCount: snapshot.betterCount ?? 0,
    topScore: snapshot.topScore ?? null,
    blocks: snapshot.blocks ?? 1,
    confidence: snapshot.confidence,
    suburb: { id: suburb.id, name: suburb.name, state: suburb.state, slug: suburb.slug, average: suburb.average, streetCount: suburb.streetCount },
  };
  const compareRows = [
    { label: snapshot.name, value: snapshot.score, accent: true },
    { label: `${suburb.name} street average`, value: suburb.average, note: `Across ${suburb.streetCount} scored streets` },
    ...(suburbSnapshot?.score !== null && suburbSnapshot?.score !== undefined
      ? [{ label: `${suburb.name} market R-Score`, value: suburbSnapshot.score, note: 'How the whole suburb\u2019s market is running this month — a different, 27-indicator measure' }]
      : []),
  ];

  return (
    <main className="suburb-page street-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/streets">Check another street</Link>
        <MobileNav links={navLinks} />
      </header>

      {/* ── Layer 0 — free, no gate ─────────────────────────────────────── */}
      <section className="suburb-hero section-shell">
        <p className="eyebrow"><span /> Street Score{snapshot.asOf ? ` · Data as of ${snapshot.asOf}` : ''}</p>
        <h1>{snapshot.name}, <i>{suburb.name} {suburb.state}</i></h1>
        <p className="suburb-meta">
          {`${snapshot.addresses.toLocaleString('en-AU')} addresses`}
          {snapshot.rank && suburb.streetCount ? ` · ${rankWords(snapshot, suburb)}` : ''}
          {' · '}<Link href={`/suburbs/${suburb.slug}`}>See the {suburb.name} suburb score</Link>
        </p>

        <div className="suburb-scoreband street-scoreband">
          <StreetDial score={snapshot.score} />
          <div className="suburb-scorecopy">
            <p className="suburb-scoreline"><strong>{headlineWords(snapshot)}</strong>{gapWords ? <> — {gapWords}</> : null}</p>
            <ul className="street-tests street-tests-inline" aria-label="The four street tests">
              {Object.entries(TEST_LABELS).map(([key, label]) => (
                <li key={key} className={snapshot.tests[key] === null ? 'na' : snapshot.tests[key] ? 'pass' : 'fail'}>
                  <span aria-hidden="true">{snapshot.tests[key] === null ? '–' : snapshot.tests[key] ? '✓' : '✕'}</span>{label}
                </li>
              ))}
            </ul>
            {snapshot.verdict ? (
              <div className={`suburb-verdict verdict-${snapshot.verdict.band}`}>
                <p className="suburb-verdict-label">{snapshot.verdict.label}</p>
                <p className="suburb-verdict-detail">{snapshot.verdict.detail}</p>
              </div>
            ) : (
              <div className="suburb-verdict verdict-thin">
                <p className="suburb-verdict-label">Not enough data on this street for a reliable read</p>
                <p className="suburb-verdict-detail">Short streets, new estates and mostly-commercial strips are the kind we look at by hand rather than score automatically. If this street matters to you, ask us — we&apos;ll do it properly.</p>
              </div>
            )}
            {snapshot.context?.national && snapshot.context.national.streets >= MIN_NATIONAL_STREETS && (
              <p className="street-national">
                Streets scoring 75+ make up <b>{snapshot.context.national.shareStrong}%</b> of the {snapshot.context.national.streets.toLocaleString('en-AU')} Australian streets we score
                {snapshot.context.state ? <>; in {suburb.state} it&apos;s <b>{snapshot.context.state.shareStrong}%</b></> : null}.
                {' '}{snapshot.name} sits {snapshot.context.national.shareBelow > 0 ? <>above <b>{snapshot.context.national.shareBelow}%</b> of them</> : 'at the bottom of that range'}.
              </p>
            )}
            <p className="street-provenance">
              <span className={`street-confidence street-confidence-${snapshot.confidence}`}>{CONFIDENCE_WORDS[snapshot.confidence]}</span>
              {` · ${snapshot.addresses.toLocaleString('en-AU')} addresses across ${snapshot.blocks} census block${snapshot.blocks === 1 ? '' : 's'}`}
              {` · Tenure: ${snapshot.sources.tenure}`}{snapshot.sources.market ? ` · Rent & yield: ${snapshot.sources.market}` : ''}
            </p>
            <p className="street-hero-cta">
              <a href="#report">
                {snapshot.betterCount > 0
                  ? <><b>{snapshot.betterCount} street{snapshot.betterCount === 1 ? '' : 's'} in {suburb.name} score higher</b>{snapshot.topScore ? ` (up to ${snapshot.topScore}/100)` : ''} — see the top-scoring streets &amp; full report ↓</>
                  : <><b>See the Top 5 &amp; Bottom 5 streets in {suburb.name}</b> + full block-by-block report ↓</>}
              </a>
            </p>
            <p className="suburb-compliance">Scores describe measured conditions on the blocks this street runs through — not your home, not personal advice, and not a forecast.</p>
          </div>
        </div>

        {/* Street vs suburb — the hero comparison */}
        <div className="street-compare" id="compare">
          <CompareBars rows={compareRows} />
          <div className="street-compare-why">
            {flatSuburb ? (
              <>
                <p className="street-compare-callout">Every scored street in {suburb.name} shares this profile — here the suburb, not the street, is the decision.</p>
                <p className="street-note">The street test can&apos;t separate {suburb.name}&apos;s streets on tenure, rent or yield. {suburbSnapshot?.score !== null && suburbSnapshot?.score !== undefined ? <>The suburb&apos;s market R-Score of <b>{suburbSnapshot.score}</b> is the number that matters here — <Link href={`/suburbs/${suburb.slug}`}>see the suburb scorecard</Link>.</> : <Link href={`/suburbs/${suburb.slug}`}>See the suburb scorecard.</Link>}</p>
              </>
            ) : (
              <>
                <p className="street-compare-callout">{gapWords || 'How this street stacks up against its own suburb.'}</p>
                <p className="street-note">
                  {snapshot.gap !== null && snapshot.gap > 0 && `The blocks on ${snapshot.name} pass more of the four tests than the typical ${suburb.name} street.`}
                  {snapshot.gap !== null && snapshot.gap < 0 && `The blocks on ${snapshot.name} pass fewer of the four tests than the typical ${suburb.name} street — the full report shows which, block by block.`}
                  {snapshot.gap === 0 && `Typical for ${suburb.name} on these measures — the full report shows how it sits block by block.`}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="suburb-teasers">
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Owner-occupiers</span>
            <strong>{stats.ownerOcc === null ? '—' : `${stats.ownerOcc}%`}</strong>
            <p>{stats.ownerOcc === null ? 'Not enough census data for the blocks on this street.' : stats.ownerOcc > 65 ? 'Mostly owner-occupied — the kind of street people hold onto.' : 'Under the 65% owner-occupier line we look for.'}</p>
          </div>
          <div className="suburb-teaser">
            <span className="suburb-teaser-label">Median weekly rent</span>
            <strong>{stats.rent === null ? '—' : `$${stats.rent}/wk`}</strong>
            <p>{stats.rent === null || suburb.rent === null ? 'Rental data is thin for the blocks on this street.' : `Against a ${suburb.name} median of $${Math.round(suburb.rent)}/wk.`}</p>
          </div>
          <div className="suburb-teaser">
            {snapshot.betterCount > 0 ? (
              <>
                <span className="suburb-teaser-label">Higher-scoring in {suburb.name}</span>
                <strong>{snapshot.betterCount} {snapshot.betterCount === 1 ? 'street' : 'streets'}</strong>
                <p>Score higher than {snapshot.name}{snapshot.topScore ? ` (up to ${snapshot.topScore}/100)` : ''}. <a href="#report">Unlock the top streets ↓</a></p>
              </>
            ) : (
              <>
                <span className="suburb-teaser-label">Gross yield</span>
                <strong>{stats.yieldRate === null ? '—' : `${stats.yieldRate}%`}</strong>
                <p>{stats.yieldRate === null || suburb.yieldRate === null ? 'Not enough sales and rents here to measure yield reliably.' : `Against ${Math.round(suburb.yieldRate * 1000) / 10}% across ${suburb.name}.`} <a href="#report">See all {suburb.streetCount} ranked streets ↓</a></p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Segment tap + Layers 1 + 2 + profiling (client) ─────────────── */}
      <noscript><style>{'.street-segment{opacity:1;transform:none}'}</style></noscript>
      <StreetExperience snapshot={clientSnapshot} />

      <section className="suburb-footnote section-shell" id="method">
        <p>
          <b>How the Street Score works.</b> Every address on {snapshot.name} is matched (G-NAF) to its ABS 2021 mesh block and SA1 area. Each block scores 100 when owner-occupiers are above 65%, public housing is 5% or less, and both its median rent and rental yield are at or above the {suburb.name} median; 75 when one of the rent/yield tests passes; 50 when neither does; 25 when only one of the two tenure tests passes; 0 when neither does. The Street Score is the address-weighted average of its blocks — the same street test our research engine applies to every listed property. Suburb medians are as of {snapshot.asOf || 'the latest month'}; tenure is from the 2021 Census. Past performance is not a reliable indicator of future performance. Nothing on this page is personal financial advice.
        </p>
      </section>

      <Footer backHref={`/streets/${suburb.slug}`} backLabel={`Other streets in ${suburb.name} ↑`} />
    </main>
  );
}
