import Link from 'next/link';
import Footer from '../components/Footer';
import WebinarRegisterForm from './WebinarRegisterForm';
import { pageMetadata } from '../../lib/seo';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = pageMetadata({
  title: 'Free Live Webinar: If I Were Buying an Investment Property in Australia Today | Ripehouse Advisory',
  description: 'Tuesday 25 August, 7:00pm AEST. Join Ripehouse Advisory founder Jacob Field for a 45-minute working session on how we research markets, reject unsuitable properties and decide what\u2019s actually worth buying.',
  ogTitle: 'If I Were Buying an Investment Property in Australia Today, This Is How I\u2019d Do It',
  ogDescription: 'Free live webinar with Jacob Field, Founder of Ripehouse Advisory. Tuesday 25 August, 7:00pm AEST \u00b7 45 minutes. The process behind the decision \u2014 market, timing, property, rejection, due diligence, portfolio fit.',
  path: '/webinar',
});

const modules = [
  { k: 'Market', copy: 'Almost every market you\u2019re watching doesn\u2019t deserve your money \u2014 and we can prove it in minutes, not months.' },
  { k: 'Timing', copy: 'Yesterday\u2019s star performer is often tomorrow\u2019s regret. When does \u201cproven growth\u201d quietly become a warning sign?' },
  { k: 'Property', copy: 'An attractive house and an attractive investment are rarely the same thing. Confusing them is a six-figure mistake.' },
  { k: 'Rejection', copy: 'The most profitable word in property is \u201cno\u201d. What does a disciplined no look like when a deal is 90% right?' },
  { k: 'Due diligence', copy: 'The checks that kill a \u201cperfect\u201d property \u2014 and why most buyers never run them until it\u2019s too late.' },
  { k: 'Portfolio fit', copy: 'The best property in Australia can still be the wrong property for you. Fit beats features, every time.' },
];

const mastheads = [
  ['https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/b9dd039d-678db1738e5c93eaf9da8c8f_realestate.png', 'realestate.com.au'],
  ['https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/4b76d2b6-678db13a4efb03fe9099e686_dailymailau.png', 'Daily Mail Australia'],
  ['https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/d615a4c1-678db07954301dead6655d03_eliteagent.png', 'Elite Agent'],
  ['https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/976ed8c5-678db0a0c5f0946dd8da0897_thebordermail.png', 'The Border Mail'],
  ['https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/4da9481e-678db0dde52f8ef00f31dfdd_smartpropertyinvestment.png', 'Smart Property Investment'],
];

export default function WebinarPage() {
  return (
    <main className="wb-page">
      <header className="site-header book-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <span className="book-header-note">Free live webinar &middot; Tuesday 25 August</span>
      </header>

      {/* ── Hero: positioning + form ─────────────────────────── */}
      <section className="wb-hero section-shell" id="register">
        <div className="wb-hero-copy">
          <p className="eyebrow"><span /> Free live webinar &middot; Tuesday 25 August &middot; 7:00pm AEST</p>
          <h1>If I were buying an investment property in Australia <i>today,</i> this is how I&rsquo;d do it.</h1>
          <p className="wb-lede">
            Anyone can find a property. The harder question is what has to be true &mdash;
            about the market, the timing, the property and you &mdash; before you say yes.
            Join Ripehouse Advisory founder Jacob Field for a 45-minute working session
            on the tests a property has to pass before he&rsquo;d buy it today.
          </p>
          <p className="wb-hero-goal">
            The goal isn&rsquo;t to find more property. It&rsquo;s to confidently eliminate
            almost all of it.
          </p>
          <ul className="wb-meta">
            <li><b>45 minutes</b><span>Live &middot; online &middot; free</span></li>
            <li><b>Jacob Field</b><span>Founder, Ripehouse Advisory</span></li>
            <li><b>Live session</b><span>Built to attend, not replay</span></li>
          </ul>
        </div>
        <div className="wb-hero-form">
          <p className="wb-form-title">Reserve your seat</p>
          <p className="wb-form-sub">Tuesday 25 August &middot; 7:00pm AEST</p>
          <WebinarRegisterForm />
          <div className="wb-cred">
            <a className="wb-cred-reviews" href="https://maps.app.goo.gl/bYm2Bi8sfkcjjnCu6" target="_blank" rel="noreferrer">
              <span className="wb-cred-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <b>300+</b> five-star Google reviews
            </a>
            <div className="wb-cred-logos">
              {mastheads.map(([src, alt]) => <img key={src} src={src} alt={alt} loading="lazy" />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────────── */}
      <section className="wb-problem section-shell">
        <p className="section-label">The problem</p>
        <div className="wb-problem-grid">
          <h2>Most investors are looking for the right property in the <i>wrong way.</i></h2>
          <div>
            <p>
              They start with the property &mdash; the listing, the photos, the open home &mdash;
              and work backwards, hoping the market, the timing and the numbers happen to
              cooperate. In a market this noisy, that approach mostly produces confident
              mistakes.
            </p>
            <p>
              We work in the opposite direction. Market first. Timing second. Property
              near last. And at every stage, the discipline that matters most isn&rsquo;t
              finding reasons to buy &mdash; it&rsquo;s finding reasons to say no.
            </p>
            <p>
              This session is a walkthrough of that process, using the same thinking we
              apply for our own clients today.
            </p>
          </div>
        </div>
      </section>

      {/* ── What we'll cover (dark) ─────────────────────────── */}
      <section className="wb-modules">
        <div className="section-shell">
          <p className="eyebrow light"><span /> What we&rsquo;ll cover in 45 minutes</p>
          <h2>The process behind the <i>decision.</i></h2>
          <div className="wb-module-grid">
            {modules.map((m, i) => (
              <article key={m.k}>
                <span className="wb-module-number">0{i + 1}</span>
                <h3>{m.k}</h3>
                <p>{m.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── The funnel ──────────────────────────────────────── */}
      <section className="wb-funnel section-shell">
        <p className="section-label">The shape of the process</p>
        <div className="wb-funnel-grid">
          <div className="wb-funnel-steps">
            <div className="wb-funnel-step"><b>Thousands</b><span>of markets across Australia</span></div>
            <div className="wb-funnel-step wb-fs-2"><b>A short list</b><span>of markets worth investigating</span></div>
            <div className="wb-funnel-step wb-fs-3"><b>A handful</b><span>of properties that survive scrutiny</span></div>
            <div className="wb-funnel-step wb-fs-4"><b>One decision</b><span>you can defend on evidence</span></div>
          </div>
          <div className="wb-funnel-copy">
            <h2>A process built to <i>say no.</i></h2>
            <p>
              Every stage of our process exists to remove options &mdash; markets that don&rsquo;t
              justify attention, timing that doesn&rsquo;t justify action, properties that
              don&rsquo;t justify the risk. What remains is a decision you can actually stand
              behind.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who it's for ────────────────────────────────────── */}
      <section className="wb-fit section-shell">
        <p className="section-label">Is this for you?</p>
        <div className="wb-fit-grid">
          <div>
            <h3>This session is for you if&hellip;</h3>
            <ul>
              <li>You&rsquo;re planning to buy an investment property in the next 6&ndash;24 months</li>
              <li>You&rsquo;re researching markets and drowning in conflicting commentary</li>
              <li>You&rsquo;ve bought before and want a more repeatable process this time</li>
              <li>You&rsquo;d rather understand the reasoning than be handed a hot list</li>
            </ul>
          </div>
          <div>
            <h3>It&rsquo;s probably not for you if&hellip;</h3>
            <ul>
              <li>You&rsquo;re after a get-rich-quick angle or a &ldquo;secret suburb&rdquo;</li>
              <li>You want someone to tell you property only goes up</li>
              <li>You&rsquo;re not genuinely considering a purchase &mdash; this is a working session, not entertainment</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Host ─────────────────────────────────────────────── */}
      <section className="wb-host section-shell">
        <div className="wb-host-photo">
          <img src="/jacob-field-founder.jpg" alt="Jacob Field, founder of Ripehouse Advisory" />
        </div>
        <div className="wb-host-copy">
          <p className="section-label">Your host</p>
          <h2>Jacob <i>Field</i></h2>
          <p className="wb-host-role">Founder &mdash; Ripehouse Advisory</p>
          <p>
            Jacob exited the 9&ndash;5 through property investment at 32 and founded
            Ripehouse Advisory in 2011. With a background in software engineering, he
            built the research system the practice still runs on &mdash; evaluating
            Australian suburbs across dozens of metrics most investors never see.
          </p>
          <p>
            Rather than simply sourcing properties, the Ripehouse model combines market
            research, property analysis, valuation, due diligence and investment
            strategy under one discipline. In this session, Jacob walks through that
            thinking exactly as he&rsquo;d apply it to a purchase today.
          </p>
        </div>
      </section>

      {/* ── Final CTA (dark) ────────────────────────────────── */}
      <section className="wb-cta section-shell">
        <div>
          <p className="eyebrow light"><span /> Tuesday 25 August &middot; 7:00pm AEST &middot; 45 minutes</p>
          <h2>45 minutes that could change how you look at <i>every property after it.</i></h2>
          <p>Live and free. No recording promised &mdash; this one is built to attend.</p>
          <a className="button button-light" href="#register">Reserve my seat <span>&#8599;</span></a>
        </div>
      </section>

      <div className="section-shell">
        <p className="wb-fine-print">
          General information only &mdash; nothing in this webinar is personal financial,
          taxation or credit advice. Consider your circumstances and seek independent
          professional advice before acting.
        </p>
      </div>

      <Footer />
    </main>
  );
}
