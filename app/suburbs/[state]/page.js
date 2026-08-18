import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import { listSuburbSlugs } from '../../../lib/suburbs';
import { pageMetadata } from '../../../lib/seo';

// Per-state suburb index — the crawlable / no-JS path into the 15k pages.
export const revalidate = 86400;

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

const STATE_NAMES = {
  qld: 'Queensland', nsw: 'New South Wales', vic: 'Victoria', sa: 'South Australia',
  wa: 'Western Australia', tas: 'Tasmania', nt: 'Northern Territory', act: 'Australian Capital Territory',
};

export function generateStaticParams() {
  return Object.keys(STATE_NAMES).map((state) => ({ state }));
}

export async function generateMetadata({ params }) {
  const { state } = await params;
  const name = STATE_NAMES[String(state).toLowerCase()];
  if (!name) return { title: 'Suburbs | Ripehouse Advisory', robots: { index: false } };
  return pageMetadata({
    title: `${name} Suburbs — Property Market Data & R-Scores | Ripehouse Advisory`,
    description: `Every ${name} suburb scored across 27 property market indicators, updated monthly. Pick a suburb to see its R-Score, prices, rents and vacancy.`,
    path: `/suburbs/${String(state).toLowerCase()}`,
  });
}

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export default async function StateSuburbsPage({ params }) {
  const { state } = await params;
  const code = String(state).toLowerCase();
  const stateName = STATE_NAMES[code];
  if (!stateName) notFound();

  const all = await listSuburbSlugs().catch(() => []);
  const suburbs = all
    .filter((entry) => entry.state === code)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  if (!suburbs.length) notFound();

  const groups = new Map();
  for (const suburb of suburbs) {
    const letter = suburb.slug[0].toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(suburb);
  }

  return (
    <main className="suburb-index-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/suburbs">All states</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-index-hero section-shell">
        <p className="eyebrow"><span /> Your suburb, scored</p>
        <h1>{stateName} <i>suburbs.</i></h1>
        <p className="suburb-meta">{suburbs.length.toLocaleString('en-AU')} suburbs scored monthly across 27 indicators. Pick yours.</p>
      </section>

      {/* Letter pages keep each HTML payload small — the full state list in
          one page blew past the 100KB budget. */}
      <section className="suburb-index-list section-shell">
        <div className="section-label">Browse by first letter</div>
        <ul className="suburb-letter-nav">
          {[...groups.entries()].map(([letter, entries]) => (
            <li key={letter}><Link href={`/suburbs/${code}/browse/${letter.toLowerCase()}`}>{letter} <span>({entries.length})</span></Link></li>
          ))}
        </ul>
      </section>

      <Footer backHref="/suburbs" backLabel="All states ↑" />
    </main>
  );
}
