import Link from 'next/link';
import { getRandomCaseStudy, displayName } from '../../lib/case-studies';

function formatLabel(value) {
  return String(value || '').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function CaseStudySection() {
  const study = await getRandomCaseStudy();
  if (!study) return null;

  return (
    <section className="case-study section-shell" aria-labelledby="case-study-title">
      <div className="case-study-intro">
        <p className="section-label">A client story, in full</p>
        <p className="case-study-index">Selected from the Ripehouse case study archive</p>
      </div>
      <div className="case-study-heading">
        <div>
          <p className="eyebrow"><span /> Case study</p>
          <h2 id="case-study-title">{displayName(study.title)}</h2>
        </div>
        {study.location && <p className="case-study-location">{study.location}</p>}
      </div>
      {study.summary && <p className="case-study-summary">{study.summary}</p>}
      <div className="case-study-grid">
        <div className="case-study-video-wrap">
          <iframe
            className="case-study-video"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(study.videoId)}?rel=0&modestbranding=1`}
            title={`${displayName(study.title)} case study video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="case-study-details">
          {study.properties.length > 0 && (
            <div className="case-study-properties">
              <p className="case-study-overline">The property</p>
              <dl>{study.properties.map((property) => <div key={`${property.label}-${property.value}`}><dt>{formatLabel(property.label)}</dt><dd>{property.value}</dd></div>)}</dl>
            </div>
          )}
          {study.timeline.length > 0 && (
            <div className="case-study-timeline">
              <p className="case-study-overline">The result, over time</p>
              <ol>{study.timeline.map((milestone, index) => <li key={`${milestone.label}-${milestone.value}`}><span className="case-study-step">{String(index + 1).padStart(2, '0')}</span><div><strong>{milestone.label}</strong><p>{milestone.value}</p></div></li>)}</ol>
            </div>
          )}
        </div>
      </div>
      <div className="case-study-footer"><p>Good property advice is not a moment. It is a sequence of decisions that keeps working.</p><Link className="text-link" href="/#contact">Build your own sequence <span>↗</span></Link></div>
    </section>
  );
}
