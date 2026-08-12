import Link from 'next/link';
import Footer from '../components/Footer';
import VariantTracker from '../components/VariantTracker';
import SectionRenderer from '../components/page-sections/SectionRenderer';
import { resolveVariant } from '../../lib/pageVariants';
import { pageMetadata } from '../../lib/seo';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';
const coverUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/6a716917e77a27b1080ee7ac_rha-five-markets-ebook-cover.png';

export const metadata = pageMetadata({
  title: 'Free Report: The 5 Australian Markets We\u2019re Buying In For Clients in 2026 | Ripehouse Advisory',
  description: 'Get the free Ripehouse Advisory investor report — the 5 Australian markets we\u2019re buying in for clients in 2026 (and the 3 we\u2019re avoiding), the signals behind each, and how we separate real growth from headlines. Emailed instantly.',
  ogTitle: 'Free Investor Report: The 5 Australian Markets We\u2019re Buying In For Clients in 2026 (and the 3 We\u2019re Avoiding)',
  ogDescription: 'The 5 Australian markets we\u2019re buying in for clients in 2026 — and the 3 we\u2019re avoiding. The signals behind each, and the suburb-level metrics that drive our buy decisions. Emailed instantly.',
  path: '/five-markets',
  image: { url: coverUrl, alt: 'Cover of the report: The 5 Australian Markets We\u2019re Buying In For Clients in 2026' },
});

export default async function FiveMarketsPage({ searchParams }) {
  const params = await searchParams;
  const { variant, preview } = await resolveVariant('five-markets', params);
  const content = variant.content || {};

  return (
    <main className="ebook-page">
      <header className="site-header book-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <span className="book-header-note">{content.meta?.headerNote || 'Free report · Emailed instantly'}</span>
      </header>

      <SectionRenderer pageKey="five-markets" sections={content.sections} />

      <Footer />
      <VariantTracker pageKey="five-markets" variantId={variant.id} preview={preview} />
    </main>
  );
}
