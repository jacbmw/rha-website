'use client';

import usePanelTracking from './usePanelTracking';
import { storePanelReferral } from '../../../lib/abTracking';

const ebookCoverUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/ad8e601a-6a716917e77a27b1080ee7ac_rha-five-markets-ebook-cover.png';

export default function ArticleEbookPanel({ variant }) {
  const { id, props, preview } = variant;
  const { trackClick } = usePanelTracking('panel-article-ebook', id, preview);

  const onClick = () => {
    trackClick();
    // Completion credit: if this visitor submits the five-markets lead form
    // this session, this panel variant records the conversion.
    if (id && !preview) storePanelReferral('panel-article-ebook', id);
  };

  // Internal navigation must not carry utm_* params: captureTouches() would
  // store them as first/last touch and overwrite the visitor's real
  // acquisition source (facebook, newsjack, ...). Use a non-UTM ref param.
  return (
    <a className="article-cta-ebook" href="/five-markets?int_ref=blog-panel" onClick={onClick}>
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
