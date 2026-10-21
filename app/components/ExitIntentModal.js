'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';
import usePanelTracking from './panels/usePanelTracking';
import { resolvePanelClient } from '../../lib/panelClient';
import { storePanelReferral } from '../../lib/abTracking';
import { trackActivity } from '../../lib/activity';
import { rich } from './page-sections/rich';
import exitIntentDefault from '../../content/panels/panel-exit-intent.json';
import exitIntentStreetDefault from '../../content/panels/panel-exit-intent-street.json';

const STORAGE_KEY = 'rha_exit_intent_shown';
const NEWSLETTER_KEY = 'panel-exit-intent';
const STREET_KEY = 'panel-exit-intent-street';
const BLOG_PATH = /^\/resources\/blog(\/|$)/;

const isBlogPath = () => BLOG_PATH.test(window.location.pathname);

// Exit-intent modal, A/B managed via the panel variant system. On Market
// Intel (/resources/blog…) it pitches Street Score; everywhere else it stays
// the newsletter signup. The variant resolves only when the modal actually
// fires, so the display count is "times shown" — not pageviews.
export default function ExitIntentModal() {
  const [variant, setVariant] = useState(null); // { key, id, props, preview } once triggered
  const [open, setOpen] = useState(false);
  const { trackClick, trackConversion } = usePanelTracking(variant?.key || '', variant?.id, variant?.preview);

  useEffect(() => {
    let cancelled = false;
    const street = isBlogPath();
    const panelKey = street ? STREET_KEY : NEWSLETTER_KEY;
    const show = async () => {
      const resolved = await resolvePanelClient(
        panelKey,
        (street ? exitIntentStreetDefault : exitIntentDefault).props,
      );
      if (cancelled) return;
      setVariant({ key: panelKey, ...resolved });
      setOpen(true);
    };

    // Preview mode (dashboard Preview button): open immediately, no tracking.
    if (document.cookie.includes(`rha_prev_${NEWSLETTER_KEY}=`) || document.cookie.includes(`rha_prev_${STREET_KEY}=`)) {
      show();
      return () => { cancelled = true; };
    }

    if (sessionStorage.getItem(STORAGE_KEY)) return undefined;
    const armedAt = Date.now();
    let maxY = 0;
    const trigger = () => {
      // Location, suburb + street pages run their own report recapture — never stack popups there.
      if (/^\/(locations|suburbs|streets)(\/|$)/.test(window.location.pathname)) return;
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
  const { key, id, props, preview } = variant;
  const street = key === STREET_KEY;

  const handleStreetClick = () => {
    trackClick();
    if (id && !preview) storePanelReferral(STREET_KEY, id);
    trackActivity('street_cta_click', { pageKey: STREET_KEY, placement: 'exit' });
    setOpen(false);
  };

  return (
    <div className="exit-overlay" role="dialog" aria-modal="true" aria-label={street ? 'Street Score invitation' : 'Newsletter invitation'} onClick={() => setOpen(false)}>
      <div className="exit-modal" onClick={(event) => event.stopPropagation()}>
        <button className="exit-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <p className="eyebrow"><span /> {props.eyebrow}</p>
        <h3>{rich(props.heading)}</h3>
        <p className="exit-copy">{props.text}</p>
        {street ? (
          <Link className="button button-primary exit-cta" href={`${props.href || '/streets'}?int_ref=blog-exit`} onClick={handleStreetClick}>
            {props.cta}
          </Link>
        ) : (
          <NewsletterSignup
            source="exit-intent"
            cta={props.cta}
            placeholder={props.placeholder}
            onInteract={trackClick}
            onSuccess={() => trackConversion('newsletter_signup')}
          />
        )}
        <button className="exit-dismiss" onClick={() => setOpen(false)}>{props.dismiss}</button>
      </div>
    </div>
  );
}
