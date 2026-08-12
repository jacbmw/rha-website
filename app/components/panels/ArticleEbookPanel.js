'use client';

import usePanelTracking from './usePanelTracking';
import { storePanelReferral } from '../../../lib/abTracking';

const ebookCoverUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/6a716917e77a27b1080ee7ac_rha-five-markets-ebook-cover.png';

export default function ArticleEbookPanel({ variant }) {
  const { id, props, preview } = variant;
  const { trackClick } = usePanelTracking('panel-article-ebook', id, preview);

  const onClick = () => {
    trackClick();
    // Completion credit: if this visitor submits the five-markets lead form
    // this session, this panel variant records the conversion.
    if (id && !preview) storePanelReferral('panel-article-ebook', id);
  };

  return (
    <a className="article-cta-ebook" href="/five-markets?utm_source=rha-website&utm_medium=blog&utm_campaign=five_markets_report" onClick={onClick}>
      <img className="article-ebook-cover" src={ebookCoverUrl} alt="Cover of the Five Market Environments 2026 report" loading="lazy" />
      <div>
        <p className="ebook-flag">{props.flag}</p>
        <h3>{props.heading}</h3>
        <p>{props.text}</p>
      </div>
      <span className="ebook-arrow">{props.linkLabel} ↗</span>
    </a>
  );
}
