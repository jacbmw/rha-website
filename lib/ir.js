// Client-side port of the legacy ir-tracking.js (RHA Identity Resolution).
// Posts go DIRECTLY from the browser to the dashboard (not proxied through
// Next.js) so the server can capture the visitor's real IP for lead matching.
// Endpoints: POST /api/ir/pageview, /api/ir/pageview-update, /api/ir/identify
// (all CORS-open on the dashboard).

import { getVisitorId } from './visitor';

const IR_BASE = process.env.NEXT_PUBLIC_RHA_IR_URL || 'https://dashboard.picki.com.au';

const getCookie = (name) => document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';

const getParam = (key) => {
  try { return new URLSearchParams(window.location.search).get(key) || ''; } catch { return ''; }
};

const post = (path, data) => {
  try {
    fetch(`${IR_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {});
  } catch {}
};

export function collectIrSignals() {
  return {
    visitor_id: getVisitorId(),
    page_url: window.location.href.split('?')[0],
    full_url: window.location.href,
    referrer_url: document.referrer || '',
    utm_source: getParam('utm_source'),
    utm_medium: getParam('utm_medium'),
    utm_campaign: getParam('utm_campaign'),
    utm_content: getParam('utm_content'),
    utm_term: getParam('utm_term'),
    fbclid: getParam('fbclid'),
    gclid: getParam('gclid'),
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    timezone_offset: new Date().getTimezoneOffset(),
    language: navigator.language || '',
    timestamp: new Date().toISOString(),
  };
}

export function trackIrPageview() {
  const signals = collectIrSignals();
  post('/api/ir/pageview', signals);

  // The Meta pixel often sets _fbp after our pageview fires; backfill it so
  // the pageview + visitor rows carry the pixel identity (CAPI matching).
  if (!signals.fbp) {
    setTimeout(() => {
      const fbp = getCookie('_fbp');
      if (fbp) {
        post('/api/ir/pageview-update', {
          visitor_id: signals.visitor_id,
          page_url: signals.page_url,
          fbp,
          fbc: getCookie('_fbc'),
        });
      }
    }, 2500);
  }
  return signals;
}

// Links the anonymous visitor to a person the moment they submit any form.
export function irIdentify({ email = '', phone = '', firstName = '', lastName = '', formSource = '' }) {
  if (!email && !phone) return;
  const signals = collectIrSignals();
  post('/api/ir/identify', {
    visitor_id: signals.visitor_id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    form_source: formSource,
    page_url: signals.page_url,
    utm_source: signals.utm_source,
    utm_medium: signals.utm_medium,
    utm_campaign: signals.utm_campaign,
    utm_content: signals.utm_content,
    utm_term: signals.utm_term,
  });
}
