'use client';

import Link from 'next/link';
import usePanelTracking from './usePanelTracking';
import StreetScoreArt from './StreetScoreArt';
import { storePanelReferral } from '../../../lib/abTracking';
import { trackActivity } from '../../../lib/activity';
import { rich } from '../page-sections/rich';

const KEY = 'panel-street-rail';

export default function StreetRailPanel({
  variant, trackKey = '', onClick, placement = 'inline',
}) {
  const { id, props, preview } = variant;
  const { trackClick } = usePanelTracking(KEY, id, preview, trackKey);
  const href = `${props.href || '/streets'}?int_ref=blog-${placement}`;

  const handleClick = () => {
    trackClick();
    if (onClick) onClick();
    // Conversion credit happens on the street page: the report unlock calls
    // creditPanelReferral, which converts the variant that stored this.
    if (id && !preview) storePanelReferral(KEY, id);
    trackActivity('street_cta_click', { pageKey: KEY, placement });
  };

  return (
    <aside className={`street-panel street-panel-rail street-panel-rail--${placement}`} aria-label="Street Score">
      <StreetScoreArt score={props.sampleScore} suburbAverage={props.sampleSuburbAverage} dark />
      <p className="street-panel-kicker">{props.eyebrow}</p>
      <h3>{rich(props.heading)}</h3>
      <p className="street-panel-copy">{props.copy}</p>
      {props.tests?.length > 0 && (
        <ul className="street-panel-tests">
          {props.tests.map((test) => <li key={test}><span aria-hidden="true">✓</span>{test}</li>)}
        </ul>
      )}
      <Link className="button button-light street-panel-cta" href={href} onClick={handleClick}>{props.cta}</Link>
      {props.finePrint && <p className="street-panel-fine">{props.finePrint}</p>}
    </aside>
  );
}
