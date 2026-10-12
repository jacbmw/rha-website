'use client';

import Link from 'next/link';
import usePanelTracking from './usePanelTracking';
import { storePanelReferral } from '../../../lib/abTracking';
import { trackActivity } from '../../../lib/activity';
import { rich } from '../page-sections/rich';

const KEY = 'panel-street-footer';
const PLACEMENT = 'footer';

export default function StreetFooterPanel({ variant, trackKey = '', onClick }) {
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
    <section className="article-cta-primary street-panel-footer">
      <p className="eyebrow light"><span /> {props.eyebrow}</p>
      <h2>{rich(props.heading)}</h2>
      <p>{props.text}</p>
      <Link className="button button-light" href={href} onClick={handleClick}>{props.cta}</Link>
    </section>
  );
}
