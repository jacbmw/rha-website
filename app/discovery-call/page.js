import Link from 'next/link';
import StickyBookBar from './StickyBookBar';
import Footer from '../components/Footer';
import VariantTracker from '../components/VariantTracker';
import SectionRenderer from '../components/page-sections/SectionRenderer';
import { resolveVariant } from '../../lib/pageVariants';
import { pageMetadata } from '../../lib/seo';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';
const jacobImage = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/92b44b8f-67907563bbfb3b1b418dc748_ripehouse-advisory-story-jacob-field.webp';

export const metadata = pageMetadata({
  title: 'Book a Discovery Call | Ripehouse Advisory',
  description: 'Book a free 15-minute Property Investment Discovery Call with Ripehouse Advisory. Get clarity on your position, your questions answered, and an honest view on whether structured advisory is right for you.',
  ogTitle: 'Book a Free Discovery Call | Ripehouse Advisory',
  ogDescription: 'Fifteen minutes to review your position, answer your questions and decide whether structured advisory makes sense for you. No pressure — if it\u2019s not the right step, we\u2019ll tell you.',
  path: '/discovery-call',
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
        <span className="book-header-note">{content.meta?.headerNote || 'Free 15-minute call · No obligation'}</span>
      </header>

      <SectionRenderer pageKey="discovery-call" sections={content.sections} />

      <Footer />

      <StickyBookBar />
      <VariantTracker pageKey="discovery-call" variantId={variant.id} preview={preview} />
    </main>
  );
}
