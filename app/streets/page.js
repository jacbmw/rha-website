import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import StreetSearch from '../components/StreetSearch';
import { pageMetadata } from '../../lib/seo';

export const revalidate = 86400;

const logoUrl = '/images/rha-logo-dark.png';

export const metadata = pageMetadata({
  title: 'Street Score — How Does Your Street Compare to Its Suburb? | Ripehouse Advisory',
  description: 'Type a street and see its Street Score and how it compares with the rest of its suburb — free, no sign-up to see the score. Every Australian street, scored.',
  path: '/streets',
});

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export default function StreetsIndexPage() {
  return (
    <main className="suburb-index-page street-index-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/suburbs">Check a suburb</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-index-hero section-shell">
        <p className="eyebrow"><span /> Street Score</p>
        <h1>Your street, <i>versus its suburb.</i></h1>
        <p className="suburb-meta">Suburb averages hide a lot. Two streets a block apart can trade like different suburbs. Check a street you know — the score is free, and we publish exactly how it&apos;s calculated.</p>
        <StreetSearch />
      </section>

      <Footer backHref="/suburbs" backLabel="Check a suburb instead ↑" />
    </main>
  );
}
