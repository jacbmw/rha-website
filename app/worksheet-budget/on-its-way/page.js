import Link from 'next/link';
import Footer from '../../components/Footer';
import CalendlyEmbed from '../../components/CalendlyEmbed';
import { pageMetadata } from '../../../lib/seo';

const logoUrl = '/images/rha-logo-dark.png';
const worksheetPdf = '/downloads/9193356246d1d29b/Ripehouse_New_Rules_Worksheet.pdf';

export const metadata = pageMetadata({
  title: 'Your Worksheet Is On Its Way | Ripehouse Advisory',
  description: 'Check your inbox — The New Rules Worksheet is on its way. While it lands, book a free 15-minute discovery call with Ripehouse Advisory.',
  path: '/worksheet-budget/on-its-way',
  robots: { index: false, follow: false },
});

export default function WorksheetOnItsWayPage() {
  return (
    <main className="ebook-thanks-page">
      <header className="site-header book-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <span className="book-header-note">Free 15-minute call · No obligation</span>
      </header>

      <section className="ebook-thanks-hero section-shell">
        <p className="eyebrow"><span /> You&apos;re all set</p>
        <h1>Your worksheet is <i>on its way.</i></h1>
        <p className="ebook-thanks-lede">Keep an eye on your inbox — it should arrive in the next few minutes. If it hasn&apos;t landed, check your spam or promotions folder.</p>
        <p className="ebook-thanks-lede">Want to start now? <a href={worksheetPdf} target="_blank" rel="noopener" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>Open the worksheet (PDF)</a>.</p>
      </section>

      <section className="ebook-thanks-next section-shell">
        <div className="ebook-thanks-grid">
          <div className="ebook-thanks-copy">
            <p className="section-label">While it lands</p>
            <h2>Want us to run the numbers <i>with you?</i></h2>
            <p>The worksheet shows you which bucket you&apos;re in, what holding really costs now, and whether a property still works. A free 15-minute discovery call puts that in the context of your position: your numbers, your structure and your timing.</p>
            <p className="book-promise">No pressure. If the right move is &ldquo;not yet&rdquo;, we&apos;ll tell you.</p>
          </div>
          <div className="book-hero-calendar">
            <CalendlyEmbed />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
