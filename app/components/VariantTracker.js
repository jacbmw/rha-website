'use client';

import { useEffect } from 'react';
import { trackVariantEvent } from '../../lib/abTracking';

// Registers the served A/B variant for conversion attribution, persists the
// sticky assignment cookie and fires the variant pageview. Preview mode
// (?rha_variant=) registers the variant for rendering but never tracks or
// re-sticks the visitor.
export default function VariantTracker({ pageKey, variantId, preview = false }) {
  useEffect(() => {
    window.__rhaPageVariant = { pageKey, variantId, preview };
    if (!variantId || preview) return;
    document.cookie = `rha_ab_${pageKey}=${variantId};max-age=${60 * 60 * 24 * 90};path=/;SameSite=Lax`;
    trackVariantEvent('pageview');
  }, [pageKey, variantId, preview]);

  return null;
}
