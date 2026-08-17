import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import SuburbScoreWidget from '../components/SuburbScoreWidget';
import { resolvePanel } from '../../lib/panelVariants';
import { pageMetadata } from '../../lib/seo';

export const revalidate = 86400;

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = pageMetadata({
  title: 'Your Suburb, Scored — Australian Suburb Property Data | Ripehouse Advisory',
  description: 'Search any Australian suburb and see how it scores on the Ripehouse research engine — 15,000 suburbs measured across 27 indicators, updated monthly.',
  path: '/suburbs',
});

const STATES = [
  { code: 'qld', name: 'Queensland' },
  { code: 'nsw', name: 'New South Wales' },
  { code: 'vic', name: 'Victoria' },
  { code: 'sa', name: 'South Australia' },
  { code: 'wa', name: 'Western Australia' },
  { code: 'tas', name: 'Tasmania' },
  { code: 'nt', name: 'Northern Territory' },
  { code: 'act', name: 'Australian Capital Territory' },
];

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

export default async function SuburbsIndexPage() {
  const suburbPanel = await resolvePanel('panel-suburb-score');

  return (
    <main className="suburb-index-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <Link className="header-cta" href="/discovery-call">Book a call</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="suburb-index-hero section-shell">
        <p className="eyebrow"><span /> Your suburb, scored</p>
        <h1>Every suburb in Australia, <i>measured.</i></h1>
        <p className="suburb-meta">15,000 suburbs scored across 27 indicators — the same engine behind $2B+ of client purchases. Updated monthly. Free to check.</p>
        <SuburbScoreWidget variant={suburbPanel} placement="index" />
      </section>

      <section className="suburb-index-states section-shell">
        <div className="section-label">Browse by state</div>
        <ul className="suburb-state-list">
          {STATES.map((state) => (
            <li key={state.code}><Link href={`/suburbs/${state.code}`}>{state.name} <span>→</span></Link></li>
          ))}
        </ul>
      </section>

      <Footer backHref="/" backLabel="Back home ↑" />
    </main>
  );
}
