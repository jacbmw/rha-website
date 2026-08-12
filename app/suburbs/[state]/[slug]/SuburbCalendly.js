'use client';

import { useEffect, useRef, useState } from 'react';
import { getVisitorId } from '../../../../lib/visitor';
import { collectIrSignals } from '../../../../lib/ir';

const CALENDLY_URL = 'https://calendly.com/ripehouse_advisory/15min';
const WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';

// Discovery-call embed, prefilled so the call starts warm: the suburb rides in
// on utm_content + the booking answer, and the visitor id on salesforce_uuid
// (same server-side matching path as the /discovery-call page).
export default function SuburbCalendly({ suburbName, suburbSlug, firstName }) {
  const containerRef = useRef(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const url = new URL(CALENDLY_URL);
    url.searchParams.set('hide_gdpr_banner', '1');
    url.searchParams.set('primary_color', 'c79810');
    url.searchParams.set('text_color', '141a32');
    url.searchParams.set('background_color', 'fbfaf7');
    url.searchParams.set('salesforce_uuid', getVisitorId());

    const init = () => {
      if (!window.Calendly || !containerRef.current || containerRef.current.childElementCount) return;
      window.Calendly.initInlineWidget({
        url: url.toString(),
        parentElement: containerRef.current,
        prefill: {
          name: firstName || undefined,
          customAnswers: { a1: `Suburb Strategy Session — ${suburbName}` },
        },
        utm: { utmContent: `suburb-${suburbSlug}` },
      });
    };

    let script = document.querySelector(`script[src="${WIDGET_SRC}"]`);
    if (window.Calendly) {
      init();
    } else if (script) {
      script.addEventListener('load', init);
    } else {
      script = document.createElement('script');
      script.src = WIDGET_SRC;
      script.async = true;
      script.addEventListener('load', init);
      document.body.appendChild(script);
    }

    const onMessage = (event) => {
      if (!/https:\/\/([a-z0-9-]+\.)?calendly\.com$/.test(event.origin)) return;
      if (event.data?.event === 'calendly.event_scheduled') {
        setBooked(true);
        window.fbq?.('track', 'Schedule');
        window.gtag?.('event', 'discovery_booked', { event_category: 'conversion', event_label: `suburb-${suburbSlug}` });
        const signals = collectIrSignals();
        fetch(`${process.env.NEXT_PUBLIC_RHA_IR_URL || 'https://dashboard.picki.com.au'}/api/ir/pageview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...signals, full_url: `${signals.page_url}#booked` }),
          keepalive: true,
        }).catch(() => {});
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      script?.removeEventListener('load', init);
    };
  }, [suburbName, suburbSlug, firstName]);

  return (
    <div className="calendly-frame suburb-calendly">
      {booked && <p className="calendly-booked" role="status">You&apos;re booked. We&apos;ll come to the call with {suburbName} already loaded up.</p>}
      <div ref={containerRef} className="calendly-widget" aria-label="Book your Suburb Strategy Session" />
    </div>
  );
}
