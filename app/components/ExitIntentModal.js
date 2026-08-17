'use client';

import { useEffect, useState } from 'react';
import NewsletterSignup from './NewsletterSignup';
import usePanelTracking from './panels/usePanelTracking';
import { resolvePanelClient } from '../../lib/panelClient';
import { rich } from './page-sections/rich';
import exitIntentDefault from '../../content/panels/panel-exit-intent.json';

const STORAGE_KEY = 'rha_exit_intent_shown';
const PANEL_KEY = 'panel-exit-intent';

// Exit-intent newsletter modal, A/B managed via the panel variant system.
// The variant resolves only when the modal actually fires, so the display
// count is "times shown" — not pageviews — keeping its conversion rate
// comparable across variants but separate from the inline panels.
export default function ExitIntentModal() {
  const [variant, setVariant] = useState(null); // { id, props, preview } once triggered
  const [open, setOpen] = useState(false);
  const { trackClick, trackConversion } = usePanelTracking(PANEL_KEY, variant?.id, variant?.preview);

  useEffect(() => {
    let cancelled = false;
    const show = async () => {
      const resolved = await resolvePanelClient(PANEL_KEY, exitIntentDefault.props);
      if (cancelled) return;
      setVariant(resolved);
      setOpen(true);
    };

    // Preview mode (dashboard Preview button): open immediately, no tracking.
    if (document.cookie.includes(`rha_prev_${PANEL_KEY}=`)) {
      show();
      return () => { cancelled = true; };
    }

    if (sessionStorage.getItem(STORAGE_KEY)) return undefined;
    const armedAt = Date.now();
    let maxY = 0;
    const trigger = () => {
      // Suburb pages run their own scorecard recapture — never stack popups there.
      if (window.location.pathname.startsWith('/suburbs')) return;
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, '1');
      show();
    };
    const onLeave = (event) => {
      // Fire only on a genuine upward exit toward the browser chrome,
      // after the reader has actually spent time on the page.
      if (event.clientY > 8 || Date.now() - armedAt < 6000) return;
      trigger();
    };
    const onScroll = () => {
      // Mobile has no mouseleave: treat a sharp scroll back up after reading
      // deep into the page as the exit gesture instead.
      maxY = Math.max(maxY, window.scrollY);
      if (maxY > 900 && maxY - window.scrollY > 700) trigger();
    };
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelled = true;
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!open || !variant) return null;
  const { props } = variant;

  return (
    <div className="exit-overlay" role="dialog" aria-modal="true" aria-label="Newsletter invitation" onClick={() => setOpen(false)}>
      <div className="exit-modal" onClick={(event) => event.stopPropagation()}>
        <button className="exit-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <p className="eyebrow"><span /> {props.eyebrow}</p>
        <h3>{rich(props.heading)}</h3>
        <p className="exit-copy">{props.text}</p>
        <NewsletterSignup
          source="exit-intent"
          cta={props.cta}
          placeholder={props.placeholder}
          onInteract={trackClick}
          onSuccess={() => trackConversion('newsletter_signup')}
        />
        <button className="exit-dismiss" onClick={() => setOpen(false)}>{props.dismiss}</button>
      </div>
    </div>
  );
}
