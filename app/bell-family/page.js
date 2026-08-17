import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import { pageMetadata } from '../../lib/seo';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';
const coverImage = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/92b44b8f-67907563bbfb3b1b418dc748_ripehouse-advisory-story-jacob-field.webp';

export const metadata = pageMetadata({
  title: 'How the Bell Family Found Freedom With Ripehouse | Ripehouse Advisory',
  description: 'Meet Jack & Amy Bell — a young Aussie family travelling Australia, funded by a long-term property strategy built with Ripehouse Advisory.',
  path: '/bell-family',
  image: { url: coverImage, alt: 'Jack and Amy Bell travelling Australia with their family' },
});

const navLinks = [
  { label: 'Our story', href: '/about/story' },
  { label: 'Our approach', href: '/about/approach' },
  { label: 'Market intel', href: '/resources/blog' },
  { label: 'Contact', href: '/#contact' },
];

const values = [
  { title: 'We bring clarity to complexity', copy: 'Ripehouse breaks down the property investment journey into clear, manageable steps. You will always know what is happening, why, and what comes next.' },
  { title: 'Evidence, not guesswork', copy: 'Our recommendations are powered by proprietary research and real-world experience. We analyse thousands of suburbs every week, combining data with expert human review.' },
  { title: 'Your interests, protected', copy: 'We build risk management into every stage. From finance to acquisition to portfolio management, we help you avoid common pitfalls and stress-test your plan.' },
  { title: 'Support beyond settlement', copy: 'Our relationship does not end when you buy. We offer ongoing portfolio reviews, honest advice, and a commitment to your long-term success.' },
];

const reviews = [
  { body: 'Would highly recommend!! Very experienced, professional, responsive and great to deal with. A big thank-you once again to Julian and the Ripehouse team for assisting with our purchase.', author: 'Ashgan Atefi' },
  { body: 'Great service! It did not take long before Travis found us the property we wanted!', author: 'Thomas Majorel' },
  { body: 'From the get go they are head and shoulders above the other company and much more cost effective. Travis guided us every step of the way and his attention to detail was second to none. We feel we could not have secured the right property without him.', author: 'Stephen Pope' },
];

export default function BellFamilyPage() {
  return (
    <main className="bell-family-page">
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

      <section className="bell-hero section-shell">
        <div className="bell-hero-copy">
          <p className="eyebrow"><span /> Client story</p>
          <h1>How the Bell family found <i>freedom</i> with Ripehouse.</h1>
          <p className="bell-lede">
            Meet Jack & Amy Bell. A young Aussie couple travelling the country with their three kids, funded by a smart, long-term property strategy built with Ripehouse.
          </p>
          <p className="bell-intro">
            They are not financial experts. They are not trust-fund kids. They are everyday Australians who wanted more from life, and took the first step. Now, their investments work in the background while they explore Australia full-time.
          </p>
          <div className="bell-hero-actions">
            <Link className="button button-primary" href="/discovery-call">Book My Free Discovery Call</Link>
          </div>
        </div>
        <div className="bell-hero-media" aria-hidden="true">
          <img src={coverImage} alt="" />
        </div>
      </section>

      <section className="bell-story section-shell">
        <div className="section-label">The journey</div>
        <div className="bell-story-grid">
          <h2>Five years ago, the Bells made a decision most families only dream about.</h2>
          <div className="bell-story-body">
            <p>
              They packed their life into a caravan and hit the road to explore Australia — coastlines, fishing spots, remote camps, and everything in between.
            </p>
            <p>
              But behind their freedom is something most people do not see: a smart, strategic property plan built with Ripehouse.
            </p>
            <p>Here is what they did differently:</p>
            <ul>
              <li>They did not try to “time the market.”</li>
              <li>They did not chase hype or risky investments.</li>
              <li>They followed a proven method that identifies high-performance Australian suburbs.</li>
              <li>They built a portfolio step-by-step, with guidance from Ripehouse experts.</li>
            </ul>
            <p>
              The result? Their properties grow in value while they travel, giving them stability, long-term security, and future freedom for their kids.
            </p>
          </div>
        </div>
      </section>

      <section className="bell-values section-shell">
        <div className="section-label">Why Ripehouse</div>
        <div className="bell-values-grid">
          {values.map((value) => (
            <div className="bell-value-card" key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bell-reviews section-shell">
        <div className="section-label">What our clients say</div>
        <div className="bell-reviews-grid">
          {reviews.map((review) => (
            <blockquote className="bell-review-card" key={review.author}>
              <p>“{review.body}”</p>
              <footer><strong>{review.author}</strong></footer>
            </blockquote>
          ))}
        </div>
        <p className="bell-reviews-note">With over 300 glowing 5-star reviews on Google, our clients’ feedback speaks for itself.</p>
      </section>

      <section className="bell-cta section-shell">
        <h2>Ready to start your own <i>freedom journey?</i></h2>
        <p>
          Whether you want to travel, spend more time with family, or simply have more choices, Ripehouse can help you build a property strategy that supports your goals, just like the Bell family.
        </p>
        <Link className="button button-primary" href="/discovery-call">Book Your Free Discovery Call</Link>
      </section>

      <Footer backHref="/" backLabel="Back home ↑" />
    </main>
  );
}
