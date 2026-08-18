import Link from 'next/link';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import { assignSlugs, displayName, validProperties } from '../../lib/case-studies';
import { pageMetadata } from '../../lib/seo';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: 'Client Results | Ripehouse Advisory',
  description: 'See how Ripehouse clients have built property portfolios through strategy, research and long-term discipline.',
  path: '/case-studies',
});

async function getStudies() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT || 3000}` : 'https://new.ripehouseadvisory.com.au');
  const fetchOpts = process.env.NODE_ENV === 'development' ? { cache: 'no-store' } : { next: { revalidate: 900, tags: ['case-studies'] } };
  try {
    const response = await fetch(`${baseUrl}/api/case-studies`, fetchOpts);
    return assignSlugs((await response.json()).caseStudies);
  } catch {
    return [];
  }
}

export default async function CaseStudiesPage() {
  const studies = await getStudies();
  return <main className="case-studies-page"><header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/about/story">Our story</Link><Link href="/about/approach">Our approach</Link><Link href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link><MobileNav links={[{ label: 'Our story', href: '/about/story' }, { label: 'Our approach', href: '/about/approach' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header><section className="case-index-hero section-shell"><p className="eyebrow"><span /> Client outcomes, measured</p><h1>Real portfolios.<br /><i>Real progress.</i></h1><p>Not cherry-picked case studies. Not a single lucky purchase. These are the decisions, sequences and outcomes behind Ripehouse client portfolios.</p></section><section className="case-index-list section-shell">{studies.length ? studies.map((study) => { const properties = validProperties(study.properties); return <article className="case-index-card" key={study.id}><div><p className="case-eyebrow">Client case study</p><h2><Link href={`/case-studies/${study.slug}`}>{displayName(study.title)}</Link></h2><p>{study.subtitle || study.description}</p><Link className="text-link dark-link" href={`/case-studies/${study.slug}`}>Explore the portfolio <span>↗</span></Link></div>{properties.length > 0 && <div className="case-index-meta"><strong>{properties.length}</strong><span>properties<br />acquired</span><b>{study.portfolioCagr != null ? `+${study.portfolioCagr.toFixed(1)}%` : '—'}</b><span>portfolio<br />CAGR</span></div>}</article>; }) : <div className="case-empty"><h2>Portfolio stories are being prepared.</h2><p>We&apos;re compiling the first set of fully measured client journeys.</p></div>}</section><section className="case-index-cta section-shell"><div><p className="eyebrow light"><span /> Your strategy can be measured too</p><h2>Start with a<br /><i>conversation.</i></h2><Link className="button button-light" href="/discovery-call">Book a free discovery call <span>↗</span></Link></div></section><Footer /></main>;
}
