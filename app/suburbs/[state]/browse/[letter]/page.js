import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../../components/Footer';
import MobileNav from '../../../../components/MobileNav';
import { listSuburbSlugs } from '../../../../../lib/suburbs';
import { pageMetadata } from '../../../../../lib/seo';

// Per-letter suburb listing — keeps each crawlable index page small.
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

const STATE_NAMES = {
  qld: 'Queensland', nsw: 'New South Wales', vic: 'Victoria', sa: 'South Australia',
  wa: 'Western Australia', tas: 'Tasmania', nt: 'Northern Territory', act: 'Australian Capital Territory',
};

export async function generateMetadata({ params }) {
  const { state, letter } = await params;
  const name = STATE_NAMES[String(state).toLowerCase()];
  const upper = String(letter).toUpperCase().slice(0, 1);
  if (!name || !/[A-Z]/.test(upper)) return { title: 'Suburbs | Ripehouse Advisory', robots: { index: false } };
  return pageMetadata({
    title: `${name} Suburbs Starting With ${upper} — R-Scores | Ripehouse Advisory`,
    description: `${name} suburbs beginning with ${upper}, each scored monthly across 27 property market indicators.`,
    path: `/suburbs/${String(state).toLowerCase()}/browse/${upper.toLowerCase()}`,
  });
}

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export default async function StateLetterPage({ params }) {
  const { state, letter } = await params;
  const code = String(state).toLowerCase();
  const stateName = STATE_NAMES[code];
  const lower = String(letter).toLowerCase().slice(0, 1);
  if (!stateName || !/[a-z]/.test(lower)) notFound();

  const all = await listSuburbSlugs().catch(() => []);
  const suburbs = all
    .filter((entry) => entry.state === code && entry.slug.startsWith(lower))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  if (!suburbs.length) notFound();

  return (
    <main className="suburb-index-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href={`/suburbs/${code}`}>All {stateName} letters</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-index-hero section-shell">
        <p className="eyebrow"><span /> Your suburb, scored</p>
        <h1>{stateName} suburbs — <i>{lower.toUpperCase()}.</i></h1>
        <p className="suburb-meta">{suburbs.length.toLocaleString('en-AU')} suburbs. Each scored monthly across 27 indicators.</p>
      </section>

      <section className="suburb-index-list section-shell">
        <ul className="suburb-plain-list">
          {suburbs.map((entry) => (
            <li key={entry.slug}><Link href={`/suburbs/${code}/${entry.slug}`}>{entry.slug.replace(/-/g, ' ').replace(/\b[a-z]/g, (c) => c.toUpperCase())}</Link></li>
          ))}
        </ul>
      </section>

      <Footer backHref={`/suburbs/${code}`} backLabel={`All ${stateName} suburbs ↑`} />
    </main>
  );
}
