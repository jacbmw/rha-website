'use client';

import Link from 'next/link';
import usePanelTracking from './usePanelTracking';
import StreetScoreArt from './StreetScoreArt';
import { storePanelReferral } from '../../../lib/abTracking';
import { trackActivity } from '../../../lib/activity';

const KEY = 'panel-street-card';
const PLACEMENT = 'card';

export default function StreetCardPanel({ variant, trackKey = '', onClick }) {
  const { id, props, preview } = variant;
  const { trackClick } = usePanelTracking(KEY, id, preview, trackKey);
  const href = `${props.href || '/streets'}?int_ref=blog-${PLACEMENT}`;

  const handleClick = () => {
    trackClick();
    if (onClick) onClick();
    if (id && !preview) storePanelReferral(KEY, id);
    trackActivity('street_cta_click', { pageKey: KEY, placement: PLACEMENT });
  };

  return (
    <Link className="article-cta-ebook street-panel-card" href={href} onClick={handleClick}>
      <StreetScoreArt score={props.sampleScore} suburbAverage={props.sampleSuburbAverage} />
      <div>
        <p className="ebook-flag">{props.flag}</p>
        <h3>{props.heading}</h3>
        <p>{props.text}</p>
      </div>
      <span className="ebook-arrow">{props.linkLabel} ↗</span>
    </Link>
  );
}
