'use client';

import { useEffect, useRef, useState } from 'react';
import { getVisitorId } from '../../lib/visitor';
import { collectIrSignals } from '../../lib/ir';
import { trackVariantConversion } from '../../lib/abTracking';

const CALENDLY_URL = 'https://calendly.com/ripehouse_advisory/15min';
const WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';

export default function CalendlyEmbed() {
  const containerRef = useRef(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const vid = getVisitorId();
    const params = new URLSearchParams(window.location.search);

    const url = new URL(CALENDLY_URL);
    url.searchParams.set('hide_gdpr_banner', '1');
    url.searchParams.set('primary_color', 'c79810');
    url.searchParams.set('text_color', '141a32');
    url.searchParams.set('background_color', 'fbfaf7');
    url.searchParams.set('salesforce_uuid', vid);

    const init = () => {
      if (!window.Calendly || !containerRef.current || containerRef.current.childElementCount) return;
      window.Calendly.initInlineWidget({
        url: url.toString(),
        parentElement: containerRef.current,
        prefill: {
          name: params.get('name') || undefined,
          email: params.get('email') || undefined,
        },
        utm: {
          utmSource: params.get('utm_source') || undefined,
          utmMedium: params.get('utm_medium') || undefined,
          utmCampaign: params.get('utm_campaign') || undefined,
          utmContent: params.get('utm_content') || undefined,
          utmTerm: params.get('utm_term') || undefined,
        },
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
        trackVariantConversion('calendly_booked');
        window.fbq?.('track', 'Schedule');
        window.fbq?.('track', 'Lead');
        window.gtag?.('event', 'schedule_discovery_call', { event_category: 'conversion' });
        // Booking conversion beacon to the dashboard's identity-resolution
        // store (the Calendly webhook also matches server-side via the
        // salesforce_uuid we injected above).
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
  }, []);

  return (
    <div className="calendly-frame" id="book">
      {booked && <p className="calendly-booked" role="status">You&apos;re booked. A confirmation and calendar invite are on their way to your inbox.</p>}
      <div ref={containerRef} className="calendly-widget" aria-label="Book your discovery call" />
    </div>
  );
}
