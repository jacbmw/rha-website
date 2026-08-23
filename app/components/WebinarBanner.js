'use client';

import Link from 'next/link';
import usePanelTracking from './panels/usePanelTracking';
import { storePanelReferral } from '../../lib/abTracking';
import { rich } from './page-sections/rich';

const PANEL_KEY = 'panel-webinar-banner';

export default function WebinarBanner({ variant = {}, placement = 'inline' }) {
  const { id, props = {}, preview } = variant;
  const { trackClick } = usePanelTracking(PANEL_KEY, id, preview);

  const onClick = () => {
    trackClick();
    if (id && !preview) storePanelReferral(PANEL_KEY, id);
  };

  return (
    <aside className={`webinar-banner webinar-banner--${placement}`} aria-label="Free live webinar">
      <div className="webinar-banner-head">
        <img className="webinar-banner-photo" src={props.photoUrl} alt={props.photoAlt} />
        <span className="webinar-banner-badge">
          <span className="webinar-banner-live-dot" aria-hidden="true" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="5" width="14" height="14" rx="2" />
            <path d="M22 8l-6 4 6 4V8z" />
          </svg>
          {props.badge || 'Live webinar'}
        </span>
      </div>
      <p className="webinar-banner-kicker">{props.eyebrow}</p>
      <h3>{rich(props.heading)}</h3>
      <p className="webinar-banner-when">{props.when}</p>
      <p className="webinar-banner-copy">{props.copy} {props.length}.</p>
      <Link className="button button-light webinar-banner-cta" href={props.href || '/webinar'} onClick={onClick}>
        {props.cta} <span>&#8599;</span>
      </Link>
    </aside>
  );
}
