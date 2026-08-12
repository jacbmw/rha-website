'use client';

import NewsletterSignup from '../NewsletterSignup';
import usePanelTracking from './usePanelTracking';

export default function ArticleInlinePanel({ variant }) {
  const { id, props, preview } = variant;
  const { trackClick, trackConversion } = usePanelTracking('panel-article-inline', id, preview);

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
        onInteract={trackClick}
        onSuccess={() => trackConversion('newsletter_signup')}
      />
    </aside>
  );
}
