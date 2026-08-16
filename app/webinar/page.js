import Link from 'next/link';
import Footer from '../components/Footer';
import WebinarRegisterForm from './WebinarRegisterForm';
import { pageMetadata } from '../../lib/seo';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = pageMetadata({
  title: 'Free Live Webinar: If I Were Buying an Investment Property in Australia Today | Ripehouse Advisory',
  description: 'Monday 17 August, 12:30pm AEST. Join Ripehouse Advisory founder Jacob Field for a 45-minute working session on how we research markets, reject unsuitable properties and decide what\u2019s actually worth buying.',
  ogTitle: 'If I Were Buying an Investment Property in Australia Today, This Is How I\u2019d Do It',
  ogDescription: 'Free live webinar with Jacob Field, Founder of Ripehouse Advisory. Monday 17 August, 12:30pm AEST \u00b7 45 minutes. The process behind the decision \u2014 market, timing, property, rejection, due diligence, portfolio fit.',
  path: '/webinar',
});

const modules = [
  { k: 'Market', copy: 'How we narrow thousands of Australian property markets down to the small group that actually deserves further investigation.' },
  { k: 'Timing', copy: 'Why the market that performed strongly yesterday isn\u2019t necessarily the market you should buy in tomorrow.' },
  { k: 'Property', copy: 'What separates an attractive house from an attractive investment \u2014 and why the two are so often confused.' },
  { k: 'Rejection', copy: 'Why one of the most important parts of our process is saying no \u2014 and what a disciplined \u201cno\u201d looks like in practice.' },
  { k: 'Due diligence', copy: 'The checks we perform before we\u2019re prepared to recommend proceeding on any property, anywhere.' },
  { k: 'Portfolio fit', copy: 'Why the \u201cbest property\u201d is meaningless if it doesn\u2019t fit the investor buying it \u2014 goals, capacity, stage and risk.' },
];

export default function WebinarPage() {
  return (
    <main className="wb-page">
      <header className="site-header book-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <span className="book-header-note">Free live webinar &middot; Monday 17 August</span>
      </header>

      {/* ── Hero: positioning + form ─────────────────────────── */}
      <section className="wb-hero section-shell" id="register">
        <div className="wb-hero-copy">
          <p className="eyebrow"><span /> Free live webinar &middot; Monday 17 August &middot; 12:30pm AEST</p>
          <h1>If I were buying an investment property in Australia <i>today,</i> this is how I&rsquo;d do it.</h1>
          <p className="wb-lede">
            Finding a property is easy. Knowing whether you should buy it is much harder.
            Join Ripehouse Advisory founder Jacob Field for a practical, 45-minute working
            session on how we research markets, filter opportunities and decide which
            investment properties are actually worth pursuing &mdash; and which to walk past.
          </p>
          <ul className="wb-meta">
            <li><b>45 minutes</b><span>Live &middot; online &middot; free</span></li>
            <li><b>Jacob Field</b><span>Founder, Ripehouse Advisory</span></li>
            <li><b>Live session</b><span>Built to attend, not replay</span></li>
          </ul>
        </div>
        <div className="wb-hero-form">
          <p className="wb-form-title">Reserve your seat</p>
          <p className="wb-form-sub">Monday 17 August &middot; 12:30pm AEST</p>
          <WebinarRegisterForm />
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
            <h2>The goal isn&rsquo;t to find more property. It&rsquo;s to confidently eliminate <i>almost all of it.</i></h2>
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
          <p className="eyebrow light"><span /> Monday 17 August &middot; 12:30pm AEST &middot; 45 minutes</p>
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
