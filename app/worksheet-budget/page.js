import Link from 'next/link';
import Footer from '../components/Footer';
import WorksheetLeadForm from './WorksheetLeadForm';
import { pageMetadata, SITE_URL } from '../../lib/seo';

const logoUrl = '/images/rha-logo-dark.png';
const coverPath = '/images/worksheet-budget-cover.png';

export const metadata = pageMetadata({
  title: 'Free Worksheet: Negative Gearing After the 2026 Budget | Ripehouse Advisory',
  description: 'The New Rules Worksheet: work out which bucket your property falls into, what it really costs to hold after tax under the old and new rules, and whether it still works as an asset. Free 4-page PDF, emailed instantly.',
  ogTitle: 'Free Worksheet: Negative Gearing After the 2026 Budget (Investor Edition)',
  ogDescription: 'Which bucket is your property in? What does it really cost to hold now? Does it still work? A free 4-page worksheet from Ripehouse Advisory. Emailed instantly.',
  path: '/worksheet-budget',
  image: { url: `${SITE_URL}${coverPath}`, alt: 'Cover of The New Rules Worksheet: negative gearing after the 2026 Budget' },
});

const bullets = [
  'Which bucket each property you own or are considering falls into: grandfathered, new build, or established and bought after budget night',
  'What it really costs you to hold, after tax, under the old rules and the new ones, with a worked example beside your own numbers',
  'Whether it still works as an asset, with five “does it still work?” tests to run before you buy anything',
];

const pages = [
  { number: 'Page 2', title: 'Step 1 · Which bucket?', text: 'A grandfathering checklist, one per property: ownership and contract dates, what does and doesn’t count as a new build, and the question to take to your tax agent if you’re unsure.' },
  { number: 'Page 3', title: 'Step 2 · The real holding cost', text: 'Annual, after-tax holding cost under the old rules and the new ones. Fill in the yellow column with your numbers, then check whether you can comfortably carry the weekly cost with a 1% rate buffer.' },
  { number: 'Page 4', title: 'Step 3 · Does it still work?', text: 'Five tests now the tax break no longer covers a weak purchase: asset not tax break, the street not the suburb, yield vs holding cost, who buys it from you, and sequence. Plus: who should wait.' },
];

const faqs = [
  { question: 'Is this tax advice?', answer: 'No. The worksheet is general information only. It doesn’t take into account your objectives, financial situation or needs. Ripehouse Advisory is a buyers advisory and doesn’t provide tax advice, so confirm your position with a registered tax agent before acting.' },
  { question: 'Are these changes final?', answer: 'They are measures announced in the 2026–27 Federal Budget and may change as legislation is finalised. The worksheet sets out the rules as announced. Changes to capital gains tax were also announced and aren’t modelled in it.' },
  { question: 'What do I need to fill it in?', answer: 'Your property’s purchase or contract date, rent, loan amount and interest rate, holding costs, an estimate of depreciation, and your marginal tax rate. It takes about 15 minutes.' },
  { question: 'Are the worked-example numbers a forecast?', answer: 'No. The worked example uses assumed, illustrative figures (one owner earning $250,000, an $800,000 property, an 80% loan at an assumed 6.8% interest-only). Your figures will differ, so use your own in the yellow column.' },
];

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function WorksheetBudgetPage() {
  return (
    <main className="ebook-page">
      <header className="site-header book-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <span className="book-header-note">Free worksheet · Emailed instantly</span>
      </header>

      <section className="ebook-hero section-shell" id="worksheet">
        <div className="ebook-hero-panel">
          <div className="ebook-hero-copy">
            <p className="eyebrow gold"><span /> Free worksheet · Investor edition</p>
            <h1>Negative gearing after the 2026 Budget. <i>Does your property still work?</i></h1>
            <p className="ebook-lede">The tax rule Australia&apos;s property market was built on has changed. The New Rules Worksheet helps you work out three things in about 15 minutes:</p>
            <ul className="ebook-bullets">
              {bullets.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
            </ul>
            <p className="ebook-trust-line">The economy decides the average. The street decides your result.</p>
          </div>
          <div className="ebook-hero-card">
            <img className="ebook-cover" src={coverPath} alt="Cover of The New Rules Worksheet: negative gearing after the 2026 Budget" />
            <h2>Get the free worksheet</h2>
            <p className="ebook-card-sub">4-page PDF. Tell us where to send it.</p>
            <WorksheetLeadForm />
          </div>
        </div>
      </section>

      <section className="ebook-inside section-shell">
        <p className="section-label">What&apos;s inside · Page 1 sets out what changed (the three buckets, as announced), then three steps</p>
        <div className="book-steps">
          {pages.map((step) => (
            <article className="book-step" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="book-faq section-shell">
        <p className="section-label">Before you download</p>
        <div className="book-faq-grid">
          <h2>Common <i>questions</i></h2>
          <div className="book-faq-list">
            {faqs.map((item) => (
              <details className="book-faq-item" key={item.question}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ebook-final section-shell">
        <div className="contact-panel">
          <p className="eyebrow light"><span /> When the tax tailwind goes</p>
          <h2>Selection is the <i>whole game.</i></h2>
          <p>Run your numbers before you buy, not after. The worksheet is free and lands in your inbox straight away.</p>
          <a className="button button-light" href="#worksheet">Get the Worksheet <Arrow /></a>
        </div>
      </section>

      <section className="section-shell">
        <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6, maxWidth: 760, margin: '0 0 60px' }}>General information only, not personal financial, tax, credit or legal advice. The negative gearing and capital gains tax changes described are measures announced in the 2026–27 Federal Budget and may change before or after legislation. Speak with a registered tax agent, licensed financial adviser and credit provider before acting.</p>
      </section>

      <Footer />
    </main>
  );
}
