const Arrow = () => <span aria-hidden="true">↗</span>;

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '#contact' },
];

const principles = [
  {
    number: '01',
    title: 'Strategy before property',
    text: 'The right property is only useful when it serves a bigger plan. We start with your goals, borrowing capacity and time horizon.',
  },
  {
    number: '02',
    title: 'Research without the noise',
    text: 'Our team follows the fundamentals that matter: supply, demand, infrastructure, liveability and long-term growth drivers.',
  },
  {
    number: '03',
    title: 'Advice that stays with you',
    text: 'From your first acquisition to the next stage of your portfolio, we bring the people, perspective and accountability to keep you moving.',
  },
];

const stats = [
  ['15+', 'years of property experience'],
  ['$634M+', 'invested on behalf of clients'],
  ['1,352', 'properties acquired across Australia'],
  ['19.0%', 'median portfolio growth p.a.*'],
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
        <a className="header-cta" href="#contact">Book a call <Arrow /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Property investing, done differently</p>
          <h1>Build wealth with <i>intention.</i></h1>
          <p className="hero-lede">A clear property strategy. Independent advice. A team that stays invested in your long-term outcome.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">Start a conversation <Arrow /></a>
            <a className="text-link" href="#approach">Discover our approach <span>↓</span></a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun" />
          <div className="arch arch-back" />
          <div className="arch arch-front"><span className="arch-line line-one" /><span className="arch-line line-two" /></div>
          <div className="hero-caption"><span>01</span><span>Strategy-led property advice<br />for your next chapter.</span></div>
        </div>
      </section>

      <section className="intro section-shell" id="story">
        <div className="section-label">A different kind of advisory</div>
        <div className="intro-content">
          <h2>Real strategy.<br /><i>Real progress.</i></h2>
          <div className="intro-body"><p>Property investment is not about collecting houses. It is about creating choices for your future.</p><p>We combine rigorous research with a genuinely personal approach to help everyday Australians build sustainable, high-performing portfolios—without the noise, shortcuts or sales pitch.</p><a className="text-link dark-link" href="/about/story">Meet Ripehouse <Arrow /></a></div>
        </div>
      </section>

      <section className="numbers" id="intel">
        <div className="section-shell"><div className="numbers-heading"><p className="eyebrow light"><span /> The numbers behind the work</p><p className="numbers-note">Live, anonymised client portfolio data<br />measured across a 5-year rolling window.</p></div><div className="stats-grid">{stats.map(([value, label]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><p className="fine-print">* Figures reflect aggregate, anonymised client portfolio data. Market benchmark: combined capital-city dwelling values. Data updated periodically.</p></div>
      </section>

      <section className="approach section-shell" id="approach">
        <div className="section-label">How we work</div>
        <div className="approach-heading"><h2>A considered path<br />to <i>somewhere bigger.</i></h2><p>There is no one-size-fits-all answer. Our job is to make the complex feel clear, then help you act with confidence.</p></div>
        <div className="principles">{principles.map((item) => <article className="principle" key={item.number}><span className="principle-number">{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><a href="#contact" aria-label={`Learn more about ${item.title}`}><Arrow /></a></article>)}</div>
      </section>

      <section className="quote section-shell"><div className="quote-mark">“</div><blockquote>Ripehouse made the process feel clear, considered and completely ours. We were not just buying a property—we were building a plan.</blockquote><p>— Ripehouse client, Victoria</p></section>

      <section className="contact section-shell" id="contact"><div className="contact-panel"><p className="eyebrow light"><span /> No pressure, just a conversation</p><h2>Ready to make<br /><i>your next move?</i></h2><p>Book a free 15-minute discovery call with one of our specialists. We will listen to where you are now and talk through where you want to go.</p><a className="button button-light" href="mailto:info@ripehouseadvisory.com.au">Book your discovery call <Arrow /></a><div className="contact-details"><span>127–131 Macquarie St, Hobart TAS</span><a href="tel:+61361460121">(03) 6146 0121</a><a href="mailto:info@ripehouseadvisory.com.au">info@ripehouseadvisory.com.au</a></div></div></section>

      <footer className="site-footer"><a className="brand footer-brand" href="#top"><img className="brand-logo" src="https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png" alt="Ripehouse Advisory" /></a><p>© 2026 Ripehouse Advisory. All rights reserved.</p><div><a href="#">Privacy</a><a href="#">Terms</a><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
