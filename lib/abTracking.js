// Client-side A/B variant event tracking for both full pages and panels.
// - Pages: VariantTracker registers the active variant on
//   window.__rhaPageVariant; conversion points call trackVariantConversion.
// - Panels: each panel's tracking hook posts display/click/conversion events
//   directly with its own variant id.
// Preview views never track.

import { getVisitorId } from './visitor';

const BASE = process.env.NEXT_PUBLIC_RHA_IR_URL || 'https://dashboard.picki.com.au';

function postEvent({ pageKey, variantId, eventType, conversionType = null }) {
  if (!pageKey || !variantId) return;
  try {
    fetch(`${BASE}/api/public/pages/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_key: pageKey,
        variant_id: variantId,
        visitor_id: getVisitorId(),
        event_type: eventType,
        conversion_type: conversionType,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackVariantEvent(eventType, conversionType = null) {
  const active = typeof window !== 'undefined' ? window.__rhaPageVariant : null;
  if (!active?.variantId || active.preview) return;
  postEvent({ pageKey: active.pageKey, variantId: active.variantId, eventType, conversionType });
}

export const trackVariantConversion = (conversionType) => trackVariantEvent('conversion', conversionType);

export function trackPanelEvent(panelKey, variantId, eventType, conversionType = null) {
  postEvent({ pageKey: panelKey, variantId, eventType, conversionType });
}

// Cross-page panel attribution: the ebook CTA panel stores a referral marker
// on click; when the five-markets lead form completes, the panel variant that
// sent the visitor gets a conversion credit too.
const PANEL_REF_KEY = 'rha_panel_ref';

export function storePanelReferral(panelKey, variantId) {
  try { sessionStorage.setItem(PANEL_REF_KEY, JSON.stringify({ panelKey, variantId, at: Date.now() })); } catch {}
}

export function creditPanelReferral(conversionType) {
  try {
    const raw = sessionStorage.getItem(PANEL_REF_KEY);
    if (!raw) return;
    const ref = JSON.parse(raw);
    // Referrals older than 2 hours don't get credit.
    if (!ref?.panelKey || !ref?.variantId || Date.now() - (ref.at || 0) > 2 * 60 * 60 * 1000) return;
    postEvent({ pageKey: ref.panelKey, variantId: ref.variantId, eventType: 'conversion', conversionType });
    sessionStorage.removeItem(PANEL_REF_KEY);
  } catch {}
}
