// Panel-level A/B variants for the newsletter/ebook CTA panels. Same backend
// store as the page variants (rha_page_variants, keyed panel-*), same
// caching/fallback rules: 60s revalidate, weighted pick for new visitors,
// sticky via the rha_ab_<panelKey> cookie (set client-side by the panel's
// tracking hook), bundled JSON as permanent fallback.
//
// Preview: the /api/panel-preview route sets a short-lived rha_prev_<key>
// cookie which forces that variant (even paused) and suppresses tracking.

import { cookies } from 'next/headers';
import blogHeroDefault from '../content/panels/panel-blog-hero.json';
import articleInlineDefault from '../content/panels/panel-article-inline.json';
import articleFooterDefault from '../content/panels/panel-article-footer.json';
import articleEbookDefault from '../content/panels/panel-article-ebook.json';

const DEFAULT_CONTENT = {
  'panel-blog-hero': blogHeroDefault,
  'panel-article-inline': articleInlineDefault,
  'panel-article-footer': articleFooterDefault,
  'panel-article-ebook': articleEbookDefault,
};

export const PANEL_KEYS = Object.keys(DEFAULT_CONTENT);

const BASE = process.env.RHA_BACKEND_URL || 'https://dashboard.picki.com.au';

async function fetchActiveVariants(panelKey) {
  const res = await fetch(`${BASE}/api/public/pages/${panelKey}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`panel variants fetch ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.variants) ? data.variants.filter((v) => v?.content?.props) : [];
}

async function fetchVariantById(panelKey, variantId) {
  const res = await fetch(`${BASE}/api/public/pages/${panelKey}?variant=${encodeURIComponent(variantId)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`panel variant fetch ${res.status}`);
  const data = await res.json();
  return data.variants?.[0]?.content?.props ? data.variants[0] : null;
}

function weightedPick(variants) {
  const weights = variants.map((v) => Math.max(Number(v.weight) || 0, 0));
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return variants[0];
  let roll = Math.random() * total;
  for (let i = 0; i < variants.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return variants[i];
  }
  return variants[variants.length - 1];
}

// Returns { id, props, preview } — props are always usable (fallback merge so
// a variant missing a field never renders an empty string in its place).
export async function resolvePanel(panelKey) {
  const defaults = DEFAULT_CONTENT[panelKey]?.props || {};
  const fallback = { id: null, props: defaults, preview: false };

  let store = null;
  try { store = await cookies(); } catch {}

  const previewId = store?.get(`rha_prev_${panelKey}`)?.value;
  if (previewId) {
    try {
      const variant = await fetchVariantById(panelKey, previewId);
      if (variant) return { id: variant.id, props: { ...defaults, ...variant.content.props }, preview: true };
    } catch {}
    return { ...fallback, preview: true };
  }

  let variants = [];
  try {
    variants = await fetchActiveVariants(panelKey);
  } catch {}
  if (!variants.length) return fallback;

  const sticky = store?.get(`rha_ab_${panelKey}`)?.value;
  const stuck = sticky && variants.find((v) => String(v.id) === sticky);
  const chosen = stuck || weightedPick(variants);
  return { id: chosen.id, props: { ...defaults, ...chosen.content.props }, preview: false };
}
