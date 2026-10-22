import './globals.css';
import ExitIntentModal from './components/ExitIntentModal';
import SiteAnalytics from './components/SiteAnalytics';
import { pageMetadata, SITE_URL } from '../lib/seo';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/favicon.ico',
  },
  ...pageMetadata({
    title: 'Ripehouse Advisory | Data-Driven Property Investment & Buyer’s Agent Australia',
    description: 'Build a property portfolio with a clear strategy, independent buyer’s agent advice, and quantitative research across 15,000 Australian suburbs and 518,000+ streets.',
    path: '/',
  }),
};

const siteGraphJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'RealEstateAgent'],
      '@id': `${SITE_URL}/#organization`,
      name: 'Ripehouse Advisory',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/rha-logo-dark.png`,
      },
      image: `${SITE_URL}/images/rha-logo-dark.png`,
      description: 'Australian data-led property investment advisory and buyer’s agency founded in 2011. Scores 15,000+ Australian suburbs monthly across 27 indicators and 518,000+ streets at the ABS SA1 census block level.',
      foundingDate: '2011',
      telephone: '+61485050945',
      email: 'info@ripehouseadvisory.com.au',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '127–131 Macquarie St',
        addressLocality: 'Hobart',
        addressRegion: 'TAS',
        postalCode: '7000',
        addressCountry: 'AU',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Australia',
      },
      founder: [
        {
          '@type': 'Person',
          name: 'Jacob Field',
          jobTitle: 'Founder & Chief Executive Officer',
          url: `${SITE_URL}/about/story`,
        },
        {
          '@type': 'Person',
          name: 'Anna Cooper',
          jobTitle: 'Chief Operations Officer',
          url: `${SITE_URL}/about/story`,
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Ripehouse Advisory',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-AU',
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/suburbs?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraphJsonLd) }}
        />
        {children}
        <ExitIntentModal />
        <SiteAnalytics />
      </body>
    </html>
  );
}
