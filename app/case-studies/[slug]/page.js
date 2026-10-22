import Link from 'next/link';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import { notFound } from 'next/navigation';
import CaseStudyVisuals from '../CaseStudyVisuals';
import CaseStudyStory from '../CaseStudyStory';
import { assignSlugs, displayName, validProperties } from '../../../lib/case-studies';
import { pageMetadata, SITE_URL } from '../../../lib/seo';

export const dynamic = 'force-dynamic';

const logoUrl = '/images/rha-logo-dark.png';

async function getStudy(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT || 3000}` : 'https://new.ripehouseadvisory.com.au');
  const fetchOpts = process.env.NODE_ENV === 'development' ? { cache: 'no-store' } : { next: { revalidate: 900, tags: ['case-studies'] } };
  try {
    const response = await fetch(`${baseUrl}/api/case-studies`, fetchOpts);
    return assignSlugs((await response.json()).caseStudies).find((study) => study.slug === slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const study = await getStudy(slug);
  const headshot = study && (study.headshotUrl || study.photoUrl || study.image || (study.videoId ? `https://i.ytimg.com/vi/${encodeURIComponent(study.videoId)}/hqdefault.jpg` : null));
  return pageMetadata({
    title: study ? `${displayName(study.title)} | Ripehouse Advisory` : 'Client Results | Ripehouse Advisory',
    description: study?.subtitle || study?.description || 'Measured client outcomes from Ripehouse Advisory.',
    path: `/case-studies/${slug}`,
    image: headshot ? { url: headshot, alt: displayName(study.title) } : undefined,
  });
}

export default async function CaseStudyPage({ params }) {
  const slug = (await params).slug;
  const raw = await getStudy(slug);
  if (!raw) notFound();
  const study = { ...raw, title: displayName(raw.title), properties: validProperties(raw.properties), review: raw.review ? { ...raw.review, name: displayName(raw.review.name) } : raw.review };
  const studyUrl = `${SITE_URL}/case-studies/${slug}`;
  const studyJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${studyUrl}#article`,
        headline: `${study.title} — Client Property Investment Case Study`,
        description: study.subtitle || study.description || 'Measured client portfolio outcomes from Ripehouse Advisory.',
        url: studyUrl,
        author: { '@type': 'Organization', name: 'Ripehouse Advisory', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'Ripehouse Advisory', url: SITE_URL },
      },
      ...(study.videoId
        ? [
            {
              '@type': 'VideoObject',
              name: `${study.title} — Ripehouse Advisory Client Story`,
              description: study.subtitle || study.description || 'Client property portfolio case study with Ripehouse Advisory.',
              thumbnailUrl: [`https://i.ytimg.com/vi/${encodeURIComponent(study.videoId)}/hqdefault.jpg`],
              embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(study.videoId)}`,
              uploadDate: study.updatedAt || '2026-01-01T00:00:00.000Z',
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        '@id': `${studyUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Case Studies', item: `${SITE_URL}/case-studies` },
          { '@type': 'ListItem', position: 3, name: study.title, item: studyUrl },
        ],
      },
    ],
  };
  return <main className="case-study-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studyJsonLd) }} /><header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/about/story">Our story</Link><Link href="/about/approach">Our approach</Link><Link href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/case-studies">← Case studies</Link><MobileNav links={[{ label: 'Our story', href: '/about/story' }, { label: 'Our approach', href: '/about/approach' }, { label: 'Case studies', href: '/case-studies' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header><section className="case-study-hero section-shell"><p className="eyebrow"><span /> A measured client journey</p><h1>{study.title}</h1>{study.subtitle && <p className="case-study-subtitle">{study.subtitle}</p>}{study.properties.length > 0 && <div className="case-study-summary"><div><strong>{study.properties.length}</strong><span>properties acquired</span></div><div><strong>{study.portfolioCagr != null ? `+${study.portfolioCagr.toFixed(1)}%` : '—'}</strong><span>portfolio CAGR since purchase</span></div><div><strong>{study.totalGrowth > 0 ? `$${Math.round(study.totalGrowth).toLocaleString('en-AU')}` : '—'}</strong><span>measured growth</span></div></div>}</section><CaseStudyStory study={study} /><CaseStudyVisuals study={study} /><section className="case-study-cta section-shell"><div><p className="eyebrow light"><span /> Your portfolio is a sequence</p><h2>Make the next<br /><i>move measurable.</i></h2><Link className="button button-light" href="/discovery-call">Book a free discovery call <span>↗</span></Link></div></section><Footer backHref="/case-studies" backLabel="All case studies ↑" /></main>;
}
