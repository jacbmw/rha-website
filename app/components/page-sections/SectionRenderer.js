// Section registry + renderer for the DB-served A/B conversion pages.
// A variant's content is `{ meta, sections: [{ type, props }] }`. Every
// section type maps to a fixed component here, so a variant (including an
// LLM-generated one) can reorder/add/remove sections and rewrite copy, but
// the scripts, forms, Calendly embed and conversion wiring are always the
// same audited code. Unknown section types are skipped silently.

import CalendlyEmbed from '../CalendlyEmbed';
import ReviewsCarousel from '../ReviewsCarousel';
import CaseStudyPreview from '../CaseStudyPreview';
import EbookLeadForm from '../../five-markets/EbookLeadForm';
import { rich } from './rich';

const jacobImage = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67907563bbfb3b1b418dc748_ripehouse-advisory-story-jacob-field.webp';
const ebookCoverUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/6a716917e77a27b1080ee7ac_rha-five-markets-ebook-cover.png';

const featuredLogos = [
  ['https://cdn.prod.website-files.com/6785caaabc0f3871a91c9df0/678db1738e5c93eaf9da8c8f_realestate.png', 'realestate.com.au'],
  ['https://cdn.prod.website-files.com/6785caaabc0f3871a91c9df0/678db13a4efb03fe9099e686_dailymailau.png', 'Daily Mail Australia'],
  ['https://cdn.prod.website-files.com/6785caaabc0f3871a91c9df0/678db07954301dead6655d03_eliteagent.png', 'Elite Agent'],
  ['https://cdn.prod.website-files.com/6785caaabc0f3871a91c9df0/678db0a0c5f0946dd8da0897_thebordermail.png', 'The Border Mail'],
  ['https://cdn.prod.website-files.com/6785caaabc0f3871a91c9df0/678db0dde52f8ef00f31dfdd_smartpropertyinvestment.png', 'Smart Property Investment'],
];

const Arrow = () => <span aria-hidden="true">↗</span>;

function BookHero({ eyebrow, headline, lede, promise, trustChips = [] }) {
  return (
    <section className="book-hero section-shell">
      <div className="book-hero-copy">
        <p className="eyebrow"><span /> {eyebrow}</p>
        <h1>{rich(headline)}</h1>
        <p className="book-lede">{lede}</p>
        {promise && <p className="book-promise">{promise}</p>}
        {trustChips.length > 0 && (
          <ul className="book-trust-chips">
            {trustChips.map((chip) => <li key={chip.label}><strong>{chip.value}</strong><span>{chip.label}</span></li>)}
          </ul>
        )}
      </div>
      <div className="book-hero-calendar">
        <CalendlyEmbed />
      </div>
    </section>
  );
}

function EbookHero({ eyebrow, headline, lede, bullets = [], trustLine, cardHeading, cardSub }) {
  return (
    <section className="ebook-hero section-shell" id="report">
      <div className="ebook-hero-panel">
        <div className="ebook-hero-copy">
          <p className="eyebrow gold"><span /> {eyebrow}</p>
          <h1>{rich(headline)}</h1>
          <p className="ebook-lede">{lede}</p>
          {bullets.length > 0 && (
            <ul className="ebook-bullets">
              {bullets.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
            </ul>
          )}
          {trustLine && <p className="ebook-trust-line"><span className="ebook-stars" aria-hidden="true">★★★★★</span> {trustLine}</p>}
        </div>
        <div className="ebook-hero-card">
          <img className="ebook-cover" src={ebookCoverUrl} alt="Cover of the report: The 5 Australian Markets We&rsquo;re Buying In For Clients in 2026" />
          <h2>{cardHeading}</h2>
          <p className="ebook-card-sub">{cardSub}</p>
          <EbookLeadForm />
        </div>
      </div>
    </section>
  );
}

function Steps({ pageKey, label, steps = [] }) {
  const sectionClass = pageKey === 'five-markets' ? 'ebook-inside section-shell' : 'book-how section-shell';
  return (
    <section className={sectionClass}>
      <p className="section-label">{label}</p>
      <div className="book-steps">
        {steps.map((step) => (
          <article className="book-step" key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SuitedGrid({ eyebrow, heading, items = [] }) {
  return (
    <section className="book-suited">
      <div className="section-shell">
        <p className="eyebrow light"><span /> {eyebrow}</p>
        <h2>{rich(heading)}</h2>
        <div className="book-suited-grid">
          {items.map((item) => (
            <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedLogos({ label }) {
  return (
    <section className="book-featured section-shell">
      <p className="section-label">{label}</p>
      <div className="book-featured-logos">
        {featuredLogos.map(([src, alt]) => <img key={src} src={src} alt={alt} loading="lazy" />)}
      </div>
    </section>
  );
}

function Founder({ eyebrow, heading, role, paragraphs = [], image, imageAlt }) {
  return (
    <section className="book-founder">
      <div className="section-shell book-founder-grid">
        <div className="book-founder-photo">
          <img src={image || jacobImage} alt={imageAlt || 'Jacob Field, founder and CEO of Ripehouse Advisory'} loading="lazy" />
        </div>
        <div className="book-founder-copy">
          <p className="eyebrow light"><span /> {eyebrow}</p>
          <h2>{rich(heading)}</h2>
          <p className="book-founder-role">{role}</p>
          {paragraphs.map((text) => <p key={text.slice(0, 40)}>{text}</p>)}
        </div>
      </div>
    </section>
  );
}

function Faq({ label, heading, items = [] }) {
  return (
    <section className="book-faq section-shell">
      <p className="section-label">{label}</p>
      <div className="book-faq-grid">
        <h2>{rich(heading)}</h2>
        <div className="book-faq-list">
          {items.map((item) => (
            <details className="book-faq-item" key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodStats({ eyebrow, heading, stats = [], finePrint }) {
  return (
    <section className="ebook-method">
      <div className="section-shell">
        <p className="eyebrow light"><span /> {eyebrow}</p>
        <h2>{rich(heading)}</h2>
        <div className="ebook-method-stats">
          {stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        </div>
        {finePrint && <p className="fine-print">{finePrint}</p>}
      </div>
    </section>
  );
}

function FinalCta({ pageKey, eyebrow, heading, text, buttonLabel, buttonHref }) {
  const sectionClass = pageKey === 'five-markets' ? 'ebook-final section-shell' : 'book-final section-shell';
  const defaultHref = pageKey === 'five-markets' ? '#report' : '#book';
  const href = typeof buttonHref === 'string' && buttonHref.startsWith('#') ? buttonHref : defaultHref;
  return (
    <section className={sectionClass}>
      <div className="contact-panel">
        <p className="eyebrow light"><span /> {eyebrow}</p>
        <h2>{rich(heading)}</h2>
        <p>{text}</p>
        <a className="button button-light" href={href}>{buttonLabel} <Arrow /></a>
      </div>
    </section>
  );
}

const REGISTRY = {
  bookHero: BookHero,
  ebookHero: EbookHero,
  steps: Steps,
  suitedGrid: SuitedGrid,
  featuredLogos: FeaturedLogos,
  reviews: ReviewsCarousel,
  caseStudy: CaseStudyPreview,
  founder: Founder,
  faq: Faq,
  methodStats: MethodStats,
  finalCta: FinalCta,
};

export default function SectionRenderer({ pageKey, sections = [] }) {
  return sections.map((section, index) => {
    const Component = REGISTRY[section?.type];
    if (!Component) return null;
    return <Component key={`${section.type}-${index}`} pageKey={pageKey} {...(section.props || {})} />;
  });
}
