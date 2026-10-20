import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '../../../components/Footer';
import MobileNav from '../../../components/MobileNav';
import StreetSearch from '../../../components/StreetSearch';
import SuburbStreetsUnlock from './SuburbStreetsUnlock';
import { findSuburbBySlug } from '../../../../lib/suburbs';
import { getSuburbStreets } from '../../../../lib/streets';
import { pageMetadata } from '../../../../lib/seo';

// Every street in one suburb (names only — scores live on each street page so
// the free score is per-street and the comparison lists stay in the report).
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
  const { suburb } = page.data;
  return pageMetadata({
    title: `Every Street in ${suburb.name} ${suburb.state}, Scored | Ripehouse Advisory`,
    description: `${suburb.streetCount} streets in ${suburb.name} ${suburb.state}, each with its own Street Score and how it compares with the suburb. Free to check.`,
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
  const anchorStreet = streets.find((s) => s.score !== null && s.confidence !== 'low') || streets[0] || null;

  return (
    <main className="suburb-index-page street-index-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/streets">Check another suburb</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-index-hero section-shell">
        <p className="eyebrow"><span /> Street Score · {suburb.name} {suburb.state}</p>
        <h1>Every street in {suburb.name}, <i>scored.</i></h1>
        <p className="suburb-meta">
          {suburb.streetCount} streets · {suburb.addresses.toLocaleString('en-AU')} addresses
          {suburb.average !== null ? ` · ${suburb.name} street average ${suburb.average}/100` : ''}
          {' · '}<Link href={`/suburbs/${suburbPath}`}>See the suburb score</Link>
        </p>
        <StreetSearch suburb={{ id: entry.id, name: entry.name, state: entry.state, slug: suburbPath }} />
      </section>

      {suburb.scoredStreets >= 3 && anchorStreet && (
        <SuburbStreetsUnlock suburb={suburb} suburbPath={suburbPath} anchorKey={anchorStreet.key} />
      )}

      <section className="suburb-index-list section-shell">
        <div className="section-label">All streets</div>
        <ul className="suburb-plain-list">
          {streets.map((street) => (
            <li key={street.slug}><Link href={`/streets/${suburbPath}/${street.slug}`} prefetch={false}>{street.name}</Link></li>
          ))}
        </ul>
      </section>

      <Footer backHref={`/suburbs/${suburbPath}`} backLabel={`Back to ${suburb.name} ↑`} />
    </main>
  );
}
