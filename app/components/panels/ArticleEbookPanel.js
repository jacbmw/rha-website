'use client';

import usePanelTracking from './usePanelTracking';
import { storePanelReferral } from '../../../lib/abTracking';

const ebookCoverUrl = '/images/five-markets-ebook-cover.png';

export default function ArticleEbookPanel({ variant, trackKey = '', onClick }) {
  const { id, props, preview } = variant;
  const { trackClick } = usePanelTracking('panel-article-ebook', id, preview, trackKey);

  const handleClick = () => {
    trackClick();
    if (onClick) onClick();
    // Completion credit: if this visitor submits the five-markets lead form
    // this session, this panel variant records the conversion.
    if (id && !preview) storePanelReferral('panel-article-ebook', id);
  };

  // Internal navigation must not carry utm_* params: captureTouches() would
  // store them as first/last touch and overwrite the visitor's real
  // acquisition source (facebook, newsjack, ...). Use a non-UTM ref param.
  return (
    <a className="article-cta-ebook" href="/five-markets?int_ref=blog-panel" onClick={handleClick}>
      <img className="article-ebook-cover" src={ebookCoverUrl} alt="Cover of the report: The 5 Australian Markets We&rsquo;re Buying In For Clients in 2026" loading="lazy" />
      <div>
        <p className="ebook-flag">{props.flag}</p>
        <h3>{props.heading}</h3>
        <p>{props.text}</p>
      </div>
      <span className="ebook-arrow">{props.linkLabel} ↗</span>
    </a>
  );
}
