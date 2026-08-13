import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import { pageMetadata } from '../../lib/seo';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';
const groupUrl = 'https://www.facebook.com/groups/highperformancepropertyinvestment';

export const metadata = pageMetadata({
  title: 'Join Our Property Investor Community | Ripehouse Advisory',
  description: 'Join Australia’s most active community of high-performance property investors. Genuine discussions, market insights, suburb breakdowns and direct advice — no hype, no spam.',
  path: '/facebook-group',
});

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

const audience = [
  'Investors building or actively scaling a property portfolio',
  'People who want to make smarter, research-backed decisions',
  'Australians serious about wealth, economics and investing',
  'People learning from others who are actually doing the work',
  'Those who want genuine discussions — not hype, not sales pitches',
];

const features = [
  { title: 'High-performance strategies', copy: 'Conversations about what actually moves the needle in a portfolio — not trending tips.' },
  { title: 'Real-time market insights', copy: 'Money, policy and property-market context from people reading the same data we do.' },
  { title: 'Suburb breakdowns', copy: 'Deal discussions and suburb-level analysis from experienced investors around the country.' },
  { title: 'Direct advice', copy: 'A place to ask questions and get honest, experience-backed answers.' },
  { title: 'No promo, no spam', copy: 'Real talk only. No course pitches, no agent spruiking, no noise.' },
  { title: 'Weekly value posts', copy: 'Curated insights and questions from the Ripehouse research team every week.' },
];

export default function FacebookGroupPage() {
  return (
    <main className="facebook-group-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/discovery-call">Book a call</Link>
        <MobileNav links={navLinks} />
      </header>

      <section className="facebook-hero section-shell">
        <p className="eyebrow"><span /> Community</p>
        <h1>Join Australia’s most active community of high-performance property investors.</h1>
        <p className="facebook-lede">
          If you are serious about building wealth through research-backed property investing — and you want to be around people actually doing the work — this group is for you.
        </p>
        <a className="button button-primary" href={groupUrl} target="_blank" rel="noopener noreferrer">
          Join the Facebook Group <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="facebook-audience section-shell">
        <div className="section-label">Who this is for</div>
        <div className="facebook-content">
          <h2>People actually building <i>real wealth.</i></h2>
          <p className="facebook-intro">
            Most online property conversations are full of hype, misinformation or people nowhere near ready to invest. This group is for Australians serious about using property as a long-term wealth-building vehicle.
          </p>
          <ul className="facebook-list">
            {audience.map((item) => (
              <li key={item}>
                <span className="facebook-tick" aria-hidden="true">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="facebook-disclaimer">If that is not you, that is completely OK — this group probably is not the right fit.</p>
        </div>
      </section>

      <section className="facebook-features section-shell">
        <div className="section-label">What is inside</div>
        <div className="facebook-features-grid">
          {features.map((feature) => (
            <div className="facebook-feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="facebook-cta section-shell">
        <h2>Join the community that actually <i>moves the needle.</i></h2>
        <p>
          Get direct access to experienced investors, weekly research-driven posts and a community focused on real outcomes — not noise.
        </p>
        <a className="button button-primary" href={groupUrl} target="_blank" rel="noopener noreferrer">
          Join the Facebook Group Now <span aria-hidden="true">↗</span>
        </a>
      </section>

      <Footer backHref="/" backLabel="Back home ↑" />
    </main>
  );
}
