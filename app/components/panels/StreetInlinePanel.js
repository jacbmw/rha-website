'use client';

import Link from 'next/link';
import usePanelTracking from './usePanelTracking';
import { storePanelReferral } from '../../../lib/abTracking';
import { trackActivity } from '../../../lib/activity';

const KEY = 'panel-street-inline';
const PLACEMENT = 'inline';

export default function StreetInlinePanel({ variant, trackKey = '', onClick }) {
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
    <aside className="street-panel street-panel-inline">
      <div>
        <p className="street-panel-inline-label">{props.label}</p>
        <p>{props.text}</p>
      </div>
      <div className="street-panel-inline-cta">
        <Link className="button button-primary" href={href} onClick={handleClick}>{props.cta}</Link>
        {props.finePrint && <p className="street-panel-fine">{props.finePrint}</p>}
      </div>
    </aside>
  );
}
