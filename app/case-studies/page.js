import Link from 'next/link';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Client Results | Ripehouse Advisory', description: 'See how Ripehouse clients have built property portfolios through strategy, research and long-term discipline.' };

async function getStudies() {
  try { const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://new.ripehouseadvisory.com.au'}/api/case-studies`, { next: { revalidate: 900, tags: ['case-studies'] } }); return (await response.json()).caseStudies || []; } catch { return []; }
}

export default async function CaseStudiesPage() {
  const studies = await getStudies();
  return <main className="case-studies-page"><header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/about/story">Our story</Link><Link href="/about/approach">Our approach</Link><Link href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/#contact">Book a call <span>↗</span></Link></header><section className="case-index-hero section-shell"><p className="eyebrow"><span /> Client outcomes, measured</p><h1>Real portfolios.<br /><i>Real progress.</i></h1><p>Not cherry-picked case studies. Not a single lucky purchase. These are the decisions, sequences and outcomes behind Ripehouse client portfolios.</p></section><section className="case-index-list section-shell">{studies.length ? studies.map((study) => <article className="case-index-card" key={study.id}><div><p className="case-eyebrow">Client case study</p><h2><Link href={`/case-studies/${study.id}`}>{study.title}</Link></h2><p>{study.subtitle || study.description}</p><Link className="text-link dark-link" href={`/case-studies/${study.id}`}>Explore the portfolio <span>↗</span></Link></div><div className="case-index-meta"><strong>{study.properties?.length || 0}</strong><span>properties<br />acquired</span><b>{study.portfolioCagr != null ? `+${study.portfolioCagr.toFixed(1)}%` : '—'}</b><span>portfolio<br />CAGR</span></div></article>) : <div className="case-empty"><h2>Portfolio stories are being prepared.</h2><p>We&apos;re compiling the first set of fully measured client journeys.</p></div>}</section><section className="case-index-cta section-shell"><div><p className="eyebrow light"><span /> Your strategy can be measured too</p><h2>Start with a<br /><i>conversation.</i></h2><Link className="button button-light" href="/#contact">Book a free discovery call <span>↗</span></Link></div></section><footer className="site-footer"><Link className="brand footer-brand" href="/"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><p>© 2026 Ripehouse Advisory. All rights reserved.</p><div><a href="#">Privacy</a><a href="#">Terms</a><Link href="/">Back home ↑</Link></div></footer></main>;
}
