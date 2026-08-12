import ReviewsCarousel from './components/ReviewsCarousel';
import NumbersSection from './components/NumbersSection';
import CaseStudyPreview from './components/CaseStudyPreview';
import Principles from './components/Principles';
import Footer from './components/Footer';

const Arrow = () => <span aria-hidden="true">↗</span>;

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Case studies', href: '/case-studies' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '#contact' },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src="https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png" alt="Ripehouse Advisory" />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
        <a className="header-cta" href="/discovery-call">Book a call <Arrow /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Property investing, done differently</p>
          <h1>Build wealth with <i>intention.</i></h1>
          <p className="hero-lede">A clear property strategy. Independent advice. A team that stays invested in your long-term outcome.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="/discovery-call">Book Discovery Call <Arrow /></a>
            <a className="text-link" href="/about/approach">Discover our approach</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun" />
          <div className="arch arch-back" />
          <div className="arch arch-front">
            <span className="door-inset" />
            <span className="door-panel door-panel-top" />
            <span className="door-panel door-panel-bottom" />
            <span className="door-handle" />
          </div>
        </div>
      </section>

      <section className="intro section-shell" id="story">
        <div className="section-label">A different kind of advisory</div>
        <div className="intro-content">
          <h2>Real strategy.<br /><i>Real progress.</i></h2>
          <div className="intro-body"><p>Property investment is not about collecting houses. It is about creating choices for your future.</p><p>We combine rigorous research with a genuinely personal approach to help everyday Australians build sustainable, high-performing portfolios—without the noise, shortcuts or sales pitch.</p><a className="text-link dark-link" href="/about/story">Meet Ripehouse <Arrow /></a></div>
        </div>
      </section>

      <NumbersSection />

      <section className="approach section-shell" id="approach">
        <div className="section-label">How we work</div>
        <div className="approach-heading"><h2>A considered path<br />to <i>somewhere bigger.</i></h2><p>There is no one-size-fits-all answer. Our job is to make the complex feel clear, then help you act with confidence.</p></div>
        <Principles />
      </section>

      <ReviewsCarousel />

      <CaseStudyPreview />

      <section className="contact section-shell" id="contact"><div className="contact-panel"><p className="eyebrow light"><span /> No pressure, just a conversation</p><h2>Ready to make<br /><i>your next move?</i></h2><p>Book a free 15-minute discovery call with one of our specialists. We will listen to where you are now and talk through where you want to go.</p><a className="button button-light" href="/discovery-call">Book your discovery call <Arrow /></a><div className="contact-details"><span>127–131 Macquarie St, Hobart TAS</span><a href="tel:+61361460121">(03) 6146 0121</a><a href="mailto:info@ripehouseadvisory.com.au">info@ripehouseadvisory.com.au</a></div></div></section>

      <Footer backHref="#top" backLabel="Back to top ↑" />
    </main>
  );
}
