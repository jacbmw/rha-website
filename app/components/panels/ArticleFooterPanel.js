'use client';

import NewsletterSignup from '../NewsletterSignup';
import usePanelTracking from './usePanelTracking';
import { rich } from '../page-sections/rich';

export default function ArticleFooterPanel({
  variant, trackKey = '', onClick, onConversion,
}) {
  const { id, props, preview } = variant;
  const { trackClick, trackConversion } = usePanelTracking('panel-article-footer', id, preview, trackKey);

  return (
    <section className="article-cta-primary">
      <p className="eyebrow light"><span /> {props.eyebrow}</p>
      <h2>{rich(props.heading)}</h2>
      <p>{props.text}</p>
      <NewsletterSignup
        source="article-footer"
        cta={props.cta}
        placeholder={props.placeholder}
        onInteract={() => { trackClick(); if (onClick) onClick(); }}
        onSuccess={() => { trackConversion('newsletter_signup'); if (onConversion) onConversion(); }}
      />
    </section>
  );
}
