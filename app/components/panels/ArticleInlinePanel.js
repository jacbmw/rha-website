'use client';

import NewsletterSignup from '../NewsletterSignup';
import usePanelTracking from './usePanelTracking';

export default function ArticleInlinePanel({
  variant, trackKey = '', onClick, onConversion,
}) {
  const { id, props, preview } = variant;
  const { trackClick, trackConversion } = usePanelTracking('panel-article-inline', id, preview, trackKey);

  return (
    <aside className="inline-signup">
      <div>
        <p className="inline-signup-label">{props.label}</p>
        <p>{props.text}</p>
      </div>
      <NewsletterSignup
        source="article-inline"
        cta={props.cta}
        placeholder={props.placeholder}
        onInteract={() => { trackClick(); if (onClick) onClick(); }}
        onSuccess={() => { trackConversion('newsletter_signup'); if (onConversion) onConversion(); }}
      />
    </aside>
  );
}
