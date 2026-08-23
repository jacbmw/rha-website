'use client';

import { useCallback, useEffect, useRef } from 'react';
import { trackPanelEvent } from '../../../lib/abTracking';

const displayedPanels = new Set();

// Shared tracking hook for A/B panels: fires the display event once on mount,
// persists the sticky assignment cookie, and returns click/conversion
// trackers (click fires at most once per mount). Preview renders never track.
export default function usePanelTracking(panelKey, variantId, preview = false, trackKey = '') {
  const clickedRef = useRef(false);

  useEffect(() => {
    if (!variantId || preview) return;
    document.cookie = `rha_ab_${panelKey}=${variantId};max-age=${60 * 60 * 24 * 90};path=/;SameSite=Lax`;
    const displayKey = trackKey ? `${panelKey}:${variantId}:${trackKey}` : `${panelKey}:${variantId}`;
    if (displayedPanels.has(displayKey)) return;
    displayedPanels.add(displayKey);
    trackPanelEvent(panelKey, variantId, 'pageview');
  }, [panelKey, variantId, preview, trackKey]);

  const trackClick = useCallback(() => {
    if (!variantId || preview || clickedRef.current) return;
    clickedRef.current = true;
    trackPanelEvent(panelKey, variantId, 'click');
  }, [panelKey, variantId, preview]);

  const trackConversion = useCallback((conversionType) => {
    if (!variantId || preview) return;
    trackPanelEvent(panelKey, variantId, 'conversion', conversionType);
  }, [panelKey, variantId, preview]);

  return { trackClick, trackConversion };
}
