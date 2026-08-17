import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import SuburbExperience from './SuburbExperience';
import { findSuburbBySlug, getSuburbSnapshot } from '../../../../lib/suburbs';
import { pageMetadata, SITE_URL } from '../../../../lib/seo';

// One template, ~15,000 pages. ISR with 24h revalidate — the underlying data
// updates monthly. Pages render on-demand and are cached, so no build blowout.
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return []; // all pages on-demand
}

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

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
  const title = `${snapshot.name} ${snapshot.state} Property Market Data & R-Score | Ripehouse Advisory`;
  const description = snapshot.score !== null
    ? `${snapshot.name} ${snapshot.state} scores ${snapshot.score}/100 on the Ripehouse R-Score this month — median price ${fmtMoney(snapshot.stats.medianPrice)}, vacancy ${snapshot.stats.vacancy ?? '—'}%. See the full data.`
    : `Current market data for ${snapshot.name} ${snapshot.state} from the Ripehouse research engine — 15,000 suburbs scored across 27 indicators, updated monthly.`;
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
  const { snapshot } = data;
  const { stats } = snapshot;

  return (
    <main className="suburb-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/suburbs">Check another suburb</Link>
        <MobileNav links={navLinks} />
      </header>

      {/* ── Layer 0 — free snapshot ─────────────────────────────────────── */}
      <section className="suburb-hero section-shell">
        <p className="eyebrow"><span /> Your suburb, scored · Data as of {snapshot.asOf}</p>
        <h1>{snapshot.name}, <i>{snapshot.state}</i></h1>
        <p className="suburb-meta">
          {snapshot.postcodes.length ? `Postcode ${snapshot.postcodes.join(', ')}` : ''}
          {snapshot.lga ? ` · ${snapshot.lga} council area` : ''}
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
      </section>

      {/* ── Layers 1 + 2 (client) ───────────────────────────────────────── */}
      <SuburbExperience snapshot={snapshot} />

      <section className="suburb-footnote section-shell">
        <p>
          R-Score and all figures are drawn from Ripehouse&apos;s research engine — 15,000 suburbs measured across 27 indicators, refreshed monthly (data as of {snapshot.asOf}). Scores describe past and current measured market conditions only. Past performance is not a reliable indicator of future performance. Nothing on this page is personal financial advice.
        </p>
      </section>

      <Footer backHref="/suburbs" backLabel="Check another suburb ↑" />
    </main>
  );
}
