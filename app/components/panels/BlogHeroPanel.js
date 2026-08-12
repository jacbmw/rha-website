'use client';

import NewsletterSignup from '../NewsletterSignup';
import usePanelTracking from './usePanelTracking';

export default function BlogHeroPanel({ variant }) {
  const { id, props, preview } = variant;
  const { trackClick, trackConversion } = usePanelTracking('panel-blog-hero', id, preview);

  return (
    <div className="hero-signup">
      <p>{props.heading}</p>
      <NewsletterSignup
        source="blog-hero"
        cta={props.cta}
        placeholder={props.placeholder}
        onInteract={trackClick}
        onSuccess={() => trackConversion('newsletter_signup')}
      />
    </div>
  );
}
