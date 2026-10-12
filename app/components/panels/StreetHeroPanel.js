'use client';

import Link from 'next/link';
import usePanelTracking from './usePanelTracking';
import { storePanelReferral } from '../../../lib/abTracking';
import { trackActivity } from '../../../lib/activity';

const KEY = 'panel-street-hero';
const PLACEMENT = 'hero';

export default function StreetHeroPanel({ variant }) {
  const { id, props, preview } = variant;
  const { trackClick } = usePanelTracking(KEY, id, preview);
  const href = `${props.href || '/streets'}?int_ref=blog-${PLACEMENT}`;

  const handleClick = () => {
    trackClick();
    if (id && !preview) storePanelReferral(KEY, id);
    trackActivity('street_cta_click', { pageKey: KEY, placement: PLACEMENT });
  };

  return (
    <div className="hero-signup street-panel-hero">
      <p className="street-panel-hero-eyebrow">{props.eyebrow}</p>
      <p>{props.heading}</p>
      <p className="street-panel-hero-copy">{props.copy}</p>
      <Link className="button button-light" href={href} onClick={handleClick}>{props.cta}</Link>
    </div>
  );
}
