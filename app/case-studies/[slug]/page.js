import Link from 'next/link';
import Footer from '../../components/Footer';
import { notFound } from 'next/navigation';
import CaseStudyVisuals from '../CaseStudyVisuals';
import CaseStudyStory from '../CaseStudyStory';

export const dynamic = 'force-dynamic';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

async function getStudy(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT || 3000}` : 'https://new.ripehouseadvisory.com.au');
  const fetchOpts = process.env.NODE_ENV === 'development' ? { cache: 'no-store' } : { next: { revalidate: 900, tags: ['case-studies'] } };
  try {
    const response = await fetch(`${baseUrl}/api/case-studies`, fetchOpts);
    return (await response.json()).caseStudies?.find((study) => study.slug === slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) { const study = await getStudy((await params).slug); return { title: study ? `${study.title} | Ripehouse Advisory` : 'Client Results | Ripehouse Advisory', description: study?.subtitle || study?.description || 'Measured client outcomes from Ripehouse Advisory.' }; }

export default async function CaseStudyPage({ params }) {
  const study = await getStudy((await params).slug);
  if (!study) notFound();
  return <main className="case-study-page"><header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/about/story">Our story</Link><Link href="/about/approach">Our approach</Link><Link href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/case-studies">← Case studies</Link></header><section className="case-study-hero section-shell"><p className="eyebrow"><span /> A measured client journey</p><h1>{study.title}</h1>{study.subtitle && <p className="case-study-subtitle">{study.subtitle}</p>}<div className="case-study-summary"><div><strong>{study.properties.length}</strong><span>properties acquired</span></div><div><strong>{study.portfolioCagr != null ? `+${study.portfolioCagr.toFixed(1)}%` : '—'}</strong><span>portfolio CAGR since purchase</span></div><div><strong>{study.totalGrowth > 0 ? `$${Math.round(study.totalGrowth).toLocaleString('en-AU')}` : '—'}</strong><span>measured growth</span></div></div></section><CaseStudyStory study={study} /><CaseStudyVisuals study={study} /><section className="case-study-cta section-shell"><div><p className="eyebrow light"><span /> Your portfolio is a sequence</p><h2>Make the next<br /><i>move measurable.</i></h2><Link className="button button-light" href="/discovery-call">Book a free discovery call <span>↗</span></Link></div></section><Footer backHref="/case-studies" backLabel="All case studies ↑" /></main>;
}
