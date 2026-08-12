import Link from 'next/link';
import Footer from '../../components/Footer';
import CalendlyEmbed from '../../components/CalendlyEmbed';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = {
  title: 'Your Report Is On Its Way | Ripehouse Advisory',
  description: 'Check your inbox — the Five Market Environments report is on its way. While it lands, book a free 15-minute discovery call with Ripehouse Advisory.',
  robots: { index: false, follow: false },
};

export default function OnItsWayPage() {
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
        <h1>Your report is <i>on its way.</i></h1>
        <p className="ebook-thanks-lede">Keep an eye on your inbox — it should arrive in the next few minutes. If it hasn&apos;t landed, check your spam or promotions folder.</p>
      </section>

      <section className="ebook-thanks-next section-shell">
        <div className="ebook-thanks-grid">
          <div className="ebook-thanks-copy">
            <p className="section-label">While it lands</p>
            <h2>Want to know what these five markets mean <i>for you?</i></h2>
            <p>The report shows you the signals we&apos;re watching. A free 15-minute discovery call puts them in the context of your position — your equity, your goals, your timing.</p>
            <p className="book-promise">No pressure. If it&apos;s not the right step, we&apos;ll tell you.</p>
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
