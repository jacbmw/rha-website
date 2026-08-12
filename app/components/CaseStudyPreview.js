import Link from 'next/link';
import { assignSlugs } from '../../lib/case-studies';

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

function initials(title) {
  return String(title || '').split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

export default async function CaseStudyPreview() {
  const studies = await getStudies();
  if (!studies.length) return null;
  const study = studies[Math.floor(Math.random() * studies.length)];
  const headshot = study.headshotUrl || study.photoUrl || study.image || (study.videoId ? `https://i.ytimg.com/vi/${encodeURIComponent(study.videoId)}/hqdefault.jpg` : null);

  return (
    <section className="case-preview section-shell" aria-labelledby="case-preview-title">
      <div className="section-label">Client outcomes, measured</div>
      <Link className="case-preview-panel" href={`/case-studies/${study.slug}`}>
        <div className="case-preview-copy">
          <div className="case-preview-person">
            {headshot ? (
              <img className="case-preview-headshot" src={headshot} alt="" loading="lazy" />
            ) : (
              <span className="case-preview-headshot case-preview-initials" aria-hidden="true">{initials(study.title)}</span>
            )}
            <p className="case-eyebrow">Client case study</p>
          </div>
          <h2 id="case-preview-title">{study.title}</h2>
          {(study.subtitle || study.description) && <p className="case-preview-sub">{study.subtitle || study.description}</p>}
          <span className="text-link dark-link">Read the full story <span aria-hidden="true">↗</span></span>
        </div>
        <div className="case-preview-meta">
          <div><strong>{study.properties?.length || 0}</strong><span>properties acquired</span></div>
          <div><strong>{study.portfolioCagr != null ? `+${study.portfolioCagr.toFixed(1)}%` : '—'}</strong><span>portfolio CAGR</span></div>
          {study.totalGrowth > 0 && <div><strong>${Math.round(study.totalGrowth).toLocaleString('en-AU')}</strong><span>measured growth</span></div>}
        </div>
      </Link>
      <div className="case-preview-foot"><Link className="text-link" href="/case-studies">Browse all case studies <span aria-hidden="true">↗</span></Link></div>
    </section>
  );
}
