import Link from 'next/link';
import StickyBookBar from '../discovery-call/StickyBookBar';
import Footer from '../components/Footer';
import VariantTracker from '../components/VariantTracker';
import SectionRenderer from '../components/page-sections/SectionRenderer';
import { resolveVariant } from '../../lib/pageVariants';
import { pageMetadata, SITE_URL } from '../../lib/seo';

const logoUrl = '/images/rha-logo-dark.png';
const jacobImage = `${SITE_URL}/images/story-jacob-field.webp`;

export const metadata = pageMetadata({
  title: 'Investor Decision Review | Ripehouse Advisory',
  description: 'Book a free 15-minute phone review with Ripehouse. Discuss your property investment goals, clarify your next decision and see whether our advisory service fits.',
  ogTitle: 'Investor Decision Review | Ripehouse Advisory',
  ogDescription: 'Book a free 15-minute phone review with Ripehouse. Discuss your property investment goals, clarify your next decision and see whether our advisory service fits.',
  path: '/review',
  image: { url: jacobImage, alt: 'Jacob Field, founder and CEO of Ripehouse Advisory' },
});

export default async function DiscoveryCallPage({ searchParams }) {
  const params = await searchParams;
  const { variant, preview } = await resolveVariant('discovery-call', params);
  const content = variant.content || {};

  return (
    <main className="book-page">
      <header className="site-header book-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <span className="book-header-note">{content.meta?.headerNote || 'Free 15-minute phone call | No obligation'}</span>
      </header>

      <SectionRenderer pageKey="discovery-call" sections={content.sections} />

      <Footer compact />

      <StickyBookBar />
      <VariantTracker pageKey="discovery-call" variantId={variant.id} preview={preview} />
    </main>
  );
}
